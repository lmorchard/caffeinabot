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
import { selectors, rootReducer, actions, toPersist } from "../../lib/store";
import { fromServer } from "../../lib/store/utils";
import { makeLog } from "./lib/utils";

import "./index.scss";

import App from "./components/App";
import Overlay from "./components/Overlay";

const log = makeLog("index");

let history, store, socket;

const socketSend = (event, data = {}) => {
  if (!socket) return;
  socket.send(JSON.stringify({ ...data, event }));
};

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

function setupStore() {
  const composeEnhancers = composeWithDevTools({});

  const initialState = {};

  history = createBrowserHistory();

  store = createStore(
    connectRouter(history)(rootReducer),
    initialState,
    composeEnhancers(
      applyMiddleware(
        promiseMiddleware,
        routerMiddleware(history),
        webSocketMiddleware
      )
    )
  );
  /*
  store.dispatch(
    registerUUID("overlayItems", {
      alpha: { x: 700, y: 0, width: 320, height: 200 },
      beta: { x: 350, y: 0, width: 320, height: 200 },
      gamma: { x: 350, y: 210, width: 320, height: 200 }
    })
  );
  */
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
    socketSend("storeRestore");
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
  storeRestore: ({ data }) => {
    store.dispatch(actions.storeRestore(data.store));
  },
  default: ({ data }) => {
    log("unexpected socket message", data);
  }
};

const PERSIST_DELAY = 500;
let persistTimer, persistInProgress;

const webSocketMiddleware = ({ getState }) => next => action => {
  const nextAction = next(action);
  const { type, payload, meta = {} } = nextAction;
  const state = getState();

  if (socket && selectors.socketConnected(state)) {
    if (!meta.localOnly && !meta.fromServer) {
      socketSend("storeDispatch", { action: { payload, meta, type } });
    }

    if (meta.persistCheckpoint) {
      if (persistTimer) clearTimeout(persistTimer);
      persistTimer = setTimeout(
        () =>
          socketSend("storePersist", {
            store: toPersist(store.getState())
          }),
        PERSIST_DELAY
      );
    }
  }

  return nextAction;
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
