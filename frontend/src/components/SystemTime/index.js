import React from "react";

export const SystemTime = ({ systemTime }) => (
  <p>
    <b>System time:</b> {new Date(systemTime).toISOString()}
  </p>
);

export default SystemTime;
