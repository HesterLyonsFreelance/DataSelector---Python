## Test script for native SQL in ArcGIS
## Uses ArcSDESQSExecute module
## See http://pro.arcgis.com/en/pro-app/arcpy/classes/arcsdesqlexecute.htm
## Hester, 05/01/2016.

import arcpy

arcpy.AddMessage("Connecting to database")
try:
    DBSDE = r"H:\Dev\PythonToolsForMessing\TVERCConn2.sde"
    cnnDB = arcpy.ArcSDESQLExecute(DBSDE)
except Exception as err:
    arcpy.AddMessage(err)
    arcpy.AddMessage("Cannot connect to database. Aborting")
    exit(0)

arcpy.AddMessage("Getting all birds")
try:
    ## NOTE THIS WORKS UNTIL YOU SELECT SP_GEOMETRY WHICH RETURNS AN UNSPECIFIED ERROR.
    theQuery = "SELECT TOP 1000 TaxonName, TaxonGroup, SP_GEOMETRY FROM [NBNData_TVERC].[dbo].[TVERC_Spp_Full] WHERE TaxonGroup = 'Birds'"
    theQuery = "SELECT TOP 1000 TaxonName, TaxonGroup FROM [NBNData_TVERC].[dbo].[TVERC_Spp_Full] WHERE TaxonGroup = 'Birds'"
    theCursor = cnnDB.execute(theQuery)
    for row in theCursor:
        arcpy.AddMessage("Bird found : " + row[0]) ## function returns a list.
except Exception as err:
    arcpy.AddMessage(err)
    arcpy.AddMessage("Selection failed")
    
del cnnDB


## See https://geonet.esri.com/thread/169418
## "If you are trying to export geographic data as geographic data from an enterprise geodatabase, ArcSDESQLExecute is the wrong tool.
## "The tool doesn't work with native spatial data types returned from various DBMSes."

## MakeQueryLayer_management may well do the trick - to be investigated. However this wouldnot
## work with a stored procedure.
