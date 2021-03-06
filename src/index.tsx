import * as React from 'react';
import { Observable } from 'rxjs';

//https://www.carlrippon.com/react-context-with-typescript-p1/
// https://medium.com/@mtiller/react-16-3-context-api-intypescript-45c9eeb7a384

type Store = { [key: string]: any };

type Combinator<V> = (s: any) => Observable<V>;

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

type PlugProps<V> = {
    combinator: Combinator<V>;
    children: (val: V) => React.ReactElement;
    defaultValue?: V;
};

export const Plug = React.memo(
    ({ combinator, children, defaultValue = undefined }: PlugProps<any>) => {
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

export const usePlug = function <V>(
    combinator: Combinator<V>,
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
export const useSuspendedPlug = function <V>(combinator: Combinator<V>): V {
    const store = React.useContext(StoreContext);
    const stream: Observable<V> = combinator(store);
    const [value, setValue] = React.useState<V>(store.__cache.get(stream));

    React.useEffect(() => {
        stream.subscribe({
            next: (val) => {
                store.__cache.set(stream, val);
                setValue(val);
            }
        });
    }, []);

    if (typeof value === 'undefined') {
        throw new Promise<void>((res) => {
            /**
             * toPromise() does not work for BehaviorSubject nor custom Observable
             * */
            stream.subscribe({
                next: (val) => {
                    store.__cache.set(stream, val);
                    res();
                }
            });
        });
    }

    return value;
};
