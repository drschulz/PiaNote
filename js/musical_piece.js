function Musical_Piece(config) {
  this.piece = config;
}

Musical_Piece.prototype.vexdump = function() {
  var that = this;
  var currentAccidentals = (function() { 
    var staveNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    var accidentals = {
      C: 'n',
      D: 'n',
      E: 'n',
      F: 'n',
      G: 'n',
      A: 'n',
      B: 'n'};
    
    var indx;
  
    if (that.piece.isSharpKey) {
      indx = sharpKeys.indexOf(that.piece.key);
      
      for(i = 0; i < indx; i++) {
        staveNote = (3 + 4*i)%7;
        accidentals[staveNotes[(3 + 4*i)%7]] = '#';
      }
    }
    else {
      indx = flatKeys.indexOf(that.piece.key);
      
      for (i = 0; i < indx; i++) {
        accidentals[staveNotes[(7 + 3*i)%7]] = '@';
      }
    }
    
    return accidentals;
  })();
  
  function getSheetNote(tone, accidental) {
    var baseNote = tone[accidental];
    
    if (currentAccidentals[baseNote] != accidental) {
      currentAccidentals[baseNote] = accidental;
      return baseNote + accidental;
    }
    
    return baseNote;
  }
  
  //spacing
  var vextab = "options space=20\n";
  
  //piece information
  vextab += "stave tablature=false time=" + this.piece.time 
    + " key=" + this.piece.key + " clef=" + this.piece.clef + "\n";
    
  //notes  
  if (this.piece.notes.length > 0) {
    vextab += "notes ";
    var measureRhythm = 0;
    this.piece.notes.forEach(function(e) {
      var sheetNote;
      if (e.tone == REST) {
        sheetNote = "##";
      }
      else {
        var tone = midiToNote(e.tone);
        var sheetNote;
        
        if (tone.note['n'] !== undefined) {
          sheetNote = getSheetNote(tone.note, 'n');
        }
        else {
          sheetNote = that.piece.isSharpKey ? getSheetNote(tone.note, '#') : getSheetNote(tone.note, '@');
        }
        
        sheetNote += "/" + tone.octave;
      }
      
      if (measureRhythm + rhythmMap[e.rhythm] > 4) {
        var difference = 4 - measureRhythm;
        if (difference > 0) {
          vextab += ":" + rhythmToString[difference] + " ## "; 
        }
        vextab += "| ";
        measureRhythm = 0;
      }
      measureRhythm += rhythmMap[e.rhythm];
      
      vextab += ":" + e.rhythm + " " + sheetNote + " ";
    });
    
    vextab += "\n";
  }
  //text above notes if needed
  //if (this.piece.textOn) {
    vextab += "text ";
    
    this.piece.notes.forEach(function(e) {
      vextab += e.vextext() + ", ";
    });
    vextab += ":";
    vextab += "\n";
  //}
  
  vextab += "options space=45\n";
    
  return vextab;
};


Musical_Piece.prototype.abcDump = function() {
  var that = this;
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
        accidentals[staveNotes[(7 + 3*i)%7]] = '_';
      }
    }
    
    return accidentals;
  })();
  
  function getSheetNote(tone, accidental) {
    var baseNote = tone[accidental];
    
    if (currentAccidentals[baseNote] != accidental) {
      currentAccidentals[baseNote] = accidental;
      return accidental + baseNote;
    }
    
    return baseNote;
  }
  
  var abc = "";
  
  //initial stuff
  abc += "M: " + this.piece.time + "\n" 
       + "L: 1/16\n" 
       + "K: " + this.piece.key + "\n"
       + "V: V1 clef=treble\n"
       + "V: V2 clef=bass\n";
       
  
  //voice 1
  abc += "[V: V1]";
  
  //voice 1 notes  
  if (this.piece.voice1.length > 0) {
    var measureRhythm = 0;
    this.piece.voice1.forEach(function(e) {
      var sheetNote;
      if (e.tone == REST) {
        sheetNote = "z";
      }
      else {
        var tone = midiToNote(e.tone);
        //var sheetNote;
        
        if (tone.note['='] !== undefined) {
          sheetNote = getSheetNote(tone.note, '=');
        }
        else {
          sheetNote = that.piece.isSharpKey ? getSheetNote(tone.note, '^') : getSheetNote(tone.note, '_');
        }
        
        sheetNote += abcOctave[tone.octave];
      }
      
      if (measureRhythm + rhythmMap[e.rhythm] > 4) {
        var difference = 4 - measureRhythm;
        if (difference > 0) {
          abc += " z" + rhythmABC[rhythmToString[difference]] + " ";
         
        }
        abc += "| ";
        measureRhythm = 0;
      }
      measureRhythm += rhythmMap[e.rhythm];
      
      abc += sheetNote + rhythmABC[e.rhythm] + " ";
    });
    
  
  }
  abc += "|\n[V: V2]";
  if (this.piece.voice2 !== undefined && this.piece.voice2.length > 0) {
    var measureRhythm = 0;
    this.piece.voice2.forEach(function(e) {
      var sheetNote;
      if (e.tone == REST) {
        sheetNote = "z";
      }
      else {
        var tone = midiToNote(e.tone);
        //var sheetNote;
        
        if (tone.note['='] !== undefined) {
          sheetNote = getSheetNote(tone.note, '=');
        }
        else {
          sheetNote = that.piece.isSharpKey ? getSheetNote(tone.note, '^') : getSheetNote(tone.note, '_');
        }
        
        sheetNote += abcOctave[tone.octave];
      }
      
      if (measureRhythm + rhythmMap[e.rhythm] > 4) {
        var difference = 4 - measureRhythm;
        if (difference > 0) {
          abc += " z" + rhythmABC[rhythmToString[difference]] + " ";
         
        }
        abc += "| ";
        measureRhythm = 0;
      }
      measureRhythm += rhythmMap[e.rhythm];
      
      abc += sheetNote + rhythmABC[e.rhythm] + " ";
    });
    
    abc += "|";
  }
  console.log(abc);
  
  return abc;
  
  /*return "X: 1\n"
  + "T: Test\n"
  + "M: 4/4\n"
  + "L: 1/4\n"
  + "%%staves (1) (2)\n"
  + "K: Bb\n"
  + "V: 1\n"
  + "B A C G | E A A C |\n"
  + "V: 2\n"
  + "[K: Bb bass] A,, G,,/B,,/ C,//F,//C,//F,// C, |   A, D, G,, C,|";*/
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
            dir: MatchDirection.LEFT
          };
          
          top = {
            raw: MATCH_SCORES.INSERTION_DELETION + matrix[i-1][j].raw,
            dir: MatchDirection.TOP
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

  //return voice1Results;
  return [voice1Results, voice2Results];
  
};