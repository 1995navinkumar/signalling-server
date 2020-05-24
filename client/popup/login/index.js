import React from "react";
import style from './login.css';
import { withRouter } from "react-router-dom";
import Snackbar from '../snackbar';
import * as utils from '../../utils';

class Login extends React.Component {
    constructor(props) {
        super(props);
    }
    login() {
        var background = utils.getBackground();
        var { ConnectionManager, SocketHandler } = background;
        utils.getUserProfile().then(profile => {
            var url = utils.isExtension() ? "localhost:8090" : location.host;
            var queryParams = new URLSearchParams({ email: profile.email }).toString();
            try {
                ConnectionManager.createConnection(url, queryParams, SocketHandler);
                this.props.app.setState({
                    route: "home"
                });
            } catch (error) {

            }
        });
    }
    onMessage({ page, type }) {
        if (page === "login") {
            this.props.history.push("home");
        }
    }
    componentDidMount() {
        localStorage.setItem("page", "login");
    }

    render() {
        return (
            <div className="login-page">
                <div className="login-content">
                    <img id="party-icon" src="assets/img/party-icon.png" />
                    <button id="login-button" onClick={this.login.bind(this)}>Dive In</button>
                </div>
            </div>
        );
    }
}

export default (Login)