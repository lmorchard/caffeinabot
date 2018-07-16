import React from "react";
import { connect } from "react-redux";
import { Route, Link, Switch } from "react-router-dom";
import { hot } from "react-hot-loader";
import { /* actions, */ selectors } from "../../lib/store";

import Resizable from "re-resizable";

import SystemTime from "../SystemTime";

import "./index.scss";

import Logo from "./logo.svg";

const mapDispatchToProps = dispatch => ({});

const mapStateToProps = state => {
  const mappedSelectors = Object.entries(selectors).reduce(
    (acc, [name, selector]) => ({ ...acc, [name]: selector(state) }),
    {}
  );
  return {
    ...mappedSelectors
  };
};

export const AppComponent = props => (
  <div className="app">
        <nav class="ui borderless menu">
          <div class="ui container">
            <a class="brand item" href="/"><img style={{ color: "white" }} src={Logo} /></a><a class="item" href="/themes">Themes</a><a class="item" href="/templates">Templates</a><a class="item" href="/blog">Blog</a>
            <div class="right menu">
              <a class="item" href="https://github.com/semantic-ui-forest"><i class="github icon"></i></a><a class="item" href="/atom.xml"><i class="feed icon"></i></a>
              <div class="item">
                <form action="https://www.google.com/search" class="ui form" method="get" target="_blank">
                  <input name="q" type="hidden" value="site:semantic-ui-forest.com" />
                  <div class="ui left icon transparent input">
                    <input name="q" placeholder="Search..." type="text" /><i class="search icon"></i>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </nav>

    <h1>Hello world!</h1>
    <AuthStatus {...props} />
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
        console.log("RESIZE STOP", { e, direction, ref, d }); // eslint-disable-line
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

const AuthStatus = ({ authLoading, authUser }) => (
  <div className="auth-status">
    {authLoading && <p>Loading...</p>}
    {!authLoading &&
      !authUser && (
        <a className="twitch-login" href="/auth/twitch">
          Login with Twitch
        </a>
      )}
    {!authLoading &&
      !!authUser && (
        <p>
          <img src={authUser.logo} width="100" height="100" />
          <br />
          <span className="auth-display-name">{authUser.display_name}</span>
          <br />
          <span className="logout">
            [<a href="/auth/logout">Logout</a>]
          </span>
        </p>
      )}
  </div>
);

export default connect(mapStateToProps, mapDispatchToProps)(
  hot(module)(AppComponent)
);
