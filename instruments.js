var piano = new Wad({
    source : 'square', 
    env : {
        attack : 0.01, 
        decay : 0.005, 
        sustain : 0.2, 
        hold : 0.015, 
        release : 0.3
    }, 
    filter : {
        type : 'lowpass', 
        frequency : 1200, 
        q : 8.5, 
        env : {
            attack : 0.2, 
            frequency : 600
        }
    }
});

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