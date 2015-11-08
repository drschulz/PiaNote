
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

var keyMap = {};

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

function playTune() {
  songcurBeat = 0;
  var note = getRandomKey(keyMap);
  var noteMap = keyMap[note];
  var dur = getRandomKey(rhythms);
  var durMap = rhythms[dur];
  
  while(songcurBeat < 48) {
    console.log("The note!: " + note);
    piano.play({pitch: note, wait: tempo*songcurBeat});
    songcurBeat += rhythmMap[dur];
    
    note = noteMap[Math.random()*noteMap.length << 0];
    noteMap = keyMap[note];
    
    dur = durMap[Math.random()*durMap.length << 0];
    durMap = rhythms[dur];
  }
}


var curBeat = 0;

function playMajorChord(instrument, baseNote, duration) {
  instrument.play({pitch: midiMap[baseNote], wait: curBeat});
  instrument.play({pitch: midiMap[baseNote + 4], wait: curBeat});
  instrument.play({pitch: midiMap[baseNote + 7], wait: curBeat});
  curBeat += duration;
}

function playMinorChord(instrument, baseNote, duration) {
  instrument.play({pitch: midiMap[baseNote], wait: curBeat});
  instrument.play({pitch: midiMap[baseNote + 3], wait: curBeat});
  instrument.play({pitch: midiMap[baseNote + 7], wait: curBeat});
  curBeat += duration;
}

function playSeventhChord(instrument, baseNote, duration) {
  instrument.play({pitch: midiMap[baseNote], wait: curBeat});
  instrument.play({pitch: midiMap[baseNote + 4], wait: curBeat});
  instrument.play({pitch: midiMap[baseNote + 7], wait: curBeat});
  instrument.play({pitch: midiMap[baseNote + 10], wait: curBeat});
  curBeat += duration;
}

var tempo;

function playSynchopatedChordBar1(chord) {
  curBeat += 0.5*tempo;
  playSeventhChord(piano, chord, tempo*(rhythmMap["Q"]));
  playSeventhChord(piano, chord, tempo*rhythmMap['h']);
}

function playSynchopatedChordBar2(chord) {
  playSeventhChord(piano, chord, tempo*rhythmMap['Q']);
  playSeventhChord(piano, chord, tempo*(rhythmMap['h'] + rhythmMap['e']));
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
  bass.play({pitch: midiMap[note], wait: tempo*(basecurBeat++)});
  bass.play({pitch: midiMap[note+4], wait: tempo*(basecurBeat++)});
  bass.play({pitch: midiMap[note+7], wait: tempo*(basecurBeat++)});
  bass.play({pitch: midiMap[note+9], wait: tempo*(basecurBeat++)});
  bass.play({pitch: midiMap[note+12], wait: tempo*(basecurBeat++)});
  bass.play({pitch: midiMap[note+9], wait: tempo*(basecurBeat++)});
  bass.play({pitch: midiMap[note+7], wait: tempo*(basecurBeat++)});
  bass.play({pitch: midiMap[note+4], wait: tempo*(basecurBeat++)});
}

function halfWalk(note) {
  bass.play({pitch: midiMap[note], wait: tempo*(basecurBeat++)});
  bass.play({pitch: midiMap[note+4], wait: tempo*(basecurBeat++)});
  bass.play({pitch: midiMap[note+7], wait: tempo*(basecurBeat++)});
  bass.play({pitch: midiMap[note+9], wait: tempo*(basecurBeat++)});
}

function playBassline() {
   walk(24);
   walk(24);
   walk(29);
   walk(24);
   halfWalk(31);
   halfWalk(29);
   walk(24);
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

//init: start up MIDI
window.addEventListener('load', function() {   
  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then( onMIDIStarted, onMIDISystemError );
  }
  
  addEvent(window, "keydown", handleKeyDown);
  addEvent(window, "keyup", handleKeyUp);
  
  var bpm = 160;
  tempo = 60 / bpm;
  
  var num = 0;
  playAccompaniment();
  //playProgression();
  setInterval(playAccompaniment, Math.floor(tempo * 48 * 1000));
  setInterval(playTune, tempo * 48 * 1000 << 0);
  
});