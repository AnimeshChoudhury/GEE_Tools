// In this code dates previously saved and uploaded as asset in GEE is imported.
// list of the dates can be manually created and shown here. An area of interest
// is created and saved as a FeatureCollection. A Function is created to filter 
// MODIS Terra LST images based on a date and mapped over the ImageCollection. The 
// images present in the ImageCollection are scaled with the scaling factor and 
// clipped according to geometry created. Later Data visualization and Batch Data 
// Download procedure are also provided. 



///////// Extraction of dates from a FeatureCollection /////////
var datesList = table.aggregate_array('data') // table is the default name of imported FeatureCollection
print(datesList)


////// creating the list of dates manually//////
// var datesList = ee.List([
//   '2013-05-13',
//   '2013-05-29',
//   '2013-09-18',
//   '2013-10-20',
//   '2013-11-21',
//   '2014-05-16',
//   '2014-11-24',
//   '2015-02-12',
//   '2015-04-17',
//   '2015-05-03',
// ]) 

///// creation of AOI //////
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

var zoom = 10;
// Center the map on the specified location and set the zoom level
Map.centerObject(center, zoom);
Map.addLayer(geometry)


// Function to filter MODIS Terra LST images based on a date
var filterMODIS = function(date) {
  var start = ee.Date(date);
  var end = start.advance(1, 'day'); 
  var collection = ee.ImageCollection('MODIS/006/MOD11A1')
    .filterDate(start, end)
    .select('LST_Day_1km')
    .filterBounds(geometry)
    .first(); // Select daytime LST band
  return collection;
};

// Map the filtering function over the dates list
var lstCollectionList = datesList.map(filterMODIS);
print(lstCollectionList)

// Create an ImageCollection from the list of images//
var imageCollection = ee.ImageCollection.fromImages(lstCollectionList);

// cliping with geometry and scalling 
var clip_ImageCollection = function(image) {
  var clipped_image = image.select('LST_Day_1km').clip(geometry).multiply(0.02)
  return clipped_image.rename("LST_clipped").copyProperties(image, image.propertyNames())
}

var clipped_collection = imageCollection.map(clip_ImageCollection)
print(clipped_collection)


//////////////////Vizulization of the LST/////////////////////////

// Convert the image collection to a list
var imageList = clipped_collection.toList(clipped_collection.size());
var Image1 = ee.Image(imageList.get(0)); // select image index 

// Define visualization parameters
var vis_params = {
  min: 290.0,
  max: 320.0,
  palette: [
    '040274', '040281', '0502a3', '0502b8', '0502ce', '0502e6',
    '0602ff', '235cb1', '307ef3', '269db1', '30c8e2', '32d3ef',
    '3be285', '3ff38f', '86e26f', '3ae237', 'b5e22e', 'd6e21f',
    'fff705', 'ffd611', 'ffb613', 'ff8b13', 'ff6e08', 'ff500d',
    'ff0000', 'de0101', 'c21301', 'a71001', '911003'
  ],
};

Map.addLayer(Image1, vis_params, 'LST_Day_1km')

/////////////////Downloading the ImageCollection//////////////////////////////
var batch = require('users/fitoprincipe/geetools:batch')
batch.Download.ImageCollection.toDrive(filtered_collection.select("LST_clipped"), 'Drive_Folder', 
                {name: "LS8_LST{system_date}", 
                scale: 1000, 
                region: geometry,
                crs: 'EPSG:4326',
                type: 'float'})