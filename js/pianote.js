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
  
  /*this.updatePlayerPiece = function(noteNumber, duration) {
    var voice = noteNumber >= MIDDLE_C ? that.playerPiece.piece.voice1 : that.playerPiece.piece.voice2;
    
    if (duration === undefined) {
      var note = new Note({tone: noteNumber, rhythm: "q"});
      voice.push(note);
    }
    else {
      var temp = duration / that.playerPiece.piece.tempo;
      if (temp < SHORTEST_RHYTHM) {
        return;
      }
      var closestRhythm = findClosest(temp, rhythmMap);
      voice[voice.length - 1].rhythm = closestRhythm;
    }
  };*/

  this.updatePlayerPiece = function() {
    //console.log("updating");
    var now = performance.now();

    for(var note in this.currentNotes) {
      
      var n = this.currentNotes[note];
      var timePassed = (now - n.start) / 1000.0;
      var duration = timePassed / that.tempo;
      if (duration < SHORTEST_RHYTHM) {
        continue;
      }
      var closestRhythm = findClosest(duration, rhythmMap);
      console.log(n.voice);
      if(n.voice == 1) {
        this.playerPiece.piece.voice1[n.idx].rhythm = closestRhythm;
      }
      else {
        this.playerPiece.piece.voice2[n.idx].rhythm = closestRhythm;  
      }
    } 
  }

  /*this.updateTime = function() {
    var now = performance.now();
    
    if (time !== 0) {
      var timePassed = (now - time) / 1000.0;
      if (that.previousNote !== undefined) {
        that.updatePlayerPiece(that.previousNote, timePassed);
        that.previousNote = undefined;
      }
    }
    time = now;
  };*/
  
  this.resetTime = function() {
    time = 0;
  };
  
  this.expectedPiece = undefined;
  this.playerPiece = undefined;
  this.pieceConfig = undefined;
  this.scoredPiece = undefined;
  this.playerStats = new UserStats();

}

PiaNote.prototype.noteOn = function(note, velocity) {
  var tone = new Note({tone: note, rhythm: "q"});
  var voice = note >= MIDDLE_C ? this.playerPiece.piece.voice1 : this.playerPiece.piece.voice2;
  voice.push(tone);
  var whichVoice = note >= MIDDLE_C ? 1 : 2;
  this.currentNotes[note] = {voice: whichVoice, idx: voice.length - 1, start: performance.now(), tone: note};
  console.log("note on!");


  /*this.updateTime();
  this.currentNote = note;
  start = performance.now();
  
  this.updatePlayerPiece(note);*/
};

PiaNote.prototype.noteOff = function(note) {
  this.updatePlayerPiece();
  delete this.currentNotes[note];
  //this.previousNote = note;
};

PiaNote.prototype.monitorTempo = function(tempo) {
  this.tempo = tempo;
  this.interval = setInterval(this.updatePlayerPiece, this.tempo * 1000 << 0);
};

PiaNote.prototype.unMonitorTempo = function() {
  clearInterval(this.interval);
  this.interval = null;
};

PiaNote.prototype.isMonitoring = function() {
  return this.interval != null;
};


