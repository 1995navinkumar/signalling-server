import React from "react";

import * as utils from '../utils';

import User from './user';
import Header from './header';
import Login from './login';
import Home from './home';
import Party from './party';
import Settings from './settings';
import Notification from './notification';
import style from "./style.css";

var componentMap = {
	user: User,
	header: Header,
	login: Login,
	home: Home,
	party: Party,
	settings: Settings,
	notification: Notification
};

module.exports = class App extends React.Component {
	constructor(props) {
		super(props);
		window.app = this;
		this.state = {
			style: {
				visibility: "hidden"
			},
			route: ""
		};
	}

	componentDidMount() {
		var background = utils.getBackground();
		var connection = background.ConnectionManager.getConnection();
		var route = localStorage.getItem("page") || "user";
		utils.getUserProfile().then(details => {
			var { email } = details;
			if (!email && !utils.isExtension()) {
				route = "user"
			} else {
				route = "login"
			}
			if (connection && connection.ws.readyState == 1) {
				route
			}
			this.setState({
				route
			})
		})
	}

	render() {
		var RenderComponent = componentMap[this.state.route || "login"];
		return (
			<div className="main">
				<Header app={this} />
				<RenderComponent app={this} />
			</div>
		);
	}
}
