var rhythmMap = {
  "w": 4,
  "h": 2,
  "q": 1,
  "qd": 1.5,
  "8": 0.5,
  "8d": 0.75,
  "16": 0.25,
  "16d": 0.375,
};

var restMap = {
  "wr": 4,
  "hr": 2,
  "qr": 1,
  "qdr": 1.5,
  "8r": 0.5,
  "8dr": 0.75,
  "16r": 0.25,
  "16dr": 0.375,
};

var rhythmWholeMap = {
  "w": 32,
  "h": 16,
  "q": 8,
  "qd": 12,
  "8": 4,
  "8d": 6,
  "16": 2,
  "16d": 3,
};

var reverseRestMap = {
  '32': "wr",
  '16': "hr",
  '8': "qr",
  '4': "8r",
  '2': "16r",
  '1': "32r",
};

var possibleRestValues = [32, 16, 8, 4, 2, 1];

var rhythmValues = function() {
  var values = [];
  for(var key in rhythmMap) {
    values.push(rhythmMap[key]);
  } 
  return values;
};

var boardToMidi = {
  'A': 60,
  'W': 61,
  'S': 62,
  'E': 63,
  'D': 64,
  'F': 65,
  'T': 66,
  'G': 67,
  'Y': 68,
  'H': 69,
  'U': 70,
  'J': 71,
  'K': 72,
};

var octaveMap = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

function MidiMap() {
  this.midiMap = new Array(96);
  var octaveNum;
  var note;
  
  for (i = 0; i < 96; i++) {
    note = octaveMap[i%12];
    octaveNum = (i / 12) << 0;
    this.midiMap[i] = {
      note:  note + octaveNum,
      sheetNote: note.toLowerCase() + '/' + octaveNum
    };
  }
}

MidiMap.prototype.musicNote = function(midiNum) {
  return this.midiMap[midiNum].note;
};

MidiMap.prototype.sheetNote = function(midiNum) {
  return this.midiMap[midiNum].sheetNote;
};