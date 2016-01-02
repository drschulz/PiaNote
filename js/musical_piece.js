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
        console.log(staveNote);
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
    this.piece.notes.forEach(function(e) {
      var tone = midiToNote(e.tone);
      var sheetNote;
      
      if (tone.note['n'] !== undefined) {
        sheetNote = getSheetNote(tone.note, 'n');
      }
      else {
        sheetNote = that.piece.isSharpKey ? getSheetNote(tone.note, '#') : getSheetNote(tone.note, '@');
      }
      
      vextab += ":" + e.rhythm + " " + sheetNote + "/" + tone.octave + " ";
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
    
    for (i = 0; i < that.piece.notes.length + 1; i++) {
      mat.push(new Array(notes.piece.length + 1));
      mat[i][0] = {
        raw: MATCH_SCORES.INSERTION_DELETION * (i + 1),
        dir: MatchDirection.TOP
      };
    }
    
    for (j = 0; j < notes.piece.length + 1; i++) {
      mat[0][j] = {
        raw: MATCH_SCORES.INSERTION_DELETION * (j + 1),
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
  
  
  for (i = matrix.length - 1; i > 0; i++) {
    for (j = matrix[i].length - 1; j > 0; j++) {
      
    }
  }
  
  
  
  
  
  
};