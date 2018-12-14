import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { Plug, Provider } from './index';

test('Provider should exists', () => {
    expect(typeof Plug !== 'undefined');
});
