import React from "react";
import classnames from "classnames";
import { connect } from "react-redux";
import { Route, Link, Switch } from "react-router-dom";
import { hot } from "react-hot-loader";
import { /* actions, */ selectors } from "../../lib/store";
import GridLayout from "react-grid-layout";

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

    <ResponsiveLocalStorageLayout {...props} />
  </div>
);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(hot(module)(AppComponent));

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
    this.setState({ layouts: {} });
  }

  onLayoutChange(layout, layouts) {
    saveToLS("layouts", layouts);
    this.setState({ layouts });
  }

  render() {
    const { authUser, authLoading } = this.props;

    return (
      <div>
        <ResponsiveReactGridLayout
          className="panels"
          compactType="horizontal"
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={30}
          preventCollision={false}
          draggableHandle=".dragHandle"
          layouts={this.state.layouts || defaultLayout}
          onLayoutChange={(layout, layouts) =>
            this.onLayoutChange(layout, layouts)
          }
        >
          {Panel(
            {
              title:
                "This is an extra long panel title that should break because it should be really extra long that stretches quite a long distance",
              key: "1",
              dataGrid: { w: 2, h: 3, x: 4, y: 0, minW: 2, minH: 3 }
            },
            <React.Fragment>
              <p>This is some test content</p>
              <ul>
                <li>One</li>
                <li>Two</li>
                <li>Three</li>
              </ul>
            </React.Fragment>
          )}

          {Panel(
            {
              title: "Griddy",
              key: "2",
              dataGrid: { w: 2, h: 3, x: 4, y: 0, minW: 2, minH: 3 }
            },
            <div className="griddy">
              <div className="one">One</div>
              <div className="two">Two</div>
              <div className="three">Three</div>
              <div className="four">Four</div>
              <div className="five">Five</div>
              <div className="six">Six</div>
            </div>
          )}

          {Panel(
            {
              title: "Socket status",
              key: "3",
              dataGrid: { w: 2, h: 3, x: 4, y: 0, minW: 2, minH: 3 }
            },
            <div>
              <p>Socket is: {this.props.socketStatus}</p>
              <SystemTime systemTime={this.props.systemTime} />
            </div>
          )}

          {Panel(
            {
              title: "Twitch Chat",
              key: "4",
              dataGrid: { w: 2, h: 3, x: 6, y: 0, minW: 2, minH: 3 }
            },
            authLoading ? (
              <p>Loading...</p>
            ) : (
              <iframe
                frameBorder="0"
                scrolling="no"
                id="chat_embed"
                style={{ width: "100%", height: "100%" }}
                src={`http://www.twitch.tv/embed/${
                  authUser.name
                }/chat?darkpopout`}
              />
            )
          )}

          {Panel(
            {
              title: "Twitch Preview",
              key: "5",
              dataGrid: { w: 2, h: 3, x: 8, y: 0, minW: 2, minH: 3 }
            },
            authLoading ? (
              <p>Loading...</p>
            ) : (
              <iframe
                frameBorder="0"
                scrolling="no"
                id="chat_embed"
                style={{ width: "100%", height: "100%" }}
                src={`http://player.twitch.tv/?channel=${
                  authUser.name
                }&muted=true&autoplay=true`}
              />
            )
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
      <header>
        <button className="menu">
          <i className="fa fa-bars" aria-hidden="true" />
        </button>
        <span className="title dragHandle">{title}</span>
        <button className="pin inactive">
          <i className="fa fa-thumb-tack" aria-hidden="true" />
        </button>
        <button className="close">
          <i className="fa fa-times" aria-hidden="true" />
        </button>
      </header>
      <section className="content">{children}</section>
    </div>
  </div>
);
