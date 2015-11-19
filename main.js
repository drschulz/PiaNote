
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
    
    piaNoteOn(MidiConstants.DEFAULT_CHANNEL, note, velocity, tempo*(songcurBeat/8.0));
    //MIDI.noteOn(1, note, velocity, tempo*songcurBeat/8.0);
    songcurBeat += rhythmWholeMap[dur];
    piaNoteOff(MidiConstants.DEFAULT_CHANNEL, note, tempo*(songcurBeat/8.0));
    //MIDI.noteOff(1, note, velocity, tempo*(songcurBeat/8.0));
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


var curBeat = 0;
var velocity = 127;

function playMajorChord(instrument, baseNote, duration) {
  MIDI.chordOn(0, [baseNote, baseNote + 4, baseNote + 7], velocity, curBeat);
  MIDI.chordOff(0, [baseNote, baseNote + 4, baseNote + 7], velocity, curBeat + duration);
  curBeat += duration;
}

function playMinorChord(instrument, baseNote, duration) {
  MIDI.chordOn(0, [baseNote, baseNote + 3, baseNote + 7], velocity, curBeat);
  MIDI.chordOff(0, [baseNote, baseNote + 3, baseNote + 7], velocity, curBeat + duration);
  curBeat += duration;
}

function playSeventhChord(instrument, baseNote, duration) {
  MIDI.chordOn(0, [baseNote, baseNote + 4, baseNote + 7, baseNote + 10], velocity, curBeat);
  MIDI.chordOff(0, [baseNote, baseNote + 4, baseNote + 7, baseNote + 10], velocity, curBeat + duration);
  curBeat += duration;
}

var tempo;

function playSynchopatedChordBar1(chord) {
  curBeat += 0.5*tempo;
  playSeventhChord(piano, chord, tempo*(rhythmMap["qd"]));
  playSeventhChord(piano, chord, tempo*rhythmMap['h']);
}

function playSynchopatedChordBar2(chord) {
  playSeventhChord(piano, chord, tempo*rhythmMap['qd']);
  playSeventhChord(piano, chord, tempo*(rhythmMap['h'] + rhythmMap['8']));
}

function playSyncopatedChord(chord) {
  playSynchopatedChordBar1(chord);
  playSynchopatedChordBar2(chord);
}

function playProgression() {
  playSyncopatedChord(48); //C
  playSyncopatedChord(48); //C
  playSyncopatedChord(53); //F
  playSyncopatedChord(48); //C
  playSynchopatedChordBar1(55); //G
  playSynchopatedChordBar2(53); //F
  playSyncopatedChord(48); //C
}

var basecurBeat;

function walk(note) {
  MIDI.noteOn(2, note, velocity, tempo*(basecurBeat++));
  MIDI.noteOn(2, note+4, velocity, tempo*(basecurBeat++));
  MIDI.noteOn(2, note+7, velocity, tempo*(basecurBeat++));
  MIDI.noteOn(2, note+9, velocity, tempo*(basecurBeat++));
  MIDI.noteOn(2, note+12, velocity, tempo*(basecurBeat++));
  MIDI.noteOn(2, note+9, velocity, tempo*(basecurBeat++));
  MIDI.noteOn(2, note+7, velocity, tempo*(basecurBeat++));
  MIDI.noteOn(2, note+4, velocity, tempo*(basecurBeat++));
}

function halfWalk(note) {
  MIDI.noteOn(2, note, velocity, tempo*(basecurBeat++));
  MIDI.noteOn(2, note+4, velocity, tempo*(basecurBeat++));
  MIDI.noteOn(2, note+7, velocity, tempo*(basecurBeat++));
  MIDI.noteOn(2, note+9, velocity, tempo*(basecurBeat++));
}

function playBassline() {
   walk(36);
   walk(36);
   walk(41);
   walk(36);
   halfWalk(43);
   halfWalk(41);
   walk(36);
}

function playAccompaniment() {
  curBeat = 0;
  basecurBeat = 0;
  playProgression();
  playBassline();
}


function addEvent(element, eventName, callback) {
    if (element.addEventListener) {
        element.addEventListener(eventName, callback, false);
    } else if (element.attachEvent) {
        element.attachEvent("on" + eventName, callback);
    }
}

var midiMap;
var ctx;

function createPiano() {
  var octave = [0, 1, 0, 1, 0, 2, 0, 1, 0, 1, 0, 1, 0, 2];
  var currentKey;
  var currentKeyNum = 48;
  for(i = 0; i < 4*octave.length; i++) {
   currentKey = octave[i % octave.length];
   if (currentKey === 0) {
     $('#piano-container').append("<paper-card id='k" + currentKeyNum + "' class='white key' elevation='5'></paper-card>");
     currentKeyNum ++;
   }
   else if (currentKey == 1) {
     $('#blackkeys').append("<paper-card id='k" + currentKeyNum + "' class='black key' elevation='5'></paper-card>");
     currentKeyNum++;  
   }
   else {
     $('#blackkeys').append("<div class='empty' elevation='1'></div>");
   }
  }
}

function startAccompanimentLoop() {
  playAccompaniment();
  
  setInterval(playAccompaniment, Math.floor(tempo * 48 * 1000));
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
  tempo = 60 / bpm;
}

function initializeSheetMusic() {
  var canvas = $('#mystaff')[0]; 
  renderer = new Vex.Flow.Renderer(canvas,
  Vex.Flow.Renderer.Backends.SVG);
}

function initializeMidi() {
  MIDI.loader = new sketch.ui.Timer;
  MIDI.loadPlugin({
		soundfontUrl: "./soundFonts/FluidR3_GM/",
		instrument: ["acoustic_grand_piano", "acoustic_bass"],
		onprogress: function(state, progress) {
			MIDI.loader.setValue(progress * 100);
		},
		onsuccess: function() {
		  //MIDI.setVolume(0, 127);
		  MIDI.setVolume(1, 127);
		  MIDI.setVolume(0, 100);
		  MIDI.setVolume(2, 127);
		  MIDI.programChange(1, 0);
		  MIDI.programChange(0,0);
		  MIDI.programChange(2, 32);
		  
		  $("#play-button").prop("disabled", false);
		}
	});
}

function initializePiaNote() {
  createPiano();
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