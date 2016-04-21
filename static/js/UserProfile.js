function UserProfile(config) {
	if (config == undefined) {
		this.songNum = 0; // the current song
		this.isWarmup = true;
		this.warmUpNum = 0;
		this.isPostTest = false;
		this.postTestNum = 0;
		this.updateStatuses();
		//this.performanceData = {}; //level: {list of accuracy lists}
	}
	else {
		this.songNum = config.songNum;
		this.isWarmup = config.isWarmup;
		this.warmUpNum = config.warmUpNum;
		this.isPostTest = config.isPostTest;
		this.postTestNum = config.postTestNum;
		this.setInformation(config);
		//this.performanceData = config.performanceData;
	}
}

UserProfile.prototype.setInformation = function(config) {
	this.currentLevel = config.currentLevel;
	this.baseLevel = config.baseLevel;
	this.nextBaseLevel = config.nextBaseLevel;
	this.drillingLevel = config.drillingLevel;
	PianoteLevels.setLevels(this.drillingLevel);
	this.tiers = PianoteLevels.getTiers();
	this.currentTier = config.currentTier;
	this.currentLevelInTier = config.currentLevelInTier;
	PianoteLevels.unlockAllLevels();
	PianoteLevels.lockLevels(this.currentLevelInTier.level);
	this.numAttemptsAtLevel = config.numAttemptsAtLevel;
	this.numSuccessesInLevel = config.numSuccessesInLevel;
    this.numStrugglesInLevel = config.numStrugglesInLevel;
    
    
    this.curPsetLevel = config.curPsetLevel;
    this.pset = config.pset;
    PianoteLevels.unlockAllLevels();
    PianoteLevels.lockLevels(this.pset[this.curPsetLevel].level);
}

UserProfile.prototype.updateStatuses = function() {
	this.currentLevel = PianoteLevels.getCurrentLevels(); //current level they are working on
	
	this.baseLevel = PianoteLevels.getCurrentLevels(); //current base level that current level is derived from
	this.nextBaseLevel = PianoteLevels.getNextLevels(); //next level that current level is gradually working towards
	this.drillingLevel = PianoteLevels.getCurrentLevels(); //the drilling level that is targeting the current level
	this.tiers = PianoteLevels.getTiers();
	this.currentTier = 0; //the tier the user is on towards the next base
	this.chooseAnotherLevelInTier();
	this.numAttemptsAtLevel = 0; //attempts made to pass current level or drilling level
	this.numSuccessesInLevel = 0;
    this.numStrugglesInLevel = 0;


    this.curPsetLevel = 0;
    this.pset = PianoteLevels.getPowerSet();
    console.log("new pset");
    console.log(this.pset);
    //this.pset.pop();
    
}

UserProfile.prototype.updatePsetLevel = function() {
    //set to the next tier of levels if all power set is done
    if (this.curPsetLevel + 1 == this.pset.length) {
        PianoteLevels.unlockAllLevels();
        PianoteLevels.setLevels(this.baseLevel);
        PianoteLevels.increaseAllLevels();
        this.updateStatuses();
    }
    else {
        this.curPsetLevel++;
    }
    
    console.log(this.pset);
    
    //set the new current level
	PianoteLevels.unlockAllLevels();
	PianoteLevels.setLevels(this.baseLevel);
	PianoteLevels.increaseLevels(this.pset[this.curPsetLevel].level);
	PianoteLevels.lockLevels(this.pset[this.curPsetLevel].level);

	this.currentLevel = PianoteLevels.getCurrentLevels();
	this.drillingLevel = PianoteLevels.getCurrentLevels();
	this.numAttemptsAtLevel = 0; //attempts made to pass current level or drilling level
	this.numSuccessesInLevel = 0;
    this.numStrugglesInLevel = 0;
}

UserProfile.prototype.lowerPsetLevel = function() {
    if (this.curPsetLevel - 1 < 0) {
        return;
    }
    
    this.curPsetLevel--;
    
    //set the new current level
	PianoteLevels.unlockAllLevels();
	PianoteLevels.setLevels(this.baseLevel);
	PianoteLevels.increaseLevels(this.pset[this.curPsetLevel].level);
	PianoteLevels.lockLevels(this.pset[this.curPsetLevel].level);

	this.currentLevel = PianoteLevels.getCurrentLevels();
	this.drillingLevel = PianoteLevels.getCurrentLevels();
    this.numAttemptsAtLevel = 0; //attempts made to pass current level or drilling level
	this.numSuccessesInLevel = 0;
    this.numStrugglesInLevel = 0;
    
}

