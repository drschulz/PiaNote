const tier0 = [[]];
const tier1 = [[0], [1], [2], [3]];
const tier2 = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
const tier3 = [[0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3]];
const tiers = [tier0, tier1, tier2, tier3];

const INTERVALS = 0;
const RHYTHMS = 1;
const KEYLEVEL = 2;
const CHORDLEVEL = 3;

function UserProfile() {
	this.currentLevel = [1,1,1,1]; //current level they are working on
	this.baseLevel = [1,1,1,1]; // current base level that current level is derived from
	this.nextBaseLevel = [2,2,2,2]; //next level that current level is gradually working towards
	this.drillingLevel = [1,1,1,1]; //the drilling level that is targeting the current level
	this.isDrilling = false; //whether the user is currently drilling or practicing the current level
	this.currentTier = 0; //the tier the user is on towards the next base
	this.currentLevelInTier = 0;
	this.numAttemptsAtLevel = 0; //attempts made to pass current level or drilling level
	this.tierProgress = [false]; //indicates which part of the tier they have passed.
	this.songNum = 0; // the current song

	this.performanceData = {}; //level: {list of accuracy lists}
}

UserProfile.prototype.updateTier = function() {
	//update base level if all tiers are complete
	if (this.currentTier == 3) {
		for (var i = 0; i < this.baseLevel.length; i++) {
			this.baseLevel[i]++;
			this.nextBaseLevel[i]++;
		}
	}
	
	this.currentTier = (this.currentTier + 1) % tiers.length;

	var tier = tiers[this.currentTier];

	this.tierProgress = [];
	for(var i = 0; i < tier.length; i++) {
		this.tierProgress.push(false);
	}

	this.chooseAnotherLevelInTier();
}

UserProfile.prototype.chooseAnotherLevelInTier = function() {
	var that = this;

	//only choose levels that have not been passed and that are not the current tier
	var tierLevelIndices = tiers[this.currentTier].map(function(val, idx) {
		return idx;
	});

	var filteredTierLevels = tierLevelIndices.filter(function(val, idx) {
		return !that.tierProgress[idx] && idx != that.currentLevelInTier;
	});

	//If there are not other available levels, stick at the current level
	if (filteredTierLevels.length == 0) {
		return;
	}

	//pick a random available level
	this.currentLevelInTier = filteredTierLevels[Math.random() * filteredTierLevels.length << 0];

	//set the new current level
	this.currentLevel = this.baseLevel.slice();


	var tierLevel = tiers[this.currentTier][this.currentLevelInTier];

	for (var i = 0; i < tierLevel.length; i++) {
		//update the level number according to the tier
		this.currentLevel[tierLevel[i]] = this.nextBaseLevel[tierLevel[i]];
	}

}

UserProfile.prototype.passedAllLevelsInTier = function() {
	var passed = true;

	for (var i = 0; i < this.tierProgress.length; i++) {
		passed = passed && this.tierProgress[i];
	}
	return passed;
}

UserProfile.prototype.getOverallAccuracyForLevel = function(level) {
	var curLevelString = JSON.stringify(level);

	if (this.performanceData[curLevelString] == undefined) {
		return 0;
	}

	var accuracySum = 0;
	for(var i = 0; i < this.performanceData[curLevelString].length; i++) {
		var data = this.performanceData[curLevelString][i];
		var componentAccuracySum = 0;
		for(var j = 0; j < data.length; j++) {
			componentAccuracySum += data[i];
		}
		var componentAccuracy = componentAccuracySum / data.length;
		accuracySum+=componentAccuracy;
		
	}
	return accuracySum / this.performanceData[curLevelString].length;
}

UserProfile.prototype.getComponentAccuracyForLevel = function(level) {
	var levelString = JSON.stringify(level);
	var that = this;
	if (this.performanceData[levelString] == undefined) {
		return [0,0,0,0];
	}

	console.log(this.performanceData[levelString]);

	var accuracySum = [0,0,0,0];
	for(var i = 0; i < this.performanceData[levelString].length; i++) {
		var data = this.performanceData[levelString][i];
		for(var j = 0; j < data.length; j++) {
			accuracySum[j] += data[j];
		}
	}

	console.log(accuracySum);

	return accuracySum.map(function(e) {
		return e / that.performanceData[levelString].length;
	});

}


