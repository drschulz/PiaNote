//Sorts all notes in a musical piece by their time and their tone
function flatTuneList(tune) {
  var times = Object.keys(tune);

  times.sort(function(a, b) {
    return parseInt(a) - parseInt(b);
  });

  var tuneList = [];
  //Flatten the times
  for(var j = 0; j < times.length; j++) {
    var time = times[j];
    var notes = tune[time];
    var noteArr = [];

    //Flatten all notes
    for (var i = 0; i < notes.length; i++) {
      //Flatten all PolyNotes
      if (Array.isArray(notes[i].tone)) {
        for (var k = 0; k < notes[i].tone.length; k++) {
          noteArr.push(notes[i].tone[k]);
        }
      }
      else {
        noteArr.push(notes[i]);
      }
    }

    noteArr.sort(function(a, b) {
      return a.tone - b.tone;
    });

    for (var i = 0; i < noteArr.length; i++) {
      tuneList.push(noteArr[i]);
    }
  }

  return tuneList;
}

function flatTuneListSeparatedByNote(tune, separationNote) {
  var times = Object.keys(tune);

  times.sort(function(a, b) {
    return parseInt(a) - parseInt(b);
  });

  var lowerTuneList = [];
  var upperTuneList = [];
  var lastTimeUpperPlayed = 0;
  var lastTimeLowerPlayed = 0;
  //Flatten the times
  for(var j = 0; j < times.length; j++) {
    var time = times[j];
    var notes = tune[time];
    var noteArr = [];

    //Flatten all notes
    for (var i = 0; i < notes.length; i++) {
      //Flatten all PolyNotes
      if (Array.isArray(notes[i].tone)) {
        for (var k = 0; k < notes[i].tone.length; k++) {
          noteArr.push(notes[i].tone[k]);
        }
      }
      else {
        noteArr.push(notes[i]);
      }
    }

    noteArr.sort(function(a, b) {
      return a.tone - b.tone;
    });

    var lower = [];
    var upper = [];
    for (var i = 0; i < noteArr.length; i++) {
      
      if (noteArr[i].tone < separationNote || (noteArr[i].tone == REST && noteArr[i].hand == "l")) {
          var timeNum = parseInt(time);
          if (timeNum - lastTimeLowerPlayed > 0) {
              lowerTuneList.push(new SingleNote({tone: REST, rhythm: timeNum - lastTimeLowerPlayed}));
          }
          lowerTuneList.push(noteArr[i]);
          lastTimeLowerPlayed = parseInt(time) + noteArr[i].rhythm;
      }
      else {
          var timeNum = parseInt(time);
          if (timeNum - lastTimeUpperPlayed > 0) {
              upperTuneList.push(new SingleNote({tone: REST, rhythm: timeNum - lastTimeUpperPlayed}));
          }
          upperTuneList.push(noteArr[i]);
          lastTimeUpperPlayed = parseInt(time) + noteArr[i].rhythm;
      }
      //tuneList.push(noteArr[i]);
    }
    
    /*if (!upper.length == 0) {
        if (upper.length == 1) {
            upperTuneList.push(upper[0]);
        }
        else {
            upperTuneList.push(new PolyNote({tone: upper, rhythm: upper[0].rhythm}));
        }
    }
    if (!lower.length == 0) {
        if (lower.length == 1) {
            lowerTuneList.push(lower[0]);
        }
        else {
            lowerTuneList.push(new PolyNote({tone: lower, rhythm: lower[0].rhythm}));
        }
    }*/
    
  }

  return {
      lower: lowerTuneList,
      upper: upperTuneList
  };
}


function Musical_Piece(config) {
  var that = this;

  //this.piece = config;

  this.key = config.key;
  this.isSharpKey = sharpKeys.indexOf(this.key) > 0 ? true : false;
  this.time = config.time;
  this.numMeasures = config.numMeasures;
  var beatValue = WHOLE_NOTE_VALUE / this.time.rhythm;
  this.measureDuration = this.time.beats * beatValue;
  this.measureBeat = Math.floor(this.time.beats / 2);
  this.measureAccent = Math.ceil(this.time.beats / 2) * beatValue;
  while (this.measureBeat % 2 == 0) {
    this.measureBeat /= 2;
  }

  this.measureBeat *= beatValue;

  this.rhythms = this.generatePhraseRhythm(config.stats);
  this.chords = this.generateChords();
  this.piece = {};
  this.generatePiece();
  this.num = config.num;
}

Musical_Piece.prototype.addToPiece = function(time, note) {
  if (this.piece[time] == undefined) {
    this.piece[time] = [];
  }
  this.piece[time].push(note);
}

Musical_Piece.prototype.generatePiece = function() {
  throw new Error("CANNOT CALL ABSTRACT FUNCTION");
};

