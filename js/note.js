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
  this.tone = config.tone;
  this.rhythm = config.rhythm;
  if (this.tone == REST) {
    this.letter = REST;
    this.octave = REST;
  }
  else {
    var letterAndOctave = midiMap.noteAndOctave(config.tone);
    this.letter = letterAndOctave.letter;
    this.octave = letterAndOctave.octave;
  }
  if (config.last_tone === undefined) {
    this.interval = 0;
  }
  else {
    this.interval = this.tone - this.last_tone;
  }
  
  this.dynamic = config.dynamic;
}

//NOT CURRENTLY USED
Note.prototype.vexdump = function() {
  return ":" + this.rhythm + " " +  this.letter 
    + "/" + this.octave;
};


//NOT CURRENTLY USED
Note.prototype.vextext = function() {
  return ":" + this.rhythm + "," + this.letter;
};
  

Note.prototype.match = function(note) {
  var score = 0;
  var noteScore;
  var intervalScore;
  var rhythmScore;
  
  if (this.tone == note.tone) {
    noteScore = MATCH_SCORES.TONE_MATCH;  
  }
  else if (this.tone != REST && this.letter == note.letter && this.octave != note.octave) {
    noteScore = MATCH_SCORES.OCTAVE_MISMATCH;
  }
  else if (this.tone != REST && this.octave == note.octave && this.letter != note.letter) {
    noteScore = MATCH_SCORES.LETTER_MISMATCH;
  }
  else {    
    noteScore = MATCH_SCORES.TONE_MISMATCH;
  }
  
  score += noteScore;
  
  
  intervalScore = this.interval == note.interval ? MATCH_SCORES.INTERVAL_MATCH 
    : MATCH_SCORES.INTERVAL_MISMATCH;
  
  if (this.rhythm == note.rhythm) {
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
    dir: MatchDirection.DIAG
  };
};