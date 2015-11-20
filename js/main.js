var main_piano;
var lastNote = 0;

var rhythms = {};

function findClosest(query, obj) {
  var best = '';
  var min = 10000.0;
  
  for (var value in obj) {
    var num = Math.abs(obj[value] - query);
    if (num < min) {
      min = num;
      best = value;
    }
  }
  
  return best;
}

var lastRhythm = '';

function updateMap(valueToAdd, map, key) {
  if(map[key] === undefined) {
    map[key] = [valueToAdd];
  }
  else {
    map[key].push(valueToAdd);
  }
  
}

function updateRhythms(temp) {
  temp = temp / tempo;
  if (temp < 0.125) {
    return;
  }
  var closestRhythm = findClosest(temp, rhythmMap);
  if (lastRhythm !== '') {
    updateMap(closestRhythm, rhythms, lastRhythm);
  }
  lastRhythm = closestRhythm;
}

var keyMap = new Array(96);

function updateKeyMap(note) {
  if (lastNote !== 0) {
    updateMap(note, keyMap, lastNote);
  }

  lastNote = note;
}

var songcurBeat = 0;

function getRandomKey(obj) {
  var keys = Object.keys(obj);
  return keys[Math.random() * keys.length << 0];
}

var sheetNotes = [];
var beams = [];

function drawSheetMusic() {
  if (ctx !== undefined) {
    ctx.clear();
  }
  ctx = renderer.getContext();
  stave = new Vex.Flow.Stave(10, 10, 1500);
  stave.addClef("treble").setContext(ctx).draw();
  
   Vex.Flow.Formatter.FormatAndDraw(ctx, stave, sheetNotes, {auto_beam: true});
}

function playTune() {
  sheetNotes = [];
  songcurBeat = 0;
  
  var note = getRandomKey(keyMap);
  var noteMap = keyMap[note];
  var dur = getRandomKey(rhythms);
  var durMap = rhythms[dur];
  var sheetNote;
  var currentDur = 0;
  var remaining = 0;
  
  while(songcurBeat < 48*8) {
    if (currentDur != 32 && currentDur + rhythmWholeMap[dur] > 32) {
      remaining = 32 - currentDur;
      //Add a rest
      songcurBeat += remaining;
      var i = 0;
      var nextRestVal;
      while(currentDur < 32 && i < possibleRestValues.length) {
        nextRestVal = possibleRestValues[i];
        if (currentDur + nextRestVal <= 32) {
          sheetNotes.push(new Vex.Flow.StaveNote({keys: ["b/4"], duration: reverseRestMap["" + nextRestVal]}));
          currentDur += nextRestVal;
        }
        else {
          i++;
        }
      }
    }
    if (currentDur == 32) {
      sheetNotes.push(new Vex.Flow.BarNote(1));
      currentDur = 0;
    }
    console.log("duration: "  + dur);
    main_piano.instrument.play(note, MidiConstants.MAX_VELOCITY, tempo*rhythmWholeMap[dur]/8.0, tempo*(songcurBeat/8.0));
    songcurBeat += rhythmWholeMap[dur];
    if (dur.indexOf("d") != -1) {
      sheetNote = new Vex.Flow.StaveNote({ keys: [midiMap.sheetNote(note)], duration: dur}).addDotToAll();
    }
    else {
      sheetNote = new Vex.Flow.StaveNote({ keys: [midiMap.sheetNote(note)], duration: dur});
    }
    currentDur += rhythmWholeMap[dur];
    sheetNotes.push(sheetNote);
    
    note = noteMap[Math.random()*noteMap.length << 0];
    noteMap = keyMap[note];
    
    dur = durMap[Math.random()*durMap.length << 0];
    durMap = rhythms[dur];
  }
  
  drawSheetMusic();
}

var tempo;

function addEvent(element, eventName, callback) {
    if (element.addEventListener) {
        element.addEventListener(eventName, callback, false);
    } else if (element.attachEvent) {
        element.attachEvent("on" + eventName, callback);
    }
}

var midiMap;
var ctx;

function startAccompanimentLoop() {
  playAccompaniment();
  
  setInterval(playAccompaniment, tempo * 48 * 1000 << 0);
  setInterval(playTune, tempo * 48 * 1000 << 0);
}

function initializeButtons() {
  $("#play-button").prop("disabled", true);
  $("#play-button").click(startAccompanimentLoop);
}

function initializeMaps() {
  midiMap = new MidiMap();
}

function initializeTempo() {
  var bpm = 160;
  tempo = SECONDS_IN_MINUTE / bpm;
}

function initializeSheetMusic() {
  var canvas = $('#mystaff')[0]; 
  renderer = new Vex.Flow.Renderer(canvas,
  Vex.Flow.Renderer.Backends.SVG);
}

function initializeMidi() {
  var progressBar = progressJs("#main-panel").setOption("theme", "red");
  progressBar.start();
  MIDI.loadPlugin({
		soundfontUrl: "./soundFonts/FluidR3_GM/",
		instrument: ["acoustic_grand_piano", "acoustic_bass"],
		onprogress: function(state, progress) {
		  progressBar.set(progress * 100);
		  console.log(progress);
		},
		onsuccess: function() {
		  progressBar.end();
		  initializeAccompaniment();
		  main_piano = new UserPiano("#piano-container");
		  $("#play-button").prop("disabled", false);
		}
	});
}

function initializePiaNote() {
  initializeButtons();
  initializeMaps();
  initializeTempo();
  initializeUserInput();
  initializeSheetMusic();
  initializeMidi();
}

//init: start up MIDI
window.addEventListener('load', function() {   
  initializePiaNote();
});