Musical_Piece.prototype.generateChords = function() {
  var chords = [];

  //alwasy start with the chord of the key
  chords.push(keyChords[0]);

  //random chords for the rest of the piece
  for (var i = 1; i < this.numMeasures - 1; i++) {
    chords.push(keyChords[Math.random() * keyChords.length << 0]);
  }

  //always end with the chord of the key
  chords.push(keyChords[0]);

  return chords;
};

Musical_Piece.prototype.clearPerformance = function() {
  var voices = this.getVoiceTuneList();
  var v = voices.voice1;

  for (var i = 0; i < v.length; i++) {
    v[i].resetPerformance();
  }

  v = voices.voice2;

  for (var i = 0; i < v.length; i++) {
    v[i].resetPerformance();
  }  

};


Musical_Piece.prototype.generatePhraseRhythm = function(stats) {
  var rhythms = [];
  var curMeasure = 0;
  var curBeat = 0;

  var possibleRhythms = rhythmLevels.getCurrentChoices();
  var measureRhythms = [];

  //get weights based on difficulty (the index) as well as the user's accuracy in that rhythm
  var cdf = 0;
  for(var i = 0; i < possibleRhythms.length; i++) {
    cdf += (i + 1) * stats.getRhythmAccuracy(possibleRhythms[i]);
  }

  while(curMeasure < this.numMeasures) {
    var rhythmIdx = 0;
    var rhythm;

    //weighted pick of rhythms through accuracies and difficulty type
    var randWieght;
    randWeight = Math.random() * cdf;
    var upTo = 0;
    for (var i = 0; i < possibleRhythms.length; i++) {
      if (upTo + (i + 1)*stats.getRhythmAccuracy(possibleRhythms[i]) >= randWeight) {
        rhythmIdx = i;
        break;
      }
      upTo += (i + 1)*stats.getRhythmAccuracy(possibleRhythms[i]);
    }
    rhythm = possibleRhythms[rhythmIdx];
    
    //Pick a good rhythm to end the phrase on
    if (curMeasure == this.numMeasures - 1) {
      //If on 3rd beat, don't pick a dotted quarter
      if (curBeat == this.measureDuration - NoteRhythms.HALF) {
        while(rhythm == NoteRhythms.D_QUARTER) {
          rhythmIdx = Math.random() * possibleRhythms.length << 0;
          rhythm = possibleRhythms[rhythmIdx];
        }
      }
      //always end last beat with a quarter note
      else if (curBeat == this.measureDuration - NoteRhythms.QUARTER) {
        rhythm = NoteRhythms.QUARTER;
      }
    }

    //if the rhythm fits in the measure, add it
    if(curBeat + rhythm <= this.measureDuration) {
      var totalDur = rhythm;//rhythmDur;
      measureRhythms.push(rhythm);
      
      //for certain rhythms, we need to add a second rhythm to match it
      switch(rhythm) {
        case NoteRhythms.D_EIGTH:
          //add eighth note
          measureRhythms.push(NoteRhythms.SIXTEENTH);
          totalDur += NoteRhythms.SIXTEENTH;
          break;
        case NoteRhythms.D_QUARTER:
        case NoteRhythms.EIGTH:
          //add eighth note
          measureRhythms.push(NoteRhythms.EIGTH);
          totalDur += NoteRhythms.EIGTH;  
          break;
        case NoteRhythms.SIXTEENTH:
          //add three 16th notes
          measureRhythms.push(NoteRhythms.SIXTEENTH);
          measureRhythms.push(NoteRhythms.SIXTEENTH);
          measureRhythms.push(NoteRhythms.SIXTEENTH);
          totalDur += NoteRhythms.SIXTEENTH*3;  
          break;
        
        default:
          break;
      }
      
      if (curBeat + totalDur >= this.measureDuration) {
        curMeasure++;
        curBeat = 0;
        rhythms.push(measureRhythms);
        measureRhythms = [];
      }
      else {
        curBeat += totalDur;
      }
    }
  }

  return rhythms;
};

Musical_Piece.prototype.getVoiceTuneList = function() {
  var tune = this.piece;

  var times = Object.keys(tune);

  times.sort(function(a, b) {
    return parseInt(a) - parseInt(b);
  });

  var tuneList = {voice1: [], voice2: []};

  for (var i = 0; i < times.length; i++) {
    var time = times[i];
    var notes = tune[time];

    notes.sort(function(a, b) {
      var comp1, comp2;
      if (Array.isArray(a.tone)) {
        comp1 = a.tone[0];
      }
      else {
        comp1 = a.tone;
      }

      if (Array.isArray(b.tone)) {
        comp2 = b.tone[0];
      }
      else {
        comp2 = b.tone;
      }

      return comp1 - comp2;
    });

    for (var j = 0; j < notes.length; j++) {
      if (notes[j].hand == 'l') {
        tuneList.voice2.push(notes[j]);
      }
      else {
        tuneList.voice1.push(notes[j]);  
      }
      
    }
  }

  return tuneList;    
}

