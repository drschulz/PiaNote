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

function Note(config) {
  this.text = " ";
  this.tone = config.tone;
  this.rhythm = config.rhythm;
  this.noteDescription;
  this.svgElements = [];
  this.performedTone;
  this.performedRhythm;
  /*if (this.tone == REST) {
    this.letter = REST;
    this.octave = REST;
  }
  else {
    var letterAndOctave = midiMap.noteAndOctave(config.tone);
    this.letter = letterAndOctave.letter;
    this.octave = letterAndOctave.octave;
  }*/
  if (config.last_tone === undefined) {
    this.interval = 0;
  }
  else {
    this.interval = this.tone - this.last_tone;
  }
  
  this.dynamic = config.dynamic;
}

Note.prototype.setText = function(text) {
  this.text = text;
};

Note.prototype.getDescription = function(isSharpKey) {
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

Note.prototype.abcDump = function(isSharpKey, currentAccidentals, measureBeat, measureDuration, measureAccent) {
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

  var that = this;
  var bundle = {};

  //get the correct note accidental
  function getAccidentalledNote(sheetTone, accidental) {
    var baseNote = sheetTone[accidental];
    
    if (currentAccidentals[baseNote] != accidental) {
      currentAccidentals[baseNote] = accidental;
      return accidental + baseNote;
    }
    
    return baseNote;
  }

  function getIndividualNote(tone, rhythm) {

    var sheetTone = midiToNote(tone);

    //always check if the natural version of the note is available
    if (sheetTone.note['='] !== undefined) {
      sheetNote = getAccidentalledNote(sheetTone.note, '=');
    }
    else {
      sheetNote = isSharpKey ? getAccidentalledNote(sheetTone.note, '^') : getAccidentalledNote(sheetTone.note, '_');
    }

    //get the correct note octave
    sheetNote += abcOctave[sheetTone.octave];

    //get the correct rhythm
    sheetNote += rhythm;//rhythmABC[rhythm];

    return sheetNote;
  }

  function getSheetNote(tone, rhythm) {
    var sheetNote = "";

    //check if this note is a chord
    if(Array.isArray(tone)) {
      sheetNote += "[";
      for (var i = 0; i < tone.length; i++) {
        sheetNote += getIndividualNote(tone[i], rhythm);
      }
      sheetNote += "]";
    }
    else {
      sheetNote = getIndividualNote(tone, rhythm);
    }

    return sheetNote;
  }

  if (this.tone == REST) {
    bundle.sheetNote = 'z' + this.rhythm;//rhythmABC[this.rhythm];
  }
  else {
    var sheetNote = "";

    //If note goes through the third beat, split it up
    if(measureBeat > 0 && measureBeat < measureAccent && measureBeat + this.rhythm > measureAccent) {
      var diff = measureAccent - measureBeat;
      var overflow = this.rhythm - diff;

      var r1 = findClosest(diff, NoteRhythms);
      var r2 = findClosest(overflow, NoteRhythms);
      
      sheetNote = "(" + getSheetNote(this.tone, r1) + getSheetNote(this.tone, r2) + ")";

      if (measureBeat + this.rhythm == measureDuration) {
        sheetNote += "|";
      }

      //measureRhythm += rhythmMap[e.rhythm];
      //successiveEighths = 0; //reset successive 8ths
      //successiveSixteenths = 0; //reset successive 16ths
    }
    else if (measureBeat + this.rhythm > measureDuration) {
      var diff = measureDuration - measureBeat;
      var overflow = this.rhythm - diff;

      var r1 = findClosest(diff, NoteRhythms);
      var r2 = findClosest(overflow, NoteRhythms);

      sheetNote = "(" + getSheetNote(this.tone, r1) + "|" + getSheetNote(this.tone, r2) + ")";
    }
    else {
      sheetNote = getSheetNote(this.tone, this.rhythm);
      if (measureBeat + this.rhythm == measureDuration) {
        sheetNote += "|";
      }
    }

    bundle.sheetNote = sheetNote;
  }

  bundle.accidentals = currentAccidentals;
  return bundle;
};
  

Note.prototype.match = function(note) {
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