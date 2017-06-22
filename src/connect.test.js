import * as _ from 'lodash/fp';
import * as React from 'react';
import renderer from 'react-test-renderer';
import { Observable, BehaviorSubject } from 'rxjs';
import { connect, Provider } from './index';

class MyComponent extends React.Component {
  render() {
    return <div>hello</div>;
  }
}

test('connect: should return a function', () => {
  expect(typeof connect(_.identity)).toBe('function');
});


test('Connect component: should render false when state.go === false', () => {
  const store = { none: Observable.never() };
  const MyComponentWrapped = connect(_.identity)(MyComponent);

  class App extends React.Component {
    render() {
      return <MyComponentWrapped />;
    }
  }
  const component = renderer.create(
    <Provider store={store}>
      <App />
    </Provider>
  );
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});

test('Connect component: should only render the WrappedComponent when go === true', () => {
  const store = { once: Observable.of(1) };
  const MyComponentWrapped = connect(_.identity)(MyComponent);
  class App extends React.Component {
    render() {
      return <MyComponentWrapped />;
    }
  }
  const component = renderer.create(
    <Provider store={store}>
      <App />
    </Provider>
  );
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});

test('Connect component: fragment attribute should contains keys specified by the storeToPropsFunc parameter', () => {
  const store = { hello$: Observable.of('world') };
  class MyOtherComponent extends React.Component {
    render() {
      return <div>{this.props.hello}</div>;
    }
  }
  MyOtherComponent.propTypes = {
    hello: React.PropTypes.string.isRequired
  };
  const MyComponentWrapped = connect(state => ({
    hello: state.hello$
  }))(MyOtherComponent);
  class App extends React.Component {
    render() {
      return <MyComponentWrapped />;
    }
  }
  const component = renderer.create(
    <Provider store={store}>
      <App />
    </Provider>
  );
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});