Musical_Piece.prototype.abcDump = function() {
  var that = this;

  //Current accidentals marks the current status of accidentals
  //that carry through the music
  var currentAccidentals = (function() { 
    var staveNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    var accidentals = {
      C: '=',
      D: '=',
      E: '=',
      F: '=',
      G: '=',
      A: '=',
      B: '='};
    
    var indx;
  
    if (that.isSharpKey) {
      indx = sharpKeys.indexOf(that.key);
      
      for(i = 0; i < indx; i++) {
        staveNote = (3 + 4*i)%7;
        //sharp
        accidentals[staveNotes[(3 + 4*i)%7]] = '^';
      }
    }
    else {
      indx = flatKeys.indexOf(that.key);
      
      for (i = 0; i < indx; i++) {
        //flat
        accidentals[staveNotes[(6 + 3*i)%7]] = '_';
      }
    }
    
    return accidentals;
  })();
  
  var abc = "";
  
  //initial stuff
  abc += "T: Song " + this.num + "\n"
       + "M: " + this.time.beats + "/" + this.time.rhythm + "\n" 
       + "L: 1/" + WHOLE_NOTE_VALUE + "\n" 
       + "K: " + this.key + "\n"
       + "%%staves {V1 V2}\n"
       + "V: V1 clef=treble\n"
       + "V: V2 clef=bass\n";

  var that = this;
  
  function getAbcVoice(voice, name) {
    var voiceString = "[V: " + name + "]";

    var successiveEighths = 0;
    var successiveSixteenths = 0;
    var successiveRhythms = 0;
    var measureRhythm = 0;
    for (var i = 0; i < voice.length; i++) {
      var note = voice[i];

      //Make sure beams are correct
      //Unbeam if over measure
      if (measureRhythm + note.rhythm >= that.measureDuration) {
        successiveRhythms = 0;
      }
      //Beam if not on a beat
      else if (successiveRhythms + note.rhythm <= that.measureBeat && measureRhythm != that.measureAccent) {
        successiveRhythms += note.rhythm;
      }
      else {
        successiveRhythms = note.rhythm;
        voiceString += " ";
      }

      //Dump the note
      var bundle = voice[i].abcDump(that.isSharpKey, currentAccidentals, measureRhythm, that.measureDuration, that.measureAccent);

      voiceString += bundle.sheetNote;
      currentAccidentals = bundle.accidentals;

      measureRhythm = (measureRhythm + note.rhythm) % that.measureDuration;
    }

    voiceString += "]\n";
    return voiceString;
  }

  var voices = this.getVoiceTuneList();
  abc += getAbcVoice(voices.voice1, "V1");
  abc += getAbcVoice(voices.voice2, "V2");
  
  return abc;
};

Musical_Piece.prototype.bindNotesToSheetMusic = function(id) {
  var that = this;

  function assignNoteData(voice, voiceNum) {
    var measureBeat = 0;
    var curMeasure = 0;
    var abcIdx = 0;
    var measureNotes = $(id).find(".note.m" + curMeasure + ".v" + voiceNum);

    for(var i = 0; i < voice.length; i++) {
      //clear the svg elements if note already had any
      voice[i].svgElements = [];
      
      //attach note to svg element
      $(measureNotes[abcIdx]).data("note", voice[i]);

      //save the svg element to the note itself
      voice[i].svgElements.push(measureNotes[abcIdx]);
      
      //check if the note spans across measure
      if (measureBeat + voice[i].rhythm > that.measureDuration) {
        var diff = that.measureDuration - measureBeat;
        var overflow = voice[i].rhythm - diff;
        abcIdx = 0;
        curMeasure++;
        //change the beat to the overflow
        measureBeat = overflow;

        //set the measure notes
        measureNotes = $(id).find(".note.m" + curMeasure + ".v" + voiceNum);

        //add the note to the sheetNotes data
        $(measureNotes[abcIdx]).data("note", voice[i]);
        
        //add the sheet note to the note
        voice[i].svgElements.push(measureNotes[abcIdx]);
        abcIdx++;
      }
      //otherwise add like normal
      else {
        abcIdx++;

        //check if the note was split in two for the sheet music
        if(measureBeat > 0 && measureBeat < that.measureAccent && measureBeat + voice[i].rhythm > that.measureAccent) {
          //also assign next sheet note the same note
          $(measureNotes[abcIdx]).data("note", voice[i]);
          
          //add the sheet note to the note
          voice[i].svgElements.push(measureNotes[abcIdx]);
          abcIdx++;
        }

        //check if the measure has finished
        if (measureBeat + voice[i].rhythm == that.measureDuration) {
          //reset the index
          abcIdx = 0;
          curMeasure++;
          measureBeat = 0;
          //get the next measure of notes
          measureNotes = $(id).find(".note.m" + curMeasure + ".v" + voiceNum);
        }
        else {
          measureBeat += voice[i].rhythm;
        }
      }
    }
  } 

  var voices = this.getVoiceTuneList();

  assignNoteData(voices.voice1, 0);
  assignNoteData(voices.voice2, 1);
};

