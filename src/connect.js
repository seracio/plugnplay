// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { Observable } from 'rxjs/Observable';

type State = { [key: string]: any };

const connect = (combinator: Function) => (WrappedComponent: any, WaitingComponent: any = null) => {
    if (typeof combinator !== 'function') {
        throw new Error('rx-connect: connect needs a combinator function as parameter');
    }

    class Connect extends React.Component {
        // flag to launch the first
        // rendering of the encapsulated component
        go: boolean;
        // state declaration for flow
        state: State;
        // oberver
        observer: { [key: string]: Function };
        // stream
        stream: Function;
        // subscription
        subscription: Function;

        constructor(props: Object, context: Object) {
            super(props, context);
            // there will be no rendering of
            // the encapsulated component
            // before the first tick
            this.go = false;
            // empty state
            this.state = {};
        }

        componentDidMount() {
            this.stream = combinator(this.context.store);
            if (typeof this.stream === 'undefined' || typeof this.stream.subscribe !== 'function') {
                throw new Error('rx-connect: combinator should return a Stream');
            }
            this.observer = {
                next: state => {
                    if (!(state instanceof Object) || Object.keys(state) === 0) {
                        throw new Error(
                            'rx-connect: combinator should return a Stream of key => values'
                        );
                    }
                    this.go = true;
                    this.setState(state);
                }
            };
            this.subscription = this.stream.subscribe(this.observer);
        }

        componentWillUnmount() {
            this.subscription.unsubscribe();
        }

        render() {
            // we pass the applicative props and inject the HOC state
            // too bad if there are conflicts
            const propsToTransfer = { ...this.props, ...this.state };
            if (this.go) {
                return <WrappedComponent {...propsToTransfer} />;
            } else {
                return !!WaitingComponent ? <WaitingComponent {...this.props} /> : null;
            }
        }
    }
    Connect.contextTypes = {
        store: PropTypes.object.isRequired
    };

    return Connect;
};

export default connect;
