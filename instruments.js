var piano = new Wad(Wad.presets.piano);

piano.globalReverb = true;

var bass = new Wad({
    source : 'sine',
    env : {
        attack : 0.02,
        decay : 0.1,
        sustain : 0.9,
        hold : 0.4,
        release : 0.1
    }
});