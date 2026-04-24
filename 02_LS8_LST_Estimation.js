/*
  ============================================================================
  LANDSAT 8 LAND SURFACE TEMPERATURE (LST) ESTIMATION
  ============================================================================
  
  PURPOSE:
  This script calculates Land Surface Temperature (LST) from Landsat 8 imagery
  using established algorithms. Key features include:
  - Cloud filtering for accurate LST calculations
  - ROI-based clipping for focused analysis
  - Batch download preparation with acquisition date tracking
  
  REFERENCE:
  Based on algorithms from: https://doi.org/10.3390/rs12091471
  GitHub: https://github.com/sofiaermida/Landsat_SMW_LST
  
  ============================================================================
*/

// ============================================================================
// SECTION 1: DEFINE AREA OF INTEREST (AOI)
// ============================================================================
var center = ee.Geometry.Point([80.3205380028601, 24.751017454572917]); // Center coordinates
var size = 0.1; // Buffer size in degrees
var geometry = ee.FeatureCollection([
  ee.Feature(
    ee.Geometry.Rectangle(
      [center.getInfo()['coordinates'][0] - size/2,
       center.getInfo()['coordinates'][1] - size/2,
       center.getInfo()['coordinates'][0] + size/2,
       center.getInfo()['coordinates'][1] + size/2]
    )
  )
]);

// Set map visualization parameters
var zoom = 10; // Zoom level (0-24)
Map.centerObject(center, zoom);
Map.addLayer(geometry);

// ============================================================================
// SECTION 2: CONFIGURE LST ESTIMATION PARAMETERS
// ============================================================================

// Load LST calculation module
var LandsatLST = require('users/sofiaermida/landsat_smw_lst:modules/Landsat_LST.js');

// Configure processing parameters
var satellite = 'L8';                    // Landsat 8 satellite
var date_start = '2022-01-01';           // Start date
var date_end = '2022-12-31';             // End date
var use_ndvi = true;                     // Include NDVI calculation

// Retrieve Landsat collection with computed variables
// (NDVI, FVC, TPW, EM, LST)
var LandsatColl = LandsatLST.collection(satellite, date_start, date_end, geometry, use_ndvi);
print(LandsatColl);

// ============================================================================
// SECTION 3: FILTER AND PROCESS IMAGE COLLECTION
// ============================================================================

// Function to clip images and prepare for export
var clip_ImageCollection = function(image) {
  var clipped_image = image.select('LST').clip(geometry);
  return clipped_image.rename("LST_clipped").copyProperties(image, image.propertyNames());
};

// Apply cloud filter and clipping
var filtered_collection = (LandsatColl
    .select(['LST'])                    // Select LST band
    .filterMetadata('CLOUD_COVER', 'less_than', 1)  // Remove cloudy images
    .map(clip_ImageCollection)          // Clip to AOI
);

print(filtered_collection);

// ============================================================================
// SECTION 4: VISUALIZATION
// ============================================================================

// Define visualization parameters
var vis_params = {
  min: 290.0,
  max: 310.0,
  palette: [
    '040274', '040281', '0502a3', '0502b8', '0502ce', '0502e6',
    '0602ff', '235cb1', '307ef3', '269db1', '30c8e2', '32d3ef',
    '3be285', '3ff38f', '86e26f', '3ae237', 'b5e22e', 'd6e21f',
    'fff705', 'ffd611', 'ffb613', 'ff8b13', 'ff6e08', 'ff500d',
    'ff0000', 'de0101', 'c21301', 'a71001', '911003'
  ],
};

Map.addLayer(Image1, vis_params, 'Thermal Band')
// Collect the Image Dates and download the list of dates as CSV //

var dates = filtered_collection.aggregate_array('system:time_start');
// Convert epoch timestamps to human-readable dates
var formattedDates = dates.map(function(date) {
  return ee.Date(date).format('YYYY-MM-dd');
});

// Convert the formatted dates array to a client-side JavaScript array
var datesList = formattedDates.getInfo();

// Print the list of formatted dates
print('List of Dates:', datesList);

// Create a feature collection from the list
var featureList = datesList.map(function(item) {
  return ee.Feature(null, {data: item});
});

var featureCollection = ee.FeatureCollection(featureList);

// Define the export parameters
var exportOptions = {
  collection: featureCollection,
  description: 'csv_export',  // Description of the export
  fileFormat: 'CSV',
  folder: 'earth engine' // Format of the exported file
};

// Start the export process
Export.table.toDrive(exportOptions);
/////////////////Downloading the ImageCollection//////////////////////////////
var batch = require('users/fitoprincipe/geetools:batch')
batch.Download.ImageCollection.toDrive(filtered_collection.select("LST_clipped"), 'Drive_Folder', 
                {name: "LS8_LST{system_date}", 
                scale: 30, 
                region: geometry,
                crs: 'EPSG:4326',
                type: 'float'})

