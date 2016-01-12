
function renderSong(piece, location, color) {
  $(location).empty();
  var canvas = $(location)[0];
  console.log(location);
  console.log(canvas);
  var renderer = new Vex.Flow.Renderer(canvas,
  Vex.Flow.Renderer.Backends.RAPHAEL);
  
  
  console.log(renderer);
  renderer.ctx.setFillStyle(color);
  renderer.ctx.setStrokeStyle(color);
  var artist = new Artist(10, 10, 900, {scale: 1.0});

  var vextab = new VexTab(artist);

  try {
   console.log(piece.vexdump());
   var elements = vextab.parse(piece.vexdump());
   console.log(elements);
   artist.render(renderer);
  }
  catch (e) {
    console.log(e.message);
  }
}

function testPieceMatch(expectedNotes, actualNotes, testNum) {
  
  var pieceOneConfig = {
    time: "4/4",
    clef: "treble",
    key: "C",
    notes: expectedNotes,
    isSharpKey: true
  };
  
  console.log(pieceOneConfig);
  
  var pieceTwoConfig = {
    time: "4/4",
    clef: "treble",
    key: "C",
    notes: actualNotes,
    isSharpKey: true
  };
  
  console.log(pieceTwoConfig);
  
  var expectedPiece = new Musical_Piece(pieceOneConfig);
  renderSong(expectedPiece, "#expected" + testNum, "black");
  var actualPiece = new Musical_Piece(pieceTwoConfig);
  renderSong(actualPiece, "#actual" + testNum, "blue");
  var matchResults = expectedPiece.match(actualPiece);
  
  var matchedPieceConfig = {
    time: "4/4",
    clef: "treble",
    key: "C",
    notes: matchResults.notes,
    isSharpKey: true
  };
  
  var matchPiece = new Musical_Piece(matchedPieceConfig);
  
  renderSong(matchPiece, "#matched" + testNum, "red");
  
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