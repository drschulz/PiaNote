
function renderSong(piece, location, color) {
  tuneObjectArray = ABCJS.renderAbc(location, piece.abcDump(), {},{add_classes: true },{});
}

function testPieceMatch(expectedNotes, actualNotes, testNum) {
  
  var pieceOneConfig = {
    time: "4/4",
    clef: "treble",
    key: "C",
    voice1: expectedNotes,
    voice2: [],
    isSharpKey: true
  };
  
  console.log(pieceOneConfig);
  
  var pieceTwoConfig = {
    time: "4/4",
    clef: "treble",
    key: "C",
    voice1: actualNotes,
    voice2: [],
    isSharpKey: true
  };
  
  console.log(pieceTwoConfig);
  
  var expectedPiece = new Musical_Piece(pieceOneConfig);
  renderSong(expectedPiece, "expected" + testNum, "black");
  var actualPiece = new Musical_Piece(pieceTwoConfig);
  renderSong(actualPiece, "actual" + testNum, "blue");
  var matchResults = expectedPiece.match(actualPiece);
  
  var matchedPieceConfig = {
    time: "4/4",
    clef: "treble",
    key: "C",
    voice1: matchResults[0].notes,
    
    isSharpKey: true
  };
  
  var matchPiece = new Musical_Piece(matchedPieceConfig);
  
  renderSong(matchPiece, "matched" + testNum, "red");
  
}

function testMatchDifferentRhythms() {
  var notes = [64, 62, 60, 62, 64, 64, 64, 62, 62, 62, 64, 67, 67];
  var rhythms = ["q", "q", "q", "q", "q", "q", "h", "q", "q", "h", "q", "q", "h"];
  
  var expectedNotes = [];
  var actualNotes = [];
  for(i = 0; i < notes.length; i++) {
    expectedNotes.push(new Note({tone: notes[i], rhythm: rhythms[i]}));
    actualNotes.push(new Note({tone: notes[i], rhythm: "q"}));
  }
  
  testPieceMatch(expectedNotes, actualNotes, 1);
}

function testMatchDifferentNotes() {
  var notes = [64, 62, 60, 62, 64, 64, 64, 62, 62, 62, 64, 67, 67];
  var rhythms = ["q", "q", "q", "q", "q", "q", "h", "q", "q", "h", "q", "q", "h"];
  
  var expectedNotes = [];
  var actualNotes = [];
  for(i = 0; i < notes.length; i++) {
    expectedNotes.push(new Note({tone: notes[i], rhythm: rhythms[i]}));
    actualNotes.push(new Note({tone: notes[i] + 2, rhythm: rhythms[i]}));
  }
  
  testPieceMatch(expectedNotes, actualNotes, 2);
}

function testMatchSlipHand() {
  var notes = [64, 62, 60, 62, 64, 64, 64, 62, 62, 62, 64, 67, 67];
  var rhythms = ["q", "q", "q", "q", "q", "q", "h", "q", "q", "h", "q", "q", "h"];
  
  var expectedNotes = [];
  var actualNotes = [];
  for(i = 0; i < notes.length; i++) {
    expectedNotes.push(new Note({tone: notes[i], rhythm: rhythms[i]}));
    if (i == 2 || i == 5 || i == 7) {
      actualNotes.push(new Note({tone: notes[i] - 1, rhythm: "16"}));
    }
    actualNotes.push(new Note({tone: notes[i], rhythm: rhythms[i]}));
  }
  
  console.log(expectedNotes);
  console.log(actualNotes);
  
  testPieceMatch(expectedNotes, actualNotes, 3);
}

function testMatchSomeMissed() {
  var notes = [64, 62, 60, 62, 64, 64, 64, 62, 62, 62, 64, 67, 67];
  var rhythms = ["q", "q", "q", "q", "q", "q", "h", "q", "q", "h", "q", "q", "h"];
  
  var expectedNotes = [];
  var actualNotes = [];
  for(i = 0; i < notes.length; i++) {
    expectedNotes.push(new Note({tone: notes[i], rhythm: rhythms[i]}));
    if (i == 2 || i == 5 || i == 7) {
      actualNotes.push(new Note({tone: notes[i] - 1, rhythm: rhythms[i]}));
    }
    else {
      actualNotes.push(new Note({tone: notes[i], rhythm: rhythms[i]}));  
    }
    
  }
  
  testPieceMatch(expectedNotes, actualNotes, 4);
}

function testMatchNoteSkip() {
  var notes = [64, 62, 60, 62, 64, 64, 64, 62, 62, 62, 64, 67, 67];
  var rhythms = ["q", "q", "q", "q", "q", "q", "h", "q", "q", "h", "q", "q", "h"];
  
  var expectedNotes = [];
  var actualNotes = [];
  for(i = 0; i < notes.length; i++) {
    expectedNotes.push(new Note({tone: notes[i], rhythm: rhythms[i]}));
    if (i != 2) {
      actualNotes.push(new Note({tone: notes[i], rhythm: rhythms[i]}));
    }
  }
  
  testPieceMatch(expectedNotes, actualNotes, 5);
}

function testMatchFirstNoteSkip() {
  var notes = [64, 62, 60, 62, 64, 64, 64, 62, 62, 62, 64, 67, 67];
  var rhythms = ["q", "q", "q", "q", "q", "q", "h", "q", "q", "h", "q", "q", "h"];
  
  var expectedNotes = [];
  var actualNotes = [];
  for(i = 0; i < notes.length; i++) {
    expectedNotes.push(new Note({tone: notes[i], rhythm: rhythms[i]}));
    if (i !== 0) {
      actualNotes.push(new Note({tone: notes[i], rhythm: rhythms[i]}));
    }
  }
  
  testPieceMatch(expectedNotes, actualNotes, 6);
}

function testMatching() {
  testMatchDifferentRhythms();
  testMatchDifferentNotes();
  testMatchSlipHand();
  testMatchSomeMissed();
  testMatchNoteSkip();
  testMatchFirstNoteSkip();
}

function initializeMaps() {
  midiMap = new MidiMap();
}

window.addEventListener('load', function() {   
  initializeMaps();
  testMatching();
  
});