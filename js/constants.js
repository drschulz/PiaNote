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
  OCTAVE: 12 
};

const keys = [
  {"Ab": -4},
  {"A": -3},
  {"Bb": -2},
  {"B": -1},
  {"Cb": -1},
  {"C": 0},
  {"C#": 1},
  {"Db": 1},
  {"D": 2},
  {"Eb": 3},
  {"E": 4},
  {"F": 5},
  {"F#": 6},
  {"Gb": 6},
  {"G": 7}
];

const sharpKeys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#'];
const flatKeys = ['C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'];

const naturalBase =   ['C',       undefined,  'D',        undefined,  'E',        'F',        undefined,  'G',        undefined,  'A',        undefined,  'B'];
const sharpBase =     ['B',       'C',        undefined,  'D',        undefined,  'E',        'F',        undefined,  'G',        undefined,  'A',        undefined];
const flatBase =      [undefined, 'D',        undefined,  'E',        'F',        undefined,  'G',        undefined,  'A',        undefined,  'B',        'C'];