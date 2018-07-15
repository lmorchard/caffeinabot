const bunyan = require("bunyan");

module.exports = (appContext) => async (ctx, next) => {
    const startTime = new Date();
    ctx.log = appContext.log.child({ source: "http", reqId: ctx.reqId });
    ctx.log.addSerializers({
      req: reqSerializer,
      res: resSerializer,
      err: bunyan.stdSerializers.err
    });

    ctx.log.info(
      { req: ctx, event: 'request' },
      `Request start for id: ${ctx.reqId}`
    );

    try {
      await next();
    } catch (err) {
      ctx.log.error(
        { err, event: 'error' },
        `Unhandled exception occured on the request: ${ctx.reqId}`
      );
      throw err;
    }

    ctx.responseTime = new Date() - startTime;
    ctx.log.info(
      { req: ctx, res: ctx, event: 'response' },
      `Request successfully completed for id: ${ctx.reqId}`
    );
  };

function reqSerializer(ctx = {}) {
  return {
    method: ctx.method,
    path: ctx.path,
    url: ctx.url,
    headers: ctx.headers,
    protocol: ctx.protocol,
    ip: ctx.ip,
    query: ctx.query
  };
}

function resBodySerializer({ status, code, message } = {}) {
  const body = { status, message };
  if (code)
    body.code = code;
  return body;
}

function resSerializer(ctx = {}) {
  return {
    statusCode: ctx.status,
    responseTime: ctx.responseTime,
    type: ctx.type,
    headers: (ctx.response || {}).headers,
    body: resBodySerializer(ctx.body)
  };
}
