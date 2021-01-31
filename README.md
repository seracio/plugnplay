# plugnplay

![](https://circleci.com/gh/seracio/plugnplay.svg?style=svg)

> A tiny module to use a dictionary of Observables as a Store for React

## Disclaimer

The purpose here is not to provide an async middleware to a redux store with Observables, as [redux-cycle-middleware](https://github.com/cyclejs-community/redux-cycle-middleware) and [redux-observable](https://github.com/redux-observable/redux-observable) do but to replace redux and its different slices (async middlewares, reducers and derived data) with Behavior Subjects. As this, we can express each variable of the store as a function of other variables, in a clean and async way.

This library only exposes a component `Playground` (a store Provider) and a render props component `Plug`.

## Install

```bash
npm i react@16.7 react-dom@16.7 rxjs@6 @seracio/plugnplay
```

## Basic usage

```javascript
import { Plug, Playground } from '@seracio/plugnplay';
import React from 'react';
import { of, interval } from 'rxjs';
import { shareReplay, delay } from 'rxjs/operators';

// expose a dictionary of Observables (Behavior Subjects)
const store = {
    hello$: of('hello').pipe(delay(250), shareReplay(1)),
    count$: interval(1000).pipe(shareReplay(1))
};

render(
    <Playground store={store}>
        <h1>My app</h1>
        <Plug combinator={(store) => store.hello$}>
            {(val) => (!!val ? <div>{val}</div> : <div>waiting...</div>)}
        </Plug>
        <p>Here is a counter:</p>
        <Plug combinator={(store) => store.count$}>
            {(val) => (!!val ? <div>{val}</div> : <div>waiting...</div>)}
        </Plug>
    </Playground>
);
```

## API

### Playground

The `Playground` component is the equivalent of a redux `Provider`.

```typescript
type PlaygroundProps = {
    store: { [key: string]: Observable };
    children: JSX.Elements;
};
```

### Plug

```typescript
type PlugProps = {
    combinator: (store) => Observable;
    defaultValue?: any;
};
```

The `combinator` props is a function that takes the dictionary store as param and returns the unique Observable we want to listen to.  
This Observable can be:

-   an Observable defined in the store
-   a combination of multiple Obserables from the store (thanks to RX operators)
-   a brand new Observble, unlinked to the store

The value of this Observable will be emitted through a render props function. Typically, you want them to be formated like props, but nothing mandatory here:

```javascript
<Plug
    combinator={(store) =>
        combineLatest(store.count$, store.val$).pipe(
            map(([count, val]) => ({ count, val }))
        )
    }
>
    {(props) => (!!props ? <MyComp {...props} /> : <Waiting />)}
</Plug>
```

As Observables are asynchronous by nature, you must provide a defaultValue if you want a synchronous rendering:

```javascript
<Plug combinator={(store) => store.props$} defaultValue={{ count: 0, val: '' }}>
    {(props) => <MyComp {...props} />}
</Plug>
```

Or you can use a Waiting component, as defaultValue is defined as null by default:

```javascript
<Plug combinator={(store) => store.props$}>
    {(props) => (!!props ? <MyComp {...props} /> : <Waiting />)}
</Plug>
```

## Development

```
yarn test --watch
```

## Publish

Due to the namespace

```
npm publish --access=public
```
