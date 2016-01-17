function PiaNote(config) {
  var time = 0;
  this.previousNote = undefined;
  this.currentNote = undefined;
  var that = this;
  
  function findClosest(query, obj) {
    var best = '';
    var min = Number.MAX_VALUE;
    
    for (var value in obj) {
      var num = Math.abs(obj[value] - query);
      if (num < min) {
        min = num;
        best = value;
      }
    }
    
    return best;
  }
  
  this.updatePlayerPiece = function(noteNumber, duration) {
    if (duration === undefined) {
      var note = new Note({tone: noteNumber, rhythm: "q"});
      that.playerPiece.piece.notes.push(note);
    }
    else {
      var temp = duration / that.playerPiece.piece.tempo;
      if (temp < SHORTEST_RHYTHM) {
        return;
      }
      var closestRhythm = findClosest(temp, rhythmMap);
      that.playerPiece.piece.notes[that.playerPiece.piece.notes.length - 1].rhythm = closestRhythm;
    }
  };

  this.updateTime = function() {
    var now = performance.now();
    
    if (time !== 0) {
      var timePassed = (now - time) / 1000.0;
      if (that.previousNote !== undefined) {
        that.updatePlayerPiece(that.previousNote, timePassed);
        that.previousNote = undefined;
      }
    }
    time = now;
  };
  
  this.resetTime = function() {
    time = 0;
  };
  
  this.expectedPiece = undefined;
  this.playerPiece = undefined;
  this.pieceConfig = undefined;
  this.scoredPiece = undefined;

}

PiaNote.prototype.noteOn = function(note, velocity) {
  this.updateTime();
  this.currentNote = note;
  start = performance.now();
  
  this.updatePlayerPiece(note);
};

PiaNote.prototype.noteOff = function(note) {
  this.previousNote = note;
};

PiaNote.prototype.generateSong = function() {
  function generateIntervals() {
    var tones = [];
    var intervals = Object.keys(Intervals);
    
    var interval;
    
    for(i = 0; i < 8; i++) {
      interval = (Math.random() * intervals.length) << 0;
      tones.push(Intervals[intervals[interval]]);
    }
    
    return tones;
  }
  
  function generateKey() {
    return keys[(Math.random() * keys.length) << 0];
  }
  
  function transpose(intervals, key) {
    var tones = [];
    var baseOfKey;
    for (var indx in key) {
      baseOfKey = key[indx];
    }
    intervals.forEach(function(e) {
      tones.push(MIDDLE_C + baseOfKey + e);
    });
    
    return tones;
  }
  
  function generateTempo() {
    var bpm = BPMS[Math.random() * BPMS.length << 0];
    
    return SECONDS_IN_MINUTE / bpm;
  }
  
  this.resetTime();
  var tempo = generateTempo();
  var intervals = generateIntervals();
  var key = generateKey();
  var tones = transpose(intervals, key);
  var notes = [];
  tones.forEach(function(e) {
    notes.push(new Note({tone: e, rhythm: "q"}));
  });
  
  
  var keyLetter = Object.keys(key)[0];
  
  var config = {
    tempo: tempo,
    time: "4/4",
    clef: "treble",
    key: keyLetter,
    notes: notes,
    isSharpKey: sharpKeys.indexOf(keyLetter) > 0 ? true : false,
  };
  
  this.expectedPiece = new Musical_Piece(config);
  
  var playerConfig = {
    tempo: tempo,
    time: "4/4",
    clef: "treble",
    key: keyLetter,
    notes: [],
    isSharpKey: sharpKeys.indexOf(keyLetter) > 0 ? true : false,
  };
  
  this.playerPiece = new Musical_Piece(playerConfig);
  
  this.pieceConfig = {
    tempo: tempo,
    time: "4/4",
    clef: "treble",
    key: keyLetter,
    notes: [],
    isSharpKey: sharpKeys.indexOf(keyLetter) > 0 ? true : false,
  };
};

PiaNote.prototype.scorePerformance = function() {
  var matchResults = this.expectedPiece.match(this.playerPiece);
  
  this.pieceConfig.notes = matchResults.notes;
  this.scoredPiece = new Musical_Piece(this.pieceConfig);
  
  return matchResults;
};