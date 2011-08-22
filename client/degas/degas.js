/** Degas framework
*
*	Object-oriented layer and object handling from turing.js (https://github.com/alexyoung/turing.js/) 
*	by Alex Young
*
*/
(function(global) {
	var middleware = [];

	/**
	* The degas object.  Use `degas('selector')` for quick DOM access when built with the DOM module.
	*
	* @returns {Object} The degas object, run through `init`
	*/
	function degas() {
		var result, i;
		for (i = 0; i < middleware.length; i++) {
			result = middleware[i].apply(degas, arguments);
			if (result) {
				return result;
			}
		}
	}
	
	degas.VERSION = '0.0.1';
	// core configuration
	degas.consts = {};
	degas.consts.mutationType = [];	// types of mutation (consts)
	degas.consts.mutationType['RANDOM_SUBSTITUTION'] = "random-substitution";
	degas.consts.crossoverType = [];
	degas.consts.crossoverType['RANDOM_SPLIT'] = "random-split";
	degas.consts.serverMessage = [];
	degas.consts.serverMessage['INITIAL_DATA'] = "initial-data";
	degas.consts.clientMessage = [];
	degas.consts.clientMessage['BEST_INDIVIDUAL'] = "best-individual";
	degas.consts.workerMessage = [];
	degas.consts.workerMessage['LOG'] = "log";
	degas.consts.workerMessage['ERROR'] = "error";
	degas.consts.workerMessage['UI_UPDATE'] = "ui-update";
	degas.consts.workerMessage['BEST_INDIVIDUAL'] = "best-individual";
	degas.consts.workerMessage['INIT_EVOLUTION'] = "init-evolution";
	degas.consts.workerMessage['RESUME_EVOLUTION'] = "resume-evolution";
	degas.consts.workerMessage['PAUSE_EVOLUTION'] = "pause-evolution";
	
	degas.config = {};
	degas.config.numberOfGenerations = false;	//when set to 'false' evolution doesn't stop
	degas.config.populationSize = 1000;			//default population size is set to 100 individual sequences
	degas.config.sequenceLength = 100;			//default sequence length is set to 10 cells
	degas.config.cellSize = 10;					//default cell size is set to 10 bits
	degas.config.serverUpdateCycle = 10;		//by default send updated best individual to server every 10 generations
	degas.config.crossoverType = degas.consts.crossoverType['RANDOM_SPLIT'];	//default crosover type is random split
	degas.config.mutationType = degas.consts.mutationType['RANDOM_SUBSTITUTION'];	//default mutation type is random substitution
	degas.config.crossoverProbability = 0.3;			//by default 30% of population is replaced with children of best each generation
	degas.config.mutationProbabilityForIndividual = 0.1;	//by default 10% of population mutates each generation
	degas.config.mutationProbabilityForCell = 0.1;			//by default 10% of cells of individual mutates each generation
	// server configuration
	degas.serverData = null;	// server data
	
	// utils
	degas.detect_web_worker = function () {
		return !!window.Worker;
	};
	
	// core functions
	// MUTATORS
	degas.mutate = {};
	/**
	*	Mutate probability% of genes to a random gene by random substitution
	* 	@param: sequence to mutate, probability of cell mutation
	* 	@return: mutated sequence
	*/
	degas.mutate.RSubst = function(sequence, bitsPerCell, mutationProbabilityForCell) {
		var mutatedSequence = new Array(sequence.length);
		
		if (mutationProbabilityForCell >=0 && mutationProbabilityForCell <=1){
			// copy sequence
			for (var k = 0; k < sequence.length; k++){
				mutatedSequence[k] = sequence[k];
			}
			// then mutate some cells
			var affected = Math.floor(sequence.length * mutationProbabilityForCell);
			for (var i = 0; i < affected; i++){
				var cellPosition = Math.floor(Math.random() * sequence.length);
				var randomCell = new Array(bitsPerCell);
				for (var j = 0; j < bitsPerCell; j++) {
					randomCell[j] = (Math.random() > 0.5) ? 1 : 0;
				}
				mutatedSequence[cellPosition] = randomCell;
			}
			return mutatedSequence;
		} else {
			degas.errorHandler("mutation probability is out of range");
			return null;
		}	
	};
	
	// CROSSOVER FUNCTIONS
	degas.xover = {};
	degas.xover.RSplit = function(sequenceA, sequenceB) {
		var childSequence = new Array(sequenceA.length);
		var splitPoint = Math.floor(Math.random() * sequenceA.length);
		for (var i = 0; i < splitPoint; i++){
			childSequence[i] = sequenceA[i];
		}
		for (var j = splitPoint; j < sequenceB.length; j++){
			childSequence[j] = sequenceB[j];
		}
		return childSequence;
	};
	
	// main error handler
	degas.errorHandler = function(err){
		console.log("Error occured: " + err);
	}
	
	/**
	* This alias will be used as an alternative to `degas()`.
	* If `__degas_alias` is present in the global scope this will be used instead. 
	* 
	*/
	degas.alias = global.__degas_alias || '$t';
	global[degas.alias] = degas;

	/**
	* Object handling
	*/
	/**
	* Determine if an object is an `Array`.
	*
	* @param {Object} object An object that may or may not be an array
	* @returns {Boolean} True if the parameter is an array
	*/
	degas.isArray = Array.isArray || function(object) {
		return !!(object && object.concat
			&& object.unshift && !object.callee);
		};

		/**
		* Convert an `Array`-like collection into an `Array`.
		*
		* @param {Object} collection A collection of items that responds to length
		* @returns {Array} An `Array` of items
		*/
		degas.toArray = function(collection) {
			var results = [], i;
			for (i = 0; i < collection.length; i++) {
				results.push(collection[i]);
			}
			return results;
		};

		// This can be overriden by libraries that extend degas(...)
		degas.init = function(fn) {
			middleware.unshift(fn);
		};

		/**
		* Determines if an object is a `Number`.
		*
		* @param {Object} object A value to test
		* @returns {Boolean} True if the object is a Number
		*/
		degas.isNumber = function(object) {
			return (object === +object) || (toString.call(object) === '[object Number]');
		};

		/**
		* Binds a function to an object.
		*
		* @param {Function} fn A function
		* @param {Object} object An object to bind to
		* @returns {Function} A rebound method
		*/
		degas.bind = function(fn, object) {
			var slice = Array.prototype.slice,
			args  = slice.apply(arguments, [2]);
			return function() {
				return fn.apply(object || {}, args.concat(slice.apply(arguments)));
			};
		};

		var testCache = {},
		detectionTests = {};

		/**
		* Used to add feature-detection methods.
		*
		* @param {String} name The name of the test
		* @param {Function} fn The function that performs the test
		*/
		degas.addDetectionTest = function(name, fn) {
			if (!detectionTests[name]) {
				detectionTests[name] = fn;
			}
		};

		/**
		* Run a feature detection name.
		*
		* @param {String} name The name of the test
		* @returns {Boolean} The outcome of the test
		*/
		degas.detect = function(testName) {
			if (typeof testCache[testCache] === 'undefined') {
				testCache[testName] = detectionTests[testName]();
			}
			return testCache[testName];
		};

		if (global.degas) {
			throw new Error('degas has already been defined');
		} else {
			global.degas = degas;
			if (typeof exports !== 'undefined') {
				exports.degas = degas;
			}
		}
		}(typeof window === 'undefined' ? this : window));

		/**
		* Object-oriented layer
		*/
		degas.Class = function() {
			return degas.oo.create.apply(this, arguments);
		}

		degas.oo = {
			create: function() {
				var methods = null,
				parent  = undefined,
				klass   = function() {
					this.$super = function(method, args) { return degas.oo.$super(this.$parent, this, method, args); };
					this.initialize.apply(this, arguments);
				};

				if (typeof arguments[0] === 'function') {
					parent = arguments[0];
					methods = arguments[1];
				} else {
					methods = arguments[0];
				}

				if (typeof parent !== 'undefined') {
					degas.oo.extend(klass.prototype, parent.prototype);
					klass.prototype.$parent = parent.prototype;
				}

				degas.oo.mixin(klass, methods);
				degas.oo.extend(klass.prototype, methods);
				klass.prototype.constructor = klass;

				if (!klass.prototype.initialize)
				klass.prototype.initialize = function(){};

				return klass;
			},

			mixin: function(klass, methods) {
				if (typeof methods.include !== 'undefined') {
					if (typeof methods.include === 'function') {
						degas.oo.extend(klass.prototype, methods.include.prototype);
					} else {
						for (var i = 0; i < methods.include.length; i++) {
							degas.oo.extend(klass.prototype, methods.include[i].prototype);
						}
					}
				}
			},

			extend: function(destination, source) {
				for (var property in source)
				destination[property] = source[property];
				return destination;
			},
			$super: function(parentClass, instance, method, args) {
				return parentClass[method].apply(instance, args);
			}
};

