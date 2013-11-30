
/**
 * Module dependencies.
 */

var express = require('express'),
http = require('http'),
passport = require('passport'),
util = require('util'),
path = require('path'),
FacebookStrategy = require('passport-facebook').Strategy,
config = require('./config.js'),
data = require('./lib/data.js'),
mongojs = require('mongojs');
var path = require("path");

var app = express();

app.configure(function () {
	app.set('port', process.env.PORT || 3000);
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'mustache');
    app.engine('mustache', require('hogan-middleware').__express);
	app.use(express.favicon(path.join(__dirname, 'public/favicon.png')));
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.session({
			secret : config.sessionsecret
		}));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}
// passport
passport.use(new FacebookStrategy({
    clientID: config.facebookid,
    clientSecret: config.facebooksecret,
    callbackURL: "http://delta.dev.geeksoc.org/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    data.findOne({ facebookId: profile.id }, function (err, user) {
    if (err) return done(err);
      if (!user) return generateUserFB(profile,done);
      return done(err, user);
      }
    );
  }
  
));

passport.serializeUser(function(user, done) {
  done(null, user.facebookId);
});

passport.deserializeUser(function(id, done) {
  data.findOne({ facebookId: id }, function(err, user) {
    done(err, user);
  });
});

app.get('/', function (req, res) {  
console.log(JSON.stringify(req.user));
res.render('index', {
		page : 'Main Page',
        theme : 'yeti',
		user : req.user
	});
});


// auth routes
app.get('/auth/facebook',
  passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
    
  

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// API stuff
app.get('/people', function (req, res) {
  data.listAllPeople(function(e, results){
      res.send(results);
    });
  });
  
app.get('/people/id/:id', function (req, res) {
  var id = req.params.id;
  var objectId = mongojs.ObjectId(id); 
  
  data.listByThing('_id', objectId, function(e, results){
      res.send(results);
    });
  });
  
app.get('/people/:thing/:id', function (req, res) {
  var id = req.params.id;
  var thing = req.params.thing;

  data.listByThing(thing, id, function(e, results){
      res.send(results);
    });
  });
  
app.post('/search', function (req, res) {
  data.listByQueryObject(req.body.query, function(e, results){
      res.send(results);
    });
  });
  
app.post('/people', function (req, res) {
  if(!req.body.hasOwnProperty('person')) {
    res.statusCode = 400;
    return res.send('Error 400: Post syntax incorrect.');
  }
  data.people.insert(req.body.person);
  res.statusCode = 200;
  return res.send('Inserted');
  });


app.put('/people/:id', function (req, res) {
  var id = req.params.id;
  var objectId = mongojs.ObjectId(id);
  
  if(!req.body.hasOwnProperty('person')) {
    res.statusCode = 400;
    return res.send('Error 400: Put syntax incorrect.');
  }
  
  data.people.replaceWithObject(objectId, req.body.person);
  res.statusCode = 200;
  return res.send('Updated');
  
  });

app.get('/map', function (req, res) {  
res.render('dashboards/map', {
    page : 'Map',
    mapelement : 'map',
    datapoints: [
      {latitude: 55.8506080519, longitude: -4.26492576329, weight: 100},
        {latitude: 55.8613701277, longitude: -4.24460130892, weight: 100},
        {latitude: 55.4906916873, longitude: -4.60522901822, weight: 100},
        {latitude: 55.8651840586, longitude: -4.2216469545 , weight: 100}
      ]
    
  });
});

function generateUserFB(profile,done){
var user = { facebookId: profile.id , name: profile.name}
data.addPerson(user);
data.findOne(user, function (err, user) {
    if (err) return done(err);
      if (!user) return done(null,false);
      return done(err, user);
      }
    );


}

http.createServer(app).listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'));
});
