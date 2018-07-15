const http = require("http");
const Koa = require("koa");
const convert = require('koa-connect');
const history = require('connect-history-api-fallback');
const KoaStatic = require("koa-static");
const setupApp = require("./app");

const PORT = process.env.PORT || "8080";

const app = new Koa();
const server = http.createServer(app.callback());

const { log } = setupApp(app, server);

app.use(convert(history()));
app.use(KoaStatic("./frontend/build/"));

log.info(`Starting HTTP server on port ${PORT}`);
server.listen(PORT);
