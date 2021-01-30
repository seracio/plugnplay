import * as React from 'react';
import { render } from '@testing-library/react';
import { of } from 'rxjs';
import { delay, shareReplay } from 'rxjs/operators';
import { Plug, Playground, StoreContext } from './index';

test('Playground: only the child should be rendered', () => {
    const { container } = render(
        <Playground store={{ test: 'test' }}>
            <div>hello world</div>
        </Playground>
    );
    expect(container.firstChild).toMatchInlineSnapshot(`
        <div>
          hello world
        </div>
    `);
});

test('Playground: can have multiple children', () => {
    const { container } = render(
        <Playground store={{ test: 'test' }}>
            <h1>title</h1>
            <div>hello world</div>
        </Playground>
    );
    expect(container).toMatchInlineSnapshot(`
        <div>
          <h1>
            title
          </h1>
          <div>
            hello world
          </div>
        </div>
    `);
});

test('Playground: the child component should have a context with a key "store"', () => {
    const App = () => {
        const store: any = React.useContext(StoreContext);
        return <div>{store.hello}</div>;
    };

    const { container } = render(
        <Playground store={{ hello: 'hello world' }}>
            <App />
        </Playground>
    );
    expect(container).toMatchInlineSnapshot(`
        <div>
          <div>
            hello world
          </div>
        </div>
    `);
});

/*test('Playground: props store should be mandatory', () => {
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
            res(void);
        }, 1000)
    );
});*/
