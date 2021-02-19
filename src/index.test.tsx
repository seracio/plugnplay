import * as React from 'react';
import { render, act } from '@testing-library/react';
import { BehaviorSubject, interval, Observable, of } from 'rxjs';
import { delay, shareReplay, subscribeOn, take } from 'rxjs/operators';
import { Plug, Playground, usePlug, useSuspendedPlug } from './index';

test('Playground: only the child should be rendered', () => {
    const { container } = render(
        <Playground store={{ test: of(0) }}>
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
        <Playground store={{ test: of(0) }}>
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

test('Plug: stream value should not be used on the first rendering if async', async () => {
    const store = {
        once: of('loaded').pipe(delay(200), shareReplay(1))
    };
    const { container, findByText } = render(
        <Playground store={store}>
            <Plug combinator={(s: typeof store) => s.once}>
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
        const value = usePlug<string>((s) => s.once, 'waiting');
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
        const value = useSuspendedPlug<string>((s) => s.once);
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
        once: interval(200).pipe(take(2))
    };

    const Comp = () => {
        const value = useSuspendedPlug<number>((s) => s.once);
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

test('useSuspendedPlug: Suspense should triggered a BehaviorSubject', async () => {
    const subject = new BehaviorSubject('loaded');
    const store = {
        once: subject
    };

    const Comp = () => {
        const value = useSuspendedPlug<string>((s) => s.once);
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

test('useSuspendedPlug: Suspense should triggered a custom Observable', async () => {
    const once = new Observable<string>((subscriber) => {
        setTimeout(() => subscriber.next('loaded'), 250);
    });
    const store = {
        once
    };

    const Comp = () => {
        const value = useSuspendedPlug<string>((s) => s.once);
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
