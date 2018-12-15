# plugnplay

> A tiny module to use a dictionnary of Observables as a Store for React

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
import { of } from 'rxjs';
import { shareReplay, delay } from 'rxjs/operators';

// expose a dictionnary of Observables (Behavior Subjects)
const store = {
    once: of('hello').pipe(
        delay(250),
        shareReplay(1)
    )
};

render(
    <Playground store={store}>
        <Plug combinator={s => s.once}>
            {c => (!c ? <div>waiting...</div> : <div>{c}</div>)}
        </Plug>
    </Playground>
);
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
