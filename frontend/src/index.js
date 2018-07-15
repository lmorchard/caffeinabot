import React from "react";
import { render } from "react-dom";
// import { Provider } from "react-redux";

import App from "./lib/components/App";
import "./index.scss";

const root = document.createElement("div");
root.id = "root";
document.body.appendChild(root);
render(<App />, root);

const { protocol, host } = window.location;
const socket = new WebSocket(
  `${protocol === "https" ? "wss" : "ws"}://${host}`
);
socket.addEventListener("open", event => {
  console.log("SOCKET OPEN");
  socket.send("HELLO HI YAYAY");
});
socket.addEventListener("message", event => {
  console.log("SOCKET MESSAGE", event.data);
});