UserProfile.prototype.updateTier = function() {
	//update base level if all tiers are complete
	if (this.currentTier == this.tiers.length - 1) {
		PianoteLevels.unlockAllLevels();
		PianoteLevels.setLevels(this.baseLevel);
		PianoteLevels.increaseAllLevels();
		this.updateStatuses();
	}
	
	this.currentTier = (this.currentTier + 1) % this.tiers.length;

	var tier = this.tiers[this.currentTier];

	this.chooseAnotherLevelInTier();
}

UserProfile.prototype.chooseAnotherLevelInTier = function() {
	var that = this;

	//only choose levels that have not been passed and that are not the current tier
	var filteredTierLevels = this.tiers[this.currentTier].filter(function(val, idx) {
		return val != that.currentLevelInTier && !val.passed;
	});

	//If there are not other available levels, stick at the current level
	if (filteredTierLevels.length == 0) {
		return;
	}

	//pick a random available level
	this.currentLevelInTier = filteredTierLevels[Math.random() * filteredTierLevels.length << 0];

	//set the new current level
	PianoteLevels.unlockAllLevels();
	PianoteLevels.setLevels(this.baseLevel);
	PianoteLevels.increaseLevels(this.currentLevelInTier.level);
	PianoteLevels.lockLevels(this.currentLevelInTier.level);

	this.currentLevel = PianoteLevels.getCurrentLevels();
	this.drillingLevel = PianoteLevels.getCurrentLevels();
}

UserProfile.prototype.passedAllLevelsInTier = function() {
	var passed = true;
	var tier = this.tiers[this.currentTier];

	for (var i = 0; i < tier.length; i++) {
		passed = passed && tier[i].passed;
	}
	return passed;
}

/*UserProfile.prototype.getOverallAccuracyForLevel = function(level) {
	var curLevelString = JSON.stringify(level);

	if (this.performanceData[curLevelString] == undefined) {
		return 0;
	}

	var accuracySum = 0;
	for(var i = 0; i < this.performanceData[curLevelString].length; i++) {
		var data = this.performanceData[curLevelString][i];
		var componentAccuracySum = 0;
		for(var j in data) {
			componentAccuracySum += data[j];
		}
		var componentAccuracy = componentAccuracySum / Object.keys(data).length;
		accuracySum+=componentAccuracy;
		
	}
	return accuracySum / this.performanceData[curLevelString].length;
}

UserProfile.prototype.getComponentAccuracyForLevel = function(level) {
	var levelString = JSON.stringify(level);
	var that = this;
	var accuracies = {};
	for (var i in level) {
		accuracies[i] = 0;
	}

	if (this.performanceData[levelString] == undefined) {
		return accuracies;
	}

	console.log(this.performanceData[levelString]);

	//var accuracySum = [0,0,0,0];
	for(var i = 0; i < this.performanceData[levelString].length; i++) {
		var data = this.performanceData[levelString][i];
		for(var j in data) {
			accuracies[j] += data[j];
		}
	}

	console.log(accuracies);

	for (var i in accuracies) {
		accuracies[i]  = accuracies[i] / that.performanceData[levelString].length;
	}

	return accuracies;
}

UserProfile.prototype.getLowestAccuracyForCurrentLevelFocus = function() {
	var that = this;
	var levelString = JSON.stringify(this.currentLevel);

	if (this.performanceData[levelString] == undefined) {
		return; //TODO HUH?????
	}

	var componentAccuracies = {};
	for (var i in this.currentLevelInTier.level) {
		componentAccuracies[this.currentLevelInTier.level[i]] = 0;
	}

	for (var i = 0; i < this.performanceData[levelString].length; i++) {
		var data = this.performanceData[levelString][i];
		for (var j in componentAccuracies) {
			componentAccuracies[j] += data[j];
		}
	}

	for (var i in componentAccuracies) {
		componentAccuracies[i]  = componentAccuracies[i] / that.performanceData[levelString].length;
	}

	var minAccuracy = 1;
	for (var i in componentAccuracies) {
		if (componentAccuracies[i] < minAccuracy) {
			minAccuracy = componentAccuracies[i];
		}
	}

	return minAccuracy;
}*/

UserProfile.prototype.getLevelFocusComponents = function() {
	return this.pset[this.curPsetLevel].level;//this.currentLevelInTier.level;
}

UserProfile.prototype.updateDrillingLevel = function() {
	this.drillingLevel = PianoteLevels.getCurrentLevels();
}


