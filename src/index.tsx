import * as React from 'react';
import { Observable } from 'rxjs';

//https://www.carlrippon.com/react-context-with-typescript-p1/
// https://medium.com/@mtiller/react-16-3-context-api-intypescript-45c9eeb7a384

type Store = any;

type Combinator<S, V> = (s: S) => Observable<V>;

const StoreContext = React.createContext<Store>({
    __cache: new WeakMap()
});

type PlaygroundProps = {
    store: Store;
    children: any;
};

export const Playground = React.memo(
    ({ store, children }: PlaygroundProps): React.ReactElement => {
        if (!(store instanceof Object)) {
            throw new Error('plugnplay: store should be an Object');
        }

        return (
            <StoreContext.Provider
                value={{
                    ...store,
                    __cache: new WeakMap()
                }}
            >
                <React.Fragment>{children}</React.Fragment>
            </StoreContext.Provider>
        );
    }
);

type PlugProps<S, V> = {
    combinator: Combinator<S, V>;
    children: (val: V) => React.ReactElement;
    defaultValue?: V;
};

export const Plug = React.memo(
    ({
        combinator,
        children,
        defaultValue = undefined
    }: PlugProps<any, any>) => {
        const [value, setValue] = React.useState(defaultValue);
        const store = React.useContext(StoreContext);
        React.useEffect(() => {
            // stream
            const stream = combinator(store);
            if (
                typeof stream === 'undefined' ||
                typeof stream.subscribe !== 'function'
            ) {
                throw new Error('plugnplay: combinator should return a Stream');
            }
            // observer
            const observer = {
                next: setValue
            };
            // subscription
            const subscription = stream.subscribe(observer);
            // unmount
            return () => subscription.unsubscribe();
        }, [store]);
        return children(value);
    }
);

export const usePlug = function <S, V>(
    combinator: Combinator<S, V>,
    defaultValue: V,
    refresh = null
) {
    const [value, setValue] = React.useState(defaultValue);
    const store = React.useContext(StoreContext);
    React.useEffect(() => {
        // stream
        const stream = combinator(store);
        if (
            typeof stream === 'undefined' ||
            typeof stream.subscribe !== 'function'
        ) {
            throw new Error('plugnplay: combinator should return a Stream');
        }
        // observer
        const observer = {
            next: setValue
        };
        // subscription
        const subscription = stream.subscribe(observer);
        // unmount
        return () => subscription.unsubscribe();
    }, [store, refresh]);
    return value;
};

// https://www.webtips.dev/how-to-improve-data-fetching-in-react-with-suspense
export const useSuspendedPlug = function <S, V>(
    combinator: Combinator<S, V>
): V {
    const store: S = React.useContext(StoreContext);
    const stream: Observable<unknown> = combinator(store);
    // @ts-ignore
    const [value, setValue] = React.useState(store.__cache[stream]);

    React.useEffect(() => {
        stream.subscribe({
            next: (val) => {
                // @ts-ignore
                store.__cache[stream] = val;
                setValue(val);
            }
        });
    }, []);

    if (typeof value === 'undefined') {
        // @ts-ignore
        throw stream.toPromise().then((val) => (store.__cache[stream] = val));
    }

    return value;
};
