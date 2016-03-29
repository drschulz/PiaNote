var user;
var engine;
var main_piano;
var musicPiece;
var pianote;

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
	pianote.generateSong();
	musicPiece = pianote.expectedPiece;//new piece(config);
	console.log("new piece done!");
	console.log(JSON.stringify(musicPiece, function(k, v) {
		if (k == 'svgElements') {
			return undefined;
		}
		return v;
	}));
	renderSong(musicPiece, "mystave", "black");
}

function initializeMidi(onProgress, onSuccess) {
  MIDI.loadPlugin({
		soundfontUrl: "http://" + location.host + "/soundFonts/FluidR3_GM/",
		instrument: ["acoustic_grand_piano", "acoustic_bass"],
		onprogress: onProgress,
		onsuccess: onSuccess
	});
}

function playSong() {
  var curBeat = 0;
  var tempo = 120;
  var SECONDS_IN_MINUTE = 60;

  var tune = musicPiece.piece;
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
          MIDI.noteOn(MidiChannels.MAIN_PIANO, n.tone, 127, SECONDS_IN_MINUTE/tempo*(parseInt(time)/4));
          MIDI.noteOff(MidiChannels.MAIN_PIANO, n.tone, SECONDS_IN_MINUTE/tempo*((parseInt(time) + note.rhythm)/4));
        }
      }
      else {
        MIDI.noteOn(MidiChannels.MAIN_PIANO, note.tone, 127, SECONDS_IN_MINUTE/tempo*(parseInt(time)/4));
        MIDI.noteOff(MidiChannels.MAIN_PIANO, note.tone, SECONDS_IN_MINUTE/tempo*((parseInt(time) + note.rhythm)/4));
      }
    }
  }
}


window.addEventListener('load', function() {
	user = new UserProfile();
	engine = new RecommendationEngine(user);
	pianote = new PiaNote(new UserStats());
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
		MIDI.setVolume(MidiChannels.MAIN_PIANO, MidiConstants.MAX_VOLUME);
  		MIDI.programChange(MidiChannels.MAIN_PIANO, GeneralMIDI.PIANO);
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