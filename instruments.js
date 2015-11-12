/*var piano = new Wad({
    source : 'square', 
    env : {
        attack : 0.01, 
        decay : 0.4, 
        sustain : 0.0, 
        hold : 0.0, 
        release : 0.1
    }, 
    filter : {
        type : 'lowpass', 
        frequency : 1200, 
        q : 8.5, 
        env : {
            attack : 0.02, 
            frequency : 600
        }
    }
});*/

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