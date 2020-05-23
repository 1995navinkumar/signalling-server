import React from "react";
import style from './home.css';
import * as utils from '../../utils';

class Home extends React.Component {

    constructor(props) {
        super(props);
        this.state = { partyName: '' };
        this.onMessage = this.onMessage.bind(this);
    }

    handleChange(event) {
        this.setState({ partyName: event.target.value });
    }

    createParty() {
        let partyName = this.state.partyName || "navin";
        var { ConnectionManager } = utils.getBackground();
        ConnectionManager.getConnection().request({
            type: "create-party",
            data: {
                partyId: partyName
            }
        });
    }

    joinParty() {
        let partyName = this.state.partyName || "navin";
        var { ConnectionManager } = utils.getBackground();
        ConnectionManager.getConnection().request({
            type: "join-party",
            data: {
                partyId: partyName
            }
        });
    }

    componentDidMount() {
        localStorage.setItem("page", "home");
    }

    render() {
        return (
            <div className="home-page">
                <input id="input__party-name" value={this.state.partyName} onChange={this.handleChange.bind(this)} type="text" placeholder="enter party name to join" />
                <button id="join-party" onClick={this.joinParty.bind(this)}>Join Party</button>
                <button id="create-party" onClick={this.createParty.bind(this)}>Create Party</button>
            </div>
        );
    }
}

export default (Home);