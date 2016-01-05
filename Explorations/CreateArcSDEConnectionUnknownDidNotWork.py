import arcpy

arcpy.CreateDatabaseConnection_management(
    out_folder_path="H:\Dev\PythonToolsForMessing",out_name="TVERCConn",database_platform="SQL_SERVER",
    instance="SONY-VAIO/SQLEXPRESS",account_authentication="OPERATING_SYSTEM_AUTH",
    username="#",password="#",save_user_pass="SAVE_USERNAME",database="NBNData_TVERC",
    schema="#",version_type="TRANSACTIONAL",version="#",date="#")
