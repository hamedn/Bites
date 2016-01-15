/**
 * Server Manifest
 */

var express = require('express');
var glob = require('glob');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compress = require('compression');
var methodOverride = require('method-override');
var Config = require('./config');
var mongoose = require('mongoose');
var credentials = require('./credentials.js');


module.exports = function(app) {
  var env = process.env.NODE_ENV || 'development';
  app.locals.ENV = env;
  app.locals.ENV_DEVELOPMENT = env == 'development';





// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8100');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,accesstoken');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

  // Request Middleware
  // app.use(favicon(Config.get('/root') + '/public/img/favicon.ico'));
  //app.use(logger('dev'));
  app.use(bodyParser.json({limit: '10mb'}));
  app.use(bodyParser.urlencoded({
    extended: true, limit:'10mb'
  }));
  app.use(cookieParser());
  app.use(compress());
  app.use(methodOverride());
  app.use(express.static('public'));


//mongoose code

var opts = {
  server: {
    socketOptions: {keepAlive: 1}
  }
};

switch(app.get('env')) {
  case 'development':
    mongoose.connect(credentials.mongo.development.connectionString, opts);
    break;
  case 'production':
    mongoose.connect(credentials.mongo.production.connectionString, opts);
    break;
  default:
    throw new Error("unknown exec env");
};


mongoose.connection.on('error', function () {
  throw new Error('unable to connect to database at ' + Config.get('/mongo/uri'));
});



var MongoSessionStore = require('session-mongoose')(require('connect'));
var sessionStore = new MongoSessionStore({ url: credentials.mongo.development.connectionString });
var User = require('./users/user.model.js');

var opts = {
  providers: credentials.providers,
  successRedirect: '/',
  failureRedirect: '/unauthorized',
  sessionStor: sessionStore
};

var auth = require('./users/auth.js')(app, opts);
auth.init();
try {
auth.registerRoutes();
}
catch (err) {console.log(err)};

app.use(function(req, res, next){
  next();
});













  //Server models
  var models = glob.sync(Config.get('/root') + '/**/*.model.js');
  models.forEach(function (model) {
    require(model);
  });

  // Server Controllers
  var controllers = glob.sync(Config.get('/root') + '/**/*.controller.js');
  controllers.forEach(function (controller) {
    require(controller)(app);
  });


/*

UPDATES ALL USER RATINGS WITHIN A TIME INTERVAL!


*/

  var User = require('mongoose').model('User');
  var Meal = require('mongoose').model('Meal');
  var ratingAggregator = function() { 

       User.find({}, function(err, users) {

          users.forEach(function(user) {
            

                finalScore = 5;
                //Now that you've found the user, loop through all meals and average out the scores
                mealList = user.mealArray;
                if (mealList.length == 0) {console.log({"rating":5})}
                else {
                  Meal.find({
                      '_id': { $in: mealList}
                  }, function(err, docs){
                       finalScore = 0;
                        noreviews = 0;

                       for ( i = 0; i < docs.length; i++) {

                        if (docs[i].rating != -5) {
                        finalScore += docs[i].rating;


                      }
                      else {
                        noreviews++;
                      }

                    

                    var meal = docs[i];
                        meal.profilePicture = user.profilePicture;


                           meal.save(function(err) {
                            if (err)
                              throw err;
                            else {
                              

                            }
                          });

                           

                       }



                       if ((docs.length - noreviews) > 0) {
                       user.rating = finalScore/(docs.length - noreviews);


                       user.save(function(err) {
                      if (err)
                        throw err;
                      else {
                        console.log({"rating":(finalScore/(docs.length-noreviews))})

                      }
                    })
                     }

                  })
                }



          });

        });



      console.log("Running hourly score update"); 

    }




var getPush = function (mealName, meal) {
  return "Hungry? Get " + mealName + " for " + meal +"!";
}
 




var Meal = require('mongoose').model('Meal');


  // Initializing Parse Backend
  var Parse = require('parse/node');
  var CronJob = require('cron').CronJob;
  Parse.initialize("YwSVlKUkmHItIfQAKgMTgNoHQSuvLUUHo8s9mBwH", "bMTLuK7K9HVYSz1U5h9i3GvJn3aVeNT3ELthFRTO", "NASRqPkVWZU7RnKy3mhNQF2QvpZT3ozZWnmnk3XH");


  try {
    // Send Push Notifications at 11am and 4pm: 00 00 11,16 * * *
    new CronJob('00 00 11,16 * * *', function() {
      mealName  = null;
    mealType = "Dinner"
    var earliestTime = new Date();
    var latestTime = new Date();

    if ((new Date()).getHours() <= 12) {
      mealType = "Lunch";
      earliestTime.setHours(11) //GTE
      latestTime.setHours(16) // LTE
    }
    else { // dinner
      earliestTime.setHours(16) //GTE
      latestTime.setHours(23) // LTE

    }

    Meal.find({
      pickup: {
        $gte: earliestTime,
        $lt: latestTime
      }
    }, function(err, meals) {
      if (err)
        throw err;

      if (meals.length > 0) {
        mealName = meals[0].title;
        var txt = getPush(mealName,mealType);

        if (mealName != null && mealName.length>1) {
          var query = new Parse.Query(Parse.Installation)
            , data = {
                "alert": txt, 
              };
          Parse.Push.send({
            where: query,
            data: data
            }, {
              success: function () {
                //console.log("arguments", arguments);
                console.log(getPush(mealName,mealType));
              },
              error: function (error) {
                console.log("Error: " + error.code + " " + error.message);
              }
          });

    }


      }


    });

      //console.log('You will see this message at 5:00');
    }, null, true, 'America/Los_Angeles');
  } catch(ex) {
    console.log("cron pattern not valid");
  }
 

  //Should send info to Everyone
  //var meals = Meal.find({}, function(err, meals) {
  //  if (err)
  //    throw err;
  //  
  //}); 

  setInterval(ratingAggregator, 1000 * 60 * 60);
  ratingAggregator();
  //require(Config.get('/root') + '/app/app.controller')(app);


};
