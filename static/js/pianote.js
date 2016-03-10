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
      //if (duration < SHORTEST_RHYTHM) {
        //continue;
      //}

      //var closestRhythm = findClosest(duration, rhythmMap);
      //console.log(n.voice);
      if(n.voice == 1) {
        this.playerPiece.piece.voice1[n.idx].rhythm = duration;//closestRhythm;
      }
      else {
        this.playerPiece.piece.voice2[n.idx].rhythm = duration;//closestRhythm;  
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
  this.playerStats = new UserStats(config);

}

PiaNote.prototype.noteOn = function(note, velocity) {
  var tone = new Note({tone: note, rhythm: "q"});
  var voice = note >= MIDDLE_C ? this.playerPiece.piece.voice1 : this.playerPiece.piece.voice2;
  voice.push(tone);
  var whichVoice = note >= MIDDLE_C ? 1 : 2;
  this.currentNotes[note] = {voice: whichVoice, idx: voice.length - 1, start: performance.now(), tone: note};
  
  //console.log("note on!");


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
        rhythmIdx = Math.random() * possibleRhythms.length << 0;
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

  var chords = [];

  function generateNote(base, lowLimit, highLimit) {
    var tone;

    do {
      var interval = NoteIntervals[Math.random() * NoteIntervals.length << 0];
      tone = base + interval;
    }while(tone < lowLimit || tone > highLimit);

    return {tone: tone, interval: interval};

  }

  function randomIntFromInterval(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
  }

  function generatePhrase(key, lowLimit, highLimit, rhythms, chords) {
    var tones = [];
    var baseOfKey = keys[key];
    var measure = 0;
    var baseTone = lowLimit + baseOfKey;

    function getPossibleIntervalsForChord(chord, intervals) {
      var chordIntervals = chord.type == 'M' ? MajorChordIntervals : MinorChordIntervals;
      var chordIntervalsMappedToKey = chordIntervals.map(function(i) {
          return chord.interval + i;
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

    function generateMeasureNotes(rhythms, possibleIntervals, chord, isLastMeasure) {
      var tones = [];

      //get all intervals that the chord hits that are within the interval range 
      var chordIntervals = getPossibleIntervalsForChord(chord, possibleIntervals);

      //generate first note by taking an interval that is in the chord      
      var interval = chordIntervals[Math.random()*chordIntervals.length << 0];
      var tone = baseTone + interval; 
      tones.push(tone);

      //generate next notes
      for(var i = 1; i < rhythms.length; i++) {
        //Make sure last note of the song ends on a chord note
        if(i == rhythms.length - 1 && isLastMeasure) {
          interval = chordIntervals[Math.random()*chordIntervals.length << 0];
        }
        else {
          interval = possibleIntervals[Math.random()*possibleIntervals.length << 0];  
        }
        tone = baseTone + interval;
        tones.push(tone);
      }

      return tones;
    }

    //pick random thumb position (between the first and 4th interval)
    var thumbPosition = Math.random() * 4 << 0;
    
    //interval range (assuming hand and fingers cannot move)
    var lowestIntervalIdx = thumbPosition;
    var highestIntervalIdx = thumbPosition + 4;

    var possibleIntervals = NoteIntervals.slice(lowestIntervalIdx, highestIntervalIdx);
    var tones = [];

    var lastMeasure = false;
    for(var i = 0; i < rhythms.length; i++) {
      if (i == rhythms.length - 1) {
        lastMeasure = true;
      }
      tones = tones.concat(generateMeasureNotes(rhythms[i], possibleIntervals, chords[i], lastMeasure));
    }

    return tones;
  }

  function generatePhraseChords(key, lowLimit, rhythms, numMeasures, totalMeasureDuration) {
    var tones = [];
    var chords = [];
    var phrase = {};

    var measureDuration = 0;
    var measureCount = 1;

    var baseOfKey = keys[key];
    //pick initial chord
    //First chord is ALWAYS the key chord (Ex. Key of C, first chord C)

    //first chord
    var chord = keyChords[0];
    var chordInterval = chord.interval;
    var chordType = chord.type;
    chords.push(chord);
    var baseOfChord = lowLimit + baseOfKey + chordInterval;
    for(i = 0; i < rhythms.length; i++) {
      var tone;
      var interval;
      var chordIntervals = chordType == 'M' ? MajorChordIntervals : MinorChordIntervals;
      tones.push([baseOfChord, baseOfChord + chordIntervals[1], baseOfChord + chordIntervals[2]]);

      //update the measureDuration
      measureDuration += rhythms[i]; 
      if (measureDuration >= totalMeasureDuration) {
        measureDuration = 0;
        measureCount++;

        //pick new chord for next measure
        //Last Chord is ALWAYS the key chord (Ex. Key of C, last chord C)
        var chord = measureCount == numMeasures ? keyChords[0] : keyChords[Math.random()*keyChords.length << 0];
        var chordInterval = chord.interval;
        var chordType = chord.type;
        chords.push(chord);
        baseOfChord = lowLimit + baseOfKey + chordInterval;
      }
    }

    phrase.chords = chords;
    phrase.tones = tones;

    return phrase;
  }
  
  /*function getnerateBaseClefNotes(key, lowLimit, highLimit, amount, rhythms) {
    var tones = [];
    var baseOfKey = keys[key];
    
    var lastInterval = undefined;
    var intervalDiff;
    var measureDuration = 0;

    //pick initial chord
    var chordIntervals = Object.keys(ChordsForKey);
    var chordInterval = parseInt(chordIntervals[Math.random() * chordIntervals.length << 0]);
    var chordType = ChordsForKey[chordInterval];
    var baseOfChord = lowLimit + baseOfKey + chordInterval; //our lowest base point to the key base to the chord base
    console.log("low limit: " + lowLimit);
    console.log("baseOfKey: " + baseOfKey);
    console.log("chordInterval: " + chordInterval);
    console.log("base of chord: " + baseOfChord);
    console.log("sum: " + (lowLimit + baseOfKey));
    for(i=0; i < amount; i++) {
    
      var tone; //possible tone
      var interval; //possible interval
      var iterations = 10; //number of iterations to find notes (the lower iterations is, the more random the pick will be)
      var bestTone = baseOfChord;
      var bestInterval = lastInterval;
      var bestFitness = 0;//initial fitness for base chord note

      for(j = 0; j < iterations; j++) {
        do {
          //Pick a random interval based on the chord type
          interval = chordType == 'M' ? MajorChordIntervals[(Math.random() * MajorChordIntervals.length) << 0]
                            : MinorChordIntervals[(Math.random() * MinorChordIntervals.length) << 0];

          tone = baseOfChord + interval;
          
          //find the "jump" distance from the last note to this one.
          if(lastInterval === undefined) {
            intervalDiff = 0;
          }
          else {
            intervalDiff = Math.abs(lastInterval - interval);
          }

          //console.log("working: " + tone);

          //Pick tones until one is found within limits and also does not exceed the interval jump set for the user.
        } while(tone < lowLimit || tone >= highLimit || intervalDiff > that.playerStats.getStats().maxIntervalJump);
      
        
        //check if this tone is the best one we've found for the player so far in our iterations
        var fitness = that.playerStats.getNoteFitness(tone);
        if(fitness > bestFitness) {
          bestTone = tone;
          bestFitness = fitness;
          bestInterval = interval; 
        }

      }

      //set the last interval to our best interval
      lastInterval = bestInterval;
      //add the tone to our song
      tones.push(bestTone);

      //update the measureDuration
      measureDuration += rhythmMap[rhythms[i]]; 
      if (measureDuration >= 4) {
        console.log("chord: " + chordInterval);
        measureDuration = 0;
        chords.push(chordInterval);
        //pick new chord for next measure
        chordInterval = parseInt(chordIntervals[Math.random() * chordIntervals.length << 0]);
        chordType = ChordsForKey[chordInterval];
        baseOfChord = lowLimit + baseOfKey + chordInterval;
      }
    }
    
    console.log("finished base clef notes");

    return tones;
  }*/

  function generateTempo() {
    var bpm = BPMS[Math.random() * BPMS.length << 0];
    
    return SECONDS_IN_MINUTE / bpm;
  }
  
  this.resetTime();

  var timeSig = {beats: 4, rhythm: 4};
  var beatValue = WHOLE_NOTE_VALUE / timeSig.rhythm;
  var measureDuration = timeSig.beats * beatValue;

  
  var rhythms2 = [NoteRhythms.WHOLE, NoteRhythms.WHOLE, NoteRhythms.WHOLE, NoteRhythms.WHOLE];//generateRhythms(false);
  var key = generateKey();
  var phrase = generatePhraseChords(key, LOW_C, rhythms2, 4, measureDuration);//getnerateBaseClefNotes(key, LOW_C, MIDDLE_C, rhythms2.length, rhythms2);
  var voice2 = [];
  for (i = 0; i < rhythms2.length; i++) {
    voice2.push(new Note({tone: phrase.tones[i], rhythm: rhythms2[i]}));
  }

  var rhythms1 = generatePhraseRhythm(4, measureDuration);  //generateRhythms(true);
  //var intervals = generateIntervals();
  var tones1 = generatePhrase(key, MIDDLE_C, HIGH_E, rhythms1, phrase.chords); //generateNotes(key, MIDDLE_C, HIGH_E, rhythms1.length, rhythms1);
  console.log(tones1);
  console.log("tones length: " + tones1.length);
  console.log("rhythms length: " + rhythms1.length);
  var rhythmsConcatenated  = [];
  for(i = 0; i < rhythms1.length; i++) {
    rhythmsConcatenated = rhythmsConcatenated.concat(rhythms1[i]);
  }

  console.log("concatenated rhythms length: " + rhythmsConcatenated.length);
  //var tones = transpose(intervals, key);
  var voice1 = [];
  for(i = 0; i < rhythmsConcatenated.length; i++) {
    console.log(tones1[i]);
    voice1.push(new Note({tone: tones1[i], rhythm: rhythmsConcatenated[i]}));
  }
  
  var keyLetter = key;
  
  var config = {
    time: timeSig,//"4/4",
    clef: "treble",
    key: keyLetter,
    voice1: voice1,
    voice2: voice2,
    isSharpKey: sharpKeys.indexOf(keyLetter) > 0 ? true : false,
  };
  
  this.expectedPiece = new Musical_Piece(config);
  
  var playerConfig = {
    time: timeSig,//"4/4",
    clef: "treble",
    key: keyLetter,
    voice1: [],
    voice2: [],
    isSharpKey: sharpKeys.indexOf(keyLetter) > 0 ? true : false,
  };
  
  this.playerPiece = new Musical_Piece(playerConfig);
  
  this.pieceConfig = {
    time: timeSig,//"4/4",
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