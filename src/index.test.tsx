import * as React from 'react';
import { render, act } from '@testing-library/react';
import { BehaviorSubject, interval, Observable, of } from 'rxjs';
import { delay, take } from 'rxjs/operators';
import { Playground, useStore } from './index';

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

test('useStore: Suspense should triggered pending stream', async () => {
    const store = {
        once: of('loaded').pipe(delay(250))
    };

    const Comp = () => {
        const value = useStore<string>((s) => s.once);
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

test('useStore: rendering should update with stream', async () => {
    const store = {
        once: interval(200).pipe(take(2))
    };

    const Comp = () => {
        const value = useStore<number>((s) => s.once);
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

test('useStore: Suspense should triggered a BehaviorSubject', async () => {
    const subject = new BehaviorSubject('loaded');
    const store = {
        once: subject
    };

    const Comp = () => {
        const value = useStore<string>((s) => s.once);
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

test('useStore: Suspense should triggered a custom Observable', async () => {
    const once = new Observable<string>((subscriber) => {
        setTimeout(() => subscriber.next('loaded'), 250);
    });
    const store = {
        once
    };

    const Comp = () => {
        const value = useStore<string>((s) => s.once);
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

test('useStore: should manage multiple streams', async () => {
    const store = {
        first: of('first').pipe(delay(100)),
        second: of('second').pipe(delay(200))
    };

    const CompFirst = () => {
        const value = useStore<string>((s) => s.first);
        return <div>{value}</div>;
    };

    const CompSecond = () => {
        const value = useStore<string>((s) => s.second);
        return <div>{value}</div>;
    };

    await act(async () => {
        const { container, findByText } = render(
            <Playground store={store}>
                <React.Suspense fallback={<div>waiting</div>}>
                    <CompFirst />
                    <CompSecond />
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

        await findByText('first');
        await findByText('second');

        expect(container).toMatchInlineSnapshot(`
            <div>
              <div
                style=""
              >
                first
              </div>
              <div>
                second
              </div>
            </div>
        `);
    });
});
