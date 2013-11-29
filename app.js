
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

var app = express();

app.configure(function () {
	app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
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
    User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));

passport.serializeUser(function (user, done) {
  data.people.insert(user);
	done(null, user);
});

passport.deserializeUser(function (obj, done) {
	done(null, obj);
});

app.get('/', function (req, res) {  
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
  
  
  
// API stuff
app.get('/people', function (req, res) {
  data.listAllPeople(function(e, results){
      res.send(results);
    });
  });
  
app.get('/people/:id', function (req, res) {
  var id = req.params.id;
  var objectId = mongojs.ObjectId(id); 
  
  data.listByThing('_id', objectId, function(e, results){
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


http.createServer(app).listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'));
});
