const rhythmToString = {
  4: "w",
  2: "h",
  1: "q",
  1.5: "qd",
  0.5: "8",
  0.75: "8d",
  0.25: "16",
  0.375: "16d",
};

function findClosest(query, obj) {
  var best = 0;
  var min = Number.MAX_VALUE;
  
  for (var value in obj) {
    var num = Math.abs(obj[value] - query);
    if (num < min) {
      min = num;
      best = obj[value];
    }
  }
  
  return best;
}

function Note(config) {
  this.rhythm = config.rhythm;
  this.hand = config.hand;
  this.svgElements = [];
  this.fingering = undefined;
  /*if (config.last_tone === undefined) {
    this.interval = 0;
  }
  else {
    this.interval = this.tone - this.last_tone;
  }
  
  this.dynamic = config.dynamic;*/
}

Note.prototype.getAccuracies = function(lastNote) {
  throw new Error("CANNOT CALL ABSTRACT FUNCTION");
}

Note.prototype.resetPerformance = function() {
  throw new Error("CANNOT CALL ABSTRACT FUNCTION");
}

Note.prototype.setFingering = function(finger) {
  this.fingering = finger;
}

Note.prototype.hasAnySelected = function() {
  for (var i = 0; i < this.svgElements.length; i++) {
    if ($(this.svgElements[i]).hasClass("note_selected")) {
      return true;
    }
  }

  return false;
}

Note.prototype.getSheetNote = function(currentAccidentals, isSharpKey) {
  throw new Error("CANNOT CALL ABSTRACT FUNCTION");
}

Note.prototype.abcDump = function(isSharpKey, currentAccidentals, measureBeat, measureDuration, measureAccent) {
  var that = this;
  var bundle = {};

  var sheetNote = "";
  var collection = this.getSheetNote(currentAccidentals, isSharpKey);

  //If note goes through the third beat, split it up
  if(measureBeat > 0 && measureBeat < measureAccent && measureBeat + this.rhythm > measureAccent) {
    var diff = measureAccent - measureBeat;
    var overflow = this.rhythm - diff;

    var r1 = findClosest(diff, NoteRhythms);
    var r2 = findClosest(overflow, NoteRhythms);

    sheetNote = "(" + collection.note + r1 + collection.note + r2 + ")";

    if (measureBeat + this.rhythm == measureDuration) {
      sheetNote += "|";
    }
  }
  else if (measureBeat + this.rhythm > measureDuration) {
    var diff = measureDuration - measureBeat;
    var overflow = this.rhythm - diff;

    var r1 = findClosest(diff, NoteRhythms);
    var r2 = findClosest(overflow, NoteRhythms);

    sheetNote = "(" + collection.note + r1 + "|" + collection.note + r2 + ")";
  }
  else {
    sheetNote = collection.note + this.rhythm;
    if (measureBeat + this.rhythm == measureDuration) {
      sheetNote += "|";
    }
  }

  bundle.sheetNote = sheetNote;
  bundle.accidentals = collection.accidentals;
  return bundle;
};

Note.prototype.updateCss = function() {
  throw new Error("CANNOT CALL ABSTRACT FUNCTION");
}

Note.prototype.setToHit = function() {
  for (var i = 0; i < this.svgElements.length; i++) {
    $(this.svgElements[i]).addClass("hit-all");
  }
}

function SingleNote(config) {
  this.tone = config.tone;
  Note.call(this, config);
  this.performedTone;
  this.performedRhythm = 0;
  this.interval = config.interval;
}

SingleNote.prototype = Object.create(Note.prototype);
SingleNote.prototype.constructor = SingleNote;

SingleNote.prototype.getAccuracies = function(lastNote) {
  if (this.tone == REST) {
    return undefined;
  }

  var bundle = {};

  function addToBundle(type, didHit) {
    return {musicType: type, hit: didHit ? 1 : 0};
  }

  bundle.rhythm = addToBundle(this.rhythm, this.rhythm == this.performedRhythm);
  bundle.note = addToBundle(this.tone, this.tone == this.performedTone);
  bundle.interval = addToBundle(this.interval, this.tone == this.performedTone);

  return bundle;
}

SingleNote.prototype.updateCss = function() {
  if (this.tone == REST) {
    return;
  }

  if(this.tone != this.performedTone && this.rhythm != this.performedRhythm) {
    for (var j = 0; j < this.svgElements.length; j++) {
      $(this.svgElements[j]).addClass("missed-all");//.css("fill", "#E83034");
    }
  }
  else if (this.tone != this.performedTone) {
    for (var j = 0; j < this.svgElements.length; j++) {
      $(this.svgElements[j]).addClass("missed-note");//.css("fill", "#A257DE");
    }  
  }
  else if (this.rhythm != this.performedRhythm) {
    for (var j = 0; j < this.svgElements.length; j++) {
      $(this.svgElements[j]).addClass("missed-rhythm");//.css("fill", "#455ede");
    }  
  }
  else {
    $(this.svgElements[j]).addClass("hit-all");
  }
}

