function MusicLevel(config) {
	this.numLevels = config.numLevels;
	this.baseIdx = config.baseIdx;
	this.musicComponents = config.musicComponents;
	this.increment = config.increment;

	this.currentLevel = 0;
	this.lockLevel = false;
    this.textRep = config.textRep;
}

MusicLevel.prototype.setLevel = function(level) {
	if (level < this.numLevels) {
		this.currentLevel = level;
	}
};

//whether to lock current level or not
MusicLevel.prototype.lock = function(shouldLock) {
	this.lockLevel = shouldLock;
};

//increase level if not locked and not at max
MusicLevel.prototype.increaseLevel = function() {
	if (this.currentLevel + 1 < this.numLevels && !this.lockLevel) {
		this.currentLevel++;
	}
};

//decrease level if not locked and not at level 0
MusicLevel.prototype.decreaseLevel = function() {
	if (this.currentLevel - 1 >= 0 && !this.lockLevel) {
		this.currentLevel--;
	}	
};

//get components up to the current level
MusicLevel.prototype.getCurrentChoices = function() {
	return this.musicComponents.slice(0, this.baseIdx + this.increment*this.currentLevel);
};

//only get components that belong to the current level
MusicLevel.prototype.getCurrentChoicesStrict = function() {
	var lastLevelIdx = this.currentLevel == 0 ? 0 : (this.currentLevel - 1)*this.increment + this.baseIdx;
	return this.musicComponents.slice(lastLevelIdx, this.baseIdx + this.currentLevel*this.increment);
};

//check if the level can still be increased
MusicLevel.prototype.atMaxLevel = function() {
	return this.currentLevel == this.numLevels - 1 || this.lockLevel;
};

MusicLevel.prototype.getTextRepresentationOfLevel = function() {
    var comps = this.getCurrentChoicesStrict();
    var text = "";
    for (var i = 0; i < comps.length; i++) {
        if (i != 0) {
            text += ", ";
        }
        text += this.textRep(comps[i]);
    }
    text += " ";
    return text;
}

const rhythmLevels = new MusicLevel({
	musicComponents: [
        16, 8, 4, 12, 2, 6, 1, 3
        
        ],
	numLevels: 5,//3,
	baseIdx: 4,//4, //start with quarter notes
	increment: 1,//2
    textRep: function(comp) {
         return RhythmToText[comp] + "s";  
    }
});

const keyLevels = new MusicLevel({
	musicComponents: ['C', 'G', 'F', 'D', 'Bb', 'A', 'Eb'],
	numLevels: 4,
	baseIdx: 1, //start with one sharp or flat
	increment: 2,
    textRep: function(comp) {
        return comp;
    }
});

const timeLevels = new MusicLevel({
	musicComponents: [{beats: 4, rhythm: 4}, {beats: 3, rhythm: 4}, {beats: 2, rhythm: 4}],
	numLevels: 3,
	baseIdx: 1,
	increment: 1,
    textRep: function(comp) {
        return comp.beats + "/" + comp.rhythm;
    }
});

const intervalLevels = new MusicLevel({
	musicComponents: [0, 1, 2, 4, 3],
	numLevels: 3,
	baseIdx: 3,
	increment: 1,
    textRep: function(comp) {
        var text = "";
        if (comp != 0) {
            text = comp + 1;
            if (comp + 1 == 2) {
                text += "nd";
            }
            else if (comp + 1 == 3) {
                text += "rd";
            }
            else {
                text += "th";
            }
            return text;
        }
        return "No";
    }
});

const songLevels = new MusicLevel({
	musicComponents: [SeparateHandPiece, SimpleChordPiece, SimpleFullChordPiece, MixedChordPiece, ArpeggioPiece, HandsTogetherPiece],
	numLevels: 6,
	baseIdx: 1,
	increment: 1,
    textRep: function(comp) {
        return comp.prototype.getType();
    }
});


const PianoteLevels = {
	levels: {
		k: keyLevels,
        t: timeLevels,
        s: songLevels,
        i: intervalLevels,
        r: rhythmLevels, 
	},
	
	getLevelsThatCanIncrease: function() {
		var levelIndices = [];

		for(var i in this.levels) {
			if (!this.levels[i].atMaxLevel()) {
				levelIndices.push(i);
			}
		}

		return levelIndices;
	},

	getTiers: function() {
		var tiers = [];
		tiers.push([{level: [], passed: false}]);
		var levelsToIncrease = this.getLevelsThatCanIncrease();

		for(var i = 1; i < levelsToIncrease.length; i++) {
			var cmb = Combinatorics.combination(levelsToIncrease, i);
			var tier = [];
			var t;
			while(t = cmb.next()) {
				var bundle = {};
				bundle.level = t;
				bundle.passed = false;
				tier.push(bundle);
			}
			tiers.push(tier);
		}

		return tiers;
	},
    
    getPowerSet: function() {
        var pset = [];
        var levelsToIncrease = this.getLevelsThatCanIncrease();
        console.log(levelsToIncrease);
        if (levelsToIncrease.length == 0) {
            console.log("hello!");
            pset.push({level: [], passed: false});
            console.log(pset);
            return pset;
        }
        
        cmb = Combinatorics.power(levelsToIncrease);
        cmb.forEach(function(a) {
            pset.push({level: a, passed: false});
        });
        
        return pset;
    },

	increaseAllLevels: function() {
		for (var i in this.levels) {
			this.levels[i].increaseLevel();
		}	
	},

	increaseLevels: function(levs) {
		for (var i = 0; i < levs.length; i++) {
			this.levels[levs[i]].increaseLevel();
		}
	},

	increaseLevel: function(lev) {
		this.levels[lev].increaseLevel();
	},

	decreaseLevels: function() {
		for (var i in this.levels) {
			this.levels[i].decreaseLevel();
		}	
	},

	decreaseLevel: function(lev) {
		this.levels[lev].decreaseLevel();
	},

	setLevel: function(lev, level) {
		this.levels[lev] = level;
	},

	setLevels: function(newLevels) {
		for (var i in newLevels) {
			this.levels[i].setLevel(newLevels[i]);
		}
	},

	unlockAllLevels: function() {
		for (var i in this.levels) {
			this.levels[i].lock(false);
		}
	},

	lockLevels: function(levelIndices) {
		for (var i = 0; i < levelIndices.length; i++) {
			this.levels[levelIndices[i]].lock(true);
		}
	},

	getCurrentLevels: function() {
		var currentLevels = {};

		for(var i in this.levels) {
			currentLevels[i] = this.levels[i].currentLevel;
		}

		return currentLevels;
	},

	getNextLevels: function() {
		var nextLevels = {};

		for(var i in this.levels) {
			if (this.levels[i].atMaxLevel()) {
				nextLevels[i] = this.levels[i].currentLevel;
			}
			else {
				nextLevels[i] = this.levels[i].currentLevel + 1;
			}
		}

		return nextLevels;	
	},

	getNumLevels: function() {
		return this.levels.length;
	},

	getLevelKey: function() {

	}
};
