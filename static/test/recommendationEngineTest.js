var user;
var engine;

function renderSong(piece, location, color) {
  tuneObjectArray = ABCJS.renderAbc(location, 
                                    piece.abcDump(), 
                                    {},
                                    {
                                      scale: 1.5,
                                      staffwidth: 1110,
                                      paddingright: 0,
                                      paddingleft: 0,
                                      add_classes: true, 
                                      listener: {
                                        highlight: function(abcElem) {
                                          //  alert("hello!");
                                          var note = $(abcElem.abselem.elemset[0][0]).data("note");
                                          document.getElementById("note-dialog").close();
                                          $("#pianote-note-num").html(note.getDescription(piece.isSharpKey) +"");
                                          $("#pianote-note-rhythm").html(note.rhythm + "");
                                          $("#pianote-performed-note").html(note.getDescriptionOfPerformed(piece.isSharpKey) + "");
                                          $("#pianote-performed-rhythm").html(note.performedRhythm + "");
                                          $("#note-dialog").css("left", (mouseX - 250) + "px");
                                          $("#note-dialog").css("top", mouseY + "px");
                                          document.getElementById("note-dialog").open();
                                        } 
                                        
                                      }
                                    },
                                    {});

  $("svg").attr("width", 1110);
}

function makeNewPiece() {
	var availableKeys = keyLevels.lockLevel ? keyLevels.getCurrentChoicesStrict() : keyLevels.getCurrentChoices();
	var key = availableKeys[Math.random() * availableKeys.length << 0];

	var availableTime = timeLevels.lockLevel ? timeLevels.getCurrentChoicesStrict() : timeLevels.getCurrentChoices();
	var timeSig = availableTime[Math.random() * availableTime.length << 0];

	var config = {
		time: timeSig,
		key: key,
		numMeasures: 4,
		isSharpKey: sharpKeys.indexOf(key) > 0 ? true : false
	};

	var availableSongTypes = songLevels.lockLevel ? songLevels.getCurrentChoicesStrict() : songLevels.getCurrentChoices();
	var piece = availableSongTypes[Math.random() * availableSongTypes.length << 0];
	var musicPiece = new piece(config);
	console.log("new piece done!");
	console.log(musicPiece);
	renderSong(musicPiece, "mystave", "black");
}

function initializeMidi(onProgress, onSuccess) {
  MIDI.loadPlugin({
		soundfontUrl: "http://" + location.host + "/../soundFonts/FluidR3_GM/",
		instrument: ["acoustic_grand_piano", "acoustic_bass"],
		onprogress: onProgress,
		onsuccess: onSuccess
	});
}

function playSong() {
  var curBeat = 0;

  var tune = pianote.expectedPiece.piece;
  var times = Object.keys(tune);

  //sort the notes by time
  times.sort(function(a, b) {
    return parseInt(a) - parseInt(b);
  });

  //play the notes at their corresponding times
  for (var i = 0; i < times.length; i++) {
    var time = times[i];
    var notes = tune[time];

    for(var j = 0; j < notes.length; j++) {
      var note = notes[j];

      if (Array.isArray(note.tone)) {
        for (var k = 0; k < note.tone.length; k++) {
          var n = note.tone[k];
          main_piano.instrument.noteOn(n.tone, 127, SECONDS_IN_MINUTE/metronome.tempo*(parseInt(time)/4));
          main_piano.instrument.noteOff(n.tone, SECONDS_IN_MINUTE/metronome.tempo*((parseInt(time) + note.rhythm)/4));
        }
      }
      else {
        main_piano.instrument.noteOn(note.tone, 127, SECONDS_IN_MINUTE/metronome.tempo*(parseInt(time)/4));
        main_piano.instrument.noteOff(note.tone, SECONDS_IN_MINUTE/metronome.tempo*((parseInt(time) + note.rhythm)/4));
      }
    }
  }
}


window.addEventListener('load', function() {
	user = new UserProfile();
	engine = new RecommendationEngine(user);
	console.log(user.currentLevel);
	$("#level").html(JSON.stringify(user.currentLevel));
	$("#base").html(JSON.stringify(user.baseLevel));
	$("#next").html(JSON.stringify(user.nextBaseLevel));
	$("#isDrilling").html(JSON.stringify(user.isDrilling));
	$("#drilling").html(JSON.stringify(user.drillingLevel));
	makeNewPiece();

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
		makeNewPiece();
	});


	function onProgress() {

	}

	function onSuccess() {
		main_piano = new UserPiano("#piano-container");
		alert("done!");
	}

	initializeMidi(onProgress, onSuccess);

	$("#playButton").click(playSong);

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
	console.log(intervalLevels.getCurrentChoicesStrict());

	console.log(PianoteLevels.getCurrentLevels());
	PianoteLevels.increaseAllLevels();
	console.log(PianoteLevels.getCurrentLevels());
	console.log(PianoteLevels.getNextLevels());*/

	/*var tiers = PianoteLevels.getTiers();
	console.log(tiers);
	for (var i = 0; i < tiers.length; i++) {
		console.log('[');
		for (var j = 0; j < tiers[i].length; j++) {
			console.log(tiers[i][j].level);
		}
		console.log(']');
	}
	var tiers = PianoteLevels.getTiers();
	for (var i = 0; i < tiers.length; i++) {
		console.log('[');
		for (var j = 0; j < tiers[i].length; j++) {
			console.log(tiers[i][j].level);
		}
		console.log(']');
	}*/


});