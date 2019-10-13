let createSocket = function createSocket(app) {
    wsServer = new WebSocketServer({
        httpServer: server,
        autoAcceptConnections: false
    });

    wsServer.on('request', incommingRequest);
}

function getAllUserList(connection) {
    return connectionArr.reduce((userList, conn) => {
        userList.push({ id: conn.clientId, name: conn.name });
        return userList;
    }, []);
}

function incommingRequest(request) {
    //ID for maintaining the clients that are connected
    let clientId = 1;

    //Array to maintain the connections object of client
    const connectionArr = [];
    
    var connection = request.accept(null, request.origin);
    connection.clientId = clientId;
    connectionArr.push(connection);

    //create new id for the peer
    connection.sendUTF(JSON.stringify({ type: 'create-id', id: clientId }));
    clientId++;

    connection.on('message', incomminMessages);

    connection.on('close', function (reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
}

function incomminMessages(message) {
    let msgdata = JSON.parse(message.utf8Data);
    console.log(`${connection.name} \t sent ${JSON.stringify(msgdata)}\n\n`);

    switch (msgdata.type) {
        case "user-name":
            connection.name = msgdata.name;

            //update user list on joining the party
            connectionArr.forEach(conn => {
                conn.sendUTF(JSON.stringify({ type: 'user-list', userList: getAllUserList(connection) }))
            });
            sendSignal = false;
            break;
        default:
            let targetConnection = connectionArr.find(connection => connection.clientId === msgdata.targetId);
            targetConnection.sendUTF(JSON.stringify({ ...msgdata, name: connection.name }));
    }
}