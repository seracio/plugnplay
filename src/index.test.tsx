import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { of } from 'rxjs';
import { delay, shareReplay } from 'rxjs/operators';
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

test('Plug: defaultValue should be used before stream is defined', () => {
    const store = {
        once: of(1).pipe(
            delay(100),
            shareReplay(1)
        )
    };
    const component = TestRenderer.create(
        <Playground store={store}>
            <Plug
                combinator={store => store.once}
                defaultValue={'default value'}
            >
                {v => <div>{v}</div>}
            </Plug>
        </Playground>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});

test('Plug: stream value should be used', async () => {
    const store = {
        once: of('value').pipe(shareReplay(1))
    };
    const component = TestRenderer.create(
        <Playground store={store}>
            <Plug combinator={store => store.once}>{v => <div>{v}</div>}</Plug>
        </Playground>
    );
    await new Promise(res =>
        setTimeout(() => {
            const tree = component.toJSON();
            expect(tree).toMatchSnapshot();
            res();
        }, 1000)
    );
});
