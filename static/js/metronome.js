function Metronome() {
  this.metronomeInterval = null;
  this.lookahead = 25.0; 
  this.scheduleAheadTime = 0.1;
  this.nextNoteTime = 0.0;
  this.noteResolution = 2;
  this.noteLength = 0.05;
  this.current16thNote;
  this.notesInQueue = [];

  var that = this;
  this.playBeat = function() {
    document.getElementById("metronome").play();
  
  };

  this.metronomeSound = undefined;
  this.tempo = 120;


  //nextNote, scheduleNote, and scheduler found at https://github.com/cwilso/metronome/blob/master/js/metronome.js
  function nextNote() {
      // Advance current note and time by a 16th note...
    var secondsPerBeat = 60.0 / that.tempo;    // Notice this picks up the CURRENT 
                                            // tempo value to calculate beat length.
    that.nextNoteTime += 0.25 * secondsPerBeat;    // Add beat length to last beat time

    that.current16thNote++;    // Advance the beat number, wrap to zero
    if (that.current16thNote == 16) {
        that.current16thNote = 0;
    }
  }

  function scheduleNote( beatNumber, time ) {
      // push the note on the queue, even if we're not playing.
    that.notesInQueue.push( { note: beatNumber, time: time } );

    if ( (that.noteResolution==1) && (beatNumber%2))
        return; // we're not playing non-8th 16th notes
    if ( (that.noteResolution==2) && (beatNumber%4))
        return; // we're not playing non-quarter 8th notes

    var metronomeSound = that.context.createBufferSource();
    metronomeSound.buffer = that.audioBuffer;
    metronomeSound.connect(that.context.destination);
    metronomeSound.start(time);
    metronomeSound.stop(time + that.noteLength);
  }

  function scheduler() {
      // while there are notes that will need to play before the next interval, 
      // schedule them and advance the pointer.
      while (that.nextNoteTime < that.context.currentTime + that.scheduleAheadTime ) {
          scheduleNote( that.current16thNote, that.nextNoteTime );
          nextNote();
      }
  }

  this.timerWorker = null;
  this.audioBuffer = null;

  function finishedLoading(bufferList) {
    that.metronomeSound = that.context.createBufferSource();
    that.audioBuffer = bufferList[0];
    that.metronomeSound.buffer = bufferList[0];
    that.metronomeSound.connect(that.context.destination);
    that.metronomeSound.start(0);
    
    that.timerWorker = new Worker("http://" + location.host + "/static/js/libs/metronomeworker.js");

    that.timerWorker.onmessage = function(e) {
        if (e.data == "tick") {
            scheduler();
        }
        else
            console.log("message: " + e.data);
    };
    that.timerWorker.postMessage({"interval":that.lookahead});
  }

  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  this.context = new AudioContext();

  bufferLoader = new BufferLoader(
    this.context,
    [
      "http://" + location.host + '/static/sounds/Tick.mp3'
    ],
    finishedLoading
    );

  bufferLoader.load();
  this.isPlaying = false;
}

Metronome.prototype.play = function(tempo) {
    this.isPlaying = !this.isPlaying;

    if (this.isPlaying) { // start playing
        this.current16thNote = 0;
        this.nextNoteTime = this.context.currentTime;
        this.timerWorker.postMessage("start");
        return "stop";
    } else {
        this.timerWorker.postMessage("stop");
        return "play";
    }
};

Metronome.prototype.stop = function() {
  clearInterval(this.metronomeInterval);
  this.metronomeInterval = null;
};

Metronome.prototype.isPlaying = function() {
    return isPlaying;
}

Metronome.prototype.setTempo = function(tempo) {
  this.tempo = tempo;
}