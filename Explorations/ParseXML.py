import xml.etree.ElementTree as ET

tree = ET.parse(r"H:\Dev\PythonToolsForMessing\DataSelector.xml")
root = tree.getroot()

##for child in root:
##    #print child.tag, child.attrib
##
##for item in root.iter():
##    for thing in item.iter():
##        
##       # print item.tag, thing.tag, thing.attrib

theDataSelector = root.find('DataSelector')
theLogfilePath = theDataSelector.find('LogFilePath')
print theLogfilePath.find('value').text

theLogfilePath = theDataSelector.find('LogFilePath').find('value').text
print theLogfilePath
