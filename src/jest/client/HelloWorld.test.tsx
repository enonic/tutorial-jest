import {
    describe,
    expect,
    test as it
} from '@jest/globals';
import React from 'react';
import renderer from 'react-test-renderer';
import {HelloWorld} from './HelloWorld';


describe('HelloWorld', () => {
    it('should render', () => {
        const component = renderer.create(
            <HelloWorld/>,
          );
        const tree = component.toJSON();
        expect(tree).toEqual({ type: 'h1', props: {}, children: [ 'Hello, World!' ] });
    });
});