SingleNote.prototype.getDescription = function(isSharpKey) {
  if (Array.isArray(this.tone)) {
    return "chord";
  }

  var note = midiToNote(this.tone);

  if (note.note['='] !== undefined) {
    return note.note['='];
  }
  else {
    return isSharpKey ? note.note['^'] + "#" : note.note['_'] + "b";
  }
}

SingleNote.prototype.getDescriptionOfPerformed = function(isSharpKey) {  
  if (this.performedTone == undefined || this.performedTone <= 0) {
    return "None";
  }

  console.log(this.performedTone);

  var note = midiToNote(this.performedTone);

  if (note.note['='] !== undefined) {
    return note.note['='];
  }
  else {
    return isSharpKey ? note.note['^'] + "#" : note.note['_'] + "b";
  }
}

SingleNote.prototype.getDescriptionOfRhythm = function() {
  
}

SingleNote.prototype.getSheetNote = function(currentAccidentals, isSharpKey) {
  var bundle = {};
  
  function getAccidentalledNote(sheetTone, accidental) {
    var baseNote = sheetTone[accidental];
    if (currentAccidentals[baseNote] != accidental) {
      currentAccidentals[baseNote] = accidental;
      return accidental + baseNote;
    }
    
    return baseNote;
  }

  if (this.tone == REST) {
    bundle.note = "z";
    bundle.accidentals = currentAccidentals;
    return bundle;
  }
  var sheetTone = midiToNote(this.tone);
  //always check if the natural version of the note is available
  if (sheetTone.note['='] !== undefined) {
    sheetNote = getAccidentalledNote(sheetTone.note, '=');
  }
  else {
    sheetNote = isSharpKey ? getAccidentalledNote(sheetTone.note, '^') : getAccidentalledNote(sheetTone.note, '_');
  }

  //get the correct note octave
  sheetNote += abcOctave[sheetTone.octave];

  if (this.fingering != undefined) {
    bundle.note = "!" + this.fingering + "!" + sheetNote;
  }
  else {
    bundle.note = sheetNote;
  }
  bundle.accidentals = currentAccidentals;

  return bundle;
}  

SingleNote.prototype.match = function(note) {
  var score = 0;
  var noteScore;
  var intervalScore;
  var rhythmScore;
  
  if (this.tone == note.tone) {
    noteScore = MATCH_SCORES.TONE_MATCH;  
  }
  /*else if (this.tone != REST && this.letter == note.letter && this.octave != note.octave) {
    noteScore = MATCH_SCORES.OCTAVE_MISMATCH;
  }
  else if (this.tone != REST && this.octave == note.octave && this.letter != note.letter) {
    noteScore = MATCH_SCORES.LETTER_MISMATCH;
  }*/
  else {    
    noteScore = MATCH_SCORES.TONE_MISMATCH;
  }
  
  score += noteScore;
    
  intervalScore = this.interval == note.interval ? MATCH_SCORES.INTERVAL_MATCH 
    : MATCH_SCORES.INTERVAL_MISMATCH;
  
  if (this.rhythm <= note.rhythm + 1.2 && this.rhythm >= note.rhythm - 1.2) {
    rhythmScore = MATCH_SCORES.RHYTHM_MATCH;
  }
  else {
    rhythmScore = MATCH_SCORES.RHYTHM_MISMATCH;
  }
  
  return {
    raw: noteScore + intervalScore + rhythmScore,
    tone: noteScore,
    inteval: intervalScore,
    rhythm: rhythmScore,
    dir: MatchDirection.DIAG,
    expected: this.tone,
    expectedRhythm: this.rhythm
  };
};

SingleNote.prototype.resetPerformance = function() {
  this.performedTone = 0;
  this.performedRhythm = 0;
}

function PolyNote(config) {
  //tone here is an array of SingleNotes
  this.tone = config.tone;
  this.svgElements = [];

  Note.call(this, config);
}

PolyNote.prototype = Object.create(Note.prototype);
PolyNote.prototype.constructor = PolyNote;

PolyNote.prototype.getAccuracies = function(lastNote) {
  var bundle = {};

  function addToBundle(type, didHit) {
    return {musicType: type, hit: didHit ? 1 : 0};
  }

  var allRhythmsHit = true;
  var allNotesHit = true;
  for (var i = 0; i < this.tone.length; i++) {
    allRhythmsHit = allRhythmsHit && (this.tone.rhythm == this.tone.performedRhythm);
    allNotesHit = allNotesHit && (this.tone.tone == this.tone.performedTone);
  }

  bundle.rhythm = addToBundle(this.rhythm, allRhythmsHit);
  bundle.note = addToBundle(this.getType, allNotesHit);
  
  return bundle;
}

PolyNote.prototype.resetPerformance = function() {
  for (var i = 0; i < this.tone.length; i++) {
    this.tone[i].resetPerformance();
  }
}

PolyNote.prototype.getDescription = function(isSharpKey) {
  var notes = "[";

  for (var i = 0; i < this.tone.length; i++) {
    if (i != 0) {
      notes += ", ";
    }
    notes += this.tone[i].getDescription(isSharpKey);
  } 
  notes+= "]";

  return notes;
};

