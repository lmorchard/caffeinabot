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

const addMeta = meta => action => ({
  ...action,
  meta: { ...(action.meta || {}), ...meta }
});

const fromServer = addMeta({ fromServer: true });

const localOnly = addMeta({ localOnly: true });

const wrapActions = (actions, ...wrappers) =>
  Object.entries(actions).reduce((acc, [name, action]) => {
    const toString = action.toString;
    let wrapped = action;
    wrappers.forEach(wrapper => {
      const prevWrapped = wrapped;
      wrapped = (...args) => wrapper(prevWrapped(...args));
    });
    wrapped.toString = toString;
    return { ...acc, [name]: wrapped };
  }, {});

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
      "setAuthUser"
    ),
    localOnly
  ),
  ...createActions({}, "updateOverlayItem")
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

const reducers = {
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
};

module.exports = {
  actions,
  reducers,
  selectors,
  addMeta,
  fromServer,
  localOnly,
  wrapActions
};
