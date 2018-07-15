const http = require("http");
const Koa = require("koa");
const KoaStatic = require("koa-static");
const setupApp = require("./app");

const PORT = process.env.PORT || "8080";

const app = new Koa();
const server = http.createServer(app.callback());
app.use(KoaStatic("./frontend/build/"));

const { log } = setupApp(app, server);
log.info(`Starting HTTP server on port ${PORT}`);
server.listen(PORT);
