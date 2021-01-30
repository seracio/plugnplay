import * as React from 'react';

const StoreContext = React.createContext({});

type PlaygroundProps = {
    store: { [key: string]: any };
    children: any;
};

const Playground = React.memo(({ store, children }: PlaygroundProps) => {
    if (!(store instanceof Object)) {
        throw new Error('plugnplay: store should be an Object');
    }

    return (
        <StoreContext.Provider value={store}>
            <React.Fragment>{children}</React.Fragment>
        </StoreContext.Provider>
    );
});

type PlugProps = {
    combinator: any;
    children: Function;
    defaultValue?: any;
};

const Plug = React.memo(
    ({ combinator, children, defaultValue = null }: PlugProps) => {
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

const usePlugSuspense = function (combinator, refresh = null) {
    const [value, setValue] = React.useState(undefined);
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
        // suspense mode init
        if (value === undefined) {
            throw stream.toPromise();
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

export { Playground, Plug, StoreContext, usePlug, usePlugSuspense };
