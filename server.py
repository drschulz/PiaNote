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
		user = Users.query.filter_by(username=session['username']).first();
		user.session = user.session + 1;
		db.session.commit()
		session['sessionNum'] = user.session
		return render_template('index.html', username=session['username'], sessionNum=session['sessionNum'])

	return render_template('login2.html')    


@app.route('/register', methods=['GET', 'POST'])
def register():
	if request.method == 'POST':
		username = request.form['name'];
		if Users.query.filter_by(username=username).scalar():
			return "userExists"
		user = Users(str(username));
		user.session = 0;
		db.session.add(user);
		db.session.commit();
		print("done!")

		return "registered"
	else:
		return "hello"


@app.route('/load') 
def loadScores():
	if 'username' in session:
		data = Users.query.filter_by(username=session['username']).first(); #g.db.getUserData(session['username']);
		print(data);
		if data.profile is None or data.stats is None:
			bundle = {"control": data.control}
			return json.dumps(bundle)
			#abort(404);
		
		bundle = {"stats": json.loads(data.stats), "profile": json.loads(data.profile), "control": data.control}

		return json.dumps(bundle);

	abort(404);
	

@app.route('/score', methods=['POST'])
def saveScores():
	data = request.get_json();

	if 'username' in session:
		user = Users.query.filter_by(username=session['username']).first();
		#print (data['sharpKeyLevel']);
		performance = PerformanceData(user.id, session['sessionNum'], data['songNum'], json.dumps(data['piece']), json.dumps(data['level']))
		performance.performance = json.dumps(data['performance'])
		performance.accuracies = json.dumps(data['accuracies'])
		performance.profile = json.dumps(data['profile'])
		performance.stats = json.dumps(data['stats'])
		performance.attempt = data['attempt']
		db.session.add(performance)
		db.session.commit()

		user.profile = json.dumps(data['profile'])
		user.stats = json.dumps(data['stats'])
		db.session.commit()


		#g.db.submitUserData(session['username'], json.dumps(data))
		return "data saved"

	return "data not saved"
	
@app.route('/savePrePostTest', methods=['POST'])
def savePrePost():
	data = request.get_json();

	if 'username' in session:
		user = Users.query.filter_by(username=session['username']).first();
		#print (data['sharpKeyLevel']);
		prePostTest = PrePostTest(user.id, data['pieceType'], data['pieceNum'], json.dumps(data['performance']), json.dumps(data['accuracies']))
		db.session.add(prePostTest)
		db.session.commit()
		
		user.profile = json.dumps(data['profile'])
		user.stats = json.dumps(data['stats'])
		db.session.commit()


		#g.db.submitUserData(session['username'], json.dumps(data))
		return "data saved"

	return "data not saved"

@app.route('/saveSurvey', methods=['POST'])
def saveSurvey():
	data = request.get_json();
	
	sessionNum = data['sessionNum'];
	pieceNum = data['pieceNum'];
	
	if 'username' in session:
		user = Users.query.filter_by(username=session['username']).first();
		if user is None:
			print("no user")
		print (user.id)
		print(sessionNum)
		print(pieceNum)
		performance = PerformanceData.query.filter_by(user_id=user.id, session_number=session['sessionNum'], piece_number=pieceNum, attempt=1).first();
		if performance is None:
			print("no performance")
			abort(404);
			#return "data not saved"
		
		performance.survey = json.dumps(data['survey']);
		db.session.commit();
		
		return "data saved"
	
	abort(404);
	#return "data not saved"

@app.route('/login', methods=['GET', 'POST'])
def login():
	if request.method == 'POST':
		print(str(request.form['name']));
		name = str(request.form['name']);
		userExists = Users.query.filter_by(username=name).scalar(); #g.db.userExists(request.form['name']);
		print ("exists: " + str(Users.query.filter_by(username=name).scalar()))
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
	session.pop('sessionNum', None)
	print("logging out!")
    
	return redirect(url_for('ind'));#render_template('login2.html')#redirect(url_for('login'));



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


class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True)
    control = db.Column(db.Boolean, default=False)
    session = db.Column(db.Integer)
    profile = db.Column(db.TEXT) #current profile
    stats = db.Column(db.TEXT) #current stats
    performances = db.relationship('PerformanceData', backref='users', lazy='dynamic')

    def __init__(self, username):
        self.username = username

    def __repr__(self):
        return '<User %r>' % self.username


class PerformanceData(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	user_id = db.Column(db.ForeignKey('users.id'))
	session_number = db.Column(db.Integer)
	piece_number = db.Column(db.Integer)
	attempt = db.Column(db.Integer)
	piece = db.Column(db.TEXT)
	performance = db.Column(db.TEXT)
	accuracies = db.Column(db.TEXT) #component accuracies
	level = db.Column(db.TEXT) #song level with components
	profile = db.Column(db.TEXT) #current profile and user state
	stats = db.Column(db.TEXT) #current user statistics for components
	survey = db.Column(db.TEXT)

	def __init__(self, user_id, sessionNumber, pieceNumber, piece, level):
		self.user_id = user_id
		self.session_number = sessionNumber
		self.piece_number = pieceNumber
		self.piece = piece
		self.level = level

	def __repr__(self):
		return '<Performance %r, level: %r, session: %r, song: %r>' % (self.user_id, self.level, self.sessionNumber, self.pieceNumber)

class PrePostTest(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	user_id = db.Column(db.ForeignKey('users.id'))
	piece_type = db.Column(db.TEXT)
	piece_number = db.Column(db.Integer)
	performance = db.Column(db.TEXT)
	accuracies = db.Column(db.TEXT)
	
	def __init__(self, user_id, pieceType, piece_number, performance, accuracies):
		self.user_id = user_id
		self.piece_type = pieceType
		self.piece_number = piece_number
		self.performance = performance
		self.accuracies = accuracies
	
	def __repr__(self):
		return '<PrePostTest %r, type: %r, num: %r>' % (self.user_id, self.piece_type, self.piece_number)

def wsgi(environ, start_response):
	port = int(os.environ.get("PORT", 5000))
	app.secret_key = os.urandom(24)
	app.run(debug=True, host='0.0.0.0', port=port, use_reloader=True)

def main():
	port = int(os.environ.get("PORT", 5000))
	app.secret_key = os.urandom(24)
	app.run(debug=True, host='0.0.0.0', port=port)

if __name__ == "__main__":
    main()

    