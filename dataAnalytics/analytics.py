from sqlalchemy import create_engine
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy.ext.declarative import declarative_base
#from rpy2.rpy_classic import *
import rpy2.rpy_classic as rpy
from rpy2 import robjects
from rpy2.robjects import Formula, Environment
from rpy2.robjects.vectors import IntVector, FloatVector
from rpy2.robjects.lib import grid
from rpy2.robjects.packages import importr, data
from rpy2.rinterface import RRuntimeError
import warnings
import json

engine = create_engine('postgresql://rqybykhrziarvq:KZ86GfQ6sXOHSTv0tsxVQbGUur@ec2-54-227-246-11.compute-1.amazonaws.com:5432/dch80vakna08v4')

Base = automap_base()

Base.prepare(engine, reflect=True)

User = Base.classes.users
Performances = Base.classes.performance_data;

session = Session(engine)

#myuser = session.query(User).filter_by(username="daschulz").all();
#allPerformances = session.query(Performances).all();

#for user in myuser:
#    print(user.username)

grdevices = importr('grDevices')
graphics = importr("graphics")

allUsers = session.query(User).all();

for user in allUsers:
    uId = user.id;
    performances = session.query(Performances).filter_by(user_id=uId, attempt=1).order_by(Performances.session_number, Performances.piece_number).all();
    
    songType = []
    rhythm = []
    interval = []
    key = []
    time = []
    index = []
    powersetLevel = []
    accuraciesList = []
    levels = []
    names = []
    yPos = []
    i = 0;
    print(user.username)
    lastLevel = 0
    levelBuffer = 0;
    for performance in performances:
        level = json.loads(performance.level)
        levels.append(level['k'])
        levels.append(level['t'])
        levels.append(level['s'])
        levels.append(level['i'])
        levels.append(level['r'])
        yPos.append(level['k'] + level['t'] + level['s'] + level['i'] + level['r'])
        
        if performance.survey is None:
            names.append(-1)
        else:
            names.append(json.loads(performance.survey)['helpful'])
        
        profile = json.loads(performance.profile);
        accuracies  = json.loads(performance.accuracies);
        accuraciesList.append(accuracies['s'])
        
        if lastLevel > levelBuffer + 1 and levelBuffer + profile['curPsetLevel'] == levelBuffer:
            levelBuffer = levelBuffer + lastLevel + 1
        
        lastLevel = levelBuffer + profile['curPsetLevel']
        powersetLevel.append(levelBuffer + profile['curPsetLevel']);
        
        #songType.append(level['s'])
        #rhythm.append(level['r'])
        #interval.append(level['i'])
        #key.append(level['k'])
        #time.append(level['t'])
        index.append(i)
        i = i + 1;
    
    if i > 0:
        grdevices.png(file=user.username + ".png", width=512, height=512)
     
        graphics.plot(index, powersetLevel, xlab="song number", ylab="level", type="o", col="blue")
        #graphics.axis(2, lab=)
        #graphics.lines(index, rhythm, type="o", col="red")
        #graphics.lines(index, interval, type="o", col="green")
        graphics.title("Levels for " + user.username)
        grdevices.dev_off()
        
        grdevices.png(file=user.username + "_Accuracies.png", width=512, height=512)
     
        graphics.plot(index, accuraciesList, xlab="song number", ylab="accuracy", type="o", col="blue")
        #graphics.axis(2, lab=)
        #graphics.lines(index, rhythm, type="o", col="red")
        #graphics.lines(index, interval, type="o", col="green")
        graphics.title("Accuracies for " + user.username)
        grdevices.dev_off()
        
        mat = robjects.r.matrix(levels, nrow=i, byrow=True)
        mat.colnames = robjects.StrVector(["key", "time", "song", "interval", "rhythm"])
        
        grdevices.png(file=user.username + "_Levels.png", width=1024, height=512)
     
        bp = graphics.barplot(mat.transpose(), xlab="song number", ylab="level", type="o", col=robjects.r("rainbow(5)"))
        graphics.text(bp, yPos, xpd=robjects.r('NA'), pos=3, labels=names)
        graphics.legend("topleft", mat.colnames, cex=1.0, bty="n", fill=robjects.r("rainbow(5)"))
        #graphics.axis(2, lab=)
        #graphics.lines(index, rhythm, type="o", col="red")
        #graphics.lines(index, interval, type="o", col="green")
        graphics.title("Accuracies for " + user.username)
        grdevices.dev_off()
           

#for performance in allPerformances:
#    print(str(performance.session_number) + ", " + str(performance.piece_number))
#    print(performance.level)
    
    
    
#Get the JSON
#For Each level
#put the level num on the y axis