// EVOLUTIONARY COMPUTATION CORE
/**
*	Class describes an Individual (or chromosome) as a sequence of cells. Each cell has the same size (number of bits)
*	core methods:
*		initialize() – constructor, called upon creation
*		computeFitness() – returns fitness value as Number
*		decodeSequence() – returns array of characters (which represent sequence)
*		
*/
var Individual = degas.Class({
	initialize: function (length, bitsPerCell) {
		// core values 
		this.sequence = new Array(length);
		this.bitsPerCell = bitsPerCell;
		this.fitnessMatrix = new Array(length);
		this.fitness = 0;
		
		// feature specific values
		this.alfaMale = false;				// untouchable (Neo)
		this.mutationProbability = false;	// if false – use default, if value – use value
		
		// randomize sequence
		for (var i = 0; i < length; i++) {
			this.sequence[i] = new Array(this.bitsPerCell);
			for (var j = 0; j < this.bitsPerCell; j++) {
				this.sequence[i][j] = (Math.random() > 0.5) ? 1 : 0;
			}
		}
		
		// clear argument array
		this.args = [];
	},
	
	/**
	*	Computes fitness. Calls fitness() (if exists, provided by client) or computes default bit sum
	* 	@param: no
	*	@retrurn: number
	*/
	computeFitness: function() {
		if (typeof fitness === 'function') return fitness(this.sequence, this.bitsPerCell);	// fitness() must be provided by the client
		else {
			var defaultBitSum = 0;
			for (var j=0; j < this.sequence.length; j++){
				for (var k=0; k < this.bitsPerCell; k++){
					defaultBitSum += this.sequence[j][k];
				}
			}
			return defaultBitSum;
		}
	},
	
	/**
	*	Encodes character sequence. Calls encode() (if exists, provided by client) or computes default bit sum (as characters). Not really sure this method belongs here
	* 	@param: array of characters
	*	@retrurn: array of arrays of bits (length === sequence.length * bitsPerCell)
	*/
	/*
	encodeSequence: function() {
		if (encode) {
			var encodedSequence = new Array(this.sequence.length);
			for (var j=0; j < this.sequence.length; j++){
				encodedSequence[j] = encode(this.sequence[j]);	//encode() takes array
			}
		}
	},*/
	
	/**
	*	Decodes bit sequence. Calls decode() (if exists, provided by client) or computes default bit sum
	* 	@param: no
	*	@retrurn: array of characters (length === sequence.length)
	*/
	decodeSequence: function () {
		if (typeof decode == 'function') {
			var decodedSequence = new Array(this.sequence.length);
			for (var j=0; j < this.sequence.length; j++){
				decodedSequence[j] = decode(this.sequence[j]);	//decode() takes array of bits and returns character
			}
			return decodedSequence;
		}
		else {
			var defaultBitSumSequence = new Array(this.sequence.length);
			var bitSum;
			for (var j=0; j < this.sequence.length; j++){
				bitSum = 0;
				for (var k=0; k < this.bitsPerCell; k++){
					bitSum += this.sequence[j][k];
				}
				defaultBitSumSequence[j] = bitSum;
			}
			return defaultBitSumSequence;
		}
	},
	
	/**
	*	Mutates sequence. Calls decode() or computes default bit sum
	* 	@param: mutation type, default probability (optional)
	*	@retrurn: no
	*/
	mutate: function(mutationType, defaultProbability) {
		if (!mutationType) return this.sequence; 	//if no mutation type provided – don't mutate
		if (!this.alfaMale){
			switch (mutationType) {
				case degas.consts.mutationType['RANDOM_SUBSTITUTION']:
					
					this.sequence = degas.mutate.RSubst(this.sequence, this.bitsPerCell, (this.mutationProbability) ? this.mutationProbability : defaultProbability);
					break;
			}
		}
	}
});	// END OF INDIVIDUAL

