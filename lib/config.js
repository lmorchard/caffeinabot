module.exports = (env = process.env) => {
  const {
    HOST = "localhost",
    PORT = "8080",
    NODE_ENV = "production",
    VERBOSE = "false",
    USE_HTTPS = "false",
    KEYS,
    TWITCH_CLIENT_ID,
    TWITCH_CLIENT_SECRET,
    TWITCH_CHAT_CHANNELS,
    TWITCH_BOT_USERNAME,
    TWITCH_BOT_PASSWORD
  } = env;

  return {
    HOST,
    PORT,
    VERBOSE: VERBOSE === "true",
    USE_HTTPS: USE_HTTPS === "true",
    KEYS,
    TWITCH_CLIENT_ID,
    TWITCH_CLIENT_SECRET,
    TWITCH_CHAT_CHANNELS,
    TWITCH_BOT_USERNAME,
    TWITCH_BOT_PASSWORD
  };
};
