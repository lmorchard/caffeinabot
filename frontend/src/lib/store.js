import { createActions, handleActions, combineActions } from "redux-actions";
// import undoable, { ActionCreators, ActionTypes } from "redux-undo";

export const actions = createActions(
  {
    SET_SOCKET_DISCONNECTED: () => ({ socketStatus: "disconnected" }),
    SET_SOCKET_CONNECTING: () => ({ socketStatus: "connecting" }),
    SET_SOCKET_CONNECTED: () => ({ socketStatus: "connected" })
  },
  "SET_SYSTEM_TIME"
);

export const reducers = {
  ui: handleActions(
    {
      [combineActions(
        actions.setSocketDisconnected,
        actions.setSocketConnecting,
        actions.setSocketConnected
      )]: (state, { payload: { socketStatus } }) => ({
        ...state,
        socketStatus
      }),
      [actions.setSystemTime]: (state, { payload: systemTime }) => ({
        ...state,
        systemTime
      })
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
