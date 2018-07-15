import { createStore, combineReducers } from "redux";
import { createActions, handleActions } from "redux-actions";
import undoable, { ActionCreators, ActionTypes } from "redux-undo";

export const actions = {
  ui: createActions(
    { },
    "SET_SOCKET_DISCONNECTED",
    "SET_SOCKET_CONNECTING",
    "SET_SOCKET_CONNECTED",
    "SET_SYSTEM_TIME"
  )
};

export const reducers = {
  ui: handleActions(
    {
      SET_SOCKET_DISCONNECTED: state => ({ ...state, socketStatus: "disconnected" }),
      SET_SOCKET_CONNECTING: state => ({ ...state, socketStatus: "connecting" }),
      SET_SOCKET_CONNECTED: state => ({ ...state, socketStatus: "connected" }),
      SET_SYSTEM_TIME: (state, { payload: systemTime }) =>
        ({ ...state, systemTime })
    },
    {
      socketStatus: "disconnected",
      systemTime: 0
    }
  )
};

export const selectors = {
  socketStatus: state => state.ui.socketStatus,
  systemTime: state => state.ui.systemTime
};

export const createAppStore = (initialState, enhancers) =>
  createStore(combineReducers({ ...reducers }), initialState, enhancers);
