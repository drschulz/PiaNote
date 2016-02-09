function UserStats() {
  var keyMedian = 4;
  this.sharpKeyLevel = keyMedian;
  this.flatKeyLevel = keyMedian;
  
  this.keyLevel = 6;
  this.userKeys = ['C', 'G', 'F', 'D', 'Bb', 'A', 'Eb', 'E', 'Ab', 'B', 'Db', 'F#', 'Gb', 'C#', 'Cb'];
  
  //Tracks user's accuracy for a given key signature
  this.keyAccuracy = [];
  var that = this;
  this.userKeys.forEach(function(e) {
    that.keyAccuracy.push({key: e, accuracySum: 0, numAppeared: 0});
  });
  
  //from 0 to 7
  this.rhythmLevel = 2;
  this.rhythmHitRate = {
    "w": {},
    "h": {},
    "q": {},
    "8": {},
    "qd": {},
    "16": {},
    "8d": {}
  };
  
  for (var key in this.rhythmHitRate) {
    this.rhythmHitRate[key] = {numHit: 0, numAppeared: 0};
  }
  
  this.noteHitRateVoice1 = {};
  for(i=MIDDLE_C; i < HIGH_E; i++) {
    this.noteHitRateVoice1[i] = {numHit: 0, numAppeared: 0};
  }
  
  this.noteHitRateVoice2 = {};
  for(i=LOW_C; i < MIDDLE_C; i++) {
    this.noteHitRateVoice2[i] = {numHit: 0, numAppeared: 0};
  }
  
  //scale from 0 to 24
  this.maxIntervalJump = 7; //Major 5th


  this.getMin = function(obj) {
    var max = 100.0;
    var bestKey = 0;
    for (var key in obj) {
      var val = obj[key].numAppeared > 0 ? obj[key].numHit / obj[key].numAppeared : 0;
      
      if (val < max && obj[key].numAppeared > 0) {
        max = val;
        bestKey = key;
      }
    }
    
    return {key: bestKey, val: max};
  };
  
  this.getFitness = function(sum, focusedAccuracy, numAppeared) {
    if (numAppeared > 0) {
      var avgAccuracy = sum / numAppeared;  
      return Math.exp(-(avgAccuracy - focusedAccuracy)*(avgAccuracy - focusedAccuracy)/(2*(1/numAppeared)*(1/numAppeared)));
    }
    else {
      return 1;
    }
  };

}

UserStats.prototype.getMostMissedVoice1Note = function() {
  return this.getMin(this.noteHitRateVoice1);
};

UserStats.prototype.getMostMissedVoice2Note = function() {
  return this.getMin(this.noteHitRateVoice2);
};

UserStats.prototype.getMostMissedNote = function() {
  var voice1 = this.getMostMissedVoice1Note();
  var voice2 = this.getMostMissedVoice2Note();
  
  return voice1.val > voice2.val ? voice1 : voice2;
};

UserStats.prototype.getMostMissedRhythm = function() {
  return this.getMin(this.rhythmHitRate);
};

UserStats.prototype.getKeySignatureFitness = function(key) {
  var focusedAccuracy = 0.6; //The accuracy to hone in on

  var idx = this.userKeys.indexOf(key);
  return this.getFitness(this.keyAccuracy[idx].accuracySum, focusedAccuracy, this.keyAccuracy[idx].numAppeared);
};

UserStats.prototype.updateKeyAccuracy = function(key, accuracy) {
  
  var idx = this.userKeys.indexOf(key);
  
  this.keyAccuracy[idx].accuracySum += accuracy;
  this.keyAccuracy[idx].numAppeared ++;
};

UserStats.prototype.getNoteFitness = function(note) {
  var focusedAccuracy = 0.6;

  if (note >= MIDDLE_C) {
    return this.getFitness(this.noteHitRateVoice1[note].numHit, focusedAccuracy, this.noteHitRateVoice1[note].numAppeared);
  }
  else {
    return this.getFitness(this.noteHitRateVoice2[note].numHit, focusedAccuracy, this.noteHitRateVoice2[note].numAppeared);
  }
}

UserStats.prototype.getRhythmFitness = function(rhythm) {
  var focusedAccuracy = 0.6;

  return this.getFitness(this.rhythmHitRate[rhythm].numHit, focusedAccuracy, this.rhythmHitRate[rhythm].numAppeared);
}

UserStats.prototype.updateNoteAccuracy = function(scores) {
  function updateNote(note, didHit) {
    if (note >=MIDDLE_C) {
      this.noteHitRateVoice1[note].numAppeared ++;

      if(didHit) {
        this.noteHitRateVoice1[note].numHit++;
      }
    }
    else {
      this.noteHitRateVoice2[note].numAppeared ++;

      if(didHit) {
        this.noteHitRateVoice2[note].numHit++;
      }  
    }
  }

  function updateRhythm(rhythm, didHit) {
    this.rhythmHitRate[rhythm].numAppeared++;
    if (didHit) {
      this.rhythmHitRate[rhythm].numHit++;
    }
  }

  scores.forEach(function(s) {
    updateNote(s.expected, s.tone == MATCH_SCORES.TONE_MATCH);
    updateRhythm(s.expectedRhythm, s.rhythm == MATCH_SCORES.RHYTHM_MATCH);
  });
};


















