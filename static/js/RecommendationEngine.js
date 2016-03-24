function RecommendationEngine(userProfile) {
	if(userProfile != undefined) {
		this.userProfile = userProfile;
	}
	else {
		this.userProfile = new UserProfile();
	}

	this.numAttempts = 0;
}


RecommendationEngine.prototype.getNextSongParameters = function(lastSongAccuracies) {
	var that = this;
	console.log(lastSongAccuracies);
	console.log("hello!");

	function updateDrillingLevel(accuracies) {
		var focusComponents = that.userProfile.getLevelFocusComponents();
		var lowestAccuracies = (function() {
			var minAccuracy = 1;
			for (var i = 0; i < focusComponents.length; i++) {
				if (accuracies[focusComponents[i]] < minAccuracy) {
					minAccuracy = accuracies[focusComponents[i]];
				}
			}
			
			return minAccuracy;		
		})();

		if (lowestAccuracies < 0.6) {
			console.log("decreasing!");
			PianoteLevels.decreaseLevels();
		}
		else {
			for (var i in accuracies) {
				//if component is not a focus component
				if (focusComponents.indexOf(i) == -1) {

					//lower the component level if the accuracy is bad (shows they are having trouble at the level)
					if (accuracies[i] < 0.6) {
						PianoteLevels.decreaseLevel(i);
					}
					//raise the component level if the accuracy is good, cap at current level to drill to
					else if (accuracies[i] > 0.8) {
						if (that.userProfile.drillingLevel[i] < that.userProfile.currentLevel[i]) {
							PianoteLevels.increaseLevel(i);
						}
					}
				}
			}	
		}

		that.userProfile.updateDrillingLevel();
	}

	

	//if drilling level is same as target level
	if (JSON.stringify(this.userProfile.drillingLevel) == JSON.stringify(this.userProfile.currentLevel)) {		
		//add to level accuracies	
		var curLevelString = JSON.stringify(this.userProfile.currentLevel);
		if (this.userProfile.performanceData[curLevelString] == undefined) {
			this.userProfile.performanceData[curLevelString] = [];
		}
		this.userProfile.performanceData[curLevelString].push(lastSongAccuracies);

		//Only keep last 5 accuracies
		if (this.userProfile.performanceData[curLevelString].length > 5) {
			console.log("getting rid of data for current level");
			this.userProfile.performanceData[curLevelString].shift();
		}

		//get lowest accuracy
		var lowestAccuracy = 1;
		for (var i in lastSongAccuracies) {
			if (lastSongAccuracies[i] < lowestAccuracy) {
				lowestAccuracy = lastSongAccuracies[i];
			}
		}

		//if component accuracies are high
		if (lowestAccuracy >= 0.8) {	
			console.log("success!");
			//number of successes in level go up
			this.userProfile.numSuccessesInLevel++;

			//number of successive failed attempts is reset
			this.userProfile.numAttemptsAtLevel = 0;

			console.log(this.userProfile.numSuccessesInLevel);
			//if number of successes is greater than 3
			if (this.userProfile.numSuccessesInLevel >= 3) {
				console.log("passed level!");
				//pass level
				this.userProfile.currentLevelInTier.passed = true;

				//choose next level
				if (this.userProfile.passedAllLevelsInTier()) {
					console.log("passed all levels!");
					this.userProfile.updateTier();
				}
				else {
					this.userProfile.chooseAnotherLevelInTier();
				}

				//reset successes
				this.userProfile.numSuccessesInLevel = 0;
	
			}

			//return new level
			return this.userProfile.drillingLevel;


		}

		//if component accuracies are so so
		if (lowestAccuracy >= 0.6 && lowestAccuracy < 0.8) {
			//number of attempts in level go up
			this.userProfile.numAttemptsAtLevel++;

			//if number of attempts is greater than 5
			if (this.userProfile.numAttemptsAtLevel > 5) {
				//choose another level in the tier
				this.userProfile.chooseAnotherLevelInTier();

				//reset attempts and successes
				this.userProfile.numAttemptsAtLevel = 0;
				this.userProfile.numSuccessesInLevel = 0;

				//return new level
				return this.userProfile.drillingLevel;
			}	
		}

		
	}

	updateDrillingLevel(lastSongAccuracies);
	return this.userProfile.drillingLevel;

	/*

	//Drilling to a target level
	if (this.userProfile.isDrilling) {
		console.log("drilling!");
		//Drill
		updateDrillingLevel(lastSongAccuracies);

		//if drilling level is equal to the current level
		if (JSON.stringify(this.userProfile.drillingLevel) == JSON.stringify(this.userProfile.currentLevel)) {
			this.userProfile.isDrilling = false;
			return this.userProfile.currentLevel;
		}

		return this.userProfile.drillingLevel;
	}
	//Practicing target level
	else {
		this.userProfile.numAttemptsAtLevel++;
		//add last song accuracies to current level accuracies
		var curLevelString = JSON.stringify(this.userProfile.currentLevel);
		if (this.userProfile.performanceData[curLevelString] == undefined) {
			this.userProfile.performanceData[curLevelString] = [];
		}
		this.userProfile.performanceData[curLevelString].push(lastSongAccuracies);

		//Only keep last 5 accuracies
		if (this.userProfile.performanceData[curLevelString].length > 3) {
			console.log("getting rid of data for current level");
			this.userProfile.performanceData[curLevelString].shift();
		}
		
		if (this.userProfile.numAttemptsAtLevel > 3) {
			console.log("more than 3 attempts!");
			var totalAccuracy = this.userProfile.getOverallAccuracyForLevel(this.userProfile.currentLevel);
			//if total accuracy is over all attempts is 80 or above
			var lowestAccuracy = this.userProfile.getLowestAccuracyForCurrentLevelFocus();//Math.min.apply(Math, this.userProfile.getComponentAccuracyForLevel(this.userProfile.currentLevel));
			
			console.log(this.userProfile.getComponentAccuracyForLevel(this.userProfile.currentLevel));
			console.log(lowestAccuracy);
			if(lowestAccuracy >= .8) {
				//check other accuracy levels
				//if they are sub 


				console.log("passed current level");
				//set current level as passed
				this.userProfile.tierProgress[this.userProfile.currentLevelInTier] = true;

				//if all levels in tier have been passed, update the tier (possibly going to next base level)
				if (this.userProfile.passedAllLevelsInTier()) {
					console.log("passed all levels!");
					this.userProfile.updateTier();
				}
				else {
					this.userProfile.chooseAnotherLevelInTier();
				}
			}
			//ise if the total accuracy over the attempts is between 60 and 80
			else if (lowestAccuracy >= 0.6 && lowestAccuracy < 0.8) {
				console.log("haven't passed yet, choose another level");
				this.userProfile.chooseAnotherLevelInTier();
				//choose new level in the tier
			}
			// if the total accuracy is below 60 percent
			else {
				console.log("you suck, time to drill");
				this.userProfile.isDrilling = true;
				this.userProfile.drillingLevel = this.userProfile.currentLevel.slice();

				updateDrillingLevel(this.userProfile.getComponentAccuracyForLevel(this.userProfile.currentLevel));
				this.userProfile.numAttemptsAtLevel = 0;
				return this.userProfile.drillingLevel;
				//Start drilling with the current level as the target
			}

			this.userProfile.numAttemptsAtLevel = 0;
		}
		
		return this.userProfile.currentLevel;

	}	*/

}
