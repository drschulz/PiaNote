var main_piano;
var lastNote = 0;

var rhythms = {};

function findClosest(query, obj) {
  var best = '';
  var min = Number.MAX_VALUE;
  
  for (var value in obj) {
    var num = Math.abs(obj[value] - query);
    if (num < min) {
      min = num;
      best = value;
    }
  }
  
  return best;
}

var lastRhythm = '';

function updateMap(valueToAdd, map, key) {
  if(map[key] === undefined) {
    map[key] = [valueToAdd];
  }
  else {
    map[key].push(valueToAdd);
  }
  
}

function updateRhythms(temp) {
  temp = temp / tempo;
  if (temp < SHORTEST_RHYTHM) {
    return;
  }
  var closestRhythm = findClosest(temp, rhythmMap);
  if (lastRhythm !== '') {
    updateMap(closestRhythm, rhythms, lastRhythm);
  }
  lastRhythm = closestRhythm;
}

var keyMap = new Array(96);

function updateKeyMap(note) {
  if (lastNote !== 0) {
    updateMap(note, keyMap, lastNote);
  }

  lastNote = note;
}

var songcurBeat = 0;

function getRandomKey(obj) {
  var keys = Object.keys(obj);
  return keys[Math.random() * keys.length << 0];
}

var sheetNotes = [];
var beams = [];

function drawSheetMusic() {
  if (ctx !== undefined) {
    ctx.clear();
  }
  ctx = renderer.getContext();
  stave = new Vex.Flow.Stave(10, 10, 1500);
  stave.addClef("treble").setContext(ctx).draw();
  
   Vex.Flow.Formatter.FormatAndDraw(ctx, stave, sheetNotes, {auto_beam: true});
}

function playTune() {
  sheetNotes = [];
  songcurBeat = 0;
  
  var note = getRandomKey(keyMap);
  var noteMap = keyMap[note];
  var dur = getRandomKey(rhythms);
  var durMap = rhythms[dur];
  var sheetNote;
  var currentDur = 0;
  var remaining = 0;
  
  while(songcurBeat < 48*8) {
    if (currentDur != 32 && currentDur + rhythmWholeMap[dur] > 32) {
      remaining = 32 - currentDur;
      //Add a rest
      songcurBeat += remaining;
      var i = 0;
      var nextRestVal;
      while(currentDur < 32 && i < possibleRestValues.length) {
        nextRestVal = possibleRestValues[i];
        if (currentDur + nextRestVal <= 32) {
          sheetNotes.push(new Vex.Flow.StaveNote({keys: ["b/4"], duration: reverseRestMap["" + nextRestVal]}));
          currentDur += nextRestVal;
        }
        else {
          i++;
        }
      }
    }
    if (currentDur == 32) {
      sheetNotes.push(new Vex.Flow.BarNote(1));
      currentDur = 0;
    }
    console.log("duration: "  + dur);
    main_piano.instrument.play(note, MidiConstants.MAX_VELOCITY, tempo*rhythmWholeMap[dur]/8.0, tempo*(songcurBeat/8.0));
    songcurBeat += rhythmWholeMap[dur];
    if (dur.indexOf("d") != -1) {
      sheetNote = new Vex.Flow.StaveNote({ keys: [midiMap.sheetNote(note)], duration: dur}).addDotToAll();
    }
    else {
      sheetNote = new Vex.Flow.StaveNote({ keys: [midiMap.sheetNote(note)], duration: dur});
    }
    currentDur += rhythmWholeMap[dur];
    sheetNotes.push(sheetNote);
    
    note = noteMap[Math.random()*noteMap.length << 0];
    noteMap = keyMap[note];
    
    dur = durMap[Math.random()*durMap.length << 0];
    durMap = rhythms[dur];
  }
  
  drawSheetMusic();
}

var tempo;

function addEvent(element, eventName, callback) {
    if (element.addEventListener) {
        element.addEventListener(eventName, callback, false);
    } else if (element.attachEvent) {
        element.attachEvent("on" + eventName, callback);
    }
}

