var user;
var engine;

window.addEventListener('load', function() {
	user = new UserProfile();
	engine = new RecommendationEngine(user);
	$("#level").html("current level: " + user.currentLevel);
	$("#base").html("base level: " + user.baseLevel);
	$("#next").html("target level: " + user.nextBaseLevel);
	$("#isDrilling").html("drilling: " + user.isDrilling);
	$("#drilling").html("drilling level: " + user.drillingLevel);

	$("#next-button").click(function() {
		var accuracies = [parseFloat($("#val1").val()), parseFloat($("#val2").val()), parseFloat($("#val3").val()), parseFloat($("#val4").val())];
		var nextLevel = engine.getNextSongParameters(accuracies);
		$("#level").html("current level: " + user.currentLevel);
		$("#base").html("base level: " + user.baseLevel);
		$("#next").html("target level: " + user.nextBaseLevel);
		$("#isDrilling").html("drilling: " + user.isDrilling);
		$("#drilling").html("drilling level: " + user.drillingLevel);
	});

});