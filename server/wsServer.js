//websocket & http server
var ws = require('wsnode').server;
var http = require('http');

var webServer = http.createServer(function(request, response) {
    console.log((new Date()) + " Received request for " + request.url);
    response.writeHead(404);
    response.end();
});

webServer.listen(8080, function() {
    console.log((new Date()) + " Server is listening on port 8080");
});

// attach websocket to http server
wsServer = new ws({
    httpServer: webServer,
    autoAcceptConnections: true
});
    
// filesystem
var fs = require('fs');

// connection counter, never goes down, plays role of unique ID for a connection
var activeConnections = 0;

// client object (this is a value in client hachtable cliTable)
function Cli(IPaddress) {
	this.address = IPaddress;
	this.fitness = 0;
	this.sequence = [];
};

// clients has table (key - ID(activeConnections), value - Cli obj)
var cliTable = new Array();

// add new client object to the clients table
function addNewClient(clientID, clientObj){
	cliTable[clientID] = clientObj;
}

// removes client object from hash table
function removeClient(clientID){
	cliTable.splice(clientID, 1);
}

// returns data as object
function getDataToSend(){
	var data = {};
	if (typeof prepareData == 'function'){
		data = prepareData();	// this function must be provided
	} 
	return data;
};

// client connected
wsServer.on('connect', function(conn){
	
    // new message from the client
	conn.on('message', function(message){
		activeConnections += 1;
	    //  initial message, the only message that is not in JSON format
        if (message.utf8Data.indexOf("client-connected:") == 0 ) {
            console.log("Client connected (client address=" + conn.socket.remoteAddress  + ", id=" + activeConnections + ")");
			conn.id = activeConnections;
			var newClient = new Cli(conn.socket.remoteAddress);
			addNewClient(activeConnections, newClient);
			
            // everything is ready, send data to client and let him start
			var dataToSend = getDataToSend();
			dataToSend.serverVersion = "0.0.2";
			dataToSend.messageType = "initial-data";
			conn.sendUTF(JSON.stringify(dataToSend));
			console.log("Send initial data to client " + JSON.stringify(dataToSend))
        }
		// if it's not an initial message it must be in JSON format
		else {
			try {
				var receivedObject = JSON.parse(message.utf8Data);
			} catch (err) {
				console.log("Error while parsing JSON object: " + message.utf8Data + ". Object will be empty.");
				receivedObject = {};
			}
			
			switch (receivedObject.messageType) {
				// received message is the best individual; store it in cliTable
				case ("best-individual"):
					receivedObject.address = conn.socket.remoteAddress;
					addNewClient(conn.id, receivedObject);
					console.log("Received best individual from " + conn.socket.remoteAddress + "(id=" + conn.id + ")");
					break;
				// TODO: possibly other cases
				
				default:
					console.log("Message with unknown type " + receivedObject.messageType + "is received from " + conn.socket.remoteAddress + "(id=" + conn.id + ")");
			}
		}

	  });
    
    // client disconnected
    conn.on("close", function() {
        console.log("Client with id " + conn.id + " disconnected");
      });
	});

wsServer.on('close', function(conn){
	// whaeva
});