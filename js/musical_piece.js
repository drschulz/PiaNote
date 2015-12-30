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
  
};