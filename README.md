# plugnplay

## Usage

```bash
npm i react@16.7 react-dom@16.7 rxjs@6 @seracio/plugnplay
```

```javascript
import { Plug, Playground } from '@seracio/plugnplay';
import React from 'react';
import { range } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

const store = {
    range: range(1, 100).pipe(shareReplay(1))
};

render(
    <Playground store={store}>
        <Plug combinator={s => s.range}>{c => <div>{c}</div>}</Plug>
    </Playground>
);
```

## Development

```
yarn test -- --watch
```

## Publish

Due to the namespace

```
npm publish --access=public
```
