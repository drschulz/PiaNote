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
    if (r2 >= measureDuration) {
        sheetNote += "|";
    }
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

Note.prototype.getPerformedRhythm = function() {
  throw new Error("CANNOT CALL ABSTRACT FUNCTION");
}

Note.prototype.match = function() {
    throw new Error("CANNOT CALL ABSTRACT FUNCTION");
}

Note.prototype.setPerformanceNote = function(note) {
    throw new Error("CANNOT CALL ABSTRACT FUNCTION");
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

SingleNote.prototype.getPerformedRhythm = function() {
  return this.performedRhythm == undefined ? 0 : this.performedRhythm;
}

SingleNote.prototype.getAccuracies = function(lastNote, keyTones) {
  if (this.tone == REST) {
    return undefined;
  }

  var bundle = {};

  function addToBundle(type, didHit) {
    return {musicType: type, hit: didHit ? 1 : 0};
  }

  bundle.rhythm = addToBundle(this.rhythm, this.rhythm == this.performedRhythm && this.tone == this.performedTone);
  bundle.note = addToBundle(this.tone, this.tone == this.performedTone);
  bundle.interval = addToBundle(this.interval, this.tone == this.performedTone);
  bundle.key = {hit: 0, num: 0};

  if(keyTones.indexOf(this.tone) != -1) {
      bundle.key.hit = this.tone == this.performedTone ? 1 : 0;
      bundle.key.num = 1;
  }

  return bundle;
}

SingleNote.prototype.updateCss = function() {
  //if (this.tone == REST) {
    //return;
  //}

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
    console.log("hit note! changing css ....");
    for (var j = 0; j < this.svgElements.length; j++) {
      $(this.svgElements[j]).addClass("hit-all");
    }
  }
}

