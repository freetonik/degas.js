var ws = require('C:/nodejs/lib/ws/server.js'),
    server = ws.createServer();
var fs = require('fs');

server.addListener("connection", function(conn){
	conn.addListener("message", function(message){
        //message = JSON.parse(message);
	    message['id'] = conn.id;
	    //conn.broadcast(JSON.stringify(message));
        if (message.indexOf("client-connected:") == 0 ) {
            console.log("Client connected (msg id=" + conn.id + ")");
        }
        else if (message.indexOf("gau-candidate:") == 0 ) {
            fs.writeFile("0001.txt", message.replace(/gau-candidate:/i, ""), function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("New candidate saved to file");
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