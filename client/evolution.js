//global variables 
var sequences = new Array();
sequences[0] = new Array();
sequences[1] = new Array;
var topFitness = 0;

//global constants
var SEQUENCE_LENGTH = 200;
var CANDIDATE_LENGTH = 200;
var SINGLE_MATCH_AWARD = 0.5;
var DOUBLE_MATCH_AWARD = 2;
var MUTATION_RATE = 0.5;
var XOVER_RATE = 0.5;
var GENERATIONS = 1000;
var POPULATION_SIZE = 100;

/**
*	Class describes an Individual or Chromosome
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
	*	Encodes character sequence. Calls encode() (if exists, provided by client) or computes default bit sum (as characters)
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
	crossoverIndividuals: function(indA, indB, crossoverType) {
		var child = new Individual(this.lengthOfIndividualSequence, this.bitsPerCell);
		switch (crossoverType) {
			case degas.consts.crossoverType['RANDOM_SPLIT']:
				child.sequence = degas.xover.RSplit(indA.sequence, indB.sequence);
				break;
		child.fitness = child.computeFitness();
		return child;
		}
	},
	
	/**
	*	Perform crossover on population
	*	@param: crossover probability 
	*	@return: no
	*/
	performCrossover: function(crossoverProbability){
		var affected = Math.floor(Math.random() * this.pool.length);
		// replaced worst affected individuals with children of best
		var bestFather = 0;
		var bestMother = 1;
		for (var j = this.pool.length; j > this.pool.length - affected; j--){
			this.pool[j] = this.crossoverIndividuals(this.pool[bestFather], this.pool[bestMother], degas.config.crossoverType);
			bestFather += 1;
			bestMother += 1;
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
			this.pool[i].fitness = this.pool[i].computeFitness()
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
			console.log("Affected invividuals: " + affected);
			for (var i = 0; i < affected; i++){
				var indPosition = Math.floor(Math.random() * this.pool.length);
				this.pool[indPosition].mutate(degas.config.mutationType,mutationProbabilityForCell);
			}
		} else {
			degas.errorHandler("mutation probabilities are out of range")
		}
	},
	
	buildNextGeneration: function(){
		this.mutate(degas.config.mutationProbabilityForIndividual, degas.config.mutationProbabilityForCell);	// mutate pool
		this.performCrossover(degas.config.crossoverProbability);	// perform crossover
		this.fitness = computeFitness(); 	//save each individual's fitness, save population's fitness
		this.pool.sort(this.compareIndividuals);	//sort pool by fitness
	}
});