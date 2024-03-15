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
        // console.debug(tree);
        // expect(tree).toEqual(<h1>Hello, World!</h1>)
        expect(tree).toEqual({ type: 'h1', props: {}, children: [ 'Hello, World!' ] });
    });
});