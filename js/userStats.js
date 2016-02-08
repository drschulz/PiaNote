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

UserStats.prototype.getKeySignatureFitness = function() {
  var proficientAccuracy = 95;
  var sufficientAttempts = 5;
  
  var focusedAccuracy = 0.6; //The accuracy to hone in on

  var fitness = {};
  
  for (i = 0; i < this.keyLevel; i++) {
    var curKey = this.keyAccuracy[i];
    
  
    if(curKey.numAppeared > 0) {
      var avgAccuracy = curKey.accuracySum / curKey.numAppeared;  
      fitness[curKey.key] = Math.exp(-(avgAccuracy - focusedAccuracy)*(avgAccuracy - focusedAccuracy)/(2*(1/curKey.numAppeared)));
    }
    else {
      fitness[curKey.key] = 1;
    }
  }
  
  return fitness;
};

UserStats.prototype.updateKeyAccuracy = function(key, accuracy) {
  
  var idx = this.userKeys.indexOf(key);
  
  this.keyAccuracy[idx].accuracySum += accuracy;
  this.keyAccuracy[idx].numAppeared ++;
};


















