import PropTypes from 'prop-types';
import React from 'react';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

const connect = combinator => (WrappedComponent, WaitingComponent = null) => {
    if (typeof combinator !== 'function') {
        throw new Error('rx-connect: connect needs a combinator function as parameter');
    }

    class Connect extends React.Component {
        // stream

        // state declaration for flow
        constructor(props, context) {
            super(props, context);
            // there will be no rendering of
            // the encapsulated component
            // before the first tick
            this.go = false;
            // empty state
            this.state = {};
        }
        // subscription

        // oberver

        // flag to launch the first
        // rendering of the encapsulated component


        componentDidMount() {
            this.stream = combinator(this.context.store);
            if (typeof this.stream === 'undefined' || typeof this.stream.subscribe !== 'function') {
                throw new Error('rx-connect: combinator should return a Stream');
            }
            this.observer = {
                next: state => {
                    if (!(state instanceof Object) || Object.keys(state) === 0) {
                        throw new Error('rx-connect: combinator should return a Stream of key => values');
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
            const propsToTransfer = _extends({}, this.props, this.state);
            if (this.go) {
                return React.createElement(WrappedComponent, propsToTransfer);
            } else {
                return !!WaitingComponent ? React.createElement(WaitingComponent, this.props) : null;
            }
        }
    }
    Connect.contextTypes = {
        store: PropTypes.object.isRequired
    };

    return Connect;
};

class Provider extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.store = props.store;
    }

    getChildContext() {
        return { store: this.store };
    }

    render() {
        return React.Children.only(this.props.children);
    }
}

Provider.propTypes = {
    store: PropTypes.object.isRequired
};

Provider.childContextTypes = {
    store: PropTypes.object.isRequired
};

export { connect, Provider };
