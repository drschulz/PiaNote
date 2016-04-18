from sqlalchemy import create_engine
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy.ext.declarative import declarative_base
#from rpy2.rpy_classic import *
import rpy2.rpy_classic as rpy

engine = create_engine('postgresql://rqybykhrziarvq:KZ86GfQ6sXOHSTv0tsxVQbGUur@ec2-54-227-246-11.compute-1.amazonaws.com:5432/dch80vakna08v4')

Base = automap_base()

Base.prepare(engine, reflect=True)

User = Base.classes.users
Performances = Base.classes.performance_data;

session = Session(engine)

myuser = session.query(User).filter_by(username="daschulz").all();
allPerformances = session.query(Performances).all();

for user in myuser:
    print(user.username)

for performance in allPerformances:
    print(str(performance.session_number) + ", " + str(performance.piece_number))
    print(performance.level)
    
    
    
#Get the JSON
#For Each level
#put the level num on the y axis
