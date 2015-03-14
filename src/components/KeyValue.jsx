import React from "react";

let KeyValue = React.createClass({
    render() {
        return (
            <div className="item">
              <h5>
                {this.props.label + ": "}
                <strong>
                    {this.props.children}
                </strong>
              </h5>
            </div>
        );
    }
})

export default KeyValue;
