import {
    createContext,
    Fragment,
    memo,
    useContext,
    useEffect,
    useState
} from 'react';
import { Observable } from 'rxjs';

//https://www.carlrippon.com/react-context-with-typescript-p1/
// https://medium.com/@mtiller/react-16-3-context-api-intypescript-45c9eeb7a384

type Store = { [key: string]: any };

type Combinator<V> = (s: any) => Observable<V>;

const StoreContext = createContext<Store>({
    __cache: new WeakMap()
});

type PlaygroundProps = {
    store: Store;
    children: any;
};

export const Playground = memo(
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
                <Fragment>{children}</Fragment>
            </StoreContext.Provider>
        );
    }
);

// https://www.webtips.dev/how-to-improve-data-fetching-in-react-with-suspense
export const useStore = function <V>(combinator: Combinator<V>): V {
    const store = useContext(StoreContext);
    const stream: Observable<V> = combinator(store);
    const [value, setValue] = useState<V>(store.__cache.get(stream));

    useEffect(() => {
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
