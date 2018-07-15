const serve = require("webpack-serve");

const setupApp = require("./app");

const argv = {};
const path = require("path");
const config = require(path.resolve(__dirname, "../webpack.config.js"));

serve(argv, { config }).then(({app, on, options}) => {
  setupApp(app, app.server);
});
