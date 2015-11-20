function Instrument(channel, gmNumber) {
  this.channel = channel;
  this.gmNumber = gmNumber;
  
  MIDI.setVolume(channel, MidiConstants.MAX_VOLUME);
  MIDI.programChange(channel, gmNumber);
}

Instrument.prototype.noteOn = function(note, velocity, delay) {
  MIDI.noteOn(this.channel, note, velocity, delay);
};

Instrument.prototype.noteOff = function(note, delay) {
  MIDI.noteOff(this.channel, note, delay);
};

Instrument.prototype.play = function(note, velocity, duration, delay) {
  this.noteOn(note, velocity, delay);
  this.noteOff(note, delay+duration);
  
  return duration+delay;
};

Instrument.prototype.playChord = function(notes, velocity, duration, delay) {
  MIDI.chordOn(this.channel, notes, velocity, delay);
  MIDI.chordOff(this.channel, notes, velocity, duration + delay);
  
  return duration + delay;
};

Instrument.prototype.playMajorChord = function(baseNote, velocity, duration, delay) {
  notes = [baseNote, baseNote + Intervals.MJR_3RD, baseNote + Intervals.MJR_5TH];
  return this.playChord(notes, velocity, duration, delay);
};

Instrument.prototype.playMinorChord = function(baseNote, velocity, duration, delay) {
  notes = [baseNote, baseNote + Intervals.MNR_3RD, baseNote + Intervals.MJR_5TH];
  return this.playChord(notes, velocity, duration, delay);
};

Instrument.prototype.playSeventhChord = function(baseNote, velocity, duration, delay) {
  notes = [baseNote, baseNote + Intervals.MJR_3RD, baseNote + Intervals.MJR_5TH, baseNote + Intervals.MNR_7TH];
  return this.playChord(notes, velocity, duration, delay);
};

Instrument.prototype.walk = function(baseNote, velocity, tempo, delay) {
  this.noteOn(baseNote, velocity, tempo*(delay++));
  this.noteOn(baseNote + Intervals.MJR_3RD, velocity, tempo*(delay++));
  this.noteOn(baseNote + Intervals.MJR_5TH, velocity, tempo*(delay++));
  this.noteOn(baseNote + Intervals.MJR_6TH, velocity, tempo*(delay++));
  this.noteOn(baseNote + Intervals.OCTAVE, velocity, tempo*(delay++));
  this.noteOn(baseNote + Intervals.MJR_6TH, velocity, tempo*(delay++));
  this.noteOn(baseNote + Intervals.MJR_5TH, velocity, tempo*(delay++));
  this.noteOn(baseNote + Intervals.MJR_3RD, velocity, tempo*(delay++));
  
  return delay;
};

Instrument.prototype.halfWalk = function(baseNote, velocity, tempo, delay) {
  this.noteOn(baseNote, velocity, tempo*(delay++));
  this.noteOn(baseNote + Intervals.MJR_3RD, velocity, tempo*(delay++));
  this.noteOn(baseNote + Intervals.MJR_5TH, velocity, tempo*(delay++));
  this.noteOn(baseNote + Intervals.MJR_6TH, velocity, tempo*(delay++));
  
  return delay;
};





