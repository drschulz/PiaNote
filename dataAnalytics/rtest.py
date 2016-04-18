from rpy2 import robjects
from rpy2.robjects import Formula, Environment
from rpy2.robjects.vectors import IntVector, FloatVector
from rpy2.robjects.lib import grid
from rpy2.robjects.packages import importr, data
from rpy2.rinterface import RRuntimeError
import warnings

# The R 'print' function
rprint = robjects.globalenv.get("print")
stats = importr('stats')
grdevices = importr('grDevices')
base = importr('base')
datasets = importr('datasets')

grid.activate()

lattice = importr('lattice')


grdevices.png(file="test.png", width=512, height=512)
# plotting code here
#r = robjects.r

#x = robjects.IntVector(range(10))
#y = r.rnorm(10)
#r.plot(r.runif(10), y, xlab="runif", ylab="foo/bar", col="red")

tmpenv = data(datasets).fetch("volcano")
volcano = tmpenv["volcano"]

p = lattice.wireframe(volcano, shade = True,
                      zlab = "",
                      aspect = FloatVector((61.0/87, 0.4)),
                      light_source = IntVector((10,0,10)))
rprint(p)

grdevices.dev_off()


#r = robjects.r

#x = robjects.IntVector(range(10))
#y = r.rnorm(10)

#r.X11()

#r.layout(r.matrix(robjects.IntVector([1,2,3,2]), nrow=2, ncol=2))
#r.plot(r.runif(10), y, xlab="runif", ylab="foo/bar", col="red")


#pp = ggplot2.ggplot(mtcars) + \
 #    ggplot2.aes_string(x='wt', y='mpg', col='factor(cyl)') + \
  #   ggplot2.geom_point() + \
   #  ggplot2.geom_smooth(ggplot2.aes_string(group = 'cyl'),
   #                      method = 'lm')
#pp.plot()