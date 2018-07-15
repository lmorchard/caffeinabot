import React from "react";
import { applyMiddleware } from "redux";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { composeWithDevTools } from "redux-devtools-extension";

import { actions, createAppStore } from "./lib/store";
import App from "./lib/components/App";

import "./index.scss";

let store, socket;

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

  store = createAppStore(
    {},
    composeEnhancers(applyMiddleware(updateWebSocketMiddleware))
  );
}

function setupWebSocket() {
  const {
    setSocketConnecting,
    setSocketConnected,
    setSocketDisconnected
  } = actions.ui;

  const { protocol, host } = window.location;
  socket = new WebSocket(
    `${protocol === "https" ? "wss" : "ws"}://${host}`
  );

  store.dispatch(setSocketConnecting());

  socket.addEventListener("open", event => {
    store.dispatch(setSocketConnected());
  });

  socket.addEventListener("close", event => {
    store.dispatch(setSocketDisconnected());
  });

  socket.addEventListener("message", event => {
    console.log("SOCKET MESSAGE", event.data);
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
      <App {...{}} />
    </Provider>,
    root
  );
}

init();
