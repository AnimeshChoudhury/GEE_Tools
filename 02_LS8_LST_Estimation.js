// Using established algorithms, this code utilizes Landsat 8 imagery data to
// calculate  Land Surface Temperature (LST). Cloudy images are identified and
// filtered out from the Landsat 8 images, ensuring that the LST calculation is
// accurate and representative of the land surface. The processed images are 
// clipped according to a defined Region of Interest (ROI). This feature enables 
// users to focus on specific geographical areas of interest. Additionally, 
// the code keeps track of the  acquisition dates of the images in
// the collection, preparing them for convenient batch download.    


//// Creating a geometry (area of interest) ////
var center = ee.Geometry.Point([80.3205380028601, 24.751017454572917])
var size = 0.1 // (in degree)
var geometry = ee.FeatureCollection([
  ee.Feature(
    ee.Geometry.Rectangle(
      [center.getInfo()['coordinates'][0] - size/2,
      center.getInfo()['coordinates'][1] - size/2,
      center.getInfo()['coordinates'][0] + size/2,
      center.getInfo()['coordinates'][1] + size/2]
    )
  )
])


// Set the zoom level (0-24)
var zoom = 10;

// Center the map on the specified location and set the zoom level
Map.centerObject(center, zoom);
Map.addLayer(geometry)

// LST estimation has been done according to (https://doi.org/10.3390/rs12091471)
// please exploare the given link for better understanding of the LST computing 
// from the Landsat thermal bands. Github: https://github.com/sofiaermida/Landsat_SMW_LST

var LandsatLST = require('users/sofiaermida/landsat_smw_lst:modules/Landsat_LST.js');
// Selecting date range, and landsat satellite
var satellite = 'L8';
var date_start = '2022-01-01';
var date_end = '2022-12-31';
var use_ndvi = true;

// Getting landsat collection with added variables: NDVI, FVC, TPW, EM, LST
var LandsatColl = LandsatLST.collection(satellite, date_start, date_end, geometry, use_ndvi);
print(LandsatColl);

////// Filter and clip the LST ImageCollection with cloud cover and geometry //////


// Function to clip and rename the images
var clip_ImageCollection = function(image) {
  var clipped_image = image.select('LST').clip(geometry)
  return clipped_image.rename("LST_clipped").copyProperties(image, image.propertyNames())
} 

var filtered_collection = (LandsatColl
    .select(['LST'])                    
    .filterMetadata('CLOUD_COVER', 'less_than', 1)
    .map(clip_ImageCollection)
)

print(filtered_collection)
//////////////////Vizulization of the LST/////////////////////////

// Convert the image collection to a list
var imageList = filtered_collection.toList(filtered_collection.size());
var Image1 = ee.Image(imageList.get(0)); // select image index 

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