var midiMap;
var ctx;

function startAccompanimentLoop() {
  playAccompaniment();
  
  setInterval(playAccompaniment, tempo * 48 * 1000 << 0);
  setInterval(playTune, tempo * 48 * 1000 << 0);
}

var metronome;

function playBeat() {
  metronome.play();
}

var metronomeInterval;

function playMetronome() {
  metronomeInterval = setInterval(playBeat, tempo * 1000 << 0);
}

function stopMetronome() {
  clearInterval(metronomeInterval);
}


function initializeButtons() {
  $("#play-button").prop("disabled", true);
  //$("#play-button").click(startAccompanimentLoop);
  $("#play-button").click(function() {
    playMetronome();
    $("#play-button").hide();
    $("#stop-button").show();
  });
  
  $("#stop-button").click(function() {
    stopMetronome();
    $("#stop-button").hide();
    $("#play-button").show();
  });
  
  $("#generate-button").click(generateSong);
  
}

function initializeMaps() {
  midiMap = new MidiMap();
}

function initializeTempo() {
  var bpm = 100;
  tempo = SECONDS_IN_MINUTE / bpm;
}

function initializeSheetMusic() {
  var canvas = $('#mystaff')[0]; 
  renderer = new Vex.Flow.Renderer(canvas,
  Vex.Flow.Renderer.Backends.SVG);
}

function initializeMidi() {
  var progressBar = progressJs("#main-panel").setOption("theme", "red");
  progressBar.start();
  MIDI.loadPlugin({
		soundfontUrl: "./soundFonts/FluidR3_GM/",
		instrument: ["acoustic_grand_piano", "acoustic_bass"],
		onprogress: function(state, progress) {
		  progressBar.set(progress * 100);
		  console.log(progress);
		},
		onsuccess: function() {
		  progressBar.end();
		  initializeAccompaniment();
		  main_piano = new UserPiano("#piano-container");
		  $("#play-button").prop("disabled", false);
		  
		  console.log(MIDI.supports);
      var player = MIDI.Player;
      player.timeWarp = 1;
      player.loadFile('http://localhost:54007/PiaNote/sounds/entrtanr.mid', player.start, function() {
        console.log("hello..");
      }, function(e) {
        console.log('could not load!');
        console.log(e);
      });
		}
	});
}

function initializeMetronome() {
  //found from http://soundbible.com/2044-Tick.html
  metronome = new Wad({source: 'http://127.0.0.1:51792/PiaNote/sounds/Tick.mp3'});
}

var playerSheetIndex = 0;

function updateSheetMusic(noteNumber, duration) {
  if (duration === undefined) {
    var note = new Note({tone: noteNumber, rhythm: "q"});
    //playerPiece.piece.notes.push(note);
    playerPiece.piece.notes[playerSheetIndex] = note;
    
  }
  else {
    var temp = duration / tempo;
    if (temp < SHORTEST_RHYTHM) {
      return;
    }
    var closestRhythm = findClosest(temp, rhythmMap);
    playerPiece.piece.notes[playerSheetIndex].rhythm = closestRhythm;
    playerSheetIndex++;
    //playerPiece.piece.notes[playerPiece.piece.notes.length - 1].rhythm = closestRhythm;
  }
  
  renderSong(playerPiece, "#playerstave", "blue");
}

function createSong() {
  var tones = [61, 62, 64, 65, 67, 69, 71, 72];
  var notes = [];
  tones.forEach(function(e) {
    console.log(e);
    notes.push(new Note({tone: e, rhythm: "q"}));
  });
  
  return notes;
}

function createOtherSong() {
  var tones = [72, 74, 76, 77, 79, 81, 83, 84];
  var notes = [];
  tones.forEach(function(e) {
    console.log(e);
    notes.push(new Note({tone: e, rhythm: "q"}));
  });
  
  return notes;
}

function generateIntervals() {
  var tones = [];
  var intervals = Object.keys(Intervals);
  
  var interval;
  
  for(i = 0; i < 8; i++) {
    interval = (Math.random() * intervals.length) << 0;
    tones.push(Intervals[intervals[interval]]);
  }
  
  return tones;
}

