const addMeta = meta => action => ({
  ...action,
  meta: { ...(action.meta || {}), ...meta }
});

const fromServer = addMeta({ fromServer: true });

const localOnly = addMeta({ localOnly: true });

const persistCheckpoint = addMeta({ persistCheckpoint: true });

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

module.exports = {
  addMeta,
  fromServer,
  localOnly,
  wrapActions,
  persistCheckpoint
};
