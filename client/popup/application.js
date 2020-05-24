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
			route: localStorage.getItem("page")
		};
	}

	componentDidMount() {
		var background = utils.getBackground();
		var connection = background.ConnectionManager.getConnection();
		var route = localStorage.getItem("page") || "user";
		utils.getUserProfile().then(details => {
			var { email } = details;
			if (utils.isExtension()) {
				if (!(connection && connection.ws.readyState == 1)) {
					route = "login";
				}
			} else {
				if (email) {
					route = "login";
				}
			}
			this.setState({
				route
			})
		})
	}

	render() {
		var RenderComponent = componentMap[this.state.route] || null;
		return (
			RenderComponent
				? (
					<div className="main">
						<Header app={this} />
						<RenderComponent app={this} />
					</div>
				)
				: (
					<div className="main">
						<Header app={this} />
					</div>
				)
		);
	}
}
