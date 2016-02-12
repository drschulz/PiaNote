import sys

sys.path.insert(0, '..')

from pianoteDB import PiaNoteDB

def main():
    db = PiaNoteDB('pianoteTest.db');

    db.addNewUser("Drew");

    exists = db.userExists("Drew");

    print("Does Drew exist?: " + str(exists))

    if exists:
    	jsonString = '{"key1": "val1", "key2": 0}'
    	db.submitUserData("Drew", jsonString);

    	jsonData = db.getUserData("Drew");

    	print("Drew's data: " + str(jsonData));

    db.closeConnection();


if __name__ == "__main__":
    main()