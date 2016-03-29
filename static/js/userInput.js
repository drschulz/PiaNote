function UserInput(config) {
  var midiIn = null;
  this.noteOn = config.noteOn;
  this.noteOff = config.noteOff;
  var that = this;
  function addEvent(element, eventName, callback) {
    if (element.addEventListener) {
        element.addEventListener(eventName, callback, false);
    } else if (element.attachEvent) {
        element.attachEvent("on" + eventName, callback);
    }
  }
  
  function handleKeyDown(event) {
    var note = boardToMidi[String.fromCharCode(event.keyCode)];
    that.noteOn(note, MidiConstants.MAX_VELOCITY);
  }
  
  function handleKeyUp(event) {
    var note = boardToMidi[String.fromCharCode(event.keyCode)];
    that.noteOff(note, 0);
  }

  function onStateChange(event) {
    var port = event.port;
    if (port.state == "disconnected") {
      $("#midi-connected").hide();
      $("#midi-not-connected").show();
      console.log("midi disconnected");
    }
    else {
      midiIn = midiAccess.inputs.values().next().value;
      midiIn.onmidimessage = midiMessageReceived;

      console.log("midi connected");
      $("#midi-connected").show();
      $("#midi-not-connected").hide();

    }
  }
  


  function onMIDIStarted( midi ) {
    var preferredIndex = 0;
    midiAccess = midi;
    midiIn = midiAccess.inputs.values().next().value;
    
    console.log(midi);

    midiAccess.onstatechange = onStateChange;

    if (midiIn) {
      console.log("midi connected");
      $("#midi-connected").show();
      $("#midi-not-connected").hide();

      midiIn.onmidimessage = midiMessageReceived;
    }
    else {
      $("#midi-connected").hide();
      $("#midi-not-connected").show();
      console.log("midi not connected");
    }
  }
  
  function onMIDISystemError( err ) {
    alert( "MIDI not initialized - error encountered:" + err.code );
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
      that.noteOff(noteNumber);
    } 
    else if (cmd == MidiConstants.NOTE_ON_CMD) {
      // note on
      that.noteOn(noteNumber, velocity);
    }
    
  }

  
  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then( onMIDIStarted, onMIDISystemError );
  }
  
  //addEvent(window, "keydown", handleKeyDown);
  //addEvent(window, "keyup", handleKeyUp);
}