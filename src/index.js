import React, { memo, useState, useContext, useEffect } from 'react';

const StoreContext = React.createContext({});

const Provider = memo(({ store, children }) => {
    return (
        <StoreContext.Provider value={store}>{React.Children.only(children)}</StoreContext.Provider>
    );
});

const Plug = memo(({ combinator, children, defaultValue = null }) => {
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
                next: state => {
                    if (!(state instanceof Object) || Object.keys(state) === 0) {
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
