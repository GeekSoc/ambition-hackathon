
/**
 * Module dependencies.
 */

var express = require('express'),
http = require('http'),
passport = require('passport'),
util = require('util'),
path = require('path'),
FacebookStrategy = require('passport-facebook').Strategy,
config = require('./config.js');

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
    callbackURL: "http://localhost:3000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));

passport.serializeUser(function (user, done) {
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



http.createServer(app).listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'));
});
