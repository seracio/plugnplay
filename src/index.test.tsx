import * as React from 'react';
import { render, act } from '@testing-library/react';
import { interval, of } from 'rxjs';
import { delay, shareReplay, take } from 'rxjs/operators';
import {
    Plug,
    Playground,
    StoreContext,
    usePlug,
    useSuspendedPlug
} from './index';

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

test('Plug: defaultValue should be used before stream is defined', () => {
    const store = {
        once: of(1).pipe(delay(100), shareReplay(1))
    };
    const { container } = render(
        <Playground store={store}>
            <Plug
                combinator={(store) => store.once}
                defaultValue={'default value'}
            >
                {(v) => <div>{v}</div>}
            </Plug>
        </Playground>
    );
    expect(container).toMatchInlineSnapshot(`
        <div>
          <div>
            default value
          </div>
        </div>
    `);
});

test('Plug: stream value should be rendered if synchronous', async () => {
    const store = {
        once: of('loaded').pipe(shareReplay(1))
    };
    const { container } = render(
        <Playground store={store}>
            <Plug combinator={(store) => store.once}>
                {(v) => (!!v ? <div>{v}</div> : <div>waiting</div>)}
            </Plug>
        </Playground>
    );

    expect(container).toMatchInlineSnapshot(`
        <div>
          <div>
            loaded
          </div>
        </div>
    `);
});

test('Plug: stream value should not be used on the first rendering if async', async () => {
    const store = {
        once: of('loaded').pipe(delay(200), shareReplay(1))
    };
    const { container, findByText } = render(
        <Playground store={store}>
            <Plug combinator={(store) => store.once}>
                {(v) => (!!v ? <div>{v}</div> : <div>waiting</div>)}
            </Plug>
        </Playground>
    );

    expect(container).toMatchInlineSnapshot(`
        <div>
          <div>
            waiting
          </div>
        </div>
    `);

    await findByText('loaded');

    expect(container).toMatchInlineSnapshot(`
        <div>
          <div>
            loaded
          </div>
        </div>
    `);
});

test('usePlug: stream value should not be used on the first rendering if async', async () => {
    const store = {
        once: of('loaded').pipe(delay(200), shareReplay(1))
    };

    const Comp = () => {
        const value = usePlug((s) => s.once, 'waiting');
        return <div>{value}</div>;
    };

    const { container, findByText } = render(
        <Playground store={store}>
            <Comp />
        </Playground>
    );

    expect(container).toMatchInlineSnapshot(`
        <div>
          <div>
            waiting
          </div>
        </div>
    `);

    await findByText('loaded');

    expect(container).toMatchInlineSnapshot(`
        <div>
          <div>
            loaded
          </div>
        </div>
    `);
});

test('useSuspendedPlug: Suspense should triggered pending stream', async () => {
    const store = {
        once: of('loaded').pipe(delay(250))
    };

    const Comp = () => {
        const value = useSuspendedPlug((s) => s.once);
        return <div>{value}</div>;
    };

    await act(async () => {
        const { container, findByText } = render(
            <Playground store={store}>
                <React.Suspense fallback={<div>waiting</div>}>
                    <Comp />
                </React.Suspense>
            </Playground>
        );

        expect(container).toMatchInlineSnapshot(`
            <div>
              <div>
                waiting
              </div>
            </div>
        `);

        await findByText('loaded');

        expect(container).toMatchInlineSnapshot(`
            <div>
              <div>
                loaded
              </div>
            </div>
        `);
    });
});

test('useSuspendedPlug: rendering should update with stream', async () => {
    const store = {
        once: interval(300).pipe(take(2))
    };

    const Comp = () => {
        const value = useSuspendedPlug((s) => s.once);
        return <div>{value}</div>;
    };

    await act(async () => {
        const { container, findByText } = render(
            <Playground store={store}>
                <React.Suspense fallback={<div>waiting</div>}>
                    <Comp />
                </React.Suspense>
            </Playground>
        );

        expect(container).toMatchInlineSnapshot(`
            <div>
              <div>
                waiting
              </div>
            </div>
        `);

        await findByText('0');

        expect(container).toMatchInlineSnapshot(`
            <div>
              <div>
                0
              </div>
            </div>
        `);

        await findByText('1');

        expect(container).toMatchInlineSnapshot(`
            <div>
              <div>
                1
              </div>
            </div>
        `);
    });
});
