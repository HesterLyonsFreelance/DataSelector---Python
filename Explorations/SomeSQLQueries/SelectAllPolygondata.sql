SELECT SP_GEOMETRY, SP_GEOMETRY.STAsText() as GeoDesc, TaxonName 
INTO HLPolyTest
FROM dbo.TVERC_Spp_Full
WHERE SP_GEOMETRY.STAsText() LIKE 'POLY%'