PolyNote.prototype.getDescriptionOfPerformed = function(isSharpKey) {
  var notes = "[";

  for (var i = 0; i < this.tone.length; i++) {
    if (i != 0) {
      notes += ", ";
    }
    notes += this.tone[i].getDescriptionOfPerformed(isSharpKey);
  } 
  notes+= "]";

  return notes;
}

PolyNote.prototype.getSheetNote = function(currentAccidentals, isSharpKey) {
  var sheetNote = "[";
  var bundle = {};

  for(var i = 0; i < this.tone.length; i++) {
    var collection = this.tone[i].getSheetNote(currentAccidentals, isSharpKey);
    currentAccidentals = collection.accidentals;
    sheetNote+= collection.note;
  }

  sheetNote+= "]";
  bundle.note = sheetNote;
  bundle.accidentals = currentAccidentals;

  return bundle;
}

PolyNote.prototype.getType = function() {
  return "poly note";
}

PolyNote.prototype.updateCss = function() {
  for (var i = 0; i < this.tone.length; i++) {
    var note = this.tone[i];
    if(note.tone != note.performedTone && note.rhythm != note.performedRhythm) {
      for (var j = 0; j < this.svgElements.length; j++) {
        $(this.svgElements[j]).addClass("missed-all");//.css("fill", "#E83034");
      }
      return;
    }
    else if (note.tone != note.performedTone) {
      for (var j = 0; j < this.svgElements.length; j++) {
        $(this.svgElements[j]).addClass("missed-note");//.css("fill", "#A257DE");
      }  
      return;
    }
    else if (note.rhythm != note.performedRhythm) {
      for (var j = 0; j < this.svgElements.length; j++) {
        $(this.svgElements[j]).addClass("missed-rhythm");//.css("fill", "#455ede");
      }  
      return;
    }
  }

  $(this.svgElements[j]).addClass("hit-all");
}

function Triad(config) {
  var chord = config.chord;
  var tone = config.tone;

  var intervals = chord.type == 'M' ? MajorChordIntervals : MinorChordIntervals;
  var tones = [];

  tones.push(new SingleNote({tone: tone, rhythm: config.rhythm, hand: config.hand}));
  tones.push(new SingleNote({tone: tone + intervals[1], rhythm: config.rhythm, hand: config.hand}));
  tones.push(new SingleNote({tone: tone + intervals[2], rhythm: config.rhythm, hand: config.hand}));
  config.tone = tones;

  PolyNote.call(this, config);
}

Triad.prototype = Object.create(PolyNote.prototype);
Triad.prototype.constructor = Triad;

Triad.prototype.getDescription = function(isSharpKey) {
  return "triad: " + PolyNote.prototype.getDescription.call(this, isSharpKey);
}

Triad.prototype.getType = function() {
  return "triad";
}

function SuspendedChord(config) {
  var chord = config.chord;
  var tone = config.tone;

  var intervals = chord.type == 'M' ? MajorChordIntervals : MinorChordIntervals;
  var tones = [];

  tones.push(new SingleNote({tone: tone, rhythm: config.rhythm, hand: config.hand}));
  tones.push(new SingleNote({tone: tone + 5, rhythm: config.rhythm, hand: config.hand}));
  tones.push(new SingleNote({tone: tone + intervals[2], rhythm: config.rhythm, hand: config.hand}));
  config.tone = tones;
  PolyNote.call(this, config);
}

SuspendedChord.prototype.getType = function() {
  return "suspended";
}

SuspendedChord.prototype = Object.create(PolyNote.prototype);
SuspendedChord.prototype.constructor = SuspendedChord;

function InvertedChord(config) {
  var chord = config.chord;
  var tone = config.tone;

  var intervals = chord.type == 'M' ? MajorChordIntervals : MinorChordIntervals;
  var tones = [];

  tones.push(new SingleNote({tone: tone + intervals[7], rhythm: config.rhythm, hand: config.hand}));
  tones.push(new SingleNote({tone: tone, rhythm: config.rhythm, hand: config.hand}));
  tones.push(new SingleNote({tone: tone + intervals[1], rhythm: config.rhythm, hand: config.hand}));
  config.tone = tones;
  PolyNote.call(this, config);  
}

InvertedChord.prototype.getType = function() {
  return "Inverted";
}

InvertedChord.prototype = Object.create(PolyNote.prototype);
InvertedChord.prototype.constructor = InvertedChord;

function SixthChord(config) {
  var chord = config.chord;
  var tone = config.tone;

  var intervals = chord.type == 'M' ? MajorChordIntervals : MinorChordIntervals;
  var tones = [];

  tones.push(new SingleNote({tone: tone + intervals[7], rhythm: config.rhythm, hand: config.hand}));
  tones.push(new SingleNote({tone: tone + intervals[1], rhythm: config.rhythm, hand: config.hand}));
  config.tone = tones;
  PolyNote.call(this, config);  
}

SixthChord.prototype.getType = function() {
  return "6th";
}

SixthChord.prototype = Object.create(PolyNote.prototype);
SixthChord.prototype.constructor = SixthChord;
