from rpy2 import robjects
import math, datetime
import rpy2.robjects.lib.ggplot2 as ggplot2
from rpy2.robjects import Formula, Environment
from rpy2.robjects.vectors import IntVector, FloatVector
from rpy2.robjects.lib import grid
from rpy2.robjects.packages import importr, data
from rpy2.rinterface import RRuntimeError
import warnings
rprint = robjects.globalenv.get("print")
stats = importr('stats')
grdevices = importr('grDevices')
base = importr('base')
datasets = importr('datasets')

mtcars = data(datasets).fetch('mtcars')['mtcars']

rnorm = stats.rnorm
dataf_rnorm = robjects.DataFrame({'value': rnorm(300, mean=0) + rnorm(100, mean=3),
                                  'other_value': rnorm(300, mean=0) + rnorm(100, mean=3),
                                  'mean': IntVector([0, ]*300 + [3, ] * 100)})
                                  
grdevices = importr('grDevices')

grdevices.png(file="test.png", width=512, height=512)

gp = ggplot2.ggplot(mtcars)

pp = gp + \
     ggplot2.aes_string(x='wt', y='mpg', size='factor(carb)',
                 col='factor(cyl)', shape='factor(gear)') + \
     ggplot2.geom_point()

pp.plot()

grdevices.dev_off()