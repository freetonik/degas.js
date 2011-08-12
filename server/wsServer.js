//websocket
var ws = require('C:/nodejs/lib/ws/server.js'),
    server = ws.createServer();
//filesystem
var fs = require('fs');
//ID table
var idTable = new Array();
for (var j=0; j<10; j++)
{
    idTable[j]=false;
}

server.addListener("connection", function(conn){
	conn.addListener("message", function(message){
	    //client connected 
        if (message.indexOf("client-connected:") == 0 ) {
            console.log("Client connected (client id=" + conn.id + ")");
            //find an ID for it and send it
            server.send(conn.id, "cid:" + getNewPieceID(conn.id));
        }
        //client sent updated candidate, save it to file
        else if (message.indexOf("gau-candidate:") == 0 ) {
            fs.writeFile(getPieceIdByConnectionId(conn.id)+".txt", message.replace(/gau-candidate:/i, ""), function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("New candidate received from " + conn.id);
                }
            });
        }
        else {
            console.log("Unknown message: " + message);
        }
	  });
	});

server.addListener("close", function(conn){
    console.log("Closing connection...");
    conn.broadcast(JSON.stringify({'id': conn.id, 'action': 'close'}));
});

server.listen(3434);
console.log("WebSocket server started...");

function getNewPieceID(connectionID) {
    var pieceID = -1;
    //go through table and find unused (false) ID
    for (var j=0; j<10; j++)
    {
        if (idTable[j] === false)
        {
            pieceID = j;
            idTable[j]=connectionID;
            console.log("Returned unused ID: " + j);
            break;
        }
    }
    return pieceID;
}

function getPieceIdByConnectionId(connectionID) {
    var pieceID = -1;
    //go through table and find unused (false) ID
    for (var j=0; j<10; j++)
    {
        if (idTable[j] === connectionID)
        {
            pieceID = j;
            console.log("Returned piece ID: " + j);
            break;
        }
    }
    return pieceID;
}