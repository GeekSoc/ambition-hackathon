
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
data = require('./lib/data.js');

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
    data.findOne({ facebookId: profile.id }, function (err, user) {
    if (err) return done(err);
      if (!user) return generateUserFB(profile,done);
      return done(err, user);
      }
    );
  }
  
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  data.getDistinct(id, function(err, user) {
    done(err, user);
  });
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
  
app.get('/users', function (req, res) {
  data.listAllPeople(function(e, results){
      res.send(results);
    });
  });

function generateUserFB(profile,done){
data.addPerson({ facebookId: profile.id });
data.findOne({ facebookId: profile.id }, function (err, user) {
    if (err) return done(err);
      if (!user) return done(null,false);
      return done(err, user);
      }
    );


}

http.createServer(app).listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'));
});
