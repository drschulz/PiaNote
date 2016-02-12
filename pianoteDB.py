import sqlite3
import json

class PiaNoteDB:

	def createTables(self):
		c = self.conn.cursor()
		c.execute('''CREATE TABLE IF NOT EXISTS Users 
					(id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, jsonData TEXT)''');


		self.conn.commit();

	def userExists(self, user):
		c = self.conn.cursor();
		u = (user,)
		c.execute("SELECT * from Users where username=?", u);

		if(c.fetchone() is not None):
			return True;
		else:
			return False;

	def getUserData(self, user):
		c = self.conn.cursor();
		u = (user,)
		c.execute("SELECT jsonData from Users where username=?", u);

		return c.fetchone()[0];

	def submitUserData(self, user, data):
		c = self.conn.cursor();
		u = (data,user,)
		c.execute('''UPDATE Users
					SET jsonData=? WHERE username=?''', u);

		self.conn.commit();


	def addNewUser(self, user):
		c = self.conn.cursor();
		u = (user,)
		c.execute('''INSERT INTO Users(username) values(?)''', u);
		self.conn.commit();


	def closeConnection(self):
		self.conn.close();

	def openConnection(self):
		self.conn = sqlite3.connect(self.dbName);


	def __init__(self, dbName):
		self.dbName = dbName;
		self.conn = sqlite3.connect(dbName);
		self.createTables();
