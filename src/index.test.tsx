import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { Plug, Playground, StoreContext } from './index';

test('Playground: only the child should be rendered', () => {
    const component = TestRenderer.create(
        <Playground store={{ test: 'test' }}>
            <div>hello world</div>
        </Playground>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});

test('Playground: the child component should have a context with a key "store"', () => {
    const App = () => {
        const store: any = React.useContext(StoreContext);
        return <div>{store.hello}</div>;
    };

    const component = TestRenderer.create(
        <Playground store={{ hello: 'hello world' }}>
            <App />
        </Playground>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});

test('Playground: props store should be mandatory', () => {
    const t = () => {
        TestRenderer.create(
            // @ts-ignore
            <Playground>
                <div>hello world</div>
            </Playground>
        );
    };
    expect(t).toThrow();
});
