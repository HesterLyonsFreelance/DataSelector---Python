theOpenString = 'r"' + self.params[0].value + '"'
theFile = open(theOpenString, 'r')
theColumns = theFile.readline()
self.params[1].value = theColumns
