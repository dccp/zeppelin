import React from "react";
import InfoBox from "./infobox.jsx";

let Dashboard = React.createClass({
    render() {
        return (
            <div className="container">
                <h1>
                    Zeppelin Dashboard
                </h1>
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
