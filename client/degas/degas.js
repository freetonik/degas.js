/** Degas framework
*
*
*
*
*
*
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
	degas.mutationType = [];
	degas.mutationType['RANDOM_SUBSTITUTION'] = "RandomSubstitution";
	
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

/** Evolution
*
*
*


//global variables 
var sequences = new Array();
sequences[0] = new Array();
sequences[1] = new Array;
var topFitness = 0;

//global constants
var SEQUENCE_LENGTH = 200;
var CANDIDATE_LENGTH = 160;
var SINGLE_MATCH_AWARD = 0.5;
var DOUBLE_MATCH_AWARD = 2;
var MUTATION_RATE = 0.6;
var XOVER_RATE = 0.5;
var GENERATIONS = 100;
var POPULATION_SIZE = 100;

LCS_Chromosome = degas.Class({
initialize: function() {
this.sequence = new Array(CANDIDATE_LENGTH);
this.matches = new Array(CANDIDATE_LENGTH);
this.fitness = 0;
this.untouchable = false;
//initial random DNA sequence
for (var i=0; i<this.length; i++)
{
var val = Math.floor(Math.random()*4);
var letter;
if (val==0) letter = "A";
if (val==1) letter = "T";
if (val==2) letter = "C";
if (val==3) letter = "G";
this.sequence[i] = letter;
}
},

calculateFitness: function() {
var seqW1 = 0;		//walker over first sequence
var seqW2 = 0;		//walker over second sequence
this.fitness = 0;	//initial fitness

//clean matches array
for (var i=0; i<this.length; i++) 
{
this.matches[i]=0;
}

//go over 1st sequence
for (var i=0; i<this.length; i++)
{
for (var j=seqW1; j<SEQUENCE_LENGTH; j++)
{
if (sequences[0][j] == this.sequence[i]) 
{
this.matches[i]++;
seqW1 = j+1;
break;
}
}
}

//gp over second sequence
for (var i=0; i<this.length; i++)
{
for (var j=seqW2; j<this.length; j++)
{
if (sequences[1][j] == this.sequence[i]) 
{
this.matches[i]++;
seqW2 = j+1;
break;
}
}
}

//going over RESULTS matrix
for (var i = 0; i < this.length; i++)
{
if (this.matches[i] == 1) this.fitness += SINGLE_MATCH_AWARD;
if (this.matches[i] == 2) this.fitness += DOUBLE_MATCH_AWARD;
}
//stop bothering the perfect guy!
if (this.fitness == CANDIDATE_LENGTH * DOUBLE_MATCH_AWARD) this.untouchable = true;
return this.fitness;
},

mutate: function() {
if (!this.untouchable)
{
for (var i=0; i<(CANDIDATE_LENGTH*MUTATION_RATE); i++)
{
var potential = new Chromosome();
potential.sequence = this.sequence;
var pos = Math.floor(Math.random()*CANDIDATE_LENGTH);

var val = Math.floor(Math.random()*4);
var letter;
if (val==0) letter = "A";
if (val==1) letter = "T";
if (val==2) letter = "C";
if (val==3) letter = "G";
potential.sequence[pos] = letter;
potential.fitness = potential.calculateFitness();
if (potential.fitness > this.fitness) this.sequence = potential.sequence;
}
}
},

crossover: function(parent){
if (!this.untouchable)
{
for (var i = CANDIDATE_LENGTH/2; i<CANDIDATE_LENGTH; i++)
{
this.sequence[i] = parent.sequence[i];
}
}
}
});

//Chromosome = LCS_Chromosome;

Population = degas.Class({
initialize: function(){
// initialize
this.people = [POPULATION_SIZE];

// sorting function (higher fitness is better)
this.comparePeople = function(a, b)
{ 
return b.fitness - a.fitness; 
};

// allocate space for the chromosomes that make up the population + the selected parents
for (var i = 0; i < POPULATION_SIZE; ++i) 
{
this.people[i] = new LCS_Chromosome();
}
},

buildNextGeneration: function(){
// Calculate the fitness values of all the items and then sort by fitness
for (var i = 0; i < POPULATION_SIZE; ++i) 
{
this.people[i].fitness = this.people[i].calculateFitness();
}
this.people.sort(this.comparePeople);

//perform xover and mutation
for (var k = 0; k < POPULATION_SIZE*XOVER_RATE; k++)
{
var randone = Math.floor(Math.random() * POPULATION_SIZE);
var randtwo = Math.floor(Math.random() * POPULATION_SIZE);
this.people[randone].crossover(this.people[randtwo]); 
}

for(var c = 0; c < POPULATION_SIZE; c++)
{
this.people[c].mutate();
}
}
});
*/