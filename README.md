# Signalling Server
    Signalling server used to manage connection and communication between peers by sending appropriate signals. It is composed of three major modules
* auth-util
* connection-manager
* party-manager
    * party

## Auth-Util
* keeps track of user accounts
* create new account
* delete existing account
* authenticate users

## Connection Manager
* Keeps track of active connections
* Creates new connection
* Terminates existing connection
* Delegates/dispatches all client requests to Party Manager

## Party Manager 
* Keeps track of active parties
* Creates new party
* Terminates existing parties
* Delegates/dispatches client request to specific Party 

### Party
* Keeps track of DJ and other party members
* add new party member
* remove existing party member
* Establishes communication between party members
* Broadcast signals withing the party members
* Handles party specific actions