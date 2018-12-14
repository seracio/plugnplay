import React, { memo, useState, useContext, useEffect } from 'react';

const StoreContext = React.createContext({});

type ProviderProps = {
    store: { [key: string]: any };
    children: any;
};

const Provider = memo(({ store, children }: ProviderProps) => {
    return (
        <StoreContext.Provider value={store}>{React.Children.only(children)}</StoreContext.Provider>
    );
});

type PlugProps = {
    combinator: any;
    children: Function;
    defaultValue: any;
};

const Plug = memo(({ combinator, children, defaultValue = null }: PlugProps) => {
    const [value, setValue] = useState(defaultValue);
    const store = useContext(StoreContext);
    useEffect(
        () => {
            // stream
            const stream = combinator(store);
            if (typeof stream === 'undefined' || typeof stream.subscribe !== 'function') {
                throw new Error('rx-connect: combinator should return a Stream');
            }
            // observer
            const observer = {
                next: (state: any) => {
                    if (!(state instanceof Object) || Object.keys(state).length === 0) {
                        throw new Error(
                            'rx-connect: combinator should return a Stream of key => values'
                        );
                    }
                    setValue(state);
                }
            };
            // subscription
            const subscription = stream.subscribe(observer);
            // unmount
            return () => subscription.unsubscribe();
        },
        [store]
    );
    return children(value);
});

export { Provider, Plug };
