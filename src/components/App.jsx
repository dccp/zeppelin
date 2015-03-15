import React from "react";
import Router from "react-router";
import NavBar from "./NavBar.jsx";

let RouteHandler = Router.RouteHandler;

let App = React.createClass({
  render() {
    return (
      <div>
        <NavBar/>
        {/* this is the important part */}
        <RouteHandler/>
      </div>
    );
  }
});

export default App;
