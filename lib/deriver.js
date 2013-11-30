
module.exports.annotate = function (data, person, callback) {
	
  if (person.location) {
  	data.getPostCodeInfo(person.location, function(e, result) {
      if (result) {
        person.internet = result.internet;
        person.isdeprived = result.isdeprived;
        person.ruralClassification = result.reuralClassification;
  	    console.log(JSON.stringify(person));
        callback(null, person);
      }
    });
  } else {
    callback(null, person);
  }


};



// get internet from postcode
// get deprivation from postcode
// get rurality from index 
// Put the person back in the index