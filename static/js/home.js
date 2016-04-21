//globals
var pianote;
var metronome;
var main_piano;
var tunObjectArray;
var renderInterval = null;
var mouseX;
var mouseY;
var engine;
var user;
var sessionNum = 1;
var songNum = 0;
var attempt = 1;
//var currentAccuracies;
//Sheet music rendering

function openDialog() {
  //document.getElementById("note-dialog").close();
  
  var dialog = document.getElementById("note-dialog");
  console.log(dialog.noCancelOnOutsideClick);
  //dialog.noCancelOnOutsideClick = false;
  dialog.restoreFocusOnClose = true;
  dialog.open();
  //document.getElementById("my-dialog").open();
}

function renderSong(piece, location, color) {
  tuneObjectArray = ABCJS.renderAbc(location, 
                                    piece.abcDump(), 
                                    {},
                                    {
                                      scale: 1.5,
                                      paddingright: 0,
                                      paddingleft: 0,
                                      add_classes: true, 
                                      listener: {
                                        highlight: function(abcElem) {
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

                                          //$(".note_selected").removeClass("note_selected");


                                          if (note == null) {
                                            console.log("no note found");
                                            return;
                                          }
                                          
                                          //document.getElementById("note-dialog").close();
                                          $("#pianote-note-num").html(note.getDescription(piece.isSharpKey) +"");
                                          $("#pianote-note-rhythm").html(RhythmToText[note.rhythm] + "");
                                          $("#pianote-performed-note").html(note.getDescriptionOfPerformed(piece.isSharpKey) + "");
                                          $("#pianote-performed-rhythm").html(RhythmToText[note.getPerformedRhythm()] + "");
                                          //$("#note-dialog").css("left", (mouseX - 250) + "px");
                                          //$("#note-dialog").css("top", mouseY + "px");
                                          openDialog();
                                          //console.log(document.getElementById("note-dialog").open);
                                          
                                        }, 
                                      },
                                    },
                                    {});

  //$("svg").attr("width", 1110);
}

function getTitle(levels) {
    var title = " ";
    for (var i = 0; i < levels.length; i++) {
        if (i != 0) {
            title += ", " 
        }
        
        if (levels[i] == 'r') {
            title += rhythmLevels.getTextRepresentationOfLevel();
        }
        if (levels[i] == 'i') {
            title += intervalLevels.getTextRepresentationOfLevel() + "Intervals";
        }
        if (levels[i] == 'k') {
            title += keyLevels.getTextRepresentationOfLevel() + "Keys";
        }
        if (levels[i] == 's') {
            title += songLevels.getTextRepresentationOfLevel();
        }
        if (levels[i] == 't') {
            title += timeLevels.getTextRepresentationOfLevel() + "Time";
        }
    }
    
    console.log("title: " + title);
    return title;
}

var warmUpSongs = [PretestPiece1, PretestPiece2, PretestPiece3];
var postTestSongs = [PosttestPiece1, PosttestPiece2, PosttestPiece3];

function generateNextMelody() {
  if (user.isWarmup) {
    var warmUpPiece = new warmUpSongs[user.warmUpNum](pianote.playerStats);
    pianote.setExpectedPiece(warmUpPiece);
  }
  else if (user.isPostTest) {
    var postTestPiece = new postTestSongs[user.postTestNum](pianote.playerStats);
    pianote.setExpectedPiece(postTestPiece);
  }
  else {
  
    songNum++;
    console.log(PianoteLevels.getCurrentLevels());
    var levels = user.getLevelFocusComponents();
    console.log(user);
    var title = getTitle(levels);
    
    pianote.generateSong("Song " + songNum, title);
  }
  
  renderSong(pianote.expectedPiece, "mystave", "black");
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
  pianote.expectedPiece.bindNotesToSheetMusic("#mystave");
  pianote.expectedPiece.updateCss();
  //var score = results['s'] * 100 << 0;
  //$("#score").html(" " + score + "/100");
  
  //show score key
  /*var moreInfo = document.getElementById('more-info');
  if (!moreInfo.opened) {
    _toggle();
  }*/
}

function savePiece(currentAccuracies, sNum) {
  var stats = pianote.playerStats;
  var profile = user;
  var level = PianoteLevels.getCurrentLevels();
  var performance = pianote.pianotePiece;
  var bundle = {
    stats: stats,
    profile: profile,
    level: level,
    performance: performance,
    sessionNum: sessionNum,
    attempt: attempt,
    songNum: songNum,
    piece: pianote.expectedPiece,
    accuracies: currentAccuracies
  };


  function registerPostSuccess() {
    var toast = document.querySelector('#success-toast');
    toast.text = "saved current scores";
    toast.open();
  }

  function registerPostError() {
    var toast = document.querySelector('#fail-toast');
    toast.text = "error saving scores";
    toast.open();  
  }

  var bundleJson = JSON.stringify(bundle, function(k, v) {
    if (k == 'svgElements' || k == 'tiers') {
      return undefined;
    }
    return v;
  });

  $.ajax({
    method: 'POST',
    url: '/score',
    contentType: 'application/json',
    processData: true,
    data: bundleJson,
    dataType: 'text',
    success: registerPostSuccess,
    error: registerPostError,
  });
}

