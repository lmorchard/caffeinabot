import React from "react";
import { connect } from "react-redux";
import { Route, Link, Switch } from "react-router-dom";
import { actions, selectors } from "../../store";

import Resizable from "re-resizable";

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

const mapDispatchToProps = dispatch => ({});

export const AppComponent = props => (
  <div className="app">
    <h1>Hello world!</h1>
    <p>Socket is: {props.socketStatus}</p>
    <SystemTime {...props} />
    <Resizable
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "solid 1px #ddd",
        background: "#f0f0f0"
      }}
      defaultSize={{
        width: 200,
        height: 200
      }}
      onResizeStop={(e, direction, ref, d) => {
        console.log("RESIZE STOP", { e, direction, ref, d });
      }}
    >
      001
    </Resizable>
    <ul>
      <li>
        <Link to="/">Home</Link>
      </li>
      <li>
        <Link to="/about">About</Link>
      </li>
      <li>
        <Link to="/topics">Topics</Link>
      </li>
    </ul>

    <hr />

    <Switch>
      <Route exact path="/" component={() => <p>Home!</p>} />
      <Route path="/about" component={() => <p>About!</p>} />
      <Route path="/topics" component={() => <p>Topics!</p>} />
    </Switch>
  </div>
);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AppComponent);
