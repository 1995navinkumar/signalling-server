import React, { Component } from 'react'

export class UserDetails extends Component {
    constructor(props) {
        super(props)
        this.submit = this.submit.bind(this);
        this.onChange = this.onChange.bind(this);
        this.state = {
            email: ""
        }
    }

    submit() {
        var email = this.state.email
        var userProfile = {
            email
        };
        localStorage.setItem("userProfile", JSON.stringify(userProfile));
        this.props.app.setState({
            route : "login"
        });
    }

    onChange(event) {
        this.setState({ email: event.target.value });
    }

    render() {
        return (
            <div className="user-details">
                <input type="text" name="email" placeholder="Enter Email" value={this.state.email} onChange={this.onChange} />
                <button onClick={this.submit}>Save</button>
            </div>
        )
    }
}

export default UserDetails