Musical_Piece.prototype.updateCss = function() {
  var voices = this.getVoiceTuneList();

  var v = voices.voice1;
  for (var i = 0; i < v.length; i++) {
    v[i].updateCss();
  }

  v = voices.voice2;
  for (var i = 0; i < v.length; i++) {
    v[i].updateCss();
  }

}

Musical_Piece.prototype.match = function(notes) {
  
  //find the closest value in the object to the query
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
  
  //get the max score from the possible raw scores
  function max(diag, left, top) {
    if (diag.raw >= left.raw && diag.raw >= top.raw) {
      return diag;
    }
    
    if (left.raw >= diag.raw && left.raw >= top.raw) {
      return left;
    }
    
    if (top.raw >= diag.raw && top.raw >= left.raw) {
      return top;
    }
  }
  
  //Generate the edit distance matrix
  function generateMatrix(expectedNotes, givenNotes) {
    var mat = [];
    for (i = 0; i < expectedNotes.length + 1; i++) {
      mat.push(new Array(givenNotes.length + 1));
      mat[i][0] = {
        raw: MATCH_SCORES.INSERTION_DELETION * i,
        dir: MatchDirection.TOP
      };

      if (i > 0) {
        mat[i][0].expected = expectedNotes[i-1].tone;
        mat[i][0].expectedRhythm = expectedNotes[i-1].rhythm
      }
    }
    
    for (j = 0; j < givenNotes.length + 1; j++) {
      mat[0][j] = {
        raw: MATCH_SCORES.INSERTION_DELETION * j,
        dir: MatchDirection.LEFT
      };
    }
    
    return mat;
  }

  var separationNote = MIDDLE_C + keys[this.key];
  var tuneList = flatTuneListSeparatedByNote(this.piece, separationNote);
  var matrix1 = generateMatrix(tuneList.lower, notes.lower);
  var matrix2 = generateMatrix(tuneList.upper, notes.upper);
  

  //The edit distance algorithm to match the pieces
  function matchVoice(expectedNotes, givenNotes, matrix) {
      var diag, left, top, final;

      for (i = 1; i < matrix.length; i++) {
        for (j = 1; j < matrix[i].length; j++) {
          diag = expectedNotes[i-1].match(givenNotes[j-1]);
          diag.raw += matrix[i-1][j-1].raw;
          
          left = {
            raw: MATCH_SCORES.INSERTION_DELETION + matrix[i][j-1].raw,
            dir: MatchDirection.LEFT,
            expected: expectedNotes[i-1].tone,
            expectedRhythm: expectedNotes[i-1].rhythm
          };
          
          top = {
            raw: MATCH_SCORES.INSERTION_DELETION + matrix[i-1][j].raw,
            dir: MatchDirection.TOP,
            expected: expectedNotes[i-1].tone,
            expectedRhythm: expectedNotes[i-1].rhythm
          };
          
          final = max(diag, left, top);
          
          matrix[i][j] = final;
        }
      }
      
      var results = {
        expectedNotes: expectedNotes, 
        notes: [],
        scores: [],
        totals: {
          notesMissed: 0,
          notesHit: 0,
          rhythmsHit: 0,
          rhythmsMissed: 0,
          overallAccuracy: 0
        },
      };
      
      var current;
      var i = matrix.length - 1;
      var j = matrix[i].length - 1;
      
      while(i > 0 || j > 0) {
        current = matrix[i][j];
        var expectedNote = expectedNotes[i-1];
        var actualNote = givenNotes[j-1];
        
        if (current.dir == MatchDirection.DIAG) {
          //expectedNote.setPerformanceNote(actualNote.tone);
          expectedNote.performedTone = actualNote.tone;

          results.notes.unshift(actualNote);
          results.scores.unshift(current);
          if(current.tone == MATCH_SCORES.TONE_MATCH) {
            results.totals.notesHit++;
          }
          else {
            results.totals.notesMissed++;
          }
          
          if (current.rhythm == MATCH_SCORES.RHYTHM_MATCH) {
            //expectedNote.setPerformedRhythm(expectedNote.rhythm);
            expectedNote.performedRhythm = expectedNote.rhythm;
            results.totals.rhythmsHit++;
          }
          else {
            //expectedNote.setPerformedRhythm(findClosest(actualNote.rhythm, NoteRhythms));
            expectedNote.performedRhythm = findClosest(actualNote.rhythm, NoteRhythms);
            results.totals.rhythmsMissed++;
          }
          i--;
          j--;
        }
        else if (current.dir == MatchDirection.LEFT) {
          //Note insertion on user's side, we ignore it.
          j--;
        }
        else if (current.dir == MatchDirection.TOP) {
          //Note deletion, count as the user resting.
          //expectedNote.setPerformanceNote(REST);
          //expectedNote.setPerformedRhythm(0);
          expectedNote.performedRhythm = 0;
          expectedNote.performedTone = REST;
          results.notes.unshift(new Note({tone: REST, rhythm: expectedNote.rhythm}));
          results.scores.unshift(current);
          results.totals.notesMissed ++;
          results.totals.rhythmsMissed ++;
          i--;
        }
        
      }
      
      while (i > 0) {
        results.notes.unshift(new Note({tone: REST, rhythm: expectedNotes[i-1].rhythm}));
        results.scores.unshift(matrix[i][j]);
        results.totals.notesMissed++;
        results.totals.rhythmsMissed++;
        i--;
      }
      
      results.totals.overallAccuracy = 
        (results.totals.notesHit + results.totals.rhythmsHit) /
        (results.notes.length * 2) * 100;
      
      return results;
  }
  
  //var results = 
  
  matchVoice(tuneList.lower, notes.lower, matrix1);
  matchVoice(tuneList.upper, notes.upper, matrix2);
  return {};
  
};

