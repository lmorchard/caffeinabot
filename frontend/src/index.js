import React from "react";
import { applyMiddleware, createStore, combineReducers } from "redux";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { createBrowserHistory } from "history";
import {
  connectRouter,
  routerMiddleware,
  ConnectedRouter
} from "connected-react-router";
import { reducers, actions } from "./lib/store";
import App from "./components/App";

import "./index.scss";

let history, store, socket;

function init() {
  setupStore();
  setupWebSocket();
  renderApp();
}

function setupStore() {
  const composeEnhancers = composeWithDevTools({});

  const updateWebSocketMiddleware = ({ getState }) => next => action => {
    const returnValue = next(action);
    return returnValue;
  };

  const initialState = {};

  history = createBrowserHistory();

  store = createStore(
    connectRouter(history)(combineReducers({ ...reducers })),
    initialState,
    composeEnhancers(
      applyMiddleware(routerMiddleware(history), updateWebSocketMiddleware)
    )
  );
}

function setupWebSocket() {
  const {
    setSocketConnecting,
    setSocketConnected,
    setSocketDisconnected
  } = actions;

  const { protocol, host } = window.location;
  socket = new WebSocket(`${protocol === "https" ? "wss" : "ws"}://${host}`);

  store.dispatch(setSocketConnecting());

  socket.addEventListener("open", event => {
    store.dispatch(setSocketConnected());
  });

  socket.addEventListener("close", event => {
    store.dispatch(setSocketDisconnected());
  });

  socket.addEventListener("message", event => {
    try {
      const data = JSON.parse(event.data);
      if (data.event === "STORE_ACTION") {
        const { type, payload, error, meta } = data;
        store.dispatch({ type, payload, error, meta });
      }
    } catch (err) {
      /* no-op */
    }
  });
}

function renderApp() {
  const root = document.createElement("div");
  root.id = "root";
  document.body.appendChild(root);
  render(
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <App />
      </ConnectedRouter>
    </Provider>,
    root
  );
}

init();
