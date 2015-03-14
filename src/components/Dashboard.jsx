import React from "react";
import InfoBox from "./infobox.jsx";

let Dashboard = React.createClass({
    render() {
        return (
            <div className="container">
                <h1>
                    Zeppelin Dashboard
                </h1>
                <p className="lead">This is the dev dashboard. You can call it the stairway to heaven.</p>
                <div className="row">
                    <div className="col-md-12">
                        <InfoBox />
                    </div>
                </div>
            </div>
        );
    }
});

export default Dashboard;