Musical_Piece.prototype.getAccuracies = function() {
  var voices = this.getVoiceTuneList();
  var v = voices.voice1;

  function updateAccuracies(accuracies, result) {
    if (result == undefined) {
      return accuracies;
    }

    if (accuracies[result.musicType] == undefined) {
      accuracies[result.musicType] = {hit: 0, num: 0};
    }

    

    accuracies[result.musicType].hit += result.hit;
    accuracies[result.musicType].num ++;

    return accuracies;
  }


  var rhythmAccuracies = {};
  var noteAccuracies = {};
  var intervalAccuracies = {};

  var rhythmsHit = 0;
  var notesHit = 0;
  var intervalsHit = 0;
  var numIntervals = 0;
  var numNotes = 0;

  var lastTone = undefined;
  for (var i = 0; i < v.length; i++) {
    var results = v[i].getAccuracies(lastTone);

    if (results != undefined) {
      //get accuracies by category
      rhythmAccuracies = updateAccuracies(rhythmAccuracies, results.rhythm);
      noteAccuracies = updateAccuracies(noteAccuracies, results.note);
      intervalAccuracies = updateAccuracies(intervalAccuracies, results.interval);

      //get total accuracies
      rhythmsHit += results.rhythm.hit;
      notesHit += results.note.hit;
      intervalsHit += results.interval != undefined ? results.interval.hit : 0;
      numIntervals += results.interval != undefined ? 1 : 0;
      
      lastTone = v[i];
      numNotes++;
    }
  }

  v = voices.voice2;
  var lastTone = undefined;
  for (var i = 0; i < v.length; i++) {
    var results = v[i].getAccuracies(lastTone);

    if (results != undefined) {
      //get accuracies by category
      rhythmAccuracies = updateAccuracies(rhythmAccuracies, results.rhythm);
      noteAccuracies = updateAccuracies(noteAccuracies, results.note);
      intervalAccuracies = updateAccuracies(intervalAccuracies, results.interval);

      //get total accuracies
      rhythmsHit += results.rhythm.hit;
      notesHit += results.note.hit;
      intervalsHit += results.interval != undefined ? results.interval.hit : 0;
      numIntervals += results.interval != undefined ? 1 : 0;
      
      lastTone = v[i];
      numNotes++;
    }
  }

  var bundle = {
    rhythms: {
      accuracies: rhythmAccuracies,
      num: numNotes,
      hit: rhythmsHit
    }, 
    notes: {
      accuracies: noteAccuracies,
      num: numNotes,
      hit: notesHit
    },
    intervals: {
      accuracies: intervalAccuracies,
      num: numIntervals,
      hit: intervalsHit
    }
  };

  return bundle;
}

