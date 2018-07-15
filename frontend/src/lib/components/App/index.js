import React from "react";
import { connect } from "react-redux";
import { actions, selectors } from "../../store";

import SystemTime from "../SystemTime";

import "./index.scss";

const mapStateToProps = state => {
  const mappedSelectors = Object.entries(selectors).reduce(
    (acc, [name, selector]) => ({ ...acc, [name]: selector(state) }),
    {}
  );
  return {
    ...mappedSelectors
  };
};

const mapDispatchToProps = dispatch => ({
});

export const AppComponent = props => (
  <div className="app">
    <h1>Hello world!</h1>
    <p>Socket is: {props.socketStatus}</p>
    <SystemTime {...props} />
  </div>
);

export default connect(mapStateToProps, mapDispatchToProps)(AppComponent);
