import os
from flask import Flask, request, session, render_template, g, redirect, url_for, flash, abort, make_response
from flask.ext.sqlalchemy import SQLAlchemy
from pianoteDB import PiaNoteDB
import json
app = Flask(__name__) #, static_url_path='', static_folder='')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']
db = SQLAlchemy(app)

@app.route('/')
def ind():
	if 'username' in session:
		print(" .... uhhh")
		return render_template('index.html', username=session['username'])

	return render_template('login2.html')    


@app.route('/home/<name>')
def index(name):
	return render_template('index.html', username=name)#app.send_static_file('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
	if request.method == 'POST':
		#print('here!')
		username = request.form['name'];
		#print('also here!')
		#print(username);
		#pDB = get_db();
		user = User(str(username));
		db.session.add(user);
		db.session.commit();
		g.db.addNewUser(str(username));
		print("done!")

		return "registered"
	else:
		return "hello"


@app.route('/load') 
def loadScores():
	if 'username' in session:
		data = g.db.getUserData(session['username']);
		print(data);
		if data is None:
			abort(404);
		return data
		#resp = make_response(data);
		#resp.content_type = "application/json";
		#return resp;

	abort(404);
	

@app.route('/score', methods=['POST'])
def saveScores():
	data = request.get_json();

	if 'username' in session:
		g.db.submitUserData(session['username'], json.dumps(data))
		return "data saved"

	return "data not saved"


@app.route('/login', methods=['GET', 'POST'])
def login():
	if request.method == 'POST':
		print(str(request.form['name']));
		#pDB = get_db();
		userExists = g.db.userExists(request.form['name']);

		if userExists:
			session['username'] = request.form['name'];
			return redirect(url_for('ind'));
		else:
			flash("Invalid Username, please try again")
			return render_template('login2.html')#app.send_static_file('login.html');
	else:
		print("hi there")
		return render_template('login2.html')#app.send_static_file('login.html')


@app.route('/logout')#, methods=['POST'])
def logout():
    # remove the username from the session if it's there
	session.pop('username', None)
	print("logging out!")
    
	return render_template('login2.html')#redirect(url_for('login'));



def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = PiaNoteDB('pianote.db') 
    return db

@app.before_request
def before_request():
    g.db = get_db()

@app.teardown_request
def teardown_request(exception):
    db = getattr(g, 'db', None)
    if db is not None:
        db.closeConnection()

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.closeConnection()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True)
    data = db.Column(db.TEXT, unique=True)

    def __init__(self, username):
        self.username = username

    def __repr__(self):
        return '<User %r>' % self.username


def main():
	port = int(os.environ.get("PORT", 5000))
	app.secret_key = os.urandom(24)
	app.run(debug=True, host='0.0.0.0', port=port)

if __name__ == "__main__":
    main()

    