Musical_Piece.prototype.generatePhrase = function(startMeasure, endMeasure, hand, possibleIntervals) {
  var tones = [];
  
  //offset from c
  var baseOfKey = keys[this.key];
  //base of octave
  var baseTone = hand == 'l' ? LOW_C : MIDDLE_C;
  baseTone += baseOfKey;

  function getPossibleIntervalsForChord(chord, intervals) {
    //Get either major or minor chord intervals
    var chordIntervals = chord.type == 'M' ? MajorChordIntervals : MinorChordIntervals;
    
    //map the intervals to the key by taking the interval of the base note of the chord
    var chordIntervalsMappedToKey = chordIntervals.map(function(i) {
        return chord.interval + i;
    });

    var possibleIntervals = [];
    //find all intervals that the chord hits that are within the interval range
    for(var i = 0; i < intervals.length; i++) {
      for(var j = 0; j < chordIntervalsMappedToKey.length; j++) {
        if(intervals[i] == chordIntervalsMappedToKey[j]) {
          possibleIntervals.push(intervals[i]);
          break;
        }
      }
    }

    return possibleIntervals;
  }

  var that = this;

  //the last note's interval index (to use to get the interval of the next note)
  var lastIntervalIdx = 0;
  
  //the possible intervals for the next note
  var possibleNextIntervals;
  //the possible intervals for the next chord note
  var possibleNextChordIntervals;

  //Get the intervals that absolutely need to be in the song of this level  
  var intervalsNeeded = intervalLevels.getCurrentChoicesStrict();
  
  //Make a checklist to keep track of the intervals that have been picked so far
  var intervalsCheckList = [];
  for (var i = 0; i < intervalsNeeded.length; i++) {
      intervalsCheckList.push(false);
  }

  function generateMeasureNotes(possibleIntervals, curMeasure) {
    var tones = [];
    var rhythms = that.rhythms[curMeasure];
    var chord = that.chords[curMeasure];
    
    //get all intervals that the chord hits that are within the interval range 
    var chordIntervals = getPossibleIntervalsForChord(chord, possibleIntervals);
    
    chordIntervals = chordIntervals;
    var pIntervals = possibleIntervals;

    //get the current time in the song
    var time = curMeasure*that.measureDuration;
    
    //generate first note by taking an interval that is in the chord      
    var interval;
        
    //get the intervals allowed in this level
    var possibleIndices = intervalLevels.getCurrentChoices();
    
    //generate next notes
    for(var i = 0; i < rhythms.length; i++) {
      //Make sure last note of the song ends on a chord note
      //Start the first measure on a chord note
      if (i == 0 && curMeasure == startMeasure) {
          interval = chordIntervals[Math.random()*chordIntervals.length << 0];  
          lastIntervalIdx = possibleIntervals.indexOf(interval);//interval
      }
      //start all measures on a chord note and end the song on a chord note
      else if(i == 0 || (i == rhythms.length - 1 && curMeasure == that.numMeasures - 1)) {
        //get the possible chord intervals that are within the jump range of the interval level
        possibleNextChordIntervals = getPossibleIntervalsForChord(chord, possibleNextIntervals);
        interval = possibleNextChordIntervals[Math.random()*possibleNextChordIntervals.length << 0];
        //If no such interval exists, then just pick a random one
        if (interval == undefined) {
            interval = chordIntervals[Math.random()*chordIntervals.length << 0];
        }
      }
      //otherwise, pick any interval that is within the level
      else {
        interval = possibleNextIntervals[Math.random()*possibleNextIntervals.length << 0];
        if (interval == undefined) {
          alert("UNDEFINED");
        }
      }
      
      //create the note
      tone = baseTone + interval;
      var note = new SingleNote({
          tone: tone, 
          rhythm: rhythms[i], 
          hand: hand, 
          interval: Math.abs(lastIntervalIdx - possibleIntervals.indexOf(interval))
      });
      
      //check if it is a needed interval
      if (intervalsNeeded.indexOf(note.interval) != -1) {
          intervalsCheckList[intervalsNeeded.indexOf(note.interval)] = true;
      }
      
      //get the index of the interval so we can calculate the interval of the next note
      lastIntervalIdx = possibleIntervals.indexOf(interval);
      
      //Put fingering on the note if it is the first one in the piece
      if (i == 0 && curMeasure == startMeasure) {
        note.setFingering(hand == "l" ? 5 - lastIntervalIdx : lastIntervalIdx + 1);
      }
      
      //add note to piece
      that.addToPiece(time, note);
      
      //add the rhythm to time
      time+= rhythms[i];
      
      possibleNextIntervals = [];
      //first see if there are any intervals that are of the strict current level. If 
      //there are and they have not been selected yet, only put those in the possible
      //next intervals.
      for (var j = 0; j < possibleIntervals.length; j++) {
          var diff = Math.abs(j - lastIntervalIdx);
          var idx = intervalsNeeded.indexOf(diff);
          //if it is a needed interval that has not been selected yet
          if (idx != -1 && intervalsCheckList[idx] == false)  {
              possibleNextIntervals.push(possibleIntervals[j]);           
          }
      }
      
      possibleNextChordIntervals = getPossibleIntervalsForChord(chord, possibleNextIntervals);
        
      //only fill up the intervals with other intervals if there were no needed intervals
      if (possibleNextIntervals.length == 0 || possibleNextChordIntervals.length == 0) {
          for (var j = 0; j < possibleIntervals.length; j++) {
              var diff = Math.abs(j - lastIntervalIdx);
                
              if (possibleIndices.indexOf(diff) != -1) {
                  possibleNextIntervals.push(possibleIntervals[j]);
              }
          }
      }
      possibleNextChordIntervals = getPossibleIntervalsForChord(chord, possibleNextIntervals);
      
    }

    //return tones;
  } 

  for(var i = startMeasure; i <= endMeasure; i++) {
    generateMeasureNotes(possibleIntervals, i);
  }
  
  //check if the needed intervals were met
  var allNeededIntervalsMet = false;
  for (var i = 0; i < intervalsCheckList.length; i++) {
      allNeededIntervalsMet = allNeededIntervalsMet || intervalsCheckList[i];
  }
  
  return allNeededIntervalsMet;
}

