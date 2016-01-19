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
  if (this.piece.textOn) {
    vextab += "text 0.1";
    
    this.piece.notes.forEach(function(e) {
      vextab += ", " + e.vextext();
    });
    
    vextab += "\n";
  }
  
  vextab += "options space=45\n";
    
  return vextab;
};


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
  
  var matrix = (function() {
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
  })();
  
  var diag, left, top, final;
  
  for (i = 1; i < matrix.length; i++) {
    for (j = 1; j < matrix[i].length; j++) {
      diag = this.piece.notes[i-1].match(notes.piece.notes[j-1]);
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
    var expectedNote = this.piece.notes[i-1];
    var actualNote = notes.piece.notes[j-1];
    
    if (current.dir == MatchDirection.DIAG) {
      results.notes.unshift(actualNote);
      results.scores.unshift(current);
      if(current.tone == MATCH_SCORES.TONE_MATCH) {
        results.totals.notesHit++;
      }
      else {
        results.totals.notesMissed++;
      }
      
      if (current.rhythm == MATCH_SCORES.RHYTHM_MATCH) {
        results.totals.rhythmsHit++;
      }
      else {
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
      results.notes.unshift(new Note({tone: REST, rhythm: expectedNote.rhythm}));
      results.scores.unshift(current);
      results.totals.notesMissed ++;
      results.totals.rhythmsMissed ++;
      i--;
    }
    
  }
  
  while (i > 0) {
    results.notes.unshift(new Note({tone: REST, rhythm: this.piece.notes[i-1].rhythm}));
    results.scores.unshift(matrix[i][j]);
    results.totals.notesMissed++;
    results.totals.rhythmsMissed++;
    i--;
  }
  
  results.totals.overallAccuracy = 
    (results.totals.notesHit + results.totals.rhythmsHit) /
    (results.notes.length * 2) * 100;
  
  return results;
};