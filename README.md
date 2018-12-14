# rx-connect

## Usage

```bash
npm i react rxjs @seracio/rx-connect
```

```javascript
import React from 'react';
import { range } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

const store = range(1, 100).pipe(shareReplay(1));

render(
    <Provider store={store}>
        <Plug combinator={s => s.range}>{c => <div>{c}</div>}</Plug>
    </Provider>
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
