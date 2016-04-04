var midiMap = new MidiMap();

const MidiConstants = {
  DEFAULT_CHANNEL: 1,
  INVALID_CHANNEL: 9,
  CMD_SHIFT: 4,
  NOTE_IDX: 1,
  VELOCITY_IDX: 2,
  NOTE_ON_CMD: 9,
  NOTE_OFF_CMD: 8,
  MAX_VELOCITY: 127,
  MAX_VOLUME: 127,
};

const GeneralMIDI = {
  PIANO: 0,
  BASS: 32
};

const MidiChannels = {
  PIANO_ACCOMP: 0,
  MAIN_PIANO: 1,
  BASS_ACCOMP: 2
};

const SECONDS_IN_MINUTE = 60;
const SHORTEST_RHYTHM = 0.125;

const MIDDLE_C = 60;
const HIGH_E = 88;
const LOW_C = 48;//36;
const LOWEST_C = 36;

const Intervals = {
  MJR_1ST: 0,
  MJR_2ND: 2,
  //MNR_3RD: 3,
  MJR_3RD: 4,
  MJR_4TH: 5,
  MJR_5TH: 7,
  MJR_6TH: 9,
  //MNR_7TH: 10,
  MJR_7TH: 11,
  OCTAVE: 12,
  
  OCTAVE_2ND: 14,
  OCTAVE_3RD: 16,
  OCTAVE_4TH: 17,
  OCTAVE_5TH: 19,
  OCTAVE_6TH: 21,
  OCTAVE_7TH: 23,
  OCTAVE_2: 24
};

const NoteIntervals = [
  0, //MJR 1st
  2, //MJR 2nd
  4, //MJR 3rd
  5, //MJR 4th
  7, //MJR 5th
  9, //MJR 6th
  11, //MJR 7th
//  12, //Octave

//  14, //Octave 2nd
//  16, //Octave 3rd
//  17, //Octave 4th
//  19, //Octave 5th
//  21, //Octave 6th
//  23, //Octave 7th
//  24, //2nd Octave
];


const MajorChordIntervals = [
  0, //MJR 1st
  4, //MJR 3rd
  7, //MJR 5th
  //11, //MJR 7th
  12, //Octave
  16, //Octave 3rd
  19, //Octave 5th
  //23, //Octave 7th
  24, //Second Octave
  -5, //MJR 5th under 1st
];

const MinorChordIntervals = [
  0, //1st
  3, //MNR 3rd
  7, //5th
  //10, //MNR 7th
  12, //Octave
  15, //Octave MNR 3rd
  19, //Octave 5th
  //22, //Octave MNR 7th
  24, //Second Octave
  -5, //5th under 1st
];

const keyChords = [
  {interval: 0, type: 'M'},
  {interval: 2, type: 'm'},
  {interval: 4, type: 'm'},
  {interval: -7, type: 'M'},
  {interval: -5, type: 'M'},
  {interval: -3, type: 'm'},

  /*{interval: -3, type: 'm'},
  {interval: -5, type: 'M'},
  {interval: -7, type: 'M'},
  {interval: -8, type: 'm'},
  {interval: -10, type: 'm'},
  {interval: -12, type: 'M'}*/
];

//Form MidiIntervalFromKeyBase: Major or Minor
const ChordsForKey = {
  0: 'M', //With key of C, chord C Major
  2: 'm', //With key of C, chord D Minor
  4: 'm', //WIth key of C, chord E Minor
  5: 'M', //With key of C, chord F Major
  7: 'M', //With key of C, chord G Major
  9: 'm', //with key of C, chord A Minor 
};


const keys = {
  "C": 0,
  "G": 7,
  "F": 5,
  "D": 2,
  "Bb": -2,
  "A": 9,
  "Eb": 3,
};

const musicalKeys = ['C', 'G', 'F', 'D', 'Bb', 'A', 'Eb'];

const sharpKeys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#'];
const flatKeys = ['C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'];

const naturalBase =   ['C',       undefined,  'D',        undefined,  'E',        'F',        undefined,  'G',        undefined,  'A',        undefined,  'B'];
const sharpBase =     ['B',       'C',        undefined,  'D',        undefined,  'E',        'F',        undefined,  'G',        undefined,  'A',        undefined];
const flatBase =      [undefined, 'D',        undefined,  'E',        'F',        undefined,  'G',        undefined,  'A',        undefined,  'B',        'C'];

const rhythmsList = ["w", "h", "q", "8", "qd", "16", "8d"];

const WHOLE_NOTE_VALUE = 16;

const NoteRhythms = {
  WHOLE: WHOLE_NOTE_VALUE,
  HALF: WHOLE_NOTE_VALUE / 2,
  D_HALF: WHOLE_NOTE_VALUE * 3 / 4,
  QUARTER: WHOLE_NOTE_VALUE / 4,
  D_QUARTER: WHOLE_NOTE_VALUE * 3 / 8,
  EIGTH: WHOLE_NOTE_VALUE / 8,
  D_EIGTH: WHOLE_NOTE_VALUE * 3 / 16,
  SIXTEENTH: WHOLE_NOTE_VALUE / 16
};

const RhythmToText = {
  32: "Whole",
  16: "Whole Note",
  8: "Half Note",
  12: "Dotted Half Note",
  6: "Dotted Quarter Note",
  4: "Quarter Note",
  3: "Dotted Eigth Note",
  2: "Eigth Note",
  1: "16th Note",
  0: "None"
};

const REST = -1;

const MATCH_SCORES = {
  TONE_MISMATCH: -3,
  LETTER_MISMATCH: -2,
  OCTAVE_MISMATCH: -1,
  TONE_MATCH: 3,
  
  INTERVAL_MATCH: 1,
  INTERVAL_MISMATCH: 0,
  
  RHYTHM_MATCH: 3,
  RHYTHM_MISMATCH: -3,
  
  INSERTION_DELETION: -4,
};

const MatchDirection = {
  DIAG: 1,
  LEFT: 2,
  TOP: 3
};

const BPMS = [80, 90, 100, 120];

const abcOctave = [",,,,",",,,",",,",",","","'", "''", "'''"];








