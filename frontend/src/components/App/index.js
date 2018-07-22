import React from "react";
import classnames from "classnames";
import { connect } from "react-redux";
import { Route, Link, Switch } from "react-router-dom";
import { hot } from "react-hot-loader";
import { /* actions, */ selectors } from "../../lib/store";
import GridLayout from "react-grid-layout";
import Resizable from "re-resizable";

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

export const AppComponent = props => (
  <div className="app">
    <nav className="topNav">
      <section className="primary">
        <img src={Logo} className="logo" />
        <h1>caffeinabot</h1>
      </section>
      <section className="secondary">
        <AuthStatus {...props} />
      </section>
    </nav>

    <ResponsiveLocalStorageLayout />

    <p>Socket is: {props.socketStatus}</p>
    <SystemTime {...props} />

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

export default connect(mapStateToProps, mapDispatchToProps)(
  hot(module)(AppComponent)
);

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

  resetLayout() {
    console.log("RESET");
    this.setState({ layouts: {} });
  }

  onLayoutChange(layout, layouts) {
    console.log("ON LAYOUT CHANGE", layout, layouts);
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
          draggableHandle=".titleBar"
          layouts={this.state.layouts || defaultLayout}
          onLayoutChange={(layout, layouts) =>
            this.onLayoutChange(layout, layouts)}
        >
          {Panel1({})}

          {Panel2({})}

          {Panel(
            {
              key: "3",
              dataGrid: { w: 2, h: 3, x: 4, y: 0, minW: 2, minH: 3 }
            },
            <span className="text">3</span>
          )}

          {Panel(
            {
              key: "4",
              dataGrid: { w: 2, h: 3, x: 6, y: 0, minW: 2, minH: 3 }
            },
            <span className="text">4</span>
          )}

          {Panel(
            {
              key: "5",
              dataGrid: { w: 2, h: 3, x: 8, y: 0, minW: 2, minH: 3 }
            },
            <span className="text">5</span>
          )}
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

const SystemTime = ({ systemTime }) => (
  <div className="system-time">{new Date(systemTime).toISOString()}</div>
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
        <React.Fragment>
          <div className="meta">
            <div className="auth-display-name">{authUser.display_name}</div>
            <div className="logout">
              <a href="/auth/logout">Logout</a>
            </div>
          </div>
          <img className="avatar" src={authUser.logo} />
        </React.Fragment>
      )}
  </div>
);

const Panel = (
  {
    title = "Panel",
    className = "",
    key = "1",
    dataGrid = { w: 2, h: 3, x: 2, y: 0, minW: 2, minH: 3 }
  },
  children = null
) => (
  <div
    className={classnames("panel", className)}
    key={key}
    data-grid={dataGrid}
  >
    <div className="wrapper">
      <header className="titleBar">
        <i className="fa fa-bars" aria-hidden="true" />
        <span>{title}</span>
      </header>
      <section className="content">{children}</section>
    </div>
  </div>
);

const Panel2 = ({ title = "Panel 2" }) => (
  <div
    className="panel panel-2"
    key="2"
    data-grid={{ w: 2, h: 3, x: 2, y: 0, minW: 2, minH: 3 }}
  >
    <div className="wrapper">
      <header className="titleBar">
        <i className="fa fa-bars" aria-hidden="true" />
        <span>{title}</span>
      </header>
      <section className="content">
        <p>This is some test content</p>
        <ul>
          <li>One</li>
          <li>Two</li>
          <li>Three</li>
        </ul>
      </section>
    </div>
  </div>
);

const Panel1 = ({ title = "Panel 1" }) => (
  <div
    key="1"
    data-grid={{ w: 2, h: 3, x: 0, y: 0, minW: 2, minH: 3 }}
    className="panel panel-1"
  >
    <div className="wrapper">
      <header className="titleBar">
        <i className="fa fa-bars" aria-hidden="true" />
        <span>{title}</span>
      </header>
      <section className="content">
        <div className="griddy">
          <div className="one">One</div>
          <div className="two">Two</div>
          <div className="three">Three</div>
          <div className="four">Four</div>
          <div className="five">Five</div>
          <div className="six">Six</div>
        </div>
      </section>
    </div>
  </div>
);
