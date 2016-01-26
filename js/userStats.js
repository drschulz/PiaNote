function UserStats() {
  var keyMedian = 4;
  this.sharpKeyLevel = keyMedian;
  this.flatKeyLevel = keyMedian;
  
  //On a ten point scale
  var median = 5;
  this.rhythmLevel = {
    "w": median,
    "h": median,
    "q": median,
    "qd": median,
    "8": median,
    "8d": median,
    "16": median
  };
  
  //On a ten point scale
  var noteLevel = {};
  for(i=LOW_C; i < HIGH_E; i++) {
    noteLevel[i] = median;
  }
}