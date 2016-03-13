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

  /*this.updatePlayerPiece = function() {
    //console.log("updating");
    var now = performance.now();

    for(var note in this.currentNotes) {
      
      var n = this.currentNotes[note];
      var timePassed = (now - n.start) / 1000.0;
      var duration = timePassed / that.tempo;
      //if (duration < SHORTEST_RHYTHM) {
        //continue;
      //}

      //var closestRhythm = findClosest(duration, rhythmMap);
      //console.log(n.voice);
      if(n.voice == 1) {
        this.playerPiece.piece.voice1[n.idx].rhythm = duration*WHOLE_NOTE_VALUE / 4;//closestRhythm;
      }
      else {
        this.playerPiece.piece.voice2[n.idx].rhythm = duration*WHOLE_NOTE_VALUE / 4;//closestRhythm;  
      }
    } 
  }*/

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
  if (this.playerPiece.piece.tune[time] == undefined) {
    this.playerPiece.piece.tune[time] = [];
  }

  //There is no way for us to know the hand this came from ... so we ignore it
  //and later just try to map the tone to the expected piece
  this.playerPiece.piece.tune[time].push(new SingleNote({tone: note, rhythm: rhythm}));

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

  function generatePhraseRhythm(numMeasures, measureDuration) {
    var rhythms = [];
    var curMeasure = 0;
    var curBeat = 0;

    var possibleRhythms = (function() {
      var arr = [];

      Object.keys(NoteRhythms).forEach(function(key) {
        arr.push(NoteRhythms[key]);
      });

      return arr;
    })();

    var measureRhythms = [];
    while(curMeasure < numMeasures) {
      var rhythmIdx;

      //Pick a good rhythm to end the phrase on
      do {
        rhythmIdx = Math.random() * 4 << 0;//possibleRhythms.length << 0;
      }while(curMeasure == numMeasures - 1 && 
          ((curBeat == 3 && rhythmIdx > 2) || (curBeat == 1 && rhythmIdx == 4)));

      //var rhythm = rhythmsList[rhythmIdx];
      //var rhythmDur = rhythmMap[rhythm];

      var rhythm = possibleRhythms[rhythmIdx];

      //if the rhythm fits in the measure, add it
      if(curBeat + rhythm <= measureDuration) {
        var totalDur = rhythm;//rhythmDur;
        measureRhythms.push(rhythm);
        
        switch(rhythm) {
          case NoteRhythms.D_EIGTH:
            //add eighth note
            measureRhythms.push(NoteRhythms.SIXTEENTH);
            totalDur += NoteRhythms.SIXTEENTH;
            break;
          case NoteRhythms.D_QUARTER:
          case NoteRhythms.EIGTH:
            //add eighth note
            measureRhythms.push(NoteRhythms.EIGTH);
            totalDur += NoteRhythms.EIGTH;  
            break;
          case NoteRhythms.SIXTEENTH:
            //add three 16th notes
            measureRhythms.push(NoteRhythms.SIXTEENTH);
            measureRhythms.push(NoteRhythms.SIXTEENTH);
            measureRhythms.push(NoteRhythms.SIXTEENTH);
            totalDur += NoteRhythms.SIXTEENTH*3;  
            break;
          
          default:
            break;
        }
        
        if (curBeat + totalDur >= 16) {
          curMeasure++;
          curBeat = 0;
          rhythms.push(measureRhythms);
          measureRhythms = [];
        }
        else {
          curBeat += totalDur;
        }
      }
    }

    return rhythms;
  }
  
  function generateKey() {
    var iterations = 10;
    var bestKey = 'C';
    var bestFitness = 0;
    for(i = 0; i < iterations; i++) {
      var keyIdx = that.playerStats.userKeys[Math.random() * that.playerStats.getStats().keyLevel << 0];
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

  var pianotePiece = {};

  function addToPiece(time, tone, rhythm, hand) {
    if (pianotePiece[time] == undefined) {
      pianotePiece[time] = [];
    }

    if (Array.isArray(tone)) {
      var toneArr = [];
      for(var i = 0; i < tone.length; i++) {
        toneArr.push(new SingleNote({tone: tone[i], rhythm: rhythm, hand: hand}));
      }

      pianotePiece[time].push(new PolyNote({tone: toneArr, rhythm: rhythm, hand: hand}));
    }
    else {
      pianotePiece[time].push(new SingleNote({tone: tone, rhythm: rhythm, hand: hand}));  
    }  
  }

  function generatePhrase(key, lowLimit, highLimit, rhythms, chords) {
    var tones = [];
    var baseOfKey = keys[key];
    var measure = 0;
    var baseTone = lowLimit + baseOfKey;

    function getPossibleIntervalsForChord(chord, intervals) {
      var chordIntervals = chord.info.type == 'M' ? MajorChordIntervals : MinorChordIntervals;
      var chordIntervalsMappedToKey = chordIntervals.map(function(i) {
          return chord.info.interval + i;
      });

      var possibleIntervals = [];
      //find all intervals that the chord hits that are within the interval range
      for(var i = 0; i < intervals.length; i++) {
        for(var j = 0; j < chordIntervalsMappedToKey.length; j++) {
          if(intervals[i] == chordIntervalsMappedToKey[j]) {
            possibleIntervals.push(intervals[i]);
            break;
          }
        }
      }

      return possibleIntervals;

    }    

    function generateMeasureNotes(rhythms, possibleIntervals, chord, isLastMeasure, curMeasure) {
      var tones = [];

      //get all intervals that the chord hits that are within the interval range 
      var chordIntervals = getPossibleIntervalsForChord(chord, possibleIntervals);

      function filterOutChordIntervals(e) {
        for (var i = 0; i < chord.notes.length; i++) {
          if (baseTone + e == chord.notes[i]) {
            return false;
          }
        }
        return true;
      }
      //ensure left and right hand don't play same note at same time
      chordIntervals = chordIntervals.filter(filterOutChordIntervals);
      var pIntervals = possibleIntervals.filter(filterOutChordIntervals);

      var time = curMeasure*WHOLE_NOTE_VALUE;
      //generate first note by taking an interval that is in the chord      
      var interval = chordIntervals[Math.random()*chordIntervals.length << 0];
      var tone = baseTone + interval; 
      addToPiece(time, tone, rhythms[0], 'r');
      
      //update the current time
      time += rhythms[0];

      //tones.push(tone);

      //generate next notes
      for(var i = 1; i < rhythms.length; i++) {
        //Make sure last note of the song ends on a chord note
        if(i == rhythms.length - 1 && isLastMeasure) {
          interval = chordIntervals[Math.random()*chordIntervals.length << 0];
        }
        else {
          interval = pIntervals[Math.random()*pIntervals.length << 0];  
        }
        tone = baseTone + interval;
        addToPiece(time, tone, rhythms[i], 'r');
        
        time+= rhythms[i];
        //tones.push(tone);
      }

      return tones;
    }

    //pick random thumb position (between the first and 4th interval)
    var thumbPosition = Math.random() * 4 << 0;
    
    //interval range (assuming hand and fingers cannot move)
    var lowestIntervalIdx = thumbPosition;
    var highestIntervalIdx = thumbPosition + 5;

    var possibleIntervals = NoteIntervals.slice(lowestIntervalIdx, highestIntervalIdx);
    var tones = [];

    var lastMeasure = false;
    for(var i = 0; i < rhythms.length; i++) {
      if (i == rhythms.length - 1) {
        lastMeasure = true;
      }
      
      generateMeasureNotes(rhythms[i], possibleIntervals, chords[i], lastMeasure, i);
      //tones = tones.concat(generateMeasureNotes(rhythms[i], possibleIntervals, chords[i], lastMeasure));
    }

    //return tones;
  }

  function generatePhraseChords(key, lowLimit, rhythms, numMeasures, totalMeasureDuration) {
    var tones = [];
    var chords = [];
    var phrase = {};
    var time = 0;

    var measureDuration = 0;
    var measureCount = 1;

    var baseOfKey = keys[key];
    //pick initial chord
    //First chord is ALWAYS the key chord (Ex. Key of C, first chord C)

    //first chord
    var chordInfo = keyChords[0];
    var chordInterval = chordInfo.interval;
    var chordType = chordInfo.type;
    var chordIntervals = chordType == 'M' ? MajorChordIntervals : MinorChordIntervals;
    var baseOfChord = lowLimit + baseOfKey + chordInterval;
    var chord = {info: chordInfo,
                 notes: [baseOfChord, baseOfChord + chordIntervals[1], baseOfChord + chordIntervals[2]]};

    chords.push(chord);
    
    for(i = 0; i < rhythms.length; i++) {
      var tone;
      var interval;
      var chordIntervals = chordType == 'M' ? MajorChordIntervals : MinorChordIntervals;
      addToPiece(time, [baseOfChord, baseOfChord + chordIntervals[1], baseOfChord + chordIntervals[2]], rhythms[i], 'l');

      //tones.push([baseOfChord, baseOfChord + chordIntervals[1], baseOfChord + chordIntervals[2]]);
      time+= rhythms[i];
      //update the measureDuration
      measureDuration += rhythms[i]; 
      if (measureDuration >= totalMeasureDuration) {
        measureDuration = 0;
        measureCount++;

        //pick new chord for next measure
        //Last Chord is ALWAYS the key chord (Ex. Key of C, last chord C)
        chordInfo = measureCount == numMeasures ? keyChords[0] : keyChords[Math.random()*keyChords.length << 0];
        chordInterval = chordInfo.interval;
        chordType = chordInfo.type;
        baseOfChord = lowLimit + baseOfKey + chordInterval;
        chordIntervals = chordType == 'M' ? MajorChordIntervals : MinorChordIntervals;
        chord = {info: chordInfo,
                 notes: [baseOfChord, baseOfChord + chordIntervals[1], baseOfChord + chordIntervals[2]]};
        chords.push(chord);
        
      }
    }

    return chords;
    
  }

  function generateTempo() {
    var bpm = BPMS[Math.random() * BPMS.length << 0];
    
    return SECONDS_IN_MINUTE / bpm;
  }
  
  this.resetTime();

  var timeSig = {beats: 4, rhythm: 4};
  var beatValue = WHOLE_NOTE_VALUE / timeSig.rhythm;
  var measureDuration = timeSig.beats * beatValue;

  
  var rhythms2 = [NoteRhythms.WHOLE, NoteRhythms.WHOLE, NoteRhythms.WHOLE, NoteRhythms.WHOLE];
  var key = generateKey();
  var chords = generatePhraseChords(key, LOW_C, rhythms2, 4, measureDuration);
  
  var rhythms1 = generatePhraseRhythm(4, measureDuration);
  generatePhrase(key, MIDDLE_C, HIGH_E, rhythms1, chords);
   
  var keyLetter = key;
  
  console.log(pianotePiece);

  var config = {
    time: timeSig,//"4/4",
    clef: "treble",
    key: keyLetter,
    tune: pianotePiece,
    isSharpKey: sharpKeys.indexOf(keyLetter) > 0 ? true : false,
  };
  
  this.expectedPiece = new Musical_Piece(config);
  
  var playerConfig = {
    time: timeSig,//"4/4",
    clef: "treble",
    key: keyLetter,
    tune: {},
    isSharpKey: sharpKeys.indexOf(keyLetter) > 0 ? true : false,
  };
  
  this.playerPiece = new Musical_Piece(playerConfig);
  
  this.pieceConfig = {
    time: timeSig,//"4/4",
    clef: "treble",
    key: keyLetter,
    tune: {},
    isSharpKey: sharpKeys.indexOf(keyLetter) > 0 ? true : false,
  };
};

PiaNote.prototype.scorePerformance = function() {
  var playerTuneList = this.playerPiece.flatTuneList();
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