SingleNote.prototype.getDescription = function(isSharpKey) {
  if (Array.isArray(this.tone)) {
    return "chord";
  }
  
  if (this.tone == REST) {
      return "Rest";
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
  if (this.performedTone == REST) {
      return "Rest";
  }
  
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
  var intervalScore = 0;
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
    
  //intervalScore = this.interval == note.interval ? MATCH_SCORES.INTERVAL_MATCH 
    //: MATCH_SCORES.INTERVAL_MISMATCH;
  
  var diff = Math.abs(this.rhythm - note.rhythm);
  var percentDiff = diff / this.rhythm;
  if (percentDiff < 0.4) {//this.rhythm <= note.rhythm + 1.2 && this.rhythm >= note.rhythm - 1.2) {
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

SingleNote.prototype.setPerformanceNote = function(tone) {
    this.performedTone = tone;
};

SingleNote.prototype.setPerformedRhythm = function(rhythm) {
    this.performedRhythm = rhythm;
}

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

PolyNote.prototype.match = function(note) {
  var score = 0;
  var noteScore;
  var intervalScore = 0;
  var rhythmScore;
  
  var toneNumbers = this.tone.map(function(e) {
      return e.tone;
  });
  
  for (var i = 0; i < note.tone.length; i++) {
      var idx = toneNumbers.indexOf(note.tone[i].tone);
      
      if (idx == -1) {
          noteScore += MATCH_SCORES.TONE_MISMATCH;
          rhythmScore += MATCH_SCORES.RHYTHM_MISMATCH;
      }
      else {
          this.tone[idx].match(note.tone[i]);
      }
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

PolyNote.prototype.setPerformanceNote = function(notes) {
  var toneNumbers = notes.map(function(e) {
      return e.tone;
  });
  
  var toneSet = new Set(toneNumbers);
  
  var leftOverTones = [];
  
  for (var i = 0; i < this.tone.length; i++) {
    if (toneSet.has(this.tone[i].tone)) {
        this.tone[i].setPerformanceNote(this.tone[i].tone);
        toneSet.delete(this.tone[i].tone);
    }
    else {
        leftOverTones.push(this.tone[i]);
    }
  }
  
  leftOverTones.sort(function(a, b) {
      return a.tone < b.tone;
  });
  
  var setVals = Array.from(toneSet);
  setVals.sort();
  
  for (var i = 0; i < leftOverTones.length; i++) {
      if (setVals.length > 0) {
          leftOverTones[i].setPerformanceNote(setVals[0]);
          setVals.shift();
      }
      else {
          leftOverTones[i].setPerformanceNote(REST);
      }
  } 
};

PolyNote.prototype.setPerformedRhythm = function(rhythm) {
    for (var i = 0; i < this.tone.length; i++) {
        this.tone[i].setPerformedRhythm(rhythm);
    }
}

PolyNote.prototype.getPerformedRhythm = function() {
  var allRhythmsUndefined = true;
  for (var i = 0; i < this.tone.length; i++) {
    var note = this.tone[i];
    allRhythmsUndefined = allRhythmsUndefined && note.performedRhythm == undefined;
  }

  if (allRhythmsUndefined) {
    return 0;
  }

  var smallestRhythm = NoteRhythms.WHOLE;
  

  for (var i = 0; i < this.tone.length; i++) {
    var note = this.tone[i];
    if (note.performedRhythm < smallestRhythm) {
      smallestRhythm = note.performedRhythm;
    }
  }

  return smallestRhythm;
}

PolyNote.prototype.getAccuracies = function(lastNote, keyTones) {
  var bundle = {};

  function addToBundle(type, didHit) {
    return {musicType: type, hit: didHit ? 1 : 0};
  }

  var allRhythmsHit = true;
  var allNotesHit = true;
  var keyTonesHit = {hit: 0, num: 0};
  for (var i = 0; i < this.tone.length; i++) {
    allRhythmsHit = allRhythmsHit && (this.tone[i].rhythm == this.tone[i].performedRhythm && this.tone[i].tone == this.tone[i].performedTone);
    allNotesHit = allNotesHit && (this.tone[i].tone == this.tone[i].performedTone);
    
    if (keyTones.indexOf(this.tone[i].tone) != -1) {
        keyTonesHit.hit += this.tone[i].tone == this.tone[i].performedTone ? 1 : 0;
        keyTonesHit.num++;
    }
  }

  bundle.rhythm = addToBundle(this.rhythm, allRhythmsHit);
  bundle.note = addToBundle(this.getType(), allNotesHit);
  bundle.key = keyTonesHit;
  
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
  var missedRhythm = false;
  var missedNote = false;
  for (var i = 0; i < this.tone.length; i++) {
    var note = this.tone[i];
    if (note.rhythm != note.performedRhythm) {
      missedRhythm = true;
    }
    if (note.tone != note.performedTone) {
      missedNote = true;
    }
  }

  if (missedNote && missedRhythm) {
    for (var j = 0; j < this.svgElements.length; j++) {
      $(this.svgElements[j]).addClass("missed-all");//.css("fill", "#E83034");
    }
  }
  else if (missedNote) {
    for (var j = 0; j < this.svgElements.length; j++) {
      $(this.svgElements[j]).addClass("missed-note");//.css("fill", "#A257DE");
    }  
  }
  else if (missedRhythm) {
    for (var j = 0; j < this.svgElements.length; j++) {
      $(this.svgElements[j]).addClass("missed-rhythm");//.css("fill", "#455ede");
    }
  }
  else {
    for (var j = 0; j < this.svgElements.length; j++) {
      $(this.svgElements[j]).addClass("hit-all");
    }  
  }
};

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

function SimpleTriad(config) {
    var chord = config.chord;
  var tone = config.tone;

  var intervals = chord.type == 'M' ? MajorChordIntervals : MinorChordIntervals;
  var tones = [];

  tones.push(new SingleNote({tone: tone, rhythm: config.rhythm, hand: config.hand}));
  tones.push(new SingleNote({tone: tone + intervals[2], rhythm: config.rhythm, hand: config.hand}));
  config.tone = tones;

  PolyNote.call(this, config);
}

SimpleTriad.prototype = Object.create(PolyNote.prototype);
SimpleTriad.prototype.constructor = SimpleTriad;

SimpleTriad.prototype.getDescription = function(isSharpKey) {
  return "5th: " + PolyNote.prototype.getDescription.call(this, isSharpKey);
}

SimpleTriad.prototype.getType = function() {
  return "5th";
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

SuspendedChord.prototype = Object.create(PolyNote.prototype);
SuspendedChord.prototype.constructor = SuspendedChord;

SuspendedChord.prototype.getDescription = function(isSharpKey) {
    return "Suspended: " + PolyNote.prototype.getDescription.call(this, isSharpKey);
}

SuspendedChord.prototype.getType = function() {
  return "suspended";
}

function SimpleSuspendedChord(config) {
    var chord = config.chord;
  var tone = config.tone;

  var intervals = chord.type == 'M' ? MajorChordIntervals : MinorChordIntervals;
  var tones = [];

  tones.push(new SingleNote({tone: tone + 5, rhythm: config.rhythm, hand: config.hand}));
  tones.push(new SingleNote({tone: tone + intervals[2], rhythm: config.rhythm, hand: config.hand}));
  config.tone = tones;
  PolyNote.call(this, config);
}

SimpleSuspendedChord.prototype = Object.create(PolyNote.prototype);
SimpleSuspendedChord.prototype.constructor = SimpleSuspendedChord;

SimpleSuspendedChord.prototype.getDescription = function(isSharpKey) {
    return "2nd: " + PolyNote.prototype.getDescription.call(this, isSharpKey);
}

SimpleSuspendedChord.prototype.getType = function() {
    return "2nd";
}

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

InvertedChord.prototype = Object.create(PolyNote.prototype);
InvertedChord.prototype.constructor = InvertedChord;

InvertedChord.prototype.getDescription = function(isSharpKey) {
    return "Inverted: " + PolyNote.prototype.getDescription.call(this, isSharpKey);
}

InvertedChord.prototype.getType = function() {
  return "Inverted";
}

function SimpleInvertedChord(config) {
  var chord = config.chord;
  var tone = config.tone;

  var intervals = chord.type == 'M' ? MajorChordIntervals : MinorChordIntervals;
  var tones = [];

  tones.push(new SingleNote({tone: tone + intervals[7], rhythm: config.rhythm, hand: config.hand}));
  tones.push(new SingleNote({tone: tone, rhythm: config.rhythm, hand: config.hand}));
  config.tone = tones;
  PolyNote.call(this, config);
}

SimpleInvertedChord.prototype = Object.create(PolyNote.prototype);
SimpleInvertedChord.prototype.constructor = SimpleInvertedChord;

SimpleInvertedChord.prototype.getDescription = function(isSharpKey) {
    return "4th: " + PolyNote.prototype.getDescription.call(this, isSharpKey);
}

SimpleInvertedChord.prototype.getType = function() {
    return "4th";
}

function V7Chord(config) {
  var chord = config.chord;
  var tone = config.tone;

  var intervals = chord.type == 'M' ? MajorChordIntervals : MinorChordIntervals;
  var tones = [];

  tones.push(new SingleNote({tone: tone - 8, rhythm: config.rhythm, hand: config.hand}));
  tones.push(new SingleNote({tone: tone - 2, rhythm: config.rhythm, hand: config.hand}));
  tones.push(new SingleNote({tone: tone, rhythm: config.rhythm, hand: config.hand}));
  config.tone = tones;
  PolyNote.call(this, config);  
}

V7Chord.prototype = Object.create(PolyNote.prototype);
V7Chord.prototype.constructor = V7Chord;

V7Chord.prototype.getDescription = function(isSharpKey) {
    return "6th: " + PolyNote.prototype.getDescription.call(this, isSharpKey);
}

V7Chord.prototype.getType = function() {
    return "V7Chord";
}


function SimpleV7Chord(config) {
  var chord = config.chord;
  var tone = config.tone;

  var intervals = chord.type == 'M' ? MajorChordIntervals : MinorChordIntervals;
  var tones = [];

  tones.push(new SingleNote({tone: tone - 8, rhythm: config.rhythm, hand: config.hand}));
  tones.push(new SingleNote({tone: tone, rhythm: config.rhythm, hand: config.hand}));
  config.tone = tones;
  PolyNote.call(this, config);
}

SimpleV7Chord.prototype = Object.create(PolyNote.prototype);
SimpleV7Chord.prototype.constructor = SimpleV7Chord;

SimpleV7Chord.prototype.getDescription = function(isSharpKey) {
    return "6th: " + PolyNote.prototype.getDescription.call(this, isSharpKey);
}

SimpleV7Chord.prototype.getType = function() {
   return "6th";
}

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

SixthChord.prototype = Object.create(PolyNote.prototype);
SixthChord.prototype.constructor = SixthChord;


SixthChord.prototype.getType = function() {
  return "6th";
}