function savePrePostTest(currentAccuracies) {
  var stats = pianote.playerStats;
  var profile = user;
  var performance = pianote.pianotePiece;
  var num = pianote.expectedPiece.getType() == "Pretest" ? user.warmUpNum : user.postTestNum;
  var bundle = {
    stats: stats,
    profile: profile,
    performance: performance,
    pieceType: pianote.expectedPiece.getType(),
    pieceNum: num,
    accuracies: currentAccuracies
  };


  function registerPostSuccess() {
    var toast = document.querySelector('#success-toast');
    toast.text = "saved current scores";
    toast.open();
  }

  function registerPostError() {
    var toast = document.querySelector('#fail-toast');
    toast.text = "error saving scores";
    toast.open();  
  }

  var bundleJson = JSON.stringify(bundle, function(k, v) {
    if (k == 'svgElements' || k == 'tiers') {
      return undefined;
    }
    return v;
  });

  $.ajax({
    method: 'POST',
    url: '/savePrePostTest',
    contentType: 'application/json',
    processData: true,
    data: bundleJson,
    dataType: 'text',
    success: registerPostSuccess,
    error: registerPostError,
  });
}


function resetSurvey() {
  document.querySelector('#ratings').value = 5;
  document.querySelector('#helpfulratings').value = 5;
  document.querySelector('#gradeCorrect').checked = false;
}

function saveSurvey() {
  var bundle = {
    sessionNum: sessionNum,
    pieceNum: songNum,
  }
  
  
  function registerPostSuccess() {
    var toast = document.querySelector('#success-toast');
    toast.text = "submitted survey";
    toast.open();
  }

  function registerPostError() {
    var toast = document.querySelector('#fail-toast');
    toast.text = "error submitting survey";
    toast.open();  
  }
  
  var difficulty = document.querySelector('#ratings').value;
  var helpful = document.querySelector('#helpfulratings').value;
  var correct = !document.querySelector('#gradeCorrect').checked;
  
  var survey = {
    difficulty: difficulty,
    helpful: helpful,
    correct: correct
  };
  
  bundle.survey = survey;
  
  var bundleJson = JSON.stringify(bundle);
  
  $.ajax({
    method: 'POST',
    url: '/saveSurvey',
    contentType: 'application/json',
    processData: true,
    data: bundleJson,
    dataType: 'text',
    success: registerPostSuccess,
    error: registerPostError,
  });
}

function scorePerformance() {
  var results = pianote.scorePerformance();
  
  displayResults(results);
  
  if (!user.isWarmup && !user.isPostTest) {
    $("#survey").show();
    engine.getNextSongParameters(results);
    savePiece(results);  
  }
  else {
     if (user.isWarmup) {
       user.warmUpNum++;
       if (user.warmUpNum >= warmUpSongs.length) {
          user.isWarmup = false;
       }
     }
     if (user.isPostTest) {
       user.postTestNum++;
       if (user.postTestNum >= postTestSongs.length) {
          user.isPostTest = false;
       }
     }
     
     savePrePostTest(results);
  }
  //currentAccuracies = results;
  
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
    
    //$("#play-button").prop("disabled", true);
    $("#playButtons").show();
    $("#score-div").show();
    
    if (!user.isWarmup && !user.isPostTest && attempt < 2) {
      $("#retry-button").prop("disabled", false);
    }
    
    scorePerformance();

    $("#generate-button").prop("disabled", false);
    
    
    
  });
  
  $("#generate-button").click(function() {
    $("#play-button").show();
    $("#results-card").hide();
    $("#playButtons").hide();
    $("#survey").hide();
    resetSurvey();
    $("#score-div").hide();
    generateNextMelody();
    attempt = 1;
    $("#generate-button").prop("disabled", true);
    $("#retry-button").prop("disabled", true);
    $("#play-button").prop("disabled", false);
  });

  $("#retry-button").click(function() {
    attempt++;
    pianote.expectedPiece.clearPerformance();
    renderSong(pianote.expectedPiece, "mystave", "black");
    $("#play-button").show();
    $("#retry-button").prop("disabled", true);
    $("#play-button").prop("disabled", false);
    $("#playButtons").hide();
    $("#survey").hide();
    resetSurvey();
    $("#score-div").hide();
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
  
  $("#post-test-button").click(function() {
    user.isPostTest = true;
    user.postTestNum = 0;
    generateNextMelody();
  });
  
  $("#play-song-button").click(function() {
    playSong(pianote.expectedPiece.piece);
  });


  $("#results-play-song-button").click(function() {
    playSong(pianote.expectedPiece.piece);
  });

  $("#play-performed-button").click(function() {
    playSong(pianote.pianotePiece);
  });
  
  $("#survey-button").click(function() {
    saveSurvey();
  });
}

function enableButtons() {
  $("#play-button").prop("disabled", false);
  $("#score-button").prop("disabled", false);
}

function initializeApplication(userData) {
  if (userData == undefined) {
    
    user = new UserProfile();
    engine = new RecommendationEngine(user);    
    pianote = new PiaNote(undefined, undefined);  
  }
  else {
    if (userData.stats != undefined && userData.profile != undefined) {
      
      user = new UserProfile(userData['profile']);
      pianote = new PiaNote(userData['stats'], userData.control);
    }
    else {
      user = new UserProfile();
      pianote = new PiaNote(undefined, userData.control);
      
    }
    engine = userData.control ? new ControlEngine(user) : new RecommendationEngine(user);
  }
  
  metronome = new Metronome();
  MIDI.setVolume(MidiChannels.MAIN_PIANO, MidiConstants.MAX_VOLUME);
  MIDI.programChange(MidiChannels.MAIN_PIANO, GeneralMIDI.PIANO);
  initializeButtons();
  
  /*timeLevels.setLevel(2);
  songLevels.setLevel(1);
  rhythmLevels.setLevel(2);*/
  
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
  var userData = undefined;

  function loadProgress(state, progress) {
    progressBar.set(progress * 100);
  }
  
  function loadEnd() {
    progressBar.end();
    initializeApplication(userData);  
  }
  
  progressBar.start();
  
  function init(res) {
    //statsData = JSON.parse(res);
    userData = JSON.parse(res);
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