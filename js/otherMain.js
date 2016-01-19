//globals
var pianote;
var metronome;
var main_piano;

//Sheet music rendering
function renderSong(piece, location, color) {
  $(location).empty();
  var canvas = $(location)[0];
  var renderer = new Vex.Flow.Renderer(canvas,
  Vex.Flow.Renderer.Backends.RAPHAEL);
  
  renderer.ctx.setFillStyle(color);
  renderer.ctx.setStrokeStyle(color);
  var artist = new Artist(10, 10, 900, {scale: 1.0});

  var vextab = new VexTab(artist);

  try {
   var elements = vextab.parse(piece.vexdump());
   artist.render(renderer);
  }
  catch (e) {
    console.log(e.message);
  }
}

function generateNextMelody() {
  pianote.generateSong();
  renderSong(pianote.expectedPiece, "#mystave", "black");
  renderSong(pianote.playerPiece, "#playerstave", "#455ede");
}

var song = 1;
var rows = [];

function populateTables(results) {
  $("#n-h").empty();
  $("#n-m").empty();
  $("#r-h").empty();
  $("#r-hm").empty();
  $("#accurate").empty();
  
  $("#n-h").html(results.totals.notesHit);
  $("#n-m").html(results.totals.notesMissed);
  $("#r-h").html(results.totals.rhythmsHit);
  $("#r-m").html(results.totals.rhythmsMissed);
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
  
  $("#results-card").show();
}

function displayResults(results) {
  populateTables(results);
  updateChart(results);
  //TODO
}

function scorePerformance() {
  var results = pianote.scorePerformance();

  renderSong(pianote.scoredPiece, "#playerstave", "#455ede");
  displayResults(results);
}

function initializeButtons() {
  //$("#play-button").click(startAccompanimentLoop);
  $("#play-button").click(function() {
    metronome.play(pianote.expectedPiece.piece.tempo);
    $("#play-button").hide();
    $("#stop-button").show();
  });
  
  $("#stop-button").click(function() {
    metronome.stop();
    $("#stop-button").hide();
    $("#play-button").show();
  });
  
  $("#generate-button").click(function() {
    $("#results-card").hide();
    generateNextMelody();
  });
  
  $("#score-button").click(scorePerformance);
  
}

function enableButtons() {
  $("#play-button").prop("disabled", false);
  $("#generate-button").prop("disabled", false);
  $("#score-button").prop("disabled", false);
}

function initializeApplication() {
  pianote = new PiaNote();
  metronome = new Metronome();
  initializeButtons();
  
  function noteOn(note, velocity) {
    main_piano.instrument.noteOn(note, velocity, 0);
    pianote.noteOn(note, velocity);
    renderSong(pianote.playerPiece, "#playerstave", "blue");
  }
  
  function noteOff(note) {
    main_piano.instrument.noteOff(note, 0);
    pianote.noteOff(note);
  }
  
  function userInputSuccessful() {
    enableButtons();
    generateNextMelody();
    main_piano = new UserPiano("#piano-container");
  }
  
  usrInput = new UserInput({loadSuccess: userInputSuccessful, noteOn: noteOn, noteOff: noteOff});
  
  enableButtons();
  generateNextMelody();
  main_piano = new UserPiano("#piano-container");
}


function initializeMidi(onProgress, onSuccess) {
  MIDI.loadPlugin({
		soundfontUrl: "./soundFonts/FluidR3_GM/",
		instrument: ["acoustic_grand_piano", "acoustic_bass"],
		onprogress: onProgress,
		onsuccess: onSuccess
	});
}

window.addEventListener('load', function() {   
  var progressBar = progressJs("#main-panel").setOption("theme", "red");
  
  function loadProgress(state, progress) {
    progressBar.set(progress * 100);
  }
  
  function loadEnd() {
    progressBar.end();
    initializeApplication();  
  }
  
  progressBar.start();
  
  initializeMidi(loadProgress, loadEnd);
});