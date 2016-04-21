function PiaNote(config, isControl) {
  var time = 0;
  this.tempo = 120;
  this.previousNote = undefined;
  this.currentNotes = {};
  this.interval = null;
  this.isControl = isControl;
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
  this.monitoring = false;

}

PiaNote.prototype.noteOn = function(note, velocity) {
  if (this.monitoring) {
  
    if (this.playTime == null) {
        this.playTime = performance.now();
    }

    //get time in terms of the song measure and beat
    var startTime = (performance.now() - this.playTime) / 1000.0;
    //round to the nearest 16th note
    var beat = Math.round((startTime / this.tempo) * WHOLE_NOTE_VALUE / 4);


    this.currentNotes[note] = {start: performance.now(), time: beat, tone: note};
  }
};

PiaNote.prototype.noteOff = function(note) {
  if (this.monitoring) {
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
  }
};

PiaNote.prototype.monitorTempo = function(tempo) {
  this.monitoring = true;
  this.tempo = tempo;
};

PiaNote.prototype.unMonitorTempo = function() {
  this.monitoring = false;
  this.playTime = null;
};

PiaNote.prototype.isMonitoring = function() {
  return this.playTime != null;
};

PiaNote.prototype.setExpectedPiece = function(piece) {
  this.pianotePiece = {};
  this.resetTime();
  
  this.expectedPiece = piece;
}

PiaNote.prototype.generateSong = function(title, description) {
  var that = this;

  //monitored piece
  this.pianotePiece = {};
  
  this.resetTime();

  var availableKeys = keyLevels.lockLevel ? keyLevels.getCurrentChoicesStrict() : keyLevels.getCurrentChoices();
  var key;
  var availableTime = timeLevels.lockLevel ? timeLevels.getCurrentChoicesStrict() : timeLevels.getCurrentChoices();
  var timeSig;
  var availableSongTypes = songLevels.lockLevel ? songLevels.getCurrentChoicesStrict() : songLevels.getCurrentChoices();
  
  var stats;

  if (!this.isControl) {
    key = this.playerStats.getBestItem(availableKeys, this.playerStats.keyStats);//availableKeys[Math.random() * availableKeys.length << 0];


    var availableTimeString = [];
    for (var i = 0; i < availableTime.length; i++) {
        availableTimeString.push(JSON.stringify(availableTime[i]));
    }
    var bestTimeSig = this.playerStats.getBestItem(availableTimeString, this.playerStats.timeStats); 
    
    timeSig = JSON.parse(bestTimeSig);//availableTime[Math.random() * availableTime.length << 0];
    stats = this.playerStats;
  }
  else {
      key = availableKeys[Math.random() * availableKeys.length << 0];
      timeSig = availableTime[Math.random() * availableTime.length << 0];
      stats = new UserStats();
  } 

  var config = {
    time: timeSig,
    key: key,
    numMeasures: 4,
    isSharpKey: sharpKeys.indexOf(key) > 0 ? true : false,
    stats: stats,
    title: title,
    altTitle: description
  };

  if (!this.isControl) {
    var availableSongTypesString = [];
    for (var i = 0; i < availableSongTypes.length; i++) {
        availableSongTypesString.push(availableSongTypes[i].prototype.getType());
    }
    var piece = this.playerStats.getBestItem(availableSongTypesString, this.playerStats.songStats);//availableSongTypes[Math.random() * availableSongTypes.length << 0];
    for (var i = 0; i < availableSongTypes.length; i++) {
        if (availableSongTypes[i].prototype.getType() == piece) {
        this.expectedPiece = new availableSongTypes[i](config);
        break;
        }
    }
  }
  else {
      var piece = availableSongTypes[Math.random() * availableSongTypes.length << 0];
      this.expectedPiece = new piece(config);
  }
  
};

PiaNote.prototype.scorePerformance = function() {
  var separationNote = MIDDLE_C + keys[this.expectedPiece.key];
  var playerTuneList = flatTuneListSeparatedByNote(this.pianotePiece, separationNote);
  var matchResults = this.expectedPiece.match(playerTuneList);

  var results = this.expectedPiece.getAccuracies();

  var accuracies = {
    'r': results.rhythms.hit / results.rhythms.num, // weight more by type of rhythm
    't': (results.notes.hit + results.rhythms.hit) / (results.notes.num + results.rhythms.num),//results.rhythms.hit / results.rhythms.num,
    'k': results.notes.hit / results.notes.num,//results.key.num == 0 ? 1 : (results.key.hit) / results.key.num,//results.notes.hit / results.notes.num,
    'i': results.intervals.hit / results.intervals.num, //weight more by type of interval
    's': (results.notes.hit + results.rhythms.hit) / (results.notes.num + results.rhythms.num) //do both notes and rhythms
  }

  //engine.getNextSongParameters(accuracies);
  
  //enter stats into the userStats
  this.playerStats.addToNoteStats(results.notes.accuracies);
  this.playerStats.addToRhythmStats(results.rhythms.accuracies);
  this.playerStats.addToIntervalStats(results.intervals.accuracies);
  var timeStats = {
    hit: accuracies['t'],
    num: 1
  };

  this.playerStats.addToTimeStats(timeStats, JSON.stringify(this.expectedPiece.time));
  
  var keyStats = {
    hit: accuracies['k'],
    num: 1
  };

  this.playerStats.addToKeyStats(keyStats, this.expectedPiece.key);
  //TODO Song stats
  var songStats = {
    hit: accuracies['s'],
    num: 1
  }
  this.playerStats.addToSongStats(songStats, this.expectedPiece.getType());

  return accuracies;
};

PiaNote.prototype.getCurrentStats = function() {
  return this.playerStats.getStats();
};