var midiIn = null;

function handleKeyDown(event) {
  var note = boardToMidi[String.fromCharCode(event.keyCode)];
  piaNoteOn(note, MidiConstants.MAX_VELOCITY);
}

function handleKeyUp(event) {
  var note = boardToMidi[String.fromCharCode(event.keyCode)];
  piaNoteOff(note, 0);
}
 
var time = 0; 

var currentNote; 
 
function updateTime() {
  var now = performance.now();
  
  if (time !== 0) {
    var timePassed = (now - time) / 1000.0;
    updateRhythms(timePassed);
  }
  time = now;
}

function piaNoteOn(note, velocity) {
  main_piano.instrument.noteOn(note, velocity, 0);
  //updateKeyMap(note);
  
  currentNote = note;
  start = performance.now();
  
  updateSheetMusic(note);
  
  //updateTime();
}

function piaNoteOff(note) {
  stop = performance.now();
  var duration = (stop - start) / 1000.0;
  
  updateSheetMusic(note, duration);
  
  
  main_piano.instrument.noteOff(note, 0);
  
}

function midiMessageReceived(event) {
  var cmd = event.data[0] >> MidiConstants.CMD_SHIFT;
  var channel = event.data[0] & 0xf;
  var noteNumber = event.data[MidiConstants.NOTE_IDX];
  var velocity = event.data[MidiConstants.VELOCITY_IDX];

  if (channel == MidiConstants.INVALID_CHANNEL) {
    return;
  }
  
  if ( cmd==MidiConstants.NOTE_OFF_CMD 
    || ((cmd==MidiConstants.NOTE_ON_CMD)&&(velocity===0)) ) { // with MIDI, note on with velocity zero is the same as note off
    // note off
    piaNoteOff(noteNumber);
  } 
  else if (cmd == MidiConstants.NOTE_ON_CMD) {
    // note on
    piaNoteOn(noteNumber, velocity);
  }
  
}

function onMIDIStarted( midi ) {
  var preferredIndex = 0;

  midiAccess = midi;
  midiIn = midiAccess.inputs.values().next().value;
  
  if (midiIn) {
    console.log("midi connected");
    midiIn.onmidimessage = midiMessageReceived;
  }
}

function onMIDISystemError( err ) {
  console.log( "MIDI not initialized - error encountered:" + err.code );
}

function initializeUserInput() {
  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then( onMIDIStarted, onMIDISystemError );
  }
  
  addEvent(window, "keydown", handleKeyDown);
  addEvent(window, "keyup", handleKeyUp);
}