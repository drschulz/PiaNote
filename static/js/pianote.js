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

  function generatePhraseRhythm(numMeasures) {
    var rhythms = [];
    var curMeasure = 0;
    var curBeat = 0;

    while(curMeasure < numMeasures) {
      var rhythmIdx;

      //Pick a good rhythm to end the phrase on
      do {
        rhythmIdx = Math.random() * 5 << 0;
      }while(curMeasure == numMeasures - 1 && 
          ((curBeat == 3 && rhythmIdx > 2) || (curBeat == 1 && rhythmIdx == 4)));

      var rhythm = rhythmsList[rhythmIdx];
      var rhythmDur = rhythmMap[rhythm];

      //if the rhythm fits in the measure, add it
      if(curBeat + rhythmDur <= 4) {
        var totalDur = rhythmDur;
        rhythms.push(rhythm);
        
        switch(rhythm) {
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
        
        if (curBeat + totalDur >= 4) {
          curMeasure++;
          curBeat = 0;
        }
        else {
          curBeat += totalDur;
        }
      }
    }

    return rhythms;
  }
  
  function generateRhythms(isVoice1) {
    var numMeasures = 4;
    var curMeasure = 0;
    var rhythms = [];
    var rhythmKeys = Object.keys(rhythmMap);
    var curMeasureCount = 0;
    while(curMeasure < numMeasures) {
      
      var iterations = 10;
      var bestRhythm = 'w';
      var rhythmDur = 4;
      var bestFitness = 0;
      for(i = 0; i < iterations; i++) {
        var rhythm = rhythmsList[(Math.random() * that.playerStats.getStats().rhythmLevel) << 0];
        var fitness = that.playerStats.getRhythmFitness(rhythm, isVoice1);
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

  function generatePhrase(key, lowLimit, highLimit, rhythms) {
    var tones = [];
    var baseOfKey = keys[key];
    var measure = 0;
    var baseTone = lowLimit + baseOfKey;

    //pick random starting fingering
    var startingFinger = (Math.random() * 4 + 1) << 0;
    
    //figure out how high and low we can go based on the fingering
    downwardDistance = startingFinger - 1;
    upwardDistance = 5 - startingFinger;

    lowestStartingIntervalIdx = downwardDistance;
    highestStartingIntervalIdx = NoteIntervals.length - upwardDistance;

    //pick random starting note
    var intervalIdx;
    var startingTone;
    do {
      intervalIdx = randomIntFromInterval(lowestStartingIntervalIdx, highestStartingIntervalIdx);
      var startingInterval = NoteIntervals[intervalIdx];
      startingTone = baseTone + startingInterval;
    }while(startingTone < lowLimit || startingTone > highLimit);    
    tones.push(startingTone);

    var lowestIntervalIdx = intervalIdx - downwardDistance;
    var highestIntervalIdx = intervalIdx + upwardDistance;

    console.log("lowest idx: " + lowestIntervalIdx);
    console.log("highest idx: " + highestIntervalIdx);

    //create rest of notes
    for(i = 1; i < rhythms.length; i++) {
      var tone;
      do {
        var idx = randomIntFromInterval(lowestIntervalIdx, highestIntervalIdx);
        console.log(idx);
        var interval = NoteIntervals[idx];
        tone = baseTone + interval;
      }
      while(tone < lowLimit || tone > highLimit);
      tones.push(tone);
    }
    
    return tones;
  }

  function generateNotes(key, lowLimit, highLimit, amount, rhythms) {
    var tones = [];
    var baseOfKey = keys[key];
    console.log("key: " + key);
    console.log("base of key: " + baseOfKey);
    var measure = 0;
    //var intervals = Object.keys(Intervals);
    
    var baseTone = lowLimit + baseOfKey + chords[measure]; //Set the base tone to be the first note of the key
    var chordType = ChordsForKey[chords[measure]];
    var lastInterval = undefined;
    var intervalDiff;
    var measureDuration = 0;
    for(i=0; i < amount; i++) {
      var tone;
      var interval;
      var iterations = 10;
      var bestTone = baseTone;
      var bestInterval = lastInterval;
      var bestFitness = 0;

      for(j = 0; j < iterations; j++) {
        do {
          //Pick a random note interval
          //interval = NoteIntervals[(Math.random() * NoteIntervals.length) << 0];
          interval = chordType == 'M' ? MajorChordIntervals[(Math.random() * MajorChordIntervals.length) << 0]
                            : MinorChordIntervals[(Math.random() * MinorChordIntervals.length) << 0];

          tone = baseTone + interval;

          //find the "jump" distance from the last note to this one.
          if(lastInterval === undefined) {
            intervalDiff = 0;
            console.log("hello");
          }
          else {
            intervalDiff = Math.abs(lastInterval - interval);
          }

        //Pick tones until one is found within limits and also does not exceed the interval jump set for the user
        } while(tone < lowLimit || tone >= highLimit || intervalDiff > that.playerStats.getStats().maxIntervalJump);
      
        //check if this tone is the best one we've found for the player so far in our iterations
        var fitness = that.playerStats.getNoteFitness(tone);
        if(fitness > bestFitness) {
          bestTone = tone;
          bestFitness = fitness;
          bestInterval = interval; 
        }
      }  

      console.log("got one");
      console.log(amount);  
      
      //push the best tone
      tones.push(bestTone);
      //save the interval
      lastInterval = bestInterval;

      measureDuration += rhythmMap[rhythms[i]]; 
      if (measureDuration >= 4) {
        measure++;
        //console.log("chord: " + chordInterval);
        measureDuration = 0;
        //chords.push(chordInterval);
        //pick new chord for next measure
        chordType = ChordsForKey[chords[measure]];
        baseTone = lowLimit + baseOfKey + chords[measure];
      }
    }
    
    return tones;
  }

  function generatePhraseChords(key, lowLimit, rhythms) {
    var tones = [];
    var chords = [];
    var phrase = {};

    measureDuration = 0;

    var baseOfKey = keys[key];
    //pick initial chord

    var chord = keyChords[Math.random()*keyChords.length << 0];
    var chordInterval = chord.interval;
    var chordType = chord.type;
    chords.push(chord);
    var baseOfChord = lowLimit + baseOfKey + chordInterval;
    for(i = 0; i < rhythms.length; i++) {
      var tone;
      var interval;
      tones.push(baseOfChord);

      //update the measureDuration
      measureDuration += rhythmMap[rhythms[i]]; 
      if (measureDuration >= 4) {
        measureDuration = 0;
        //pick new chord for next measure
        var chord = keyChords[Math.random()*keyChords.length << 0];
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
  
  function getnerateBaseClefNotes(key, lowLimit, highLimit, amount, rhythms) {
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
  }


  function generateTempo() {
    var bpm = BPMS[Math.random() * BPMS.length << 0];
    
    return SECONDS_IN_MINUTE / bpm;
  }
  
  this.resetTime();
  
  var rhythms2 = ['w', 'w', 'w', 'w'];//generateRhythms(false);
  var key = generateKey();
  var phrase = generatePhraseChords(key, LOW_C, rhythms2);//getnerateBaseClefNotes(key, LOW_C, MIDDLE_C, rhythms2.length, rhythms2);
  var voice2 = [];
  for (i = 0; i < rhythms2.length; i++) {
    voice2.push(new Note({tone: phrase.tones[i], rhythm: rhythms2[i]}));
  }

  var rhythms1 = generatePhraseRhythm(4);  //generateRhythms(true);
  //var intervals = generateIntervals();
  var tones1 = generatePhrase(key, MIDDLE_C, HIGH_E, rhythms1); //generateNotes(key, MIDDLE_C, HIGH_E, rhythms1.length, rhythms1);
  console.log(tones1);
  //var tones = transpose(intervals, key);
  var voice1 = [];
  for(i = 0; i < rhythms1.length; i++) {
    voice1.push(new Note({tone: tones1[i], rhythm: rhythms1[i]}));
  }
  
  var keyLetter = key;
  
  var config = {
    time: "4/4",
    clef: "treble",
    key: keyLetter,
    voice1: voice1,
    voice2: voice2,
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
  
  console.log(matchResults);

  this.playerStats.updateKeyAccuracy(this.pieceConfig.key, matchResults[0].totals.overallAccuracy);
  this.playerStats.updateNoteAccuracy(matchResults[0].scores, true);

  this.playerStats.updateKeyAccuracy(this.pieceConfig.key, matchResults[1].totals.overallAccuracy);
  this.playerStats.updateNoteAccuracy(matchResults[1].scores, false);

  return matchResults;
};

PiaNote.prototype.getCurrentStats = function() {
  return this.playerStats.getStats();
};