var Population = degas.Class({
	initialize: function(popSize, lengthOfIndividualSequence, bitsPerCell) {
		// core values
		this.pool = new Array(popSize);
		this.fitness = 0;
		this.lengthOfIndividualSequence = lengthOfIndividualSequence;
		this.bitsPerCell = bitsPerCell;
		
		// randomize population
		for (var i = 0; i < this.pool.length; i++) {
			this.pool[i] = new Individual(lengthOfIndividualSequence, bitsPerCell);
		}
		
		this.fitness = this.computeFitness();
		
		// clear argument array
		this.args = [];
	},
	
	/**
	*	Sorting function. By default higher fitness is better
	*/
	compareIndividuals: function(a, b) { 
    	return b.fitness - a.fitness; 
    },
	
	/**
	*	Crossover of two individuals
	*	@param: individualA, individualB, crossover type
	*	@return: child individual
	*/
	crossoverIndividuals: function(seq1, seq2, crossoverType) {
		var childSeq = new Array(this.lengthOfIndividualSequences);
		switch (crossoverType) {
			case degas.consts.crossoverType['RANDOM_SPLIT']:
				childSeq = degas.xover.RSplit(seq1, seq2);
				break;
			default:
				childSeq = seq1;
				break;
		}
		return childSeq;
	},
	
	/**
	*	Perform crossover on population
	*	@param: crossover probability 
	*	@return: no
	*/
	performCrossover: function(crossoverProbability){
		var affected = Math.floor(crossoverProbability * this.pool.length);
		// replaced worst affected individuals with children of best
		var picker = 0;	
		for (var j = (this.pool.length-1); j > (this.pool.length - affected - 1); j--){
			// console.log("Replacing " + j + " with " + picker + " and " + (picker+1));
			this.pool[j].sequence = this.crossoverIndividuals(this.pool[picker].sequence, this.pool[(picker+1)].sequence, degas.config.crossoverType);
			// console.log("Just replaced ind num " + j + " with nice " + this.pool[j].sequence + " and its fitness " + this.pool[j].computeFitness() + " while current picker=" + picker);
			picker += 1;
		}
	},
	
	/**
	*	Sums up fitness by taking each individual's fitness value; performs faster than computeFitness(), might not be accurate
	* 	@param: no
	*	@retrurn: number
	*/
	sumUpFitness: function(){
		var computedFitness = 0;
		for (var i = 0; i < this.pool.length; i++) {
			computedFitness += this.pool[i].fitness;
		}
		return computedFitness;
	},
	
	/**
	*	Computes fitness. Calls computeFitness() on every individual and returns sum; saves each individuals fitness to it
	* 	@param: no
	*	@retrurn: number
	*/
	computeFitness: function(){
		var computedFitness = 0;
		for (var i = 0; i < this.pool.length; i++) {
			this.pool[i].fitness = this.pool[i].computeFitness();
			computedFitness += this.pool[i].fitness;
		}
		return computedFitness;
	},
	
	/**
	*	Mutates population. Calls mutate() on every individual among affected percent=mutationProbabilityForIndividual%
	* 	@param: how many percent of pool to mutate, how many genes in each to mutate (numbers 0..1)
	*	@retrurn: no
	*/
	mutate: function(mutationProbabilityForIndividual, mutationProbabilityForCell){
		if (mutationProbabilityForIndividual >=0 && mutationProbabilityForIndividual <=1 && mutationProbabilityForCell>=0 && mutationProbabilityForCell <=1){
			var affected = Math.floor(this.pool.length * mutationProbabilityForIndividual);
			for (var i = 0; i < affected; i++){
				var indPosition = Math.floor(Math.random() * this.pool.length);
				this.pool[indPosition].mutate(degas.config.mutationType,mutationProbabilityForCell);
			}
		} else {
			degas.errorHandler("mutation probabilities are out of range")
		}
	},
	
	/**
	*	Moves population to next generation. 
	* 	@param: how many percent of pool to mutate, how many genes in each to mutate (numbers 0..1)
	*	@retrurn: no
	*/
	buildNextGeneration: function(){
		this.mutate(degas.config.mutationProbabilityForIndividual, degas.config.mutationProbabilityForCell);	// mutate pool
		this.performCrossover(degas.config.crossoverProbability);	// perform crossover
		this.fitness = this.computeFitness(); 	//save each individual's fitness, save population's fitness
		this.pool.sort(this.compareIndividuals);	//sort pool by fitness
	}
});

