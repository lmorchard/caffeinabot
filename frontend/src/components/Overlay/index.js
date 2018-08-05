import React from "react";
import classnames from "classnames";
import { connect } from "react-redux";
import { connectUUID } from "react-redux-uuid";
import { hot } from "react-hot-loader";
import Draggable from "react-draggable";
import Resizable from "re-resizable";
import Rnd from "react-rnd";
import { actions, selectors } from "../../../../lib/store";

import "./index.scss";

const mapDispatchToProps = dispatch => ({});

const mapStateToProps = state => {
  const mappedSelectors = Object.entries(selectors).reduce(
    (acc, [name, selector]) => ({ ...acc, [name]: selector(state) }),
    {}
  );
  return { ...mappedSelectors };
};

export class Overlay extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { overlayItemIds, getOverlayItem } = this.props;
    const { updateItem } = this;
    return (
      <div>
        {overlayItemIds.map(id => (
          <UuidOverlayItem {...{ ...this.props, key: id, uuid: id }} />
        ))}
        <pre>
          {JSON.stringify(
            overlayItemIds.map(id => getOverlayItem(id)),
            null,
            " "
          )}
        </pre>
      </div>
    );
  }
}

const OverlayItem = props => {
  const {
    uuid,
    x,
    y,
    width,
    height,
    updateItem,
    className = "overlayBox"
  } = props;
  return (
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
      onDrag={(e, d) => updateItem(d.x, d.y, width, height)}
      onDragStop={(e, d) => updateItem(d.x, d.y, width, height)}
      onResize={(e, direction, ref, delta, position) =>
        updateItem(position.x, position.y, ref.offsetWidth, ref.offsetHeight)}
    >
      <div className="content">
        <div className="dragHandle">XXX</div>
        <div className="griddy">
          <div className="one">{uuid}</div>
          <div className="two">Two</div>
          <div className="three">Three</div>
          <div className="four">Four</div>
          <div className="five">Five</div>
          <div className="six">Six</div>
        </div>
      </div>
    </Rnd>
  );
};

const UuidOverlayItem = connectUUID(
  "overlayItems",
  (state, props) => ({
    ...state,
    ...props
  }),
  {
    updateItem: (x, y, width, height) =>
      actions.updateOverlayItem({ x, y, width, height })
  }
)(OverlayItem);

export default connect(mapStateToProps, mapDispatchToProps)(
  hot(module)(Overlay)
);
