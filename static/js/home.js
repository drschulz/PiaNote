//globals
var pianote;
var metronome;
var main_piano;
var tunObjectArray;
var renderInterval = null;
var mouseX;
var mouseY;
//Sheet music rendering

function renderSong(piece, location, color) {
  tuneObjectArray = ABCJS.renderAbc(location, 
                                    piece.abcDump(), 
                                    {},
                                    {
                                      scale: 1.5,
                                      //staffwidth: 1110,
                                      paddingright: 0,
                                      paddingleft: 0,
                                      add_classes: true, 
                                      listener: {
                                        highlight: function(abcElem) {
                                          console.log("highlighting!");
                                          var note = null;
                                          var voices = piece.getVoiceTuneList();
                                          var v1 = voices.voice1;
                                          for (var i = 0; i < v1.length; i++) {
                                            var voiceNote = v1[i];
                                            if (voiceNote.hasAnySelected()) {
                                              note = voiceNote;
                                              break;
                                            }
                                          }
                                          if (note == null) {
                                            var v2 = voices.voice2;
                                            for (var i = 0; i < v2.length; i++) {
                                              var voiceNote = v2[i];
                                              if (voiceNote.hasAnySelected()) {
                                                note = voiceNote;
                                                break;
                                              }
                                            }
                                          } 

                                          if (note == null) {
                                            console.log("no note found");
                                            return;
                                          }

                                          console.log(note);

                                          document.getElementById("note-dialog").close();
                                          $("#pianote-note-num").html(note.getDescription(piece.isSharpKey) +"");
                                          $("#pianote-note-rhythm").html(RhythmToText[note.rhythm] + "");
                                          $("#pianote-performed-note").html(note.getDescriptionOfPerformed(piece.isSharpKey) + "");
                                          $("#pianote-performed-rhythm").html(note.performedRhythm + "");
                                          $("#note-dialog").css("left", (mouseX - 250) + "px");
                                          $("#note-dialog").css("top", mouseY + "px");
                                          document.getElementById("note-dialog").open();
                                        } 
                                        
                                      }
                                    },
                                    {});

  //$("svg").attr("width", 1110);
}

function bindNotesToSheetMusic() {
  //start with voice 1
  var totalMeasures = 4;
  var curMeasure = 0;
  var measureBeat = 0;
  var noteIdx = 0;
  var abcIdx = 0;
  var voice1 = pianote.expectedPiece.getVoiceTuneList().voice1;
  var beatValue = WHOLE_NOTE_VALUE / pianote.expectedPiece.time.rhythm;
  var measureAccent = Math.ceil(pianote.expectedPiece.time.beats / 2) * beatValue;
  var measureDuration = pianote.expectedPiece.time.beats * beatValue;

  var measureNotes = $(".note.m0.v0");
  for(var i = 0; i < voice1.length; i++) {
    $(measureNotes[abcIdx]).data("note", voice1[i]);
    voice1[i].svgElements.push(measureNotes[abcIdx]);
    if(measureBeat > 0 && measureBeat < measureAccent && measureBeat + voice1[i].rhythm > measureAccent) {
      abcIdx++;
      $(measureNotes[abcIdx]).data("note", voice1[i]);
      voice1[i].svgElements.push(measureNotes[abcIdx]);
      abcIdx++;
    
      if (measureBeat + voice1[i].rhythm == measureDuration) {
        abcIdx = 0;
        curMeasure++;
        measureBeat = 0;
        measureNotes = $(".note.m" + curMeasure + ".v0");
      }
      else {
        measureBeat += voice1[i].rhythm;
      }
    }
    else if (measureBeat + voice1[i].rhythm > measureDuration) {
      var diff = measureDuration - measureBeat;
      var overflow = voice1[i].rhythm - diff;
      abcIdx = 0;
      curMeasure++;
      measureBeat = overflow;
      measureNotes = $(".note.m" + curMeasure + ".v0");
      $(measureNotes[abcIdx]).data("note", voice1[i]);
      voice1[i].svgElements.push(measureNotes[abcIdx]);
      abcIdx++;
    }
    else {
      abcIdx++;
      
      if (measureBeat + voice1[i].rhythm == measureDuration) {
        abcIdx = 0;
        curMeasure++;
        measureBeat = 0;
        measureNotes = $(".note.m" + curMeasure + ".v0");
      }
      else {
        measureBeat += voice1[i].rhythm;
      }
    }
  }
}