Musical_Piece.prototype.addRests = function(startMeasure, endMeasure, hand) {
  
  //for (var i = startMeasure; i <= endMeasure; i++) {
    var note = new SingleNote({tone: REST, rhythm: this.measureDuration*(endMeasure - startMeasure + 1), hand: hand});
    var time = i*this.measureDuration;
    this.addToPiece(startMeasure*this.measureDuration, note);
  //}

};

Musical_Piece.prototype.getType = function() {
  throw new Error("CANNOT CALL ABSTRACT FUNCTION");
}

//all subclasses of musical piece

function SeparateHandPiece(config) {
  Musical_Piece.call(this, config);
}

SeparateHandPiece.prototype = Object.create(Musical_Piece.prototype);
SeparateHandPiece.prototype.constructor = SeparateHandPiece;

SeparateHandPiece.prototype.generatePiece = function() {
  var iterations = 0;
  do {
    this.piece = {};
    var rightThumbPosition = Math.random() * 3 << 0;
    var rlowestIntervalIdx = rightThumbPosition;
    var rhighestIntervalIdx = rightThumbPosition + 5;
    var possibleIntervalsR = NoteIntervals.slice(rlowestIntervalIdx, rhighestIntervalIdx);
    var rIntervalsMet = this.generatePhrase(0, 1, 'r', possibleIntervalsR);
    this.addRests(0,1,'l');


    var leftPinkyPosition = Math.random() * 3 << 0;
    var llowestIntervalIdx = leftPinkyPosition;
    var lhighestIntervalIdx = leftPinkyPosition + 5;
    var possibleIntervalsL = NoteIntervals.slice(llowestIntervalIdx, lhighestIntervalIdx);
    var lIntervalsMet = this.generatePhrase(2, 3, 'l', possibleIntervalsL);
    this.addRests(2,3, 'r');
    iterations++;
  }
  while(!rIntervalsMet && !lIntervalsMet && iterations < 100);
};

SeparateHandPiece.prototype.getType = function() {
  return "SeparateHandPiece";
}

function ChordPiece(config) {
  Musical_Piece.call(this, config);
}

ChordPiece.prototype = Object.create(Musical_Piece.prototype);
ChordPiece.prototype.constructor = ChordPiece;

ChordPiece.prototype.generatePiece = function() {
  var iterations = 0;
  do {
    var rightThumbPosition = Math.random() * 4 << 0;
    var rlowestIntervalIdx = rightThumbPosition;
    var rhighestIntervalIdx = rightThumbPosition + 5;
    var possibleIntervalsR = NoteIntervals.slice(rlowestIntervalIdx, rhighestIntervalIdx);
    this.piece = {};
    var intervalsMet = this.generatePhrase(0, 3, 'r', possibleIntervalsR);
    iterations++;
  }while(!intervalsMet && iterations < 100);
  
  this.generateLeftHandChords();
}

ChordPiece.prototype.generateLeftHandChords = function() {
  throw new Error("CANNOT CALL ABSTRACT FUNCTION");
}

//subclasses of chord piece
function TriadPiece(config) {
  ChordPiece.call(this, config);
} 

TriadPiece.prototype = Object.create(ChordPiece.prototype);
TriadPiece.prototype.constructor = TriadPiece;

TriadPiece.prototype.generateLeftHandChords = function() {
  var baseOfKey = keys[this.key];
  var baseTone = LOW_C;
  baseTone += baseOfKey;

  for (var i = 0; i < this.numMeasures; i++) {
    var note = new Triad({tone: baseTone + this.chords[i].interval, chord: this.chords[i], rhythm: this.measureDuration, hand: 'l'});
    var time = i*this.measureDuration;
    this.addToPiece(time, note);
  }
}

TriadPiece.prototype.getType = function() {
  return "TriadPiece";
};

function SuspendedChordPiece(config) {
  ChordPiece.call(this, config);
}

SuspendedChordPiece.prototype = Object.create(ChordPiece.prototype);
SuspendedChordPiece.prototype.constructor = SuspendedChordPiece;

SuspendedChordPiece.prototype.generateLeftHandChords = function() {
  var baseOfKey = keys[this.key];
  var baseTone = LOW_C;
  baseTone += baseOfKey;

  var note = new Triad({tone: baseTone + this.chords[0].interval, chord: this.chords[0], rhythm: this.measureDuration, hand: 'l'});
  var time = 0;
  this.addToPiece(time, note);

  for (var i = 1; i < this.numMeasures - 1; i++) {
    note = new SuspendedChord({tone: baseTone + this.chords[i].interval, chord: this.chords[i], rhythm: this.measureDuration, hand: 'l'});
    time = i*this.measureDuration;
    this.addToPiece(time, note);  
  }

  var lastMeasure = this.numMeasures - 1;
  var note = new Triad({tone: baseTone + this.chords[lastMeasure].interval, chord: this.chords[lastMeasure], rhythm: this.measureDuration, hand: 'l'});
  var time = lastMeasure*this.measureDuration;
  this.addToPiece(time, note);
};

