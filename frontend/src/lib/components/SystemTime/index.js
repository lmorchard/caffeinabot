import React from "react";

export const SystemTime = ({ systemTime }) => (
  <p>
    <b>System time:</b> {new Date(systemTime).toString()}
  </p>
);

export default SystemTime;
