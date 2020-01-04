# Signalling Server

Signalling server is used to pass information from one client to another

Message Structure

```js
var Message = {
    category : String, // category of the message 
    type : String, // type of message in that category
    data : Object // data corresponding to that particular message
}
```

## Incoming Message Category 

### Request

| Type         | initiator | handler      | Description                                                          | Expected data      |
|--------------|-----------|--------------|----------------------------------------------------------------------|--------------------|
| create-party | Any       | server       | request to create a new party if not already exist                   | {invited : Array}  |
| join-party   | Any       | server/Admin | request to join an existing party if not already in another party    | {partyId : String} |
| become-dj    | Any       | server/Admin | request to become a DJ of the party which will be forwarded to admin | {}                 |


### Response

| Type       | initiator | handler | Description                                   |
|------------|-----------|---------|-----------------------------------------------|
| join-party | Any       | Admin   | response sent by admin for join-party request |
| become-dj  | Any       | Admin   | response sent by admin for become-dj request  |

### webrtc

| Type      | intiator          | handler           | Description                  |
|-----------|-------------------|-------------------|------------------------------|
| offer     | DJ                | Party Member      | offer sent by DJ for webrtc  |
| answer    | Party Member      | DJ                | Answer sent to DJ for webrtc |
| candidate | DJ / Party Member | DJ / Party Member | candidate sharing for webrtc |


### Message


### Action

| Type        | intiator | handler | Description                                                    |
|-------------|----------|---------|----------------------------------------------------------------|
| end-party   | admin    | server  | Action performed by Admin to end the party                     |
| leave-party | Any      | server  | Action can be performed by any party member to leave the party |

## Outgoing Message Category

### Notify

| Type              | intiator | handler       | Description                                                                                                |
|-------------------|----------|---------------|------------------------------------------------------------------------------------------------------------|
| join-party        | server   | DJ            | Notify DJ about a new party member in order to make webrtc connection                                      |
| dj-change         | server   | Party Members | Notify all party members that DJ has been changed                                                          |
| admin-left        | server   | Party Members | Notify all party members that admin left the party and who is the current admin                            |
| dj-left           | server   | Party Members | Notify all Party Members that DJ has left and anyone can request to become a DJ                            |
| member-left       | server   | Party Members | Notify all Party Members that a particular member has left the party                                       |
| party-ended       | server   | Party Members | Notify all Party Members that the party has been ended by the admin                                        |
| become-dj-pending | server   | DJ            | Notify the requester of become-dj that the request has been sent to admin and the pending for confirmation |