function generateNextMelody() {
  pianote.generateSong();
  renderSong(pianote.expectedPiece, "mystave", "black");
  //pianote.expectedPiece.bindNotesToSheetMusic();

  var voices = pianote.expectedPiece.getVoiceTuneList();
  var v1 = voices.voice1;
  var v2 = voices.voice2;

  for (var i = 0; i < v1.length; i++) {
    v1[i].setToHit();
  }

  for (var i = 0; i < v2.length; i++) {
    v2[i].setToHit();
  }
  //renderSong(pianote.playerPiece, "playerstave", "#455ede");
}

var song = 1;
var rows = [];

function populateTables(results) {
  //$("#n-h1").empty();
  //$("#n-m1").empty();
  //$("#r-h1").empty();
  //$("#r-hm1").empty();
  $("#accurate").empty();
  
  $("#n-h1").html(results.totals.notesHit);
  $("#n-m1").html(results.totals.notesMissed);
  $("#r-h1").html(results.totals.rhythmsHit);
  $("#r-m1").html(results.totals.rhythmsMissed);
  $("#n-h2").html(results.totals.notesHit);
  $("#n-m2").html(results.totals.notesMissed);
  $("#r-h2").html(results.totals.rhythmsHit);
  $("#r-m2").html(results.totals.rhythmsMissed);
  $("#accurate").html(results.totals.overallAccuracy + "%");  
}

function updateChart(results) {
  var chart = document.getElementById("session-chart"); 
  
  var rhythmAccuracy = results.totals.rhythmsHit / results.notes.length * 100;
  var noteAccuracy = results.totals.notesHit / results.notes.length * 100;
  
  var newRowData = rows.concat([["song " + song, 
    noteAccuracy, 
    rhythmAccuracy, 
    results.totals.overallAccuracy << 0]]);
    
  chart.rows = newRowData;
  rows = newRowData;
  
  song++;
  //$("#results-card").show();
}

function displayResults(results) {
  populateTables(results);
  updateChart(results);
  //renderSong(pianote.expectedPiece, "performedstave", "black");
  pianote.expectedPiece.bindNotesToSheetMusic("#mystave");
  pianote.expectedPiece.updateCss();
  //document.getElementById("results-dialog").open();
  //TODO
}

function saveUserStats() {
  var stats = pianote.getCurrentStats();

  function registerPostSuccess() {
    var toast = document.getElementById('success-toast');
    //toast.text = "saved current scores";
    toast.open();
  }

  function registerPostError() {
    var toast = document.getElementById('fail-toast');
    //toast.text = "error saving scores";
    toast.open();  
  }

  $.ajax({
    method: 'POST',
    url: '/score',
    contentType: 'application/json',
    processData: true,
    data: JSON.stringify(stats),
    dataType: 'text',
    success: registerPostSuccess,
    error: registerPostError,
  });
}

function updateStave() {
  var voice = flatTuneList(pianote.expectedPiece.piece);
  for(var i = 0; i < voice.length; i++) {
    var note = voice[i];
    if(note.tone != note.performedTone && note.rhythm != note.performedRhythm) {
      for (var j = 0; j < note.svgElements.length; j++) {
        $(note.svgElements[j]).css("fill", "#E83034");
      }
    }
    else if (note.tone != note.performedTone) {
      for (var j = 0; j < note.svgElements.length; j++) {
        $(note.svgElements[j]).css("fill", "#A257DE");
      }  
    }
    else if (note.rhythm != note.performedRhythm) {
      for (var j = 0; j < note.svgElements.length; j++) {
        $(note.svgElements[j]).css("fill", "#455ede");
      }  
    }
  }
}

function scorePerformance() {
  var results = pianote.scorePerformance();
  //updateStave();
  displayResults(results);

  saveUserStats();
}

