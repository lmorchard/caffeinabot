import React from "react";
import { connect } from "react-redux";
import { Route, Link, Switch } from "react-router-dom";
import { hot } from "react-hot-loader";
import { /* actions, */ selectors } from "../../lib/store";
import GridLayout from "react-grid-layout";
import Resizable from "re-resizable";
import SystemTime from "../SystemTime";

import { WidthProvider, Responsive } from "react-grid-layout";

const ResponsiveReactGridLayout = WidthProvider(Responsive);
const originalLayouts = getFromLS("layouts") || {};

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

/**
 * This layout demonstrates how to sync multiple responsive layouts to localstorage.
 */
class ResponsiveLocalStorageLayout extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      layouts: JSON.parse(JSON.stringify(originalLayouts))
    };
  }

  static get defaultProps() {
    return {
      className: "layout",
      cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
      rowHeight: 30
    };
  }

  onLayoutChange(layout, layouts) {
    saveToLS("layouts", layouts);
    this.setState({ layouts });
  }

  render() {
    return (
      <div>
        <ResponsiveReactGridLayout
          className="panels"
          compactType="horizontal"
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={30}
          layouts={this.state.layouts}
          onLayoutChange={(layout, layouts) =>
            this.onLayoutChange(layout, layouts)}
        >
          <div
            className="panel"
            key="1"
            data-grid={{ w: 2, h: 3, x: 0, y: 0, minW: 2, minH: 3 }}
          >
            <span className="text">1</span>
          </div>
          <div
            className="panel"
            key="2"
            data-grid={{ w: 2, h: 3, x: 2, y: 0, minW: 2, minH: 3 }}
          >
            <span className="text">2</span>
          </div>
          <div
            className="panel"
            key="3"
            data-grid={{ w: 2, h: 3, x: 4, y: 0, minW: 2, minH: 3 }}
          >
            <span className="text">3</span>
          </div>
          <div
            className="panel"
            key="4"
            data-grid={{ w: 2, h: 3, x: 6, y: 0, minW: 2, minH: 3 }}
          >
            <span className="text">4</span>
          </div>
          <div
            className="panel"
            key="5"
            data-grid={{ w: 2, h: 3, x: 8, y: 0, minW: 2, minH: 3 }}
          >
            <span className="text">5</span>
          </div>
        </ResponsiveReactGridLayout>
      </div>
    );
  }
}

function getFromLS(key) {
  let ls = {};
  if (global.localStorage) {
    try {
      ls = JSON.parse(global.localStorage.getItem("rgl-8")) || {};
    } catch (e) {
      /*Ignore*/
    }
  }
  return ls[key];
}

function saveToLS(key, value) {
  if (global.localStorage) {
    global.localStorage.setItem(
      "rgl-8",
      JSON.stringify({
        [key]: value
      })
    );
  }
}

export const AppComponent = props => (
  <div className="app">
    <nav className="topNav">
      <section className="primary">
        <img src={Logo} style={{ width: 48, height: 48, margin: (64 - 48) / 2 }} />
      </section>
      <section className="secondary">
        <SystemTime {...props} />
        <AuthStatus {...props} />
      </section>
    </nav>

    <ResponsiveLocalStorageLayout />
    <h1>Hello world!</h1>
    <p>Socket is: {props.socketStatus}</p>
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
          <img src={authUser.logo} width="32" height="32" />
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
