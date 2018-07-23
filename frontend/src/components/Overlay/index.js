import React from "react";
import classnames from "classnames";
import { connect } from "react-redux";
import { hot } from "react-hot-loader";
import Draggable from "react-draggable";
import Resizable from "re-resizable";
//import { ResizableBox } from "react-resizable";
import { /* actions, */ selectors } from "../../lib/store";

import "./index.scss";

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

export class Overlay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: {
        one: { id: "one", x: 0, y: 0, width: 320, height: 200 },
        two: { id: "two", x: 350, y: 0, width: 320, height: 200 },
        three: { id: "three", x: 350, y: 210, width: 320, height: 200 }
      }
    };
  }

  updateItem = (id, x, y, width, height) => {
    const { items } = this.state;
    this.setState({
      items: { ...items, [id]: { ...items[id], x, y, width, height } }
    });
  };

  render() {
    const { updateItem } = this;
    const { items } = this.state;
    return (
      <div>
        {Object.entries(items).map(([id, item]) => (
          <OverlayBox {...{ key: id, id, item, updateItem }} />
        ))}
        <pre>{JSON.stringify(items, null, " ")}</pre>
      </div>
    );
  }
}

class OverlayBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.stateFromItem(props.item);
  }

  stateFromItem(item) {
    const { x, y, width, height } = item;
    return {
      x,
      y,
      width,
      height,
      deltaX: 0,
      deltaY: 0,
      deltaWidth: 0,
      deltaHeight: 0
    };
  }

  reset = () => {
    this.setState(this.stateFromItem(this.props.item));
  };

  commit = () => {
    const newState = {
      x: this.state.x + this.state.deltaX,
      y: this.state.y + this.state.deltaY,
      width: this.state.width + this.state.deltaWidth,
      height: this.state.height + this.state.deltaHeight,
      deltaX: 0,
      deltaY: 0,
      deltaWidth: 0,
      deltaHeight: 0
    };
    this.setState(newState);
    this.props.updateItem(
      this.props.item.id,
      newState.x,
      newState.y,
      newState.width,
      newState.height
    );
  };

  handleDrag = (ev, { x, y }) => this.setState({ x, y });

  handleResize = (ev, dir, ref, delta) => {
    const newState = { deltaWidth: delta.width, deltaHeight: delta.height };
    const ldir = dir.toLowerCase();
    if (ldir.includes("top")) {
      newState.deltaY = 0 - delta.height;
    }
    if (ldir.includes("left")) {
      newState.deltaX = 0 - delta.width;
    }
    this.setState(newState);
  };

  render() {
    const { item, id, setItemPosition, setItemSize } = this.props;
    const { x, y, deltaX, deltaY, width, height } = this.state;
    return (
      <Draggable
        handle=".dragHandle"
        position={{ x: x + deltaX, y: y + deltaY }}
        onStart={this.reset}
        onDrag={this.handleDrag}
        onStop={this.commit}
      >
        <Resizable
          size={{ width, height }}
          style={{ position: "absolute" }}
          onResizeStart={this.reset}
          onResize={this.handleResize}
          onResizeStop={this.commit}
        >
          <div className="overlayBoxContent">
            <div className="dragHandle">XXX</div>
            <h3>{item.id}</h3>
            <pre>{JSON.stringify(this.state, null, " ")}</pre>
          </div>
        </Resizable>
      </Draggable>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(hot(module)(Overlay));
