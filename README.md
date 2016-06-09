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

## Development setup

Optional: set up a Python virtualenv by running

    virtualenv venv
    source venv/bin/activate

Install dependencies by running

    bower install
    pip install -r requirements.txt

After that completes, start the server with

    export DATABASE_URL=sqlite:///pianote.db
    python server.py

Open <http://localhost:5000> in Google Chrome.
