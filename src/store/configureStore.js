import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk'
import promise from 'redux-promise';
import promiseMiddleware from 'redux-promise-middleware';
import rootReducer from '../reducers';
import createHelpers from './createHelpers';
import createLogger from './logger';

export default function configureStore(initialState, helpersConfig) {
  const helpers = createHelpers(helpersConfig);
  const middleware = [thunk.withExtraArgument(...helpers)];

  let enhancer;

  middleware.push(
    promiseMiddleware({
      promiseTypeSuffixes: ['LOADING', 'SUCCESS', 'ERROR']
    })
  );

  if (__DEV__) {

    middleware.push(createLogger());

    // https://github.com/zalmoxisus/redux-devtools-extension#redux-devtools-extension
    let devToolsExtension = f => f;
    if (process.env.BROWSER && window.devToolsExtension) {
      devToolsExtension = window.devToolsExtension();
    }

    enhancer = compose(
      applyMiddleware(...middleware),
      devToolsExtension
    );
  } else {
    enhancer = applyMiddleware(...middleware);
  }

  // See https://github.com/rackt/redux/releases/tag/v3.1.0
  const store = createStore(rootReducer, initialState, enhancer);

  // Hot reload reducers (requires Webpack or Browserify HMR to be enabled)
  if (__DEV__ && module.hot) {
    module.hot.accept('../reducers', () =>
      store.replaceReducer(require('../reducers').default) // eslint-disable-line global-require
    );
  }

  return store;
}
