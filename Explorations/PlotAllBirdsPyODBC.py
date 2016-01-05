## Test script for PyODBC
import arcpy
arcpy.AddMessage("Importing pyodbc")
import os
import datetime
import pyodbc

arcpy.env.overwriteOutput = True

arcpy.AddMessage("Connecting to database")
try:
    
    cnxn = pyodbc.connect(r'Driver={SQL Server};Server=.\SQLEXPRESS;Database=NBNData_TVERC;Trusted_Connection=yes;')
    cursor = cnxn.cursor()
except Exception as err:
    arcpy.AddMessage(err)
    arcpy.AddMessage("Cannot connect to database. Aborting")
    exit(0)

arcpy.AddMessage("Getting all birds")
try:
    cursor.execute("SELECT TOP 10 TaxonName FROM [NBNData_TVERC].[dbo].[TVERC_Spp_Full] WHERE TaxonGroup = 'Birds'")
    while 1:
        row = cursor.fetchone()
        if not row:
            break
        arcpy.AddMessage("Bird found : " + row.TaxonName)
except Exception as err:
    arcpy.AddMessage(err)
    arcpy.AddMessage("Selection failed")

## Create new feature class
theOutFC = r"H:\Dev\PythonToolsForMessing\TestGeoDB.gdb\BirdsTest"
arcpy.CreateFeatureclass_management(r"H:\Dev\PythonToolsForMessing\TestGeoDB.gdb", "BirdsTest","POINT")

## Add some fields
arcpy.AddField_management(theOutFC, "TaxonName", "TEXT", "", "", 50)
arcpy.AddField_management(theOutFC, "TaxonGroup", "TEXT", "", "", 50)

arcpy.AddMessage("Getting spatial details")
try:
    cursor.execute("SELECT TOP 10 TaxonName, TaxonGroup, SP_GEOMETRY FROM [NBNData_TVERC].[dbo].[TVERC_Spp_Full] WHERE TaxonGroup = 'Birds'")
    ## get insert cursor
    theFieldNames = ["SHAPE@", "TaxonName", "TaxonGroup"]
    theInsCurs = arcpy.da.InsertCursor(theOutFC, theFieldNames)
    while 1:
        row = cursor.fetchone()
        if not row:
            break
        ## THIS DOES NOT WORK
        theInsList = [row.SP_GEOMETRY.asShape(), row.TaxonName, row.TaxonGroup]
        theInsCurs.insertRow(tuple(theInsList))
        ## thePrintString = "Bird details: " + row.TaxonName + ", " + row.TaxonGroup
        arcpy.AddMessage("Added " + row.TaxonName)
except Exception as err:
    arcpy.AddMessage(err)
    arcpy.AddMessage("Query failed")


##arcpy.AddMessage("Looking for hamster name containing " + theHamName)
##try:
##    cursor.execute("exec FindAHamster " + theHamName)
##    while 1:
##        row = cursor.fetchone()
##        if not row:
##            break
##        arcpy.AddMessage("The following hamster has been found: ")
##        thePrintString = row.HamsterID + ", " + row.HamsterName + ", " + row.Species
##        arcpy.AddMessage(thePrintString)
##except:
##    arcpy.AddMessage("Stored procedure failed or not found")

cnxn.close()
