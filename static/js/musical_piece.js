function Musical_Piece(config) {
  this.piece = config;
}


//Sorts all notes in a musical piece by their time and their tone
Musical_Piece.prototype.flatTuneList = function() {
  var tune = this.piece.tune;

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

Musical_Piece.prototype.getVoiceTuneList = function() {
  var tune = this.piece.tune;

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
      console.log(notes[j]);
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

  var beatValue = WHOLE_NOTE_VALUE / this.piece.time.rhythm;
  var measureBeat = Math.floor(this.piece.time.beats / 2);
  while (measureBeat % 2 == 0) {
    measureBeat /= 2;
  }

  measureBeat *= beatValue;

  var measureDuration = this.piece.time.beats * beatValue;
  var measureAccent = Math.ceil(this.piece.time.beats / 2) * beatValue;

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
  
    if (that.piece.isSharpKey) {
      indx = sharpKeys.indexOf(that.piece.key);
      
      for(i = 0; i < indx; i++) {
        staveNote = (3 + 4*i)%7;
        //sharp
        accidentals[staveNotes[(3 + 4*i)%7]] = '^';
      }
    }
    else {
      indx = flatKeys.indexOf(that.piece.key);
      
      for (i = 0; i < indx; i++) {
        //flat
        accidentals[staveNotes[(6 + 3*i)%7]] = '_';
      }
    }
    
    return accidentals;
  })();
  
  var abc = "";
  
  //initial stuff
  abc += "M: " + this.piece.time.beats + "/" + this.piece.time.rhythm + "\n" 
       + "L: 1/" + WHOLE_NOTE_VALUE + "\n" 
       + "K: " + this.piece.key + "\n"
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
      if (measureRhythm + note.rhythm >= measureDuration) {
        successiveRhythms = 0;
      }
      //Beam if not on a beat
      else if (successiveRhythms + note.rhythm <= measureBeat && measureRhythm != measureAccent) {
        successiveRhythms += note.rhythm;
      }
      else {
        successiveRhythms = note.rhythm;
        voiceString += " ";
      }

      //Dump the note
      console.log(voice[i]);
      var bundle = voice[i].abcDump(that.piece.isSharpKey, currentAccidentals, measureRhythm, measureDuration, measureAccent);

      voiceString += bundle.sheetNote;
      currentAccidentals = bundle.accidentals;

      measureRhythm = (measureRhythm + note.rhythm) % measureDuration;
    }

    voiceString += "]\n";
    return voiceString;
  }

  var voices = this.getVoiceTuneList();
  abc += getAbcVoice(voices.voice1, "V1");
  abc += getAbcVoice(voices.voice2, "V2");
  
  return abc;
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

  var tuneList = this.flatTuneList();
  console.log(tuneList);
  var matrix1 = generateMatrix(tuneList, notes);
  

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
            expectedNote.performedRhythm = expectedNote.rhythm;
            results.totals.rhythmsHit++;
          }
          else {
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
          expectedNote.performedRhythm = REST;
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
  
  var results = matchVoice(tuneList, notes, matrix1);

  return results;
  
};