function generateKey() {
  return keys[(Math.random() * keys.length) << 0];
}

function transpose(intervals, key) {
  var tones = [];
  var baseOfKey;
  for (var indx in key) {
    baseOfKey = key[indx];
  }
  console.log(baseOfKey);
  intervals.forEach(function(e) {
    tones.push(MIDDLE_C + baseOfKey + e);
  });
  
  return tones;
}

function renderSong(piece, location, color) {
  $(location).empty();
  var canvas = $(location)[0];
  console.log(location);
  console.log(canvas);
  var renderer = new Vex.Flow.Renderer(canvas,
  Vex.Flow.Renderer.Backends.RAPHAEL);
  
  
  console.log(renderer);
  renderer.ctx.setFillStyle(color);
  renderer.ctx.setStrokeStyle(color);
  var artist = new Artist(10, 10, 900, {scale: 1.0});

  var vextab = new VexTab(artist);

  try {
   console.log(piece.vexdump());
   var elements = vextab.parse(piece.vexdump());
   console.log(elements);
   artist.render(renderer);
  }
  catch (e) {
    console.log(e.message);
  }
}

var playerPiece;

function generateSong() {
  var intervals = generateIntervals();
  var key = generateKey();
  var tones = transpose(intervals, key);
  
  var notes = [];
  console.log(tones);
  tones.forEach(function(e) {
    console.log(e);
    notes.push(new Note({tone: e, rhythm: "q"}));
  });
  
  var keyLetter = Object.keys(key)[0];
  
  var config = {
    time: "4/4",
    clef: "treble",
    key: keyLetter,
    notes: notes,
    isSharpKey: sharpKeys.indexOf(keyLetter) > 0 ? true : false,
  };
  
  var piece = new Musical_Piece(config);
  
  renderSong(piece, "#mystave", "black");
  
  var playerNotes = [];
  playerSheetIndex = 0;
  
  for(i = 0; i < 8; i++) {
    playerNotes.push(new Note({tone: 12, rhythm: "q"}));
  }
  
  var playerConfig = {
    time: "4/4",
    clef: "treble",
    key: keyLetter,
    notes: playerNotes,
    isSharpKey: sharpKeys.indexOf(keyLetter) > 0 ? true : false,
  };
  
  playerPiece = new Musical_Piece(playerConfig);
  
  renderSong(playerPiece, "#playerstave", "#455ede");
  
}

function initializeSong() {
  var notes = createSong();
  
  var config = {
    time: "4/4",
    clef: "treble",
    key: "C#",
    notes: notes,
    isSharpKey: true
  };
  
  var piece = new Musical_Piece(config);
  
  var canvas = $('#mystave')[0]; 
  var renderer = new Vex.Flow.Renderer(canvas,
  Vex.Flow.Renderer.Backends.RAPHAEL);
  
  console.log(renderer);
  
  var artist = new Artist(10, 10, 900, {scale: 1.0});

  var vextab = new VexTab(artist);

  try {
   var elements = vextab.parse(piece.vexdump());
   console.log(elements);
   artist.render(renderer);
  }
  catch (e) {
    console.log(e.message);
  }
  /*config.notes = createOtherSong();
  
  renderer.ctx.setFillStyle("red");
  renderer.ctx.setStrokeStyle("red");
  
  piece = new Musical_Piece(config);
  vextab.parse(piece.vexdump());
  artist.render(renderer);*/
  
  
  //$("#stave").find(".editor").val(piece.vexdump());
  //$("#stave").find(".editor").keyup();
}

function initializePiaNote() {
  initializeButtons();
  initializeMaps();
  initializeTempo();
  initializeUserInput();
  //initializeSheetMusic();
  initializeMidi();
  initializeMetronome();
  generateSong();
  //initializeSong();
}

var song;

//init: start up MIDI
window.addEventListener('load', function() {   
  initializePiaNote();
});