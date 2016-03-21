function PiaNote(config) {
  var time = 0;
  this.tempo = 120;
  this.previousNote = undefined;
  this.currentNotes = {};
  this.interval = null;
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
  
  this.resetTime = function() {
    time = 0;
  };
  
  this.expectedPiece = undefined;
  this.playerPiece = undefined;
  this.pieceConfig = undefined;
  this.scoredPiece = undefined;
  this.pianotePiece = {};
  this.playerStats = new UserStats(config);

  this.playTime = null;

}

PiaNote.prototype.noteOn = function(note, velocity) {
  if (this.playTime == null) {
    this.playTime = performance.now();
  }

  //get time in terms of the song measure and beat
  var startTime = (performance.now() - this.playTime) / 1000.0;
  //round to the nearest 16th note
  var beat = Math.floor((startTime / this.tempo) * WHOLE_NOTE_VALUE / 4);


  this.currentNotes[note] = {start: performance.now(), time: beat, tone: note};
};

PiaNote.prototype.noteOff = function(note) {
  var now = performance.now();
  var n = this.currentNotes[note];
  var timePassed = (now - n.start) / 1000.0;
  var duration = timePassed / this.tempo;

  var rhythm = duration*WHOLE_NOTE_VALUE / 4;
  var time = n.time;
  if (this.pianotePiece[time] == undefined) {
    this.pianotePiece[time] = [];
  }

  //There is no way for us to know the hand this came from ... so we ignore it
  //and later just try to map the tone to the expected piece
  this.pianotePiece[time].push(new SingleNote({tone: note, rhythm: rhythm}));

  delete this.currentNotes[note];
};

PiaNote.prototype.monitorTempo = function(tempo) {
  this.tempo = tempo;
};

PiaNote.prototype.unMonitorTempo = function() {
  this.playTime = null;
};

PiaNote.prototype.isMonitoring = function() {
  return this.playTime != null;
};

PiaNote.prototype.generateSong = function() {
  var that = this;
  
  function generateKey() {
    return musicalKeys[Math.random() * musicalKeys.length << 0]; //change to choose one in the key level

    //possibly filter this random choice based on user statistics of key accuracy (like previous model)
  }

  //monitored piece
  this.pianotePiece = {};
  
  this.resetTime();
  var key = generateKey(); //choose by level
  var timeSig = {beats: 2, rhythm: 4}; //choose by level
  var keyLetter = key;
  
  var config = {
    time: timeSig,
    key: keyLetter,
    numMeasures: 4,
    isSharpKey: sharpKeys.indexOf(keyLetter) > 0 ? true : false
  };

  this.expectedPiece = new InvertedChordPiece(config); //choose by level
};

PiaNote.prototype.scorePerformance = function() {
  var playerTuneList = flatTuneList(this.pianotePiece);
  var matchResults = this.expectedPiece.match(playerTuneList);
  
  //this.pieceConfig.voice1 = matchResults[0].notes;
  //this.pieceConfig.voice2 = matchResults[1].notes;
  //this.scoredPiece = new Musical_Piece(this.pieceConfig);
  
  console.log(matchResults);

  //this.playerStats.updateKeyAccuracy(this.pieceConfig.key, matchResults[0].totals.overallAccuracy);
  //this.playerStats.updateNoteAccuracy(matchResults[0].scores, true);

  //this.playerStats.updateKeyAccuracy(this.pieceConfig.key, matchResults[1].totals.overallAccuracy);
  //this.playerStats.updateNoteAccuracy(matchResults[1].scores, false);

  return matchResults;
};

PiaNote.prototype.getCurrentStats = function() {
  return this.playerStats.getStats();
};