function playSong(tune) {
  var curBeat = 0;
  var tempo = 120;
  var SECONDS_IN_MINUTE = 60;

  //var tune = musicPiece.piece;
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

function initializeButtons() {
  $("#play-button").click(function() {
    var bpm = $("#bpm").val();
    metronome.play(SECONDS_IN_MINUTE / bpm);
    pianote.monitorTempo(SECONDS_IN_MINUTE / bpm);
    $("#play-button").hide();
    $("#stop-button").show();
    $("#generate-button").prop("disabled", true);
    $("#retry-button").prop("disabled", true);
  });
  
  $("#stop-button").click(function() {
    metronome.play();
    pianote.unMonitorTempo();
    $("#stop-button").hide();
    $("#play-button").show();
    $("#playButtons").show();
    scorePerformance();
    $("#generate-button").prop("disabled", false);
    $("#retry-button").prop("disabled", false);
  });
  
  $("#generate-button").click(function() {
    $("#results-card").hide();
    $("#playButtons").hide();
    generateNextMelody();
    $("#generate-button").prop("disabled", true);
    $("#retry-button").prop("disabled", true);
  });

  $("#retry-button").click(function() {
    pianote.expectedPiece.clearPerformance();
    renderSong(pianote.expectedPiece, "mystave", "black");
    $("#retry-button").prop("disabled", true);
  });
  
  //$("#score-button").click(scorePerformance);

  $("#bpm").change(function() {
    var bpm = $("#bpm").val();
    if (bpm > 120) {
      $("#bpm").val(120); 
      bpm = 120;     
    }

    if (bpm < 80) {
      $("#bpm").val(80); 
      bpm = 80;  
    }

    metronome.setTempo(bpm);
    if (pianote.isMonitoring()) {
      pianote.unMonitorTempo();
      pianote.monitorTempo(SECONDS_IN_MINUTE / bpm);
    }
    
  });
  
  $("#play-song-button").click(function() {
    playSong(pianote.expectedPiece.piece);
  });


  $("#results-play-song-button").click(function() {
    playSong(pianote.expectedPiece.piece);
  });

  $("#play-performed-button").click(function() {
    playSong(pianote.expectedPiece.piece);
  });
}

function enableButtons() {
  $("#play-button").prop("disabled", false);
  $("#score-button").prop("disabled", false);
}

function initializeApplication(statsData) {
  pianote = new PiaNote(statsData);
  metronome = new Metronome();
  MIDI.setVolume(MidiChannels.MAIN_PIANO, MidiConstants.MAX_VOLUME);
  MIDI.programChange(MidiChannels.MAIN_PIANO, GeneralMIDI.PIANO);
  initializeButtons();
  timeLevels.setLevel(2);
  songLevels.setLevel(5);
  rhythmLevels.setLevel(2);
  
  function noteOn(note, velocity) {
    pianote.noteOn(note, velocity);
  }
  
  function noteOff(note) {
    pianote.noteOff(note);
  }
  
  function userInputSuccessful() {
    enableButtons();
    generateNextMelody();
  }
  
  usrInput = new UserInput({loadSuccess: userInputSuccessful, noteOn: noteOn, noteOff: noteOff});
  
  enableButtons();
  generateNextMelody();
}


function initializeMidi(onProgress, onSuccess) {
  MIDI.loadPlugin({
		soundfontUrl: "http://" + location.host + "/static/soundFonts/FluidR3_GM/",
		instrument: ["acoustic_grand_piano", "acoustic_bass"],
		onprogress: onProgress,
		onsuccess: onSuccess
	});
}

window.addEventListener('load', function() {   
  $("#mystave").mousemove(function(e) {
    mouseX = e.pageX;
    mouseY = e.pageY;
  });

  $("#playButtons").hide();

  var progressBar = progressJs("#main-panel").setOption("theme", "red");
  var statsData = undefined;

  function loadProgress(state, progress) {
    progressBar.set(progress * 100);
  }
  
  function loadEnd() {
    progressBar.end();
    initializeApplication(statsData);  
  }
  
  progressBar.start();
  
  function init(res) {
    console.log(res);
    statsData = JSON.parse(res);
    initializeMidi(loadProgress, loadEnd);
  }

  function initNewUser(obj, status, error) {
    console.log("error getting user data");
    initializeMidi(loadProgress, loadEnd);
  }

  $.ajax({
    method: 'GET',
    url: '/load',
    dataType: 'text',
    success: init,
    error: initNewUser,
  });

});