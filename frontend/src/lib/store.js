import { createActions, handleActions, combineActions } from "redux-actions";
// import undoable, { ActionCreators, ActionTypes } from "redux-undo";

export const actions = createActions(
  {
    SET_SOCKET_DISCONNECTED: () => "disconnected",
    SET_SOCKET_CONNECTING: () => "connecting",
    SET_SOCKET_CONNECTED: () => "connected",
    SET_AUTH_LOADING: () => true,
    SET_AUTH_LOADED: () => false
  },
  "SET_SYSTEM_TIME",
  "SET_AUTH_USER"
);

export const reducers = {
  ui: handleActions(
    {
      [combineActions(
        actions.setSocketDisconnected,
        actions.setSocketConnecting,
        actions.setSocketConnected
      )]: (state, { payload: socketStatus }) => ({
        ...state,
        socketStatus
      }),
      [actions.setSystemTime]: (state, { payload: systemTime }) => ({
        ...state,
        systemTime
      }),
      [combineActions(actions.setAuthLoading, actions.setAuthLoaded)]: (
        state,
        { payload: authLoading }
      ) => ({
        ...state,
        authLoading
      }),
      [actions.setAuthUser]: (state, { payload: authUser }) => ({
        ...state,
        authUser,
        authLoading: false
      })
    },
    {
      socketStatus: "disconnected",
      systemTime: 0,
      authLoading: false,
      authUser: null
    }
  )
};

export const selectors = {
  socketStatus: state => state.ui.socketStatus,
  systemTime: state => state.ui.systemTime,
  authLoading: state => state.ui.authLoading,
  authUser: state => state.ui.authUser
};