// webSocket client class
wsClient = degas.Class({
	initialize: function(wsHostAddress, wsPort) {
		this.ws = new WebSocket((wsHostAddress.indexOf("ws://") == 0) ? "" : "ws://" + wsHostAddress + ":" + wsPort);
		this.ws.onopen = this.onOpen;
		this.ws.onmessage = this.onMessage;
		this.ws.onclose = this.onClose;
	},
	
	// send initial connection message as plain string
	onOpen: function(){
		this.send('client-connected:');
		console.log("Client connected");
	},
	
	// send an object in JSON format; object must have 'messageType' field
	send: function(objectToSend) {
		this.ws.send(JSON.stringify(objectToSend));
	},
	
	onMessage: function(message) {
		if (message.data) {
			var receivedObject = JSON.parse(message.data);
			switch (receivedObject.messageType){
				case degas.consts.serverMessage['INITIAL_DATA']:
					worker.postMessage(message.data);
					break;
				case degas.consts.serverMessage['UPDATED-DATA']:
					//	TODO: 
					break;
				case degas.consts.serverMessage['LEADER-BOARD']:
					// 	TODO:
					break;
				case degas.consts.serverMessage['GLOBAL-STATS']:
					//	TODO:
					break;
				default:
					degas.errorHandler("message receive from server is invalid: (" + message.data + ")");
			}
		}
	},
	
	onClose: function(message) {
		console.log(message);
		this.ws = null;		// destroy websocket
	}
});