PiaNote.prototype.generateSong = function() {
  var that = this;
  
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
  
  function generateRhythms() {
    var numMeasures = 4;
    var curMeasure = 0;
    var rhythms = [];
    var rhythmKeys = Object.keys(rhythmMap);
    var curMeasureCount = 0;
    while(curMeasure < numMeasures) {
      
      var iterations = 5;
      var bestRhythm = 'w';
      var rhythmDur = 4;
      var bestFitness = 0;
      for(i = 0; i < iterations; i++) {
        var rhythm = rhythmsList[(Math.random() * that.playerStats.rhythmLevel) << 0];
        var fitness = that.playerStats.getRhythmFitness(rhythm);
        if(fitness > bestFitness) {
          bestRhythm = rhythm;
          bestFitness = fitness;
          rhythmDur = rhythmMap[rhythm];
        }  
      }
      
      if (curMeasureCount + rhythmDur <= 4) {
        var totalDur = rhythmDur;
        rhythms.push(bestRhythm);
        
        switch(bestRhythm) {
          case "8d":
            //add eighth note
            rhythms.push("16");
            totalDur += rhythmMap["16"];
            break;
          case "qd":
          case "8":
            //add eighth note
            rhythms.push("8");
            totalDur += rhythmMap["8"];  
            break;
          case "16":
            //add three 16th notes
            rhythms.push("16");
            rhythms.push("16");
            rhythms.push("16");
            totalDur += rhythmMap["16"]*3;  
            break;
          
          default:
            break;
        }
        
        if (curMeasureCount + totalDur >= 3.999) {
          console.log("hello");
          curMeasure++;
          curMeasureCount = 0;
        }
        else {
          curMeasureCount += totalDur;
        }
      }
    }
    
    console.log(rhythms);
    return rhythms;
  }
  
  function generateKey() {
    var iterations = 5;
    var bestKey = 'C';
    var bestFitness = 0;
    for(i = 0; i < iterations; i++) {
      var keyIdx = that.playerStats.userKeys[Math.random() * that.playerStats.keyLevel << 0];
      console.log(keyIdx);
      var fitness = that.playerStats.getKeySignatureFitness(keyIdx);
      if (fitness >= bestFitness) {
        bestKey = keyIdx;
        bestFitness = fitness;
      }
    }
    
    return bestKey;
    
    /*var isSharpKey = Math.random() < 0.5;
    if (isSharpKey) {
      return sharpKeys[Math.random() * that.playerStats.sharpKeyLevel << 0];
    }
    else {
      return flatKeys[Math.random() * that.playerStats.flatKeyLevel << 0];
    }*/
    //return keys[(Math.random() * keys.length) << 0];
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
  
  function generateNotes(key, lowLimit, highLimit, amount) {
    var tones = [];
    var baseOfKey = keys[key];
    console.log("key: " + key);
    console.log("base of key: " + baseOfKey);
    var intervals = Object.keys(Intervals);
    
    var lastInterval = undefined;
    var intervalDiff;
    for(i=0; i < amount; i++) {
      var tone;
      var interval;
      var iterations = 5;
      var bestTone = lowLimit + baseOfKey;
      var bestInterval = lastInterval;
      var bestFitness = 0;

      for(j = 0; j < iterations; j++) {
        do {
          var idx = (Math.random() * intervals.length) << 0;
          interval = Intervals[intervals[idx]];
          tone = lowLimit + baseOfKey + interval;
          if(lastInterval === undefined) {
            intervalDiff = 0;
            console.log("hello");
          }
          else {
            intervalDiff = Math.abs(lastInterval - interval);
          }
          console.log("working ...: " + tone);
        } while(tone < lowLimit || tone >= highLimit || intervalDiff > that.playerStats.maxIntervalJump);
      
        var fitness = that.playerStats.getNoteFitness(tone);
        if(fitness > bestFitness) {
          bestTone = tone;
          bestFitness = fitness;
          bestInterval = interval; 
        }
      }  

      console.log("got one");
      console.log(amount);  
      tones.push(bestTone);
      lastInterval = bestInterval;
    }
    

    return tones;
  }
  
  function generateTempo() {
    var bpm = BPMS[Math.random() * BPMS.length << 0];
    
    return SECONDS_IN_MINUTE / bpm;
  }
  
  this.resetTime();
  var rhythms1 = generateRhythms();
  //var intervals = generateIntervals();
  var key = generateKey();
  var tones1 = generateNotes(key, MIDDLE_C, HIGH_E, rhythms1.length);
  console.log(tones1);
  //var tones = transpose(intervals, key);
  var voice1 = [];
  for(i = 0; i < rhythms1.length; i++) {
    voice1.push(new Note({tone: tones1[i], rhythm: rhythms1[i]}));
  }
  
  /*
  var rhythms2 = generateRhythms();
  var tones2 = generateNotes(key, LOW_C, MIDDLE_C, rhythms2.length);
  var voice2 = [];
  for (i = 0; i < rhythms2.length; i++) {
    voice2.push(new Note({tone: tones2[i], rhythm: rhythms2[i]}));
  }*/
  
  var keyLetter = key;
  
  var config = {
    time: "4/4",
    clef: "treble",
    key: keyLetter,
    voice1: voice1,
    //voice2: voice2,
    isSharpKey: sharpKeys.indexOf(keyLetter) > 0 ? true : false,
  };
  
  this.expectedPiece = new Musical_Piece(config);
  
  var playerConfig = {
    time: "4/4",
    clef: "treble",
    key: keyLetter,
    voice1: [],
    voice2: [],
    isSharpKey: sharpKeys.indexOf(keyLetter) > 0 ? true : false,
  };
  
  this.playerPiece = new Musical_Piece(playerConfig);
  
  this.pieceConfig = {
    time: "4/4",
    clef: "treble",
    key: keyLetter,
    voice1: [],
    voice2: [],
    isSharpKey: sharpKeys.indexOf(keyLetter) > 0 ? true : false,
  };
};

PiaNote.prototype.scorePerformance = function() {
  var matchResults = this.expectedPiece.match(this.playerPiece);
  
  this.pieceConfig.voice1 = matchResults[0].notes;
  this.pieceConfig.voice2 = matchResults[1].notes;
  this.scoredPiece = new Musical_Piece(this.pieceConfig);
  
  this.playerStats.updateKeyAccuracy(this.pieceConfig.key, matchResults[0].totals.overallAccuracy);
  this.playerStats.updateNoteAccuracy(matchResults[0].scores);
  return matchResults;
};