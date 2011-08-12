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
var GENERATIONS = 55;
var POPULATION_SIZE = 3;

function Chromosome()
{
    this.sequence = new Array(CANDIDATE_LENGTH);
    this.matches = new Array(CANDIDATE_LENGTH);
    this.fitness = 0;
    this.untouchable = false;
    //initial random DNA sequence
    for (var i=0; i<CANDIDATE_LENGTH; i++)
    {
        var val = Math.floor(Math.random()*4);
        var letter;
        if (val==0) letter = "A";
        if (val==1) letter = "T";
        if (val==2) letter = "C";
        if (val==3) letter = "G";
        this.sequence[i] = letter;
    }
    
    this.calculateFitness = function()
    {
        var seqW1 = 0;		//walker over first sequence
        var seqW2 = 0;		//walker over second sequence
        this.fitness = 0;	//initial fitness
        
        //clean matches array
        for (var i=0; i<CANDIDATE_LENGTH; i++) 
        {
        	this.matches[i]=0;
        }
        
        //go over 1st sequence
		for (var i=0; i<CANDIDATE_LENGTH; i++)
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
		
		for (var i=0; i<CANDIDATE_LENGTH; i++)
		{
			for (var j=seqW2; j<SEQUENCE_LENGTH; j++)
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
        for (var i = 0; i < CANDIDATE_LENGTH; i++)
        {
         	if (this.matches[i] == 1) this.fitness += SINGLE_MATCH_AWARD;
            if (this.matches[i] == 2) this.fitness += DOUBLE_MATCH_AWARD;
        }
        //stop bothering the perfect guy!
        if (this.fitness == CANDIDATE_LENGTH * DOUBLE_MATCH_AWARD) this.untouchable = true;
        return this.fitness;
    };
    
    this.mutate = function()
    {
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
    };
    
    this.crossover = function (parent)
    {
    	if (!this.untouchable)
    	{
    		for (var i = CANDIDATE_LENGTH/2; i<CANDIDATE_LENGTH; i++)
		    {
		    	this.sequence[i] = parent.sequence[i];
		    }
    	}
    	
    
    }
} //CHROMOSOME

function Population()
{
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
        this.people[i] = new Chromosome();
    }
   
    // function to create the next generation    
    this.buildNextGeneration = function()
    { 
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
    }; 
} //POPULATION