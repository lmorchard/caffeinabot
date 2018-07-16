const Twitch = require("twitch-js");

module.exports = ({ log, db, config }) => {
  const twitchConfig = config.get("twitch");
  const options = {
    debug: true,
    clientId: twitchConfig.clientId,
    channels: ["#lmorchard"],
    identity: {
      username: twitchConfig.botUsername,
      password: twitchConfig.botPassword
    }
  };
  const client = new Twitch.client(options);

  client.on("connected", () => {
    log.info("Chatbot connected");
    // client.say("#lmorchard", "I am here");
  });

  client.on("chat", (channel, userstate, message, self) => {
    console.log(
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
