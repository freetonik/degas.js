// worker's interface
self.addEventListener('message', function(e) {
	importScripts('evolution.js');
    
    // create population
    var population = new Population();
    
    //initial message with two sequences
	if (e.data.indexOf("init:") == 0) {
        // accept serialized object
        var raw = new Array;
        raw = e.data.replace(/init:/i, "").split("");
        // populate global arrays of sequences
        for (var k=0; k<SEQUENCE_LENGTH; k++)
            sequences[0][k]=raw[k];
        for (var k=0; k<SEQUENCE_LENGTH; k++)
            sequences[1][k]=raw[k+SEQUENCE_LENGTH];
            
        // start evolution
        try {
            for (var i = 0; i < GENERATIONS; ++i)
            {
                population.buildNextGeneration();
                gau("Generation " + i + ": " + population.people[0].fitness);
                if (i%10 === 0) ws(population.people[0].sequence);
            }
        }
        catch (e)
        {
            self.postMessage("When executing function: " + e.message);
            self.close();
        }
    }
    
    //initial top fitness from server (RSS)
    if (e.data.indexOf("topf:") == 0 ) {
        topFitness = e.data.replace(/topf:/i, "");
        log("Top fitness of " + topFitness + " received");
    }
    

    
    
	
	// clean up
	delete population;
	
}, false);

//messaging interface
function log(msg) {
    postMessage("log:" + msg);
}

function gau(msg) {
    postMessage("gau:" + msg);
}

function err(msg) {
    postMessage("err:" + msg);
}

function ws(msg) {
    postMessage("ws:" + msg);
}