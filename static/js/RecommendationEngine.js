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

	function updateDrillingLevel(accuracies) {
		for (i = 0; i < accuracies.length; i++) {
			//lower the component level if the accuracy is bad (shows they are having trouble at the level)
			if (accuracies[i] < 0.6) {
				that.userProfile.drillingLevel[i] = that.userProfile.drillingLevel[i] - 1 >= 0 ? that.userProfile.drillingLevel[i] - 1 : 0;
			}
			//raise the component level if the accuracy is good, cap at current level to drill to
			else if (accuracies[i] > 0.8) {
				that.userProfile.drillingLevel[i] = that.userProfile.drillingLevel[i] + 1 > curLevel[i] ? curLevel[i] : that.userProfile.drillingLevel[i] + 1;
			}
		}
	}

	//Drilling to a target level
	if (this.isDrilling) {
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
		this.userProfile.numAttempts++;
		//add last song accuracies to current level accuracies
		var curLevelString = JSON.stringify(this.userProfile.currentLevel);
		if (this.userProfile.performanceData[curLevelString] == undefined) {
			this.userProfile.performanceData[curLevelString] = [];
		}
		this.userProfile.performanceData[curLevelString].push(lastSongAccuracies);

		//Only keep last 5 accuracies
		if (this.userProfile.performanceData[curLevelString].length > 3) {
			this.userProfile.shift();
		}

		if (this.numAttempts > 3) {
			var totalAccuracy = this.userProfile.getOverallAccuracyForLevel(this.userProfile.currentLevel);
			//if total accuracy is over all attempts is 80 or above
			if(totalAccuracy >= .8) {

				//set current level as passed
				this.userProfile.tierProgress[this.userProfile.currentLevelInTier] = true;

				//if all levels in tier have been passed, update the tier (possibly going to next base level)
				if (this.userProfile.passedAllLevelsInTier()) {
					this.userProfile.updateTier();
				}
			}
			//ise if the total accuracy over the attempts is between 60 and 80
			else if (totalAccuracy >= 0.6 && totalAccuracy < 0.8) {
				this.userProfile.chooseAnotherLevelInTier();
				//choose new level in the tier
			}
			// if the total accuracy is below 60 percent
			else {
				this.userProfile.isDrilling = true;
				this.userProfile.drillingLevel = this.userProfile.currentLevel;
				updateDrillingLevel(this.userProfile.getComponentAccuracyForLevel(this.userProfile.currentLevel));
				return this.userProfile.drillingLevel;
				//Start drilling with the current level as the target
			}

			this.numAttempts = 0;
		}
		
		return this.userProfile.currentLevel;

	}	

}
