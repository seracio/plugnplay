import * as React from 'react';

const StoreContext = React.createContext<object>({
    __cache: new WeakMap()
});

type PlaygroundProps = {
    store: any;
    children: any;
};

const Playground = React.memo(({ store, children }: PlaygroundProps) => {
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
});

type PlugProps = {
    combinator: (store: any) => any;
    children: Function;
    defaultValue?: any;
};

const Plug = React.memo(
    ({ combinator, children, defaultValue = undefined }: PlugProps) => {
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

const usePlug = function (combinator, defaultValue, refresh = null) {
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
const useSuspendedPlug = function (combinator) {
    const store: any = React.useContext(StoreContext);
    const stream = combinator(store);
    const [value, setValue] = React.useState(store.__cache?.[stream]);

    React.useEffect(() => {
        stream.subscribe({
            next: (val) => {
                store.__cache[stream] = val;
                setValue(val);
            }
        });
    }, []);

    if (typeof value === 'undefined') {
        throw stream.toPromise().then((val) => (store.__cache[stream] = val));
    }

    return value;
};

export { Playground, Plug, StoreContext, usePlug, useSuspendedPlug };