SuspendedChordPiece.prototype.getType = function() {
  return "SuspendedChordPiece";
};

function InvertedChordPiece(config) {
  ChordPiece.call(this, config);
}

InvertedChordPiece.prototype = Object.create(ChordPiece.prototype);
InvertedChordPiece.prototype.constructor = InvertedChordPiece;

InvertedChordPiece.prototype.generateLeftHandChords = function() {
  var baseOfKey = keys[this.key];
  var baseTone = LOW_C;
  baseTone += baseOfKey;

  var note = new Triad({tone: baseTone + this.chords[0].interval, chord: this.chords[0], rhythm: this.measureDuration, hand: 'l'});
  var time = 0;
  this.addToPiece(time, note);

  for (var i = 1; i < this.numMeasures - 1; i++) {
    note = new InvertedChord({tone: baseTone + this.chords[i].interval, chord: this.chords[i], rhythm: this.measureDuration, hand: 'l'});
    time = i*this.measureDuration;
    this.addToPiece(time, note);  
  }

  var lastMeasure = this.numMeasures - 1;
  var note = new Triad({tone: baseTone + this.chords[lastMeasure].interval, chord: this.chords[lastMeasure], rhythm: this.measureDuration, hand: 'l'});
  var time = lastMeasure*this.measureDuration;
  this.addToPiece(time, note);  
}

InvertedChordPiece.prototype.getType = function() {
  return "InvertedChordPiece";
};

function MixedChordPiece(config) {
  
}

function LegatoChordPiece(config) {
  ChordPiece.call(this, config);
}

LegatoChordPiece.prototype = Object.create(ChordPiece.prototype);
LegatoChordPiece.prototype.constructor = LegatoChordPiece;

LegatoChordPiece.prototype.generateLeftHandChords = function() {
  var baseOfKey = keys[this.key];
  var baseTone = LOW_C;
  baseTone += baseOfKey;
  var time = 0;
  for (var i = 0; i < this.numMeasures; i++) {
    var note = new Triad({tone: baseTone + this.chords[i].interval, chord: this.chords[i], rhythm: this.measureDuration, hand: 'l'});
    var measureBeat = 0;
    var idx = 0;
    var goingUp = true;
    while (measureBeat + NoteRhythms.QUARTER <= this.measureDuration) {
        note.tone[idx].rhythm = NoteRhythms.QUARTER;
        this.addToPiece(time, note.tone[idx]);
        time+=NoteRhythms.QUARTER;
        measureBeat+= NoteRhythms.QUARTER;
        
        if (goingUp) {
            if (idx + 1 == note.tone.length) {
                goingUp = false;
                idx = idx - 1;
            }
            else {
                idx = idx + 1;
            }
        }
        else {
            if (idx - 1 < 0) {
                goingUp = true;
                idx = idx + 1;
            }
            else {
                idx = idx - 1;
            }
        }
        //idx = (idx + 1) % note.tone.length;
    }
  }
};

LegatoChordPiece.prototype.getType = function() {
  return "LegatoChordPiece";
};

//end chordPieces


function HandsTogetherPiece(config) {
  Musical_Piece.call(this, config);
}


HandsTogetherPiece.prototype = Object.create(Musical_Piece.prototype);
HandsTogetherPiece.prototype.constructor = HandsTogetherPiece;

HandsTogetherPiece.prototype.generatePiece = function() {
  var iterations = 0;
  do {
  
    var rightThumbPosition = Math.random() * 4 << 0;
    var rlowestIntervalIdx = rightThumbPosition;
    var rhighestIntervalIdx = rightThumbPosition + 5;
    var possibleIntervalsR = NoteIntervals.slice(rlowestIntervalIdx, rhighestIntervalIdx);
    var rIntervalsMet = this.generatePhrase(0, 3, 'r', possibleIntervalsR);
    

    var leftPinkyPosition = Math.random() * 4 << 0;
    var llowestIntervalIdx = leftPinkyPosition;
    var lhighestIntervalIdx = leftPinkyPosition + 5;
    var possibleIntervalsL = NoteIntervals.slice(llowestIntervalIdx, lhighestIntervalIdx);
    var lIntervalsMet = this.generatePhrase(0, 3, 'l', possibleIntervalsL);
    iterations++;
  }while(!rIntervalsMet && !lIntervalsMet && iterations < 100);

};

HandsTogetherPiece.prototype.getType = function() {
  return "HandsTogetherPiece";
}


function HandsTogetherComplexPiece() {

}

