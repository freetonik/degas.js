/* Degas evolutionary computation web worker
* 
*/
importScripts('degas/degas.js');
var evolving = false;	//global evolution switch
var population = new Population(degas.config.populationSize, degas.config.sequenceLength, degas.config.cellSize);

// web worker receives message
self.addEventListener('message', function(message) {
	
    var receivedObject = JSON.parse(message.data);
	if (receivedObject.messageType == degas.consts.serverMessage['INITIAL_DATA'] || receivedObject.messageType == degas.consts.workerMessage['RESUME_EVOLUTION']) {
        evolving = true;
		startEvolution();
    } 

	// resume evolution
	/*else if (receivedObject.messageType === degas.consts.workerMessage['RESUME_EVOLUTION']) {
		evolving = true;
	}*/

	// pause evolution
	else if (receivedObject.messageType === degas.consts.workerMessage['PAUSE_EVOLUTION']) {
	}
	
	else {
		err("webworker received unknown message!")
	}
    
    // clean up
	delete population;
	
}, false);

function startEvolution(){
	// start evolution
    try {
		var genCounter = 0;
		var uiData = {};
		while (true){
			population.buildNextGeneration();
			uiData = {};
			uiData.generation = genCounter;
			uiData.fitness = population.fitness;
			uiData.bestFitness = population.pool[0].fitness
	        uui(uiData);
			genCounter += 1;

			// send best individual update to server
			if (genCounter%degas.config.serverUpdateCycle === 0) {
				var objectToSend = {}
				objectToSend.fitness = population.pool[0].fitness;
				objectToSend.sequence = population.pool[0].sequence;
				objectToSend.messageType = "best-individual";
				ubi(objectToSend);
			}
 		}
	} catch (errorMessge) {
        err("Can't build next generation!");
        self.close();
    }
}

//messaging interface
function log(msg) {
	var objectToSend = {};
	objectToSend.messageType = degas.consts.workerMessage['LOG'];
	objectToSend.logMessage = msg;
	
    postMessage(JSON.stringify(objectToSend));
};

function uui(uiObject) {
	uiObject.messageType = degas.consts.workerMessage['UI_UPDATE'];
	postMessage(JSON.stringify(uiObject));
};

function err(msg) {
    var objectToSend = {};
	objectToSend.messageType = degas.consts.workerMessage['ERROR'];
	objectToSend.errorMessage = msg;
	
	postMessage(JSON.stringify(objectToSend));
};

function ubi(objectToSend) {
	postMessage(JSON.stringify(objectToSend));
};