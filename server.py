import os
from flask import Flask, request, render_template, g
from pianoteDB import PiaNoteDB
app = Flask(__name__) #, static_url_path='', static_folder='')

@app.route('/')
def log():
	return render_template('login2.html')    


@app.route('/home')
def index():
	return render_template('index.html')#app.send_static_file('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
	if request.method == 'POST':
		print('here!')
		username = request.form['name'];
		print('also here!')
		print(username);
		pDB = get_db();
		pDB.addNewUser(str(username));
		print("done!")

		return "registered"
	else:
		return "hello"

@app.route('/login', methods=['GET', 'POST'])
def login():
	if request.method == 'POST':
		print(str(request.form['name']));
		pDB = get_db();
		userExists = pDB.userExists(request.form['name']);

		if userExists:
			return render_template('index.html')#app.send_static_file('index.html');
		else:
			return render_template('login2.html')#app.send_static_file('login.html');
	else:
		return render_template('login2.html')#app.send_static_file('login.html')


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = PiaNoteDB('pianote.db')
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.closeConnection()

def main():
	app.run(debug=True)

if __name__ == "__main__":
    main()

    