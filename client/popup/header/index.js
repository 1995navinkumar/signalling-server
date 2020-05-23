import React from "react";
import style from './header.css';
import * as utils from '../../utils';

class Header extends React.Component {
    redirectToSettings() {
        this.props.history.push("settings");
    }
    redirectToNotification() {
        this.props.history.push("notification");
    }
    redirectToLogin() {
        var { ConnectionManager, peer } = utils.getBackground();
        ConnectionManager.terminateConnection();
        peer.stopStreaming();
        this.props.app.setState({
            route: "login"
        })
    }
    render() {
        return (
            <div className="header">
                <h2>Katcheri</h2>
                <img id="settings-icon" src="assets/img/settings.png" onClick={this.redirectToSettings.bind(this)} />
                <div className="notification-icon-container" onClick={this.redirectToNotification.bind(this)}>
                    <img id="notification-icon" className="icon" src="assets/img/notification-icon.png" />
                    <div className="dot"></div>
                </div>
                <img id="logout-icon" src="assets/img/logout.png" onClick={this.redirectToLogin.bind(this)} />
            </div>
        );
    }
}

export default (Header);