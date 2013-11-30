
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
mongojs = require('mongojs'),
deriver = require('./lib/deriver.js');
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
    callbackURL: "http://delta.dev.geeksoc.org/auth/facebook/callback",
    profileFields: ['id', 'name', 'location','gender','birthday']
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
		user : req.user
	});
});

app.get('/account', function (req, res) {  
console.log(JSON.stringify(req.user));
res.render('account', {
		page : 'Main Page',
		user : req.user
	});
});

app.post('/account',function (req, res) {
  req.body.facebookId = req.user.facebookId;
  req.body.name = {familyName:req.body.familyName,givenName:req.body.givenName};
  req.body.familyName,req.body.givenName = null;
  //data.updatePerson(req.body);
  console.log(JSON.stringify(req.user));
  
  deriver.annotate(data, req.body, function(error, user) {
  data.updatePerson(user.facebookId,user);
  //console.log(JSON.stringify(req.body));
  res.statusCode = 200;
  return res.redirect('/account'); 
  });
});


// auth routes
app.get('/auth/facebook',
  passport.authenticate('facebook', { scope: ['user_about_me','user_birthday','user_education_history',
  'user_hometown','user_interests','user_location'] }));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/account');
  });
    
  

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/about', function (req, res) {  
res.render('about', {
    page : 'About',
  });
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
  
app.get('/search', function (req, res) {
  data.listByQueryObject(req.query, function(e, results){
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
res.render('countrydash', {
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


app.get('/bargraph', function (req, res) {  
res.render('dashboards/bargraph', {
    page : 'Map',
    bar_element_name : 'graph',
    datapoints: [
      {latitude: 55.8506080519, longitude: -4.26492576329, weight: 100},
        {latitude: 55.8613701277, longitude: -4.24460130892, weight: 100},
        {latitude: 55.4906916873, longitude: -4.60522901822, weight: 100},
        {latitude: 55.8651840586, longitude: -4.2216469545 , weight: 100}
      ]
    
  });
});

app.get('/piechart', function (req, res) { 
res.render('dashboards/piechart', {
    page : 'Map',
    pie_element_name : 'graph',
    datapoints: [
        {label:"Things1", value:100, comma: true},
        {label:"Things2", value:200, comma: true},
        {label:"Things3", value:300, comma: true},
        {label:"Things4", value:400}
      ]
    
  });
});

app.get('/internet', function (req, res) { 
 data.listByQueryObject(req.query, function(e, results){
  console.log(results);
  var availability = {};
  availability['Yes'] = 0;
  availability['No']  = 0;
  for (var i = results.length - 1; i >= 0; i--) {
    if (results[i].internet == true){
      availability['Yes'] += 1;
    } else {
      availability['No'] += 1;
    }
  }
  console.log(availability);
    res.render('dashboards/piechart', {
        page : 'Map',
        pie_element_name : 'graph',
        datapoints: [
            {label:"Yes", value:availability['Yes'], comma: true},
            {label:"No", value:availability['No']}
          ]
      });
    });
});

app.get('/piechart/:information', function (req, res) { 
 data.listByQueryObject(req.query, function(e, results){
  var things= {};
  var information = req.param("information");
  for (var i = results.length - 1; i >= 0; i--) {
    if (results[information] == undefined){
      if (things["N/A"] == null){
        things["N/A"] = 0;
      }
      things["N/A"]++;
    } else {

      if (things[results[information]] == null){
        things[results[information]] = 0;
      }
      things[results[information]]++;
    }
  }

  var keys = Object.keys(things);
  var pointgen = [];
  for (var i = keys.length - 1; i >= 0; i--) {
    var key = keys[i];
    var comma = (keys > 0);
    pointgen = {"label": key, "value": things[key], "comma": comma};
  };
    res.render('dashboards/piechart', {
        page : 'Map',
        pie_element_name : 'graph',
        datapoints: pointgen
      });
    });
});




app.get('/persons', function (req, res) {  
  data.listByQueryObject({},function(e, people){
    console.log(people);
    for (var i=0;i<people.length;i++)
{ 
var person = people[i];
if(person.gender == 0){
              person.gender = "Male";
            }else if(person.gender == 1){
              person.gender = "Female";
            }else if(person.gender == 2){
              person.gender = "other";
            }
            
if(person.ruralClassification == 1){
    person.ruralClassification = "Large Urban Area"
} else if(person.ruralClassification == 2) {
  person.ruralClassification = "Other Urban Area"
} else if(person.ruralClassification == 3) {
  person.ruralClassification = "Accessible Small Town"
} else if(person.ruralClassification ==4) {
  person.ruralClassification = "Remote Small Town"
} else if(person.ruralClassification == 5) {
  person.ruralClassification = "Very Remote Small Town"
} else if(person.ruralClassification == 6) {
  person.ruralClassification = "Accessible Rural Area"
} else if(person.ruralClassification == 7) {
  person.ruralClassification = "Remote Rural Area"
} else if(person.ruralClassification == 8) {
  person.ruralClassification = "Very Remote Rural Area"
} else if(person.ruralClassification == A1) {
  person.ruralClassification = "Urban Major Conurbation"
} else if(person.ruralClassification == B1) {
  person.ruralClassification = "Urban Minor Conurbation"
} else if(person.ruralClassification == C1) {
  person.ruralClassification = "Urban City and Town"
} else if(person.ruralClassification == C2) {
  person.ruralClassification = "Urban City and Town (Sparse)"
} else if(person.ruralClassification == D1) {
  person.ruralClassification = "Rural Town and Fringe"
} else if(person.ruralClassification == D2) {
  person.ruralClassification = "Rural Town and Fringe (Sparse)"
} else if(person.ruralClassification == E1) {
  person.ruralClassification = "Rural Village"
} else if(person.ruralClassification == E2) {
  person.ruralClassification = "Rural Village (Sparse)"
} else if(person.ruralClassification == F1) {
  person.ruralClassification = "Rural Hamlet"
} else if(person.ruralClassification == F2) {
  person.ruralClassification = "Rural Hamlet (Sparse)"
} else {
  person.ruralClassification = "Unknown"
}
people[i] = person;
}
    res.render('dashboards/people', {
        page : 'People',
        persons: people
      });
    });
});


function generateUserFB(profile,done){

var g = 2;
if(profile.gender == "male"){
g = 0;
}else if (profile.gender == "female"){
g = 1
}
var user = { facebookId: profile.id , name: profile.name,gender: g,location: profile.location,birthday: profile.birthday}
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
