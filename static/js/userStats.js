function UserStats(stats) {
  this.userKeys = ['C', 'G', 'F', 'D', 'Bb', 'A', 'Eb', 'E', 'Ab', 'B', 'Db', 'F#', 'Gb', 'C#', 'Cb'];
  var that = this;


  function createStats() {
    var stats = {};
    var keyMedian = 4;
    stats.sharpKeyLevel = keyMedian;
    stats.flatKeyLevel = keyMedian;
    
    stats.keyLevel = 6;
    
    
    //Tracks user's accuracy for a given key signature
    stats.keyAccuracy = [];
    that.userKeys.forEach(function(e) {
      stats.keyAccuracy.push({key: e, accuracySum: 0, numAppeared: 0});
    });
    
    //from 0 to 7
    stats.rhythmLevel = 2;
    stats.rhythmHitRate = {
      "w": {},
      "h": {},
      "q": {},
      "8": {},
      "qd": {},
      "16": {},
      "8d": {}
    };
    
    for (var key in stats.rhythmHitRate) {
      stats.rhythmHitRate[key] = {numHit: 0, numAppeared: 0};
    }
    
    stats.noteHitRateVoice1 = {};
    for(i=MIDDLE_C; i < HIGH_E; i++) {
      stats.noteHitRateVoice1[i] = {numHit: 0, numAppeared: 0};
    }
    
    stats.noteHitRateVoice2 = {};
    for(i=LOW_C; i < MIDDLE_C; i++) {
      stats.noteHitRateVoice2[i] = {numHit: 0, numAppeared: 0};
    }
    
    //scale from 0 to 24
    stats.maxIntervalJump = 7; //Major 5th  
    
    return stats;
  }


  if(stats === undefined) {
    this.stats = createStats();
  }
  else {
    this.stats = stats;
    console.log("loading stats");
  }

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
  return this.getMin(this.stats.noteHitRateVoice1);
};

UserStats.prototype.getMostMissedVoice2Note = function() {
  return this.getMin(this.stats.noteHitRateVoice2);
};

UserStats.prototype.getMostMissedNote = function() {
  var voice1 = this.getMostMissedVoice1Note();
  var voice2 = this.getMostMissedVoice2Note();
  
  return voice1.val > voice2.val ? voice1 : voice2;
};

UserStats.prototype.getMostMissedRhythm = function() {
  return this.getMin(this.stats.rhythmHitRate);
};

UserStats.prototype.getKeySignatureFitness = function(key) {
  var focusedAccuracy = 0.6; //The accuracy to hone in on

  var idx = this.userKeys.indexOf(key);
  return this.getFitness(this.stats.keyAccuracy[idx].accuracySum, focusedAccuracy, this.stats.keyAccuracy[idx].numAppeared);
};

UserStats.prototype.updateKeyAccuracy = function(key, accuracy) {
  
  var idx = this.userKeys.indexOf(key);
  
  this.stats.keyAccuracy[idx].accuracySum += accuracy;
  this.stats.keyAccuracy[idx].numAppeared ++;
};

UserStats.prototype.getNoteFitness = function(note) {
  var focusedAccuracy = 0.6;

  if (note >= MIDDLE_C) {
    return this.getFitness(this.stats.noteHitRateVoice1[note].numHit, focusedAccuracy, this.stats.noteHitRateVoice1[note].numAppeared);
  }
  else {
    return this.getFitness(this.stats.noteHitRateVoice2[note].numHit, focusedAccuracy, this.stats.noteHitRateVoice2[note].numAppeared);
  }
}

UserStats.prototype.getRhythmFitness = function(rhythm) {
  var focusedAccuracy = 0.6;

  return this.getFitness(this.stats.rhythmHitRate[rhythm].numHit, focusedAccuracy, this.stats.rhythmHitRate[rhythm].numAppeared);
}

UserStats.prototype.updateNoteAccuracy = function(scores) {
  var that = this;

  function updateNote(note, didHit) {
    if (note >=MIDDLE_C) {
      that.stats.noteHitRateVoice1[note].numAppeared++;

      if(didHit) {
        that.stats.noteHitRateVoice1[note].numHit++;
      }
    }
    else {
      that.stats.noteHitRateVoice2[note].numAppeared ++;

      if(didHit) {
        that.stats.noteHitRateVoice2[note].numHit++;
      }  
    }
  }

  function updateRhythm(rhythm, didHit) {
    that.stats.rhythmHitRate[rhythm].numAppeared++;
    if (didHit) {
      that.stats.rhythmHitRate[rhythm].numHit++;
    }
  }

  scores.forEach(function(s) {
    updateNote(s.expected, s.tone == MATCH_SCORES.TONE_MATCH);
    updateRhythm(s.expectedRhythm, s.rhythm == MATCH_SCORES.RHYTHM_MATCH);
  });
};

UserStats.prototype.getStats = function () {
  return this.stats;
};


















