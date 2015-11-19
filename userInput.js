var midiIn = null;

function updateVisualPiano(note, isPressed) {
  var e = document.getElementById("k" + note);
  if (e) {
    if (isPressed) {
      e.classList.add("pressed");
    }
    else {
      e.classList.remove("pressed");
    }
  }
}

function handleKeyDown(event) {
  var note = boardToMidi[String.fromCharCode(event.keyCode)];
  piaNoteOn(MidiConstants.DEFAULT_CHANNEL, note, MidiConstants.MAX_VELOCITY, 0);
}

function handleKeyUp(event) {
  var note = boardToMidi[String.fromCharCode(event.keyCode)];
  piaNoteOff(MidiConstants.DEFAULT_CHANNEL, note, 0);
}
 
var time = 0; 
 
 
function updateTime() {
  var now = performance.now();
  
  if (time !== 0) {
    var timePassed = (now - time) / 1000.0;
    updateRhythms(timePassed);
  }
  time = now;
}

function piaNoteOn(channel, note, velocity, delay) {
  MIDI.noteOn(channel, note, velocity, delay);
  setTimeout(updateTime, delay);
  updateKeyMap(note);
  setTimeout(function() { 
    updateTime();
    updateVisualPiano(note, true);
  }, delay*1000);
		
}

function piaNoteOff(channel, note, delay) {
  MIDI.noteOff(channel, note, delay);
  setTimeout(function() {
    updateVisualPiano(note, false);
  }, delay*1000);
  
}

const NOTE_ON_CMD = 9;
const NOTE_OFF_CMD = 8;

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
    piaNoteOff(MidiConstants.DEFAULT_CHANNEL, noteNumber, 0);
  } 
  else if (cmd == MidiConstants.NOTE_ON_CMD) {
    // note on
    piaNoteOn(MidiConstants.DEFAULT_CHANNEL, noteNumber, velocity, 0);
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