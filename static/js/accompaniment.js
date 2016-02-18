function playSynchopatedChordBar1(chord, curBeat) {
  curBeat += 0.5*tempo;
  curBeat = piano_accomp.playSeventhChord(chord, MidiConstants.MAX_VELOCITY, 
    tempo*(rhythmMap["qd"]), curBeat);
  curBeat = piano_accomp.playSeventhChord(chord, MidiConstants.MAX_VELOCITY, 
    tempo*(rhythmMap["h"]), curBeat);
    
  return curBeat;
}

function playSynchopatedChordBar2(chord, curBeat) {
  curBeat = piano_accomp.playSeventhChord(chord, MidiConstants.MAX_VELOCITY, 
    tempo*(rhythmMap["qd"]), curBeat);
  curBeat = piano_accomp.playSeventhChord(chord, MidiConstants.MAX_VELOCITY, 
    tempo*(rhythmMap["h"] + rhythmMap['8']), curBeat);
    
  return curBeat;
}

function playSyncopatedChord(chord, curBeat) {
  curBeat = playSynchopatedChordBar1(chord, curBeat);
  curBeat = playSynchopatedChordBar2(chord, curBeat);
  
  return curBeat;
}

function playProgression() {
  var curBeat = 0;
  curBeat = playSyncopatedChord(48, curBeat); //C
  curBeat = playSyncopatedChord(48, curBeat); //C
  curBeat = playSyncopatedChord(53, curBeat); //F
  curBeat = playSyncopatedChord(48, curBeat); //C
  curBeat = playSynchopatedChordBar1(55, curBeat); //G
  curBeat = playSynchopatedChordBar2(53, curBeat); //F
  curBeat = playSyncopatedChord(48, curBeat); //C
}

function playBassline() {
   var basecurBeat = 0;
   basecurBeat = bass.walk(36, MidiConstants.MAX_VELOCITY, tempo, basecurBeat);
   basecurBeat = bass.walk(36, MidiConstants.MAX_VELOCITY, tempo, basecurBeat);
   basecurBeat = bass.walk(41, MidiConstants.MAX_VELOCITY, tempo, basecurBeat);
   basecurBeat = bass.walk(36, MidiConstants.MAX_VELOCITY, tempo, basecurBeat);
   basecurBeat = bass.halfWalk(43, MidiConstants.MAX_VELOCITY, tempo, basecurBeat);
   basecurBeat = bass.halfWalk(41, MidiConstants.MAX_VELOCITY, tempo, basecurBeat);
   basecurBeat = bass.walk(36, MidiConstants.MAX_VELOCITY, tempo, basecurBeat);
}

function playAccompaniment() {
  playProgression();
  playBassline();
}

function initializeAccompaniment() {
  bass = new Instrument(MidiChannels.BASS_ACCOMP, GeneralMIDI.BASS);
  piano_accomp = new Instrument(MidiChannels.PIANO_ACCOMP, GeneralMIDI.PIANO);
}