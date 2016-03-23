function MusicLevel(config) {
	this.numLevels = config.numLevels;
	this.baseIdx = config.baseIdx;
	this.musicComponents = config.musicComponents;
	this.increment = config.increment;

	this.currentLevel = 0;
	this.lockLevel = false;
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
	if (this.currentLevel - 1 > 0 && !this.lockLevel) {
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

const rhythmLevels = new MusicLevel({
	musicComponents: [16, 12, 8, 4, 6, 2, 3, 1],
	numLevels: 3,
	baseIdx: 4, //start with quarter notes
	increment: 2
});

const keyLevels = new MusicLevel({
	musicComponents: ['C', 'G', 'F', 'D', 'Bb', 'A', 'Eb'],
	numLevels: 3,
	baseIdx: 3, //start with one sharp or flat
	increment: 2
});

const timeLevels = new MusicLevel({
	musicComponents: [{beats: 2, rhythm: 4}, {beats: 4, rhythm: 4}, {beats: 3, rhythm: 4}, {beats: 6, rhythm: 8}],
	numLevels: 4,
	baseIdx: 1,
	increment: 1
});

const intervalLevels = new MusicLevel({
	musicComponents: [2, 3, 5, 4, 6],
	numLevels: 5,
	baseIdx: 1,
	increment: 1
});

const songLevels = new MusicLevel({
	musicComponents: [SeparateHandPiece, TriadPiece, SuspendedChordPiece, InvertedChordPiece, HandsTogetherPiece],
	numLevels: 5,
	baseIdx: 1,
	increment: 1
});


const PianoteLevels = {
	levels: {
		r: rhythmLevels, 
		k: keyLevels, 
		t: timeLevels, 
		i: intervalLevels,
		s: songLevels
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

	increaseAllLevels: function() {
		for (var i in this.levels) {
			this.levels[i].increaseLevel();
		}	
	},

	increaseLevels: function(levs) {
		for (var i = 0; i < levs.length; i++) {
			console.log(this.levels[levs[i]]);
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
	}
};
