GT_OSGB = require('./geotools.js')
	module.exports.annotate = function (data, person, callback) {

	if (person.location) {
		var postcode = person.location.replace(/\s/g, '').toUpperCase();
		data.getPostCodeInfo(postcode, function (e, result) {
			if (result) {
				person.internet = !result.internet;
				person.isdeprived = result.isdeprived;
				person.ruralClassification = result.ruralClassification;
				
			}
data.getPostCodeNSPL(postcode, function (e, result) {
			if (result) {
				//create a osgb coordinate
				var osgb = new GT_OSGB();
				osgb.setGridCoordinates(526217, 223873);

				//convert to a wgs84 coordinate
				var wgs84 = osgb.getWGS84();
console.log(JSON.stringify(wgs84));
				//now work with wgs84.latitude and wgs84.longitude
				person.latitude = wgs84.latitude;
				person.longitude = wgs84.longitude;
			}else{
              console.log(" could not find");
            }
console.log(JSON.stringify(person));
		callback(null, person);
		});
		});
		
        
	} else {
		callback(null, person);
	}

};

// get internet from postcode
// get deprivation from postcode
// get rurality from index
// Put the person back in the index
