import os
from flask import Flask, request
app = Flask(__name__, static_url_path='', static_folder='')

@app.route('/')
def log():
	return app.send_static_file('login.html')    


@app.route('/home')
def index():
	return app.send_static_file('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
	if request.method == 'POST':

		return app.send_static_file('index.html')
	else:
		return app.send_static_file('login.html')

if __name__ == "__main__":
    app.run()