const Twitch = require("twitch-js");

module.exports = ({ log, db, config }) => {
  const options = {
    debug: true,
    clientId: config.TWITCH_CLIENT_ID,
    channels: config.TWITCH_CHAT_CHANNELS.split(",").map(c => `#${c}`),
    identity: {
      username: config.TWITCH_BOT_USERNAME,
      password: config.TWITCH_BOT_PASSWORD
    }
  };
  const client = new Twitch.client(options);

  client.on("connected", () => {
    log.info("Chatbot connected");
    // client.say("#lmorchard", "I am here");
  });

  client.on("chat", (channel, userstate, message, self) => {
    log.debug(
      `Message "${message}" received from ${userstate["display-name"]}`
    );

    // Do not repond if the message is from the connected identity.
    if (self) return;

    if (options.identity && message === "!command") {
      // If an identity was provided, respond in channel with message.
      client.say(channel, "Hello world!");
    }
  });

  // Finally, connect to the channel
  client.connect();
};
