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

| Type         | initiator | handler      | Description                                                          |
|--------------|-----------|--------------|----------------------------------------------------------------------|
| create-party | Any       | server       | request to create a new party if not already exist                   |
| join-party   | Any       | server/admin | request to join an existing party if not already in another party    |
| become-dj    | Any       | server/admin | request to become a dj of the party which will be forwarded to admin |

```js
var Message = {
    category : "request", 
    type : "create-party", 
    data : {
        invited : ["sample@gmail.com","sample1@zohocorp.com"],  // Array of mail id
    }
}
```

```js
var Message = {
    category : "request", 
    type : "join-party", 
    data : {
        partyId : "askdfh123"
    }
}
```


### Response

| Type       | initiator | handler | Description                                   |
|------------|-----------|---------|-----------------------------------------------|
| join-party | Any       | admin   | response sent by admin for join-party request |
| become-dj  | Any       | admin   | response sent by admin for become-dj request  |

```js
var Message = {
    category : "response", 
    type : "join-party", 
    data : {
        memberId : "sample@gmail.com" // respond to the one requested with its mail Id
        status : "success / failure"  
    }
}
```

```js
var Message = {
    category : "request", 
    type : "become-dj", 
    data : {
        memberId : "sample@gmail.com" // respond to the one requested with its mail Id
        status : "success / failure"  
    }
}
```


### webrtc

| Type      | intiator          | handler           | Description                  |
|-----------|-------------------|-------------------|------------------------------|
| offer     | dj                | Party Member      | offer sent by dj for webrtc  |
| answer    | Party Member      | dj                | Answer sent to dj for webrtc |
| candidate | dj / Party Member | dj / Party Member | candidate sharing for webrtc |

```js
var Message = {
    category : "webrtc", 
    type : "offer/answer/candidate", 
    data : {
        memberId : "sample@gmail.com", // respond to the one requested with its mail Id
        offer : offer
    }
}
```


### Message


### Action

| Type        | intiator | handler | Description                                                    |
|-------------|----------|---------|----------------------------------------------------------------|
| end-party   | admin    | server  | Action performed by admin to end the party                     |
| leave-party | Any      | server  | Action can be performed by any party member to leave the party |


## Outgoing Message Category

### Response 

| Type                   | intiator | handler | Description                                                                    |
|------------------------|----------|---------|--------------------------------------------------------------------------------|
| party-creation-success | server   | admin   | respond to admin about successful party creation                               |
| party-creation-failure | server   | admin   | response for party creation failure                                            |
| join-party-success     | server   | member  | if party member is invited by admin                                            |
| dj-accept              | server   | dj      | if requester is an admin                                                       |
| unauthorised           | server   | Any     | if the message is invalid or the member is not authorised for the given action |


### Notification

| Type        | intiator | handler       | Description                                                           |
|-------------|----------|---------------|-----------------------------------------------------------------------|
| join-party  | server   | dj            | Notify dj about a new party member in order to make webrtc connection |
| member-left | server   | Party Members | A particular member has left the party                                |
| role-change | server   | Party Members | A role has been changed for a party member                            |
| party-ended | server   | Party Members | The party has been ended by the admin                                 |

```js
var Message = {
    category : "notification", 
    type : "join-party", 
    data : {
        memberIds : ["sample@gmail.com","sample2@gmail.com"] // respond to the one requested with its mail Id
    }
}
```

```js
var Message = {
    category : "notification", 
    type : "role-change", 
    data : {
        memberId : "sample@gmail.com" ,
        role : "admin/dj"
    }
}
```

```js
var Message = {
    category : "notification", 
    type : "member-left", 
    data : {
        memberId : "sample@gmail.com" ,
        role : "admin/dj/member"

    }
}
```