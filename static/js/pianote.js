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

  //monitored piece
  this.pianotePiece = {};
  
  this.resetTime();

  var availableKeys = keyLevels.lockLevel ? keyLevels.getCurrentChoicesStrict() : keyLevels.getCurrentChoices();
  var key = availableKeys[Math.random() * availableKeys.length << 0];

  var availableTime = timeLevels.lockLevel ? timeLevels.getCurrentChoicesStrict() : timeLevels.getCurrentChoices();
  var timeSig = availableTime[Math.random() * availableTime.length << 0];

  var config = {
    time: timeSig,
    key: key,
    numMeasures: 4,
    isSharpKey: sharpKeys.indexOf(key) > 0 ? true : false
  };

  var availableSongTypes = songLevels.lockLevel ? songLevels.getCurrentChoicesStrict() : songLevels.getCurrentChoices();
  var piece = availableSongTypes[Math.random() * availableSongTypes.length << 0];
  this.expectedPiece = new piece(config);

  //this.expectedPiece = new HandsTogetherPiece(config); //choose by level
};

PiaNote.prototype.scorePerformance = function() {
  var playerTuneList = flatTuneList(this.pianotePiece);
  var matchResults = this.expectedPiece.match(playerTuneList);
  
  console.log(matchResults);

  return matchResults;
};

PiaNote.prototype.getCurrentStats = function() {
  return this.playerStats.getStats();
};