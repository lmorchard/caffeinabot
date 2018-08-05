import React from "react";
import { applyMiddleware, createStore, combineReducers } from "redux";
import { render } from "react-dom";
import { Provider } from "react-redux";
import promiseMiddleware from "redux-promise";
import { composeWithDevTools } from "redux-devtools-extension";
import { Route, Switch } from "react-router";
import { registerUUID, createUUIDReducer } from "react-redux-uuid";
import { createBrowserHistory } from "history";
import {
  connectRouter,
  routerMiddleware,
  ConnectedRouter as Router
} from "connected-react-router";
import ReconnectingWebSocket from "reconnecting-websocket";
import { selectors, reducers, actions, fromServer } from "../../lib/store";
import { makeLog } from "./lib/utils";

import "./index.scss";

import App from "./components/App";
import Overlay from "./components/Overlay";

const log = makeLog("index");

let history, store, socket;

function init() {
  log("init");
  setupStore();
  setupWebSocket();
  setupAuth();

  const root = document.createElement("div");
  root.id = "root";
  document.body.appendChild(root);

  renderApp();
}

const updateWebSocketMiddleware = ({ getState }) => next => action => {
  const nextAction = next(action);
  const { type, payload, meta = {} } = nextAction;
  const state = getState();
  if (socket && selectors.socketConnected(state) && !meta.localOnly && !meta.fromServer) {
    socket.send(JSON.stringify({
      event: "storeDispatch",
      action: { payload, meta, type }
    }));
  }
  return nextAction;
};

function setupStore() {
  const composeEnhancers = composeWithDevTools({});

  const initialState = {};

  history = createBrowserHistory();

  store = createStore(
    connectRouter(history)(combineReducers({ ...reducers })),
    initialState,
    composeEnhancers(
      applyMiddleware(
        promiseMiddleware,
        routerMiddleware(history),
        updateWebSocketMiddleware
      )
    )
  );

  store.dispatch(
    registerUUID("overlayItems", {
      alpha: { x: 700, y: 0, width: 320, height: 200 },
      beta: { x: 350, y: 0, width: 320, height: 200 },
      gamma: { x: 350, y: 210, width: 320, height: 200 }
    })
  );
}

function setupAuth() {
  store.dispatch(actions.setAuthLoading());
  fetch("/auth/user")
    .then(response => response.json())
    .then(user => store.dispatch(actions.setAuthUser(user)));
}

function setupWebSocket() {
  const {
    setSocketConnecting,
    setSocketConnected,
    setSocketDisconnected
  } = actions;

  const { protocol, host } = window.location;
  socket = new ReconnectingWebSocket(
    `${protocol === "https" ? "wss" : "ws"}://${host}/socket`
  );

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
      const name = data.event in socketEventHandlers ? data.event : "default";
      socketEventHandlers[name]({ event, data });
    } catch (err) {
      log("socket message error", err, event);
    }
  });
}

const socketEventHandlers = {
  storeDispatch: ({ data: { action } }) => {
    store.dispatch(fromServer(action));
  },
  default: ({ data }) => {
    log("unexpected socket message", data);
  }
};

function renderApp() {
  render(
    <Provider store={store}>
      <Router history={history}>
        <Switch>
          <Route exact path="/" render={() => <App />} />
          <Route path="/overlay" render={() => <Overlay />} />
        </Switch>
      </Router>
    </Provider>,
    document.getElementById("root")
  );
}

init();
