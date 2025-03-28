import type { ByteSource } from '@enonic-types/core';
import type {
	Cheerio,
	SelectorType
} from 'cheerio';
import type {AnyNode} from 'domhandler';
import type { StepDefinitions } from 'jest-cucumber';


// import 'core-js/stable/array/from';
import { expect } from '@jest/globals';
import * as cheerio from 'cheerio';
import toDiffableHtml from 'diffable-html';
import {
  autoBindSteps,
  loadFeature
} from 'jest-cucumber';
import {
  Request,
  libContent,
  libPortal,
  server,
} from './mockXP';
import { readFileSync } from 'fs';
import { join } from 'path';


const feature = loadFeature('./src/jest/server/controller.feature');


function sanitize(text: string): string {
  return text
    .toLowerCase()
    .replace('é', 'e')
    .replace(/[()']+/, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-|-$/, '');
}

function unQuote(text: string): string {
  if (text.startsWith('"') && text.endsWith('"')) {
    return text.slice(1, -1);
  }
  return text;
}

const getAttributeValue = (
	node: Cheerio<AnyNode>,
	name: string
) => {
	const attributeValue = node.attr(name);

	if (typeof attributeValue === 'string') {
		return attributeValue;
	}

	// throw new Error(`Could not find a string value attribute:${name}!`);
	return undefined;
};

const querySelector = (
  node: Cheerio<AnyNode>,
  selector: SelectorType
) => {
  const $ = cheerio.load(''); // Ensure cheerio is loaded correctly
  return $(node.find(selector)[0]);
};

export const steps: StepDefinitions = ({ given, when, then }) => {
  const contentTypes = {};
  let currentContentTypeName;
  let currentDom;
  let aContent;

  const personFolder = libContent.create({
    contentType: 'base:folder',
    data: {},
    name: 'persons',
    parentPath: '/',
  });
  given(/^I have a contentType named "(.*)"$/, (name) => {
    currentContentTypeName = name;
    contentTypes[name] = {
      contentType: `com.example.myproject:${name}`,
      data: {},
    };
    // console.log('contentTypes:', contentTypes);
  });

  given(/^I have a field named "(.*)" of type "(.*)"$/, (field, type) => {
    const arr = type.split('[]');
    contentTypes[currentContentTypeName]['data'][field] = {
      type: arr[0],
      minimum: 0,
      maximum: arr.length > 1 ? 0 : 1,
    }
    // console.log('contentTypes:', contentTypes);
  });

  when(/^I create a new content of type "(.*)"$/, (contentTypeName) => {
    aContent = {
      contentType: `com.example.myproject:${contentTypeName}`,
      data: {
        photos: []
      },
      parentPath: personFolder._path
    }
  });

  when(/^I fill in "(.*)" as the displayName$/, (displayName) => {
    aContent.displayName = displayName;
    aContent.name = sanitize(displayName);
    // console.log('aContent:', aContent);
  });

  when(/^I add an image with the filename "(.*)" to "(.*)"$/, (filename, field) => {
    const leaSeydouxJpg = libContent.createMedia({
      data: readFileSync(join(__dirname, '..', filename)) as unknown as ByteSource,
      name: filename,
      parentPath: personFolder._path,
      mimeType: 'image/jpeg',
      focalX: 0.5,
      focalY: 0.5,
    });
    aContent.data[field].push(leaSeydouxJpg._id);
  });

  then(/^I should be able to get a person using the _name "(.*)"$/, (name) => {
    libContent.create(aContent);
    aContent = undefined;
    const person = libContent.get({key: `/persons/${name}`});
    // console.log('person:', person);
    expect(person._name).toBe(name);
  });


  when(/^I visit the page for the person named (.*)$/, (name) => {
    libPortal.request = new Request({
      repositoryId: server.context.repository,
      path: `/admin/site/preview/intro/draft/persons/${unQuote(name)}`
    });
    import('/lib/myproject/controller').then(({get}) => {
      const response = get(libPortal.request);
      // console.log('response:', response);
      currentDom = cheerio.load(String(response.body)).root();
    });
  });

  then(/^the page should have the title (.*)$/, (title) => {
    // console.log('currentDom:', currentDom.html());
    const titleEl = querySelector(currentDom, 'head title');
    expect(titleEl.text()).toBe(unQuote(title));
  });

  then(/^the css selector "(.*)" should have the text (.*)$/, (selector, text) => {
    const el = querySelector(currentDom, selector);
    expect(el.text()).toBe(unQuote(text));
  });

  then(/^the css selector "(.*)" should have the attribute "(.*)" containing (.*)$/, (selector, attribute, value) => {
    const el = querySelector(currentDom, selector);
    expect(getAttributeValue(el, attribute)).toContain(unQuote(value));
  });

  then(/^the html should be$/, (html: string) => {
    const diffableHtml = toDiffableHtml(currentDom.html()).trim();
    expect(html).toBe(diffableHtml);
  });
}; // steps

autoBindSteps(feature, [ steps ]);
