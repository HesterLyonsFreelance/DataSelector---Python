## Concept proof for hybrid approach to create spatial SQL layer
## Hester, 6 Jan 2015.

import arcpy

arcpy.env.overwriteOutput = True

DBSDE = r"H:\Dev\PythonToolsForMessing\TVERCConn2.sde"
OutFC = r"H:\Dev\PythonToolsForMessing\TestGeoDB.gdb\TestData"

arcpy.AddMessage("Connecting to database")
try:
    
    cnnDB = arcpy.ArcSDESQLExecute(DBSDE)
except Exception as err:
    arcpy.AddMessage(err)
    arcpy.AddMessage("Cannot connect to database. Aborting")
    exit(0)

## Firstly run the stored procedure.
arcpy.AddMessage("Selecting all data from stored procedure")
try:
    theQuery = "dbo.HLCreateTempTable"
    theCursor = cnnDB.execute(theQuery) 
except Exception as err:
    arcpy.AddMessage(err)
    arcpy.AddMessage("Selection failed")

## Now put the result into a query layer.
arcpy.AddMessage("Creating query layer")
try:
    arcpy.MakeQueryLayer_management(DBSDE,
                                "Temp",
                                "select * from dbo.HLTemp")
    arcpy.CopyFeatures_management ("Temp", OutFC)
    arcpy.MakeFeatureLayer_management(OutFC, "SpeciesSelection")
    
except Exception as err:
    arcpy.AddMessage(err)
    arcpy.AddMessage("Could not make query layer")


## Add resulting layer to view
arcpy.AddMessage("Adding query layer to view")
mxd = arcpy.mapping.MapDocument("CURRENT")
df = arcpy.mapping.ListDataFrames(mxd,"*")[0]
try:
    addlayer = arcpy.mapping.Layer("SpeciesSelection")
    arcpy.mapping.AddLayer(df, addlayer)
except Exception as err:
    arcpy.AddMessage(err)
    arcpy.AddMessage("Could not add layer to map")


## Secondly plot the polygon data.
outFC2 = r"H:\Dev\PythonToolsForMessing\TestGeoDB.gdb\TestPolyData"
arcpy.AddMessage("Creating query layer on polygon data")
try:
    arcpy.MakeQueryLayer_management(DBSDE,
                                "Temp",
                                "select * from dbo.HLPolyTest")
    arcpy.CopyFeatures_management ("Temp", outFC2)
    arcpy.MakeFeatureLayer_management(outFC2, "TestPolys")
    
except Exception as err:
    arcpy.AddMessage(err)
    arcpy.AddMessage("Could not make query layer")
    
## Add resulting layer to view
mxd = arcpy.mapping.MapDocument("CURRENT")
df = arcpy.mapping.ListDataFrames(mxd,"*")[0]
arcpy.AddMessage("Adding polygon data to view")
try:
    addlayer = arcpy.mapping.Layer("TestPolys")
    arcpy.mapping.AddLayer(df, addlayer)
except Exception as err:
    arcpy.AddMessage(err)
    arcpy.AddMessage("Could not add layer to map")


del cnnDB
