import React from "react";
import classnames from "classnames";
import { connect } from "react-redux";
import { hot } from "react-hot-loader";
import Draggable from "react-draggable";
import Resizable from "re-resizable";
import Rnd from "react-rnd";
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
          <OverlayItem {...{ key: id, id, item, updateItem }} />
        ))}
        <pre>{JSON.stringify(items, null, " ")}</pre>
      </div>
    );
  }
}

const OverlayItem = ({
  id,
  item: { x, y, width, height },
  updateItem,
  className = "overlayBox"
}) => (
  <Rnd
    className={className}
    position={{ x, y }}
    size={{ width, height }}
    style={{ cursor: "normal" }}
    resizeHandleWrapperClass="handles"
    resizeHandleClasses={{
      left: "left",
      right: "right",
      top: "top",
      bottom: "bottom",
      bottomLeft: "bottomLeft",
      bottomRight: "bottomRight",
      topLeft: "topLeft",
      topRight: "topRight"
    }}
    dragHandleClassName="dragHandle"
    onDragStop={(e, d) => updateItem(id, d.x, d.y, width, height)}
    onResize={(e, direction, ref, delta, position) =>
      updateItem(id, position.x, position.y, ref.offsetWidth, ref.offsetHeight)
    }
  >
    <div className="content">
      <div className="dragHandle">XXX</div>
      <h3>{id}</h3>
    </div>
  </Rnd>
);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(hot(module)(Overlay));
