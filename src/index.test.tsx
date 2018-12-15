import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { Plug, Playground } from './index';

test('Playground should exists', () => {
    expect(typeof Playground !== 'undefined');
});
