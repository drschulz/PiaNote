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

		if (lowestAccuracies < 0.7) {
			PianoteLevels.decreaseLevels();
            that.userProfile.numStrugglesInLevel++;
		}
		else {
			for (var i in accuracies) {
				//if component is not a focus component
				if (focusComponents.indexOf(i) == -1) {

					//lower the component level if the accuracy is bad (shows they are having trouble at the level)
					if (accuracies[i] < 0.7) {
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

	function isEqual(level1, level2) {
		var equal = true;
		for (var i in level1) {
			equal = equal && level1[i] == level2[i];
		}
		return equal;
	}
    
    //get lowest accuracy
    var lowestAccuracy = 1;
    for (var i in lastSongAccuracies) {
        if (lastSongAccuracies[i] < lowestAccuracy) {
            lowestAccuracy = lastSongAccuracies[i];
        }
    }

	//if drilling level is same as target level
	if (isEqual(this.userProfile.drillingLevel, this.userProfile.currentLevel)) {
		//if component accuracies are high
		if (lowestAccuracy >= 0.8) {
			//number of successes in level go up
			this.userProfile.numSuccessesInLevel++;

			//number of successive failed attempts is reset
			this.userProfile.numAttemptsAtLevel = 0;

			//if number of successes is greater than 3
			if (this.userProfile.numSuccessesInLevel >= 1) {
				//pass level
				this.userProfile.updatePsetLevel();
                /*this.userProfile.currentLevelInTier.passed = true;

				//choose next level
				if (this.userProfile.passedAllLevelsInTier()) {
					this.userProfile.updateTier();
				}
				else {
					this.userProfile.chooseAnotherLevelInTier();
				}*/

				//reset successes
				this.userProfile.numSuccessesInLevel = 0;
			}

			//return new level
			return this.userProfile.drillingLevel;
		}
        
		//number of attempts in level go up
		this.userProfile.numAttemptsAtLevel++;

		//if component accuracies are so so
		if (lowestAccuracy >= 0.7 && lowestAccuracy < 0.8) {
			//if number of attempts is greater than 5
			/*if (this.userProfile.numAttemptsAtLevel > 3) {
				//choose another level in the tier
				this.userProfile.chooseAnotherLevelInTier();

				//reset attempts and successes
				this.userProfile.numAttemptsAtLevel = 0;
				this.userProfile.numSuccessesInLevel = 0;

				//return new level
				return this.userProfile.drillingLevel;
			}*/
		}
		
	}

	updateDrillingLevel(lastSongAccuracies);
    
    if (this.userProfile.numStrugglesInLevel > 3) {
        this.userProfile.lowerPsetLevel();
        return this.userProfile.drillingLevel;
    }
    
	return this.userProfile.drillingLevel;

}


function ControlEngine(userProfile) {
	if(userProfile != undefined) {
		this.userProfile = userProfile;
	}
	else {
		this.userProfile = new UserProfile();
	}

	this.numAttempts = 0;
}

ControlEngine.prototype.getNextSongParameters = function(lastSongAccuracies) {
    this.userProfile.numAttemptsAtLevel++;
    
    if (this.userProfile.numAttemptsAtLevel == 3) {
        this.userProfile.updatePsetLevel();
    }
    return this.userProfile.drillingLevel;
    
}