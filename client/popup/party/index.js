import React from "react";
import style from './party.css';
import * as utils from '../../utils';

class Party extends React.Component {
    onbecomeDjClick() {
        if (utils.isExtension()) {
            var { ConnectionManager } = utils.getBackground();
            ConnectionManager.getConnection().request({
                type: "become-dj"
            })
        } else {
            alert("Operation allowed only on chrome extension")
        }
    }

    componentDidMount() {
        localStorage.setItem("page", "party");
    }

    render() {
        return (
            <div className="party-page">
                <audio id="audio-player" autoPlay controls></audio>
                <div className="controls">
                    <button id="become-dj" onClick={this.onbecomeDjClick.bind(this)}>Become DJ</button>
                </div>
            </div>
        );
    }
}

export default (Party)