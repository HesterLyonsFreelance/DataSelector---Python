## Data selection tool - first version
## Hester, 30 November 2015.

## The load file is parameter (0) but is not used in the script
## It was used in the validation script to preload the query.
theColumns = arcpy.GetParameterAsText(1)
##theWhereClause = arcpy.GetParameterAsText(2)
##theGroupBy = arcpy.GetParameterAsText(3)
##theOrderBy = arcpy.GetParameterAsText(4)
##theTable = arcpy.GetParamterAsText(5)
##theOutputFormat = arcpy.GetParameterAsText(6)
##theDefaultSymbology = arcpy.GetParameterAsText(7)
##theSpatialPlot = arcpy.GetParameterAsText(8)
##theXColumn = arcpy.GetParameterAsText(9)
##theYColumn = arcpy.GetParameterAsText(10)
##theSizeColumn = arcpy.GetParameterAsText(11)
##theMaxPrecision = arcpy.GetParameterAsText(12)
##theSaveFile = arcpy.GetParameterAsText(13)

## Do the process - to be completed.
arcpy.AddMessage("The following data has been entered:")
arcpy.AddMessage(theColumns)
