#PiaNote

Welcome to PiaNote.

PiaNote is an open source sight reading tool for piano players.

PiaNote automatically monitors a player's performance in order to present users with new pieces to sight read that are beneficial to that player's current ability. PiaNote also pushes players to their limits in order to improve their abilities over time. All pieces are algorithmically generated to ensure player's have different performances to sight read each time.

As a result, PiaNote provides a fully customized and tailored sight reading experience for users.

Thanks to:

- [MIDI.js] (https://github.com/mudcube/MIDI.js/)
- [midi-js-soundfonts] (https://github.com/gleitz/midi-js-soundfonts)
- [abcjs] (https://github.com/paulrosen/abcjs)
- [combinatorics] (https://github.com/dankogai/js-combinatorics)


Needed to run this program:
- bower
- python (or some way to set up a local server)
	- Flask (http://flask.pocoo.org/)
- Google Chrome

HOW TO RUN:

in the PiaNote directory, go to the static directory and run:

bower install

After that completes, in the PiaNote directory, run:

python server.py

Open up Google Chrome on Localhost:5000
