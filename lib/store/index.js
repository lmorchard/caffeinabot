const { combineReducers } = require("redux");
const {
  createActions,
  handleActions,
  combineActions
} = require("redux-actions");
const {
  createUUIDReducer,
  getRegisteredUUIDs,
  getUUIDState
} = require("react-redux-uuid");
const {
  addMeta,
  fromServer,
  localOnly,
  persistCheckpoint,
  wrapActions
} = require("./utils");

const actions = {
  ...wrapActions(
    createActions(
      {
        setSocketDisconnected: () => "disconnected",
        setSocketConnecting: () => "connecting",
        setSocketConnected: () => "connected",
        setAuthLoading: () => true,
        setAuthLoaded: () => false
      },
      "setSystemTime",
      "setAuthUser",
      "storeRestore"
    ),
    localOnly
  ),
  ...wrapActions(createActions({}, "updateOverlayItem"), persistCheckpoint)
};

const selectors = {
  socketStatus: state => state.ui.socketStatus,
  socketConnected: state => state.ui.socketStatus === "connected",
  systemTime: state => state.ui.systemTime,
  authLoading: state => state.ui.authLoading,
  authUser: state => state.ui.authUser,
  overlayItemIds: state => getRegisteredUUIDs(state, "overlayItems"),
  getOverlayItem: state => id => getUUIDState(state, "overlayItems", id)
};

const sliceReducer = combineReducers({
  ui: handleActions(
    {
      [combineActions(
        actions.setSocketConnected,
        actions.setSocketConnecting,
        actions.setSocketDisconnected
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
  ),
  uuid: createUUIDReducer({
    overlayItems: handleActions(
      {
        [actions.updateOverlayItem]: (state, { payload }) => ({
          ...state,
          ...payload
        })
      },
      {}
    )
  })
});

const restoreReducer = (state, action) => {
  if (action.type === actions.storeRestore.toString()) {
    return { ...state, ...fromPersist(action.payload) };
  }
  return state;
};

const PERSIST_KEYS = ["uuid"];

const toPersist = state =>
  PERSIST_KEYS.reduce((acc, name) => ({ ...acc, [name]: state[name] }), {});

const fromPersist = state =>
  PERSIST_KEYS.reduce((acc, name) => ({ ...acc, [name]: state[name] }), {});

const rootReducer = (state, action) =>
  [sliceReducer, restoreReducer].reduce(
    (state, reducer) => reducer(state, action),
    state
  );

module.exports = {
  actions,
  selectors,
  rootReducer,
  toPersist,
  fromPersist
};
