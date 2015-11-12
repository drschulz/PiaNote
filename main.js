
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
  console.log(closestRhythm);
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
  /*var voice = new Vex.Flow.Voice({
    num_beats: 48,
    beat_value: 4,
    resolution: Vex.Flow.RESOLUTION
  });
  
  voice.setStrict(false);

  // Add notes to voice
  voice.addTickables(sheetNotes);

  // Format and justify the notes to 500 pixels
  var formatter = new Vex.Flow.Formatter().
    joinVoices([voice]).format([voice], 1000);

  // Render voice
  voice.draw(ctx, stave);*/
  if (ctx !== undefined) {
    ctx.clear();
  }
  ctx = renderer.getContext();
  stave = new Vex.Flow.Stave(10, 10, 1000);
  stave.addClef("treble").setContext(ctx).draw();
  
  
  
   Vex.Flow.Formatter.FormatAndDraw(ctx, stave, sheetNotes);
   beams = Vex.Flow.Beam.generateBeams(sheetNotes, {stem_direction: 1});
   beams.forEach(function(beam) {
     beam.setContext(ctx).draw();
   });
   
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
  
  while(songcurBeat < 48) {
    //console.log("The note!: " + note);
    MIDI.noteOn(1, note, velocity, tempo*songcurBeat);
    MIDI.noteOff(1, note, velocity, tempo*(songcurBeat + (rhythmMap[dur])));
    //piano.play({pitch: midiMap.musicNote(note), wait: tempo*songcurBeat, duration: rhythmMap[dur]});
    songcurBeat += rhythmMap[dur];
    sheetNote = new Vex.Flow.StaveNote({ keys: [midiMap.sheetNote(note)], duration: dur});
    
    /*if (rhythmMap[dur] >= 1 || currentDur >= 1) {
      if (tempSheetNotes.length > 1) {
        beams.push(new Vex.Flow.Beam(tempSheetNotes));
        console.log("made new beam!");
      }
      Array.prototype.push.apply(sheetNotes, tempSheetNotes);
      tempSheetNotes = [];
      currentDur = 0;
      
      if (rhythmMap[dur] >= 1) {
        sheetNotes.push(sheetNote);
      }
      else {
        tempSheetNotes.push(sheetNote);
        currentDur += rhythmMap[dur];
      }
    }
    else {
      currentDur += rhythmMap[dur];
      tempSheetNotes.push(sheetNote);
    }*/
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
  /*instrument.play({pitch: midiMap.musicNote(baseNote), wait: curBeat});
  instrument.play({pitch: midiMap.musicNote(baseNote + 4), wait: curBeat});
  instrument.play({pitch: midiMap.musicNote(baseNote + 7), wait: curBeat});
  curBeat += duration;*/
  
  MIDI.chordOn(0, [baseNote, baseNote + 4, baseNote + 7], velocity, curBeat);
  MIDI.chordOff(0, [baseNote, baseNote + 4, baseNote + 7], velocity, curBeat + duration);
  curBeat += duration;
  
  /*MIDI.noteOn(0, baseNote, velocity, curBeat);
  MIDI.noteOn(0, baseNote + 4, velocity, curBeat);
  MIDI.noteOn(0, baseNote + 7, velocity, curBeat);
  
  MIDI.noteOff()*/
}

function playMinorChord(instrument, baseNote, duration) {
  /*instrument.play({pitch: midiMap.musicNote(baseNote), wait: curBeat});
  instrument.play({pitch: midiMap.musicNote(baseNote + 3), wait: curBeat});
  instrument.play({pitch: midiMap.musicNote(baseNote + 7), wait: curBeat});
  curBeat += duration;*/
  
  MIDI.chordOn(0, [baseNote, baseNote + 3, baseNote + 7], velocity, curBeat);
  MIDI.chordOff(0, [baseNote, baseNote + 3, baseNote + 7], velocity, curBeat + duration);
  curBeat += duration;
}

function playSeventhChord(instrument, baseNote, duration) {
  /*instrument.play({pitch: midiMap.musicNote(baseNote), wait: curBeat});
  instrument.play({pitch: midiMap.musicNote(baseNote + 4), wait: curBeat});
  instrument.play({pitch: midiMap.musicNote(baseNote + 7), wait: curBeat});
  instrument.play({pitch: midiMap.musicNote(baseNote + 10), wait: curBeat});
  curBeat += duration;*/
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
  
  /*bass.play({pitch: midiMap.musicNote(note), wait: tempo*(basecurBeat++)});
  bass.play({pitch: midiMap.musicNote(note+4), wait: tempo*(basecurBeat++)});
  bass.play({pitch: midiMap.musicNote(note+7), wait: tempo*(basecurBeat++)});
  bass.play({pitch: midiMap.musicNote(note+9), wait: tempo*(basecurBeat++)});
  bass.play({pitch: midiMap.musicNote(note+12), wait: tempo*(basecurBeat++)});
  bass.play({pitch: midiMap.musicNote(note+9), wait: tempo*(basecurBeat++)});
  bass.play({pitch: midiMap.musicNote(note+7), wait: tempo*(basecurBeat++)});
  bass.play({pitch: midiMap.musicNote(note+4), wait: tempo*(basecurBeat++)});*/
}

function halfWalk(note) {
  MIDI.noteOn(2, note, velocity, tempo*(basecurBeat++));
  MIDI.noteOn(2, note+4, velocity, tempo*(basecurBeat++));
  MIDI.noteOn(2, note+7, velocity, tempo*(basecurBeat++));
  MIDI.noteOn(2, note+9, velocity, tempo*(basecurBeat++));
  /*bass.play({pitch: midiMap.musicNote(note), wait: tempo*(basecurBeat++)});
  bass.play({pitch: midiMap.musicNote(note+4), wait: tempo*(basecurBeat++)});
  bass.play({pitch: midiMap.musicNote(note+7), wait: tempo*(basecurBeat++)});
  bass.play({pitch: midiMap.musicNote(note+9), wait: tempo*(basecurBeat++)});*/
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

//init: start up MIDI
window.addEventListener('load', function() {   
  midiMap = new MidiMap();
  
  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then( onMIDIStarted, onMIDISystemError );
  }
  
  addEvent(window, "keydown", handleKeyDown);
  addEvent(window, "keyup", handleKeyUp);
  
  var bpm = 160;
  tempo = 60 / bpm;
  
  var num = 0;
  
  MIDI.loadPlugin({
		soundfontUrl: "./soundFonts/FluidR3_GM/",
		instrument: ["acoustic_grand_piano", "acoustic_bass"],
		onprogress: function(state, progress) {
			console.log(state, progress);
		},
		onsuccess: function() {
		  //MIDI.setVolume(0, 127);
		  MIDI.setVolume(1, 127);
		  MIDI.setVolume(0, 100);
		  MIDI.setVolume(2, 127);
		  MIDI.programChange(1, 0);
		  MIDI.programChange(0,0);
		  MIDI.programChange(2, 32);
		  playAccompaniment();
  
      setInterval(playAccompaniment, Math.floor(tempo * 48 * 1000));
      setInterval(playTune, tempo * 48 * 1000 << 0);
		}
	});
  
  var canvas = $('#mystaff')[0]; 
  renderer = new Vex.Flow.Renderer(canvas,
  Vex.Flow.Renderer.Backends.CANVAS);
  
});