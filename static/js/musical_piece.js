function Musical_Piece(config) {
  this.piece = config;
}

Musical_Piece.prototype.abcDump = function() {
  var that = this;

  var measureDuration = (this.piece.time.beats * 4 / this.piece.time.rhythm);

  var measureAccent = Math.ceil(this.piece.time.beats / 2) * 4 / this.piece.time.rhythm;
  var maxRhythmBlock = this.piece.time.beats % 2 == 0 ? measureAccent : 1;

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
       + "L: 1/16\n" 
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
      
      //check if the rhythm goes over a measure
      /*if (measureRhythm + rhythmMap[note.rhythm] > 4) {
        var difference = 4 - measureRhythm;
        if (difference == 3) {
          voiceString += "z" + rhythmABC["h"];
          voiceString += "z" + rhythmABC["q"];
        }
        else if (difference > 0) {
          voiceString += " z" + rhythmABC[rhythmToString[difference]];
        }

        voiceString += "| ";

        measureRhythm = 0;
        successiveEighths = 0;
        successiveSixteenths = 0;
      }*/

      if (successiveRhythms + rhythmMap[note.rhythm] <= maxRhythmBlock && measureRhythm != measureAccent) {
        successiveRhythms += rhythmMap[note.rhythm];
      }
      /*//If the rhythm is an eighth note, is not the 4th one, and not on the middle of the measure attach them
      if(note.rhythm == '8' && successiveEighths <= 4 && measureRhythm != 2) {
        successiveEighths++;
        successiveSixteenths = 0;
      }
      //If the rhythm is a sixteenth note, is not the 4th one, and not on the middle of the measure attach them
      else if(note.rhythm == '16'  && successiveEighths <= 4 && measureRhythm != 2) {
        successiveSixteenths++;
        successiveEighths = 0;
      }*/ 
      else {
        successiveEighths = 0;
        successiveRhythms = 0;
        successiveRhythms += rhythmMap[note.rhythm];
        voiceString += " ";
      }

      var bundle = voice[i].abcDump(that.piece.isSharpKey, currentAccidentals, measureRhythm, measureDuration, measureAccent);

      voiceString += bundle.sheetNote;
      currentAccidentals = bundle.accidentals;

      measureRhythm = (measureRhythm + rhythmMap[note.rhythm]) % 4;
    }

    voiceString += "\n";
    return voiceString;
  }

  abc += getAbcVoice(this.piece.voice1, "V1");
  abc += getAbcVoice(this.piece.voice2, "V2");

  console.log(abc);
  
  return abc;
}

Musical_Piece.prototype.match = function(notes) {
  
  var that = this;
  
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
  
  var matrix1 = generateMatrix(this.piece.voice1, notes.piece.voice1);
  var matrix2 = generateMatrix(this.piece.voice2, notes.piece.voice2);
  
  /*var matrix1 = (function() {
    var mat = [];
    console.log(that);
    for (i = 0; i < that.piece.notes.length + 1; i++) {
      mat.push(new Array(notes.piece.notes.length + 1));
      mat[i][0] = {
        raw: MATCH_SCORES.INSERTION_DELETION * i,
        dir: MatchDirection.TOP
      };
    }
    
    for (j = 0; j < notes.piece.notes.length + 1; j++) {
      mat[0][j] = {
        raw: MATCH_SCORES.INSERTION_DELETION * j,
        dir: MatchDirection.LEFT
      };
    }
    
    return mat;
  })();*/
  
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
          results.notes.unshift(actualNote);
          results.scores.unshift(current);
          if(current.tone == MATCH_SCORES.TONE_MATCH) {
            results.totals.notesHit++;
          }
          else {
            results.totals.notesMissed++;
            //this.piece.notes[i-1].setText("Missed Note");
          }
          
          if (current.rhythm == MATCH_SCORES.RHYTHM_MATCH) {
            results.totals.rhythmsHit++;
          }
          else {
            results.totals.rhythmsMissed++;
            //this.piece.notes[i-1].setText("Missed Rhythm");
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
          results.notes.unshift(new Note({tone: REST, rhythm: expectedNote.rhythm}));
          results.scores.unshift(current);
          results.totals.notesMissed ++;
          results.totals.rhythmsMissed ++;
          //this.piece.notes[i-1].setText("Missed");
          i--;
        }
        
      }
      
      while (i > 0) {
        results.notes.unshift(new Note({tone: REST, rhythm: expectedNotes[i-1].rhythm}));
        results.scores.unshift(matrix[i][j]);
        results.totals.notesMissed++;
        results.totals.rhythmsMissed++;
        //this.piece.notes[i-1].setText("Missed");
        i--;
      }
      
      results.totals.overallAccuracy = 
        (results.totals.notesHit + results.totals.rhythmsHit) /
        (results.notes.length * 2) * 100;
      
      return results;
  }
  
  var voice1Results = matchVoice(this.piece.voice1, notes.piece.voice1, matrix1);
  var voice2Results = matchVoice(this.piece.voice2, notes.piece.voice2, matrix2);
  //var voice2Results = {};
  //return voice1Results;
  return [voice1Results, voice2Results];
  
};