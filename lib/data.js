
var connectionString = '',
  mongojs = require('mongojs'),
  db = mongojs(connectionString, ['people']);


/**
 * Adds a person to the database.
 */
module.exports.addPerson = function (person, callback) {
  db.people.insert(person, callback);
}


/**
 * Gets a list of distinct postcodes from the database.
 */
module.exports.getDistinctPostcodes = function (callback) {
  db.people
    .distinct('postcode', callback);
}

