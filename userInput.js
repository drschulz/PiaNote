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
  console.log(String.fromCharCode(event.keyCode));
  var note = boardToMidi[String.fromCharCode(event.keyCode)];
  noteOn(note);
}

function handleKeyUp(event) {
  var note = boardToMidi[String.fromCharCode(event.keyCode)];
  noteOff(note);
}
 
var time = 0; 
 
function noteOn(note) {
  piano.play({pitch: midiMap[note]});
  var now = performance.now();
  
  if (time !== 0) {
    var timePassed = (now - time) / 1000.0;
    updateRhythms(timePassed);
  }
  time = now;
  updateKeyMap(midiMap[note]);
  updateVisualPiano(note, true);
		
}

function noteOff(note) {
  updateVisualPiano(note, false);
}

var NOTE_ON_CMD = 9;
var NOTE_OFF_CMD = 8;

function midiMessageReceived(event) {
  var cmd = event.data[0] >> 4;
  var channel = event.data[0] & 0xf;
  var noteNumber = event.data[1];
  var velocity = event.data[2];

  if (channel == 9) {
    return;
  }
  
  if ( cmd==NOTE_OFF_CMD || ((cmd==NOTE_ON_CMD)&&(velocity===0)) ) { // with MIDI, note on with velocity zero is the same as note off
    // note off
    noteOff(noteNumber);
  } 
  else if (cmd == NOTE_ON_CMD) {
    // note on
    noteOn(noteNumber);
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
  document.getElementById("synthbox").className = "error";
  console.log( "MIDI not initialized - error encountered:" + err.code );
}