var rhythmMap = {
  "w": 4,
  "h": 2,
  "q": 1,
  "Q": 1.5,
  "e": 0.5,
  "E": 0.75,
  "s": 0.25,
  "S": 0.175,
};

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

var midiMap = new Array(256);

midiMap[24] = "C2";
midiMap[25] = "Db2";
midiMap[26] = "D2";
midiMap[27] = "Eb2";
midiMap[28] = "E2";
midiMap[29] = "F2";
midiMap[30] = "F#2";
midiMap[31] = "G2";
midiMap[32] = "Ab2";
midiMap[33] = "A2";
midiMap[34] = "Bb2";
midiMap[35] = "B2";

midiMap[36] = "C3";
midiMap[37] = "Db3";
midiMap[38] = "D3";
midiMap[39] = "Eb3";
midiMap[40] = "E3";
midiMap[41] = "F3";
midiMap[42] = "F#3";
midiMap[43] = "G3";
midiMap[44] = "Ab3";
midiMap[45] = "A3";
midiMap[46] = "Bb3";
midiMap[47] = "B3";


midiMap[48] = "C4";
midiMap[49] = "Db4";
midiMap[50] = "D4";
midiMap[51] = "Eb4";
midiMap[52] = "E4";
midiMap[53] = "F4";
midiMap[54] = "F#4";
midiMap[55] = "G4";
midiMap[56] = "Ab4";
midiMap[57] = "A4";
midiMap[58] = "Bb4";
midiMap[59] = "B4";

midiMap[60] = "C5";
midiMap[61] = "Db5";
midiMap[62] = "D5";
midiMap[63] = "Eb5";
midiMap[64] = "E5";
midiMap[65] = "F5";
midiMap[66] = "F#5";
midiMap[67] = "G5";
midiMap[68] = "Ab5";
midiMap[69] = "A5";
midiMap[70] = "Bb5";
midiMap[71] = "B5";

midiMap[72] = "C6";
midiMap[73] = "Db6";
midiMap[74] = "D6";
midiMap[75] = "Eb6";
midiMap[76] = "E6";
midiMap[77] = "F6";
midiMap[78] = "F#6";
midiMap[79] = "G6";
midiMap[80] = "Ab6";
midiMap[81] = "A6";
midiMap[82] = "Bb6";
midiMap[83] = "B6";

midiMap[84] = "C7";
midiMap[85] = "Db7";
midiMap[86] = "D7";
midiMap[87] = "Eb7";
midiMap[88] = "E7";