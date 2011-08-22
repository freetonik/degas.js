/* GA web worker
* 
*/
importScripts('degas/degas.js');
var evolving = false;	//global evolution switch
var population = new Population(degas.config.populationSize, degas.config.sequenceLength, degas.config.cellSize);

// web worker receives message
self.addEventListener('message', function(message) {
	
    var receivedObject = JSON.parse(message.data);
	if (receivedObject.messageType == degas.consts.serverMessage['INITIAL_DATA']) {
        //evolving = true;
		
        // start evolution
        try {
			var genCounter = 0;
			var uiData = {};
            //while (evolving === true)
			for (var j=0; j<100; j++)
            {
                population.buildNextGeneration();
				uiData = {};
				uiData.generation = genCounter;
				uiData.fitness = population.pool[0].fitness;
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
        }
        catch (errorMessge)
        {
            err("Can't build next generation!");
            self.close();
        }
    } 

	// resume evolution
	else if (receivedObject.messageType === degas.consts.workerMessage['RESUME_EVOLUTION']) {
		evolving = true;
	}

	// pause evolution
	else if (receivedObject.messageType === degas.consts.workerMessage['PAUSE_EVOLUTION']) {
		evolving = false;
	}
	
	else {
		err("webworker received unknown message!")
	}
    
    // clean up
	delete population;
	
}, false);

//messaging interface
function log(msg) {
	var objectToSend = {};
	objectToSend.messageType = degas.consts.workerMessage['LOG'];
	objectToSend.data = msg;
	
    postMessage(JSON.stringify(objectToSend));
};

function uui(uiObject) {
	uiObject.messageType = degas.consts.workerMessage['UI_UPDATE'];
	postMessage(JSON.stringify(uiObject));
};

function err(msg) {
    var objectToSend = {};
	objectToSend.messageType = degas.consts.workerMessage['ERROR'];
	objectToSend.data = msg;
	
	postMessage(JSON.stringify(objectToSend));
};

function ubi(objectToSend) {
	postMessage(JSON.stringify(objectToSend));
};