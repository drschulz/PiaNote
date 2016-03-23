var user;
var engine;

window.addEventListener('load', function() {
	user = new UserProfile();
	engine = new RecommendationEngine(user);
	console.log(user.currentLevel);
	$("#level").html(JSON.stringify(user.currentLevel));
	$("#base").html(JSON.stringify(user.baseLevel));
	$("#next").html(JSON.stringify(user.nextBaseLevel));
	$("#isDrilling").html(JSON.stringify(user.isDrilling));
	$("#drilling").html(JSON.stringify(user.drillingLevel));

	$("#next-button").click(function() {
		var accuracies = {
			r: parseFloat($("#val1").val()), 
			k: parseFloat($("#val2").val()), 
			t: parseFloat($("#val3").val()), 
			i: parseFloat($("#val4").val()),
			s: parseFloat($("#val5").val())
		};
		var nextLevel = engine.getNextSongParameters(accuracies);
		$("#level").html(JSON.stringify(user.currentLevel));
		$("#base").html(JSON.stringify(user.baseLevel));
		$("#next").html(JSON.stringify(user.nextBaseLevel));
		$("#isDrilling").html(JSON.stringify(user.isDrilling));
		$("#drilling").html(JSON.stringify(user.drillingLevel));
	});

	/*console.log(rhythmLevels.getCurrentChoices());
	console.log(rhythmLevels.getCurrentChoicesStrict());
	rhythmLevels.increaseLevel();
	console.log(rhythmLevels.getCurrentChoices());
	console.log(rhythmLevels.getCurrentChoicesStrict());

	console.log(keyLevels.getCurrentChoices());
	console.log(keyLevels.getCurrentChoicesStrict());
	keyLevels.increaseLevel();
	console.log(keyLevels.getCurrentChoices());
	console.log(keyLevels.getCurrentChoicesStrict());

	console.log(timeLevels.getCurrentChoices());
	console.log(timeLevels.getCurrentChoicesStrict());
	timeLevels.increaseLevel();
	console.log(timeLevels.getCurrentChoices());
	console.log(timeLevels.getCurrentChoicesStrict());

	console.log(intervalLevels.getCurrentChoices());
	console.log(intervalLevels.getCurrentChoicesStrict());
	intervalLevels.increaseLevel();
	console.log(intervalLevels.getCurrentChoices());
	console.log(intervalLevels.getCurrentChoicesStrict());*/

	console.log(PianoteLevels.getCurrentLevels());
	PianoteLevels.increaseAllLevels();
	console.log(PianoteLevels.getCurrentLevels());
	console.log(PianoteLevels.getNextLevels());

	var tiers = PianoteLevels.getTiers();
	console.log(tiers);
	for (var i = 0; i < tiers.length; i++) {
		console.log('[');
		for (var j = 0; j < tiers[i].length; j++) {
			console.log(tiers[i][j].level);
		}
		console.log(']');
	}

	//rhythmLevels.lock(true);
	//keyLevels.lock(true);
	//timeLevels.lock(true);
	//intervalLevels.lock(true);

	var tiers = PianoteLevels.getTiers();
	for (var i = 0; i < tiers.length; i++) {
		console.log('[');
		for (var j = 0; j < tiers[i].length; j++) {
			console.log(tiers[i][j].level);
		}
		console.log(']');
	}


});