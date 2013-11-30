
var connectionString = 'localhost/ambition',
  mongojs = require('mongojs'),
  db = mongojs(connectionString, ['people']);


/**
 * Adds a person to the database.
 */
module.exports.addPerson = function (person, callback) {
  db.people.insert(person, callback);
}

module.exports.listAllPeople = function (callback) {
  db.people.find().toArray(callback);
}

module.exports.listByThing = function (thing, id, callback) {
  var query = {};
  query[thing] = id;
  db.people.find(query).toArray(callback);
}

module.exports.listByQueryObject = function (query, callback) {
  console.log(query);
  db.people.find(query, callback);
}

/**
 * Gets a list of distinct postcodes from the database.
 */
module.exports.getDistinct = function (thing, callback) {
  db.people
    .distinct(thing, callback);
}

/**
 * Replace a user object with a fully(?) populated user object
 */
module.exports.replaceWithObject = function (id, personWithData, callback) {
  db.people.save({'_id': id}, personWithData, callback);
}

module.exports.findOne = function (thing, callback) {
  db.people
    .findOne(thing, callback);
}

module.exports.updatePerson = function (id, user) {
  db.people
    .update({facebookId:id}, user);
}
