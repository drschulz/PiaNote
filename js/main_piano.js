function UserPiano(id) {
  function createVisualPiano() {
    var octave = [0, 1, 0, 1, 0, 2, 0, 1, 0, 1, 0, 1, 0, 2];
    var currentKey;
    var currentKeyNum = 48;
    $(id).append("<div id='blackkeys'></div>");
    for(i = 0; i < 4*octave.length; i++) {
     currentKey = octave[i % octave.length];
     if (currentKey === 0) {
       $(id).append("<paper-card id='k" 
        + currentKeyNum + "' class='white key animated fadeInDown' elevation='5'></paper-card>");
       currentKeyNum ++;
     }
     else if (currentKey == 1) {
       $('#blackkeys').append("<paper-card id='k" 
        + currentKeyNum + "' class='black key animated fadeInDown' elevation='5'></paper-card>");
       currentKeyNum++;  
     }
     else {
       $('#blackkeys').append("<div class='empty' elevation='1'></div>");
     }
    }
  }
  
  function updateVisualPiano(note, isPressed) {
    var e = $("#k" + note)[0];
    if (e) {
      if (isPressed) {
        e.classList.add("pressed");
      }
      else {
        e.classList.remove("pressed");
      }
    }
  }
  
  createVisualPiano();
  
  this.muted = false;
  this.instrument = new Instrument(MidiChannels.MAIN_PIANO, GeneralMIDI.PIANO);
  var that = this;
  
  
  this.instrument.noteOn = function(note, velocity, delay) {
    
    if (!that.muted) {
      MIDI.noteOn(this.channel, note, velocity, delay);
    }
    setTimeout(function() {
      updateVisualPiano(note, true);
    }, 1000*delay);
  };
  
  this.instrument.noteOff = function(note, delay) {
    MIDI.noteOff(this.channel, note, delay);
    setTimeout(function() {
      updateVisualPiano(note, false);
    }, 1000*delay);
  };
}

UserPiano.prototype.mute = function() {
  this.mute = true;
};

UserPiano.prototype.unmute = function() {
  this.mute = false;
};