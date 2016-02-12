import os
from flask import Flask, request
from pianoteDB import PiaNoteDB
app = Flask(__name__, static_url_path='', static_folder='')
pDB = None

@app.route('/')
def log():
	return app.send_static_file('login.html')    


@app.route('/home')
def index():
	return app.send_static_file('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
	if request.method == 'POST':
		print('here!')
		username = request.form['name'];
		print('also here!')
		print(username);
		pDB.addNewUser(str(username));
		print("done!")

		return "registered"
	else:
		return "hello"

@app.route('/login', methods=['GET', 'POST'])
def login():
	if request.method == 'POST':
		print(str(request.form['name']));
		userExists = pDB.userExists(request.form['name']);

		if userExists:
			return app.send_static_file('index.html');
		else:
			return app.send_static_file('login.html');
	else:
		return app.send_static_file('login.html')



def main():
	global pDB
	pDB = PiaNoteDB('pianote.db')
	app.run()

if __name__ == "__main__":
    main()

    