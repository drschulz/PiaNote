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
  
  /*if (config.last_tone === undefined) {
    this.interval = 0;
  }
  else {
    this.interval = this.tone - this.last_tone;
  }
  
  this.dynamic = config.dynamic;*/
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

function SingleNote(config) {
  this.tone = config.tone;
  Note.call(this, config);
  this.performedTone;
  this.performedRhythm = 0;
}

SingleNote.prototype = Object.create(Note.prototype);
SingleNote.prototype.constructor = SingleNote;

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
  if (Array.isArray(this.tone)) {
    return "chord";
  }
  
  if (this.performedTone == undefined) {
    return "None";
  }

  var note = midiToNote(this.performedTone);

  if (note.note['='] !== undefined) {
    return note.note['='];
  }
  else {
    return isSharpKey ? note.note['^'] + "#" : note.note['_'] + "b";
  }
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
    return "z";
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

  bundle.note = sheetNote;
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

function PolyNote(config) {
  //tone here is an array of SingleNotes
  this.tone = config.tone;
  this.svgElements = [];

  Note.call(this, config);
}

PolyNote.prototype = Object.create(Note.prototype);
PolyNote.prototype.constructor = SingleNote;

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