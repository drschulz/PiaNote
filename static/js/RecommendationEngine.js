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
		for (i = 0; i < accuracies.length; i++) {
			//lower the component level if the accuracy is bad (shows they are having trouble at the level)
			if (accuracies[i] < 0.6) {
				that.userProfile.drillingLevel[i] = that.userProfile.drillingLevel[i] - 1 >= 1 ? that.userProfile.drillingLevel[i] - 1 : 1;
			}
			//raise the component level if the accuracy is good, cap at current level to drill to
			else if (accuracies[i] > 0.8) {
				that.userProfile.drillingLevel[i] = that.userProfile.drillingLevel[i] + 1 > that.userProfile.currentLevel[i] ? that.userProfile.currentLevel[i] : that.userProfile.drillingLevel[i] + 1;
			}
		}
	}

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
		console.log(this.userProfile.numAttemptsAtLevel);
		if (this.userProfile.numAttemptsAtLevel > 3) {
			console.log("more than 3 attempts!");
			var totalAccuracy = this.userProfile.getOverallAccuracyForLevel(this.userProfile.currentLevel);
			//if total accuracy is over all attempts is 80 or above
			var lowestAccuracy = Math.min.apply(Math, this.userProfile.getComponentAccuracyForLevel(this.userProfile.currentLevel));
			console.log(this.userProfile.getComponentAccuracyForLevel(this.userProfile.currentLevel));
			console.log(lowestAccuracy);
			if(lowestAccuracy >= .8) {
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

	}	

}
