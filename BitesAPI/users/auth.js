var User = require('./user.model.js'),
	passport = require('passport'),
	credentials = require('../credentials.js'),
	FacebookStrategy = require('passport-facebook').Strategy,
	LocalStrategy = require('passport-local').Strategy;

var express = require('express');
var router = express.Router();

var flash    = require('connect-flash');

passport.serializeUser(function(user, done) {
	done(null,user.id);
});

passport.deserializeUser(function(id, done){
	User.findById(id, function(err, user) {
		if (err || !user) return done(err,null);
		done(null,user);
	})
});

module.exports = function(app, options) {


	return {
		init: function() {


			 try {
			var env = app.get('env');
			var config = options.providers;


			if (!options.successRedirect) {
				options.successRedirect = config.facebook[env].successURL;
			}
			if (!options.failureRedirect) {
				options.failureRedirect = config.facebook[env].failURL;
			}

			app.get(config.facebook[env].successURL, function(req, res) {
		  		res.send('Auth successful!');
			})

			app.use(require('cookie-parser')(credentials.cookieSecret));
			app.use(require('express-session')({secret:credentials.cookieSecret, store:options.sessionStor }));
			app.use(passport.initialize());
			app.use(passport.session());
			app.use(flash());

			
			passport.use('local-signup', new LocalStrategy({
       			    usernameField : 'email',
        			passwordField : 'password',
        			passReqToCallback : true 
			    },
			    function(req, email, password, done) {

			    	process.nextTick(function() {


					 console.log("tried to make user");


			        User.findOne({ 'email' :  email }, function(err, user) {
			            if (err) {
			                return done(err);
			            }
			            
			            if (user) {
			                return done(null, false, {message: "Sorry, that email is already taken."});
			            } 

			            else {

			                var newUser  = new User();

			                newUser.email    = email;
			                newUser.password = newUser.generateHash(password);
			                newUser.save(function(err) {
			                    if (err)
			                        throw err;
			                    return done(null, newUser);
			                });
			            }});    

			    });


   			 }));




			passport.use('facebook', new FacebookStrategy({
				clientID: config.facebook[env].appId,
				clientSecret: config.facebook[env].appSecret,
				callbackURL: config.facebook[env].callBackURL,
				profileFields: ['id', 'emails'],
			},
			function (accessToken, refreshToken, profile, done) {
				var authId = 'facebook' + profile.id;

				User.findOne({authId: authId}, function(err, user) {
					if (err) return done(err,null);
					if (user) return done(null, user);

					user = new User({
						authId: authId,
						name: profile.displayName,
						email: profile.emails[0].value,
						created: Date.now(),
						facebook: profile._json
					});
					user.accessToken = accessToken;
					user.save(function(err) {
						if (err) return done(err,null);
						done(null,user);
					})

				});


				options.successRedirect = config.facebook[env].successURL + "?oauth_token=" + accessToken;
				console.log(accessToken);

			}));
		}
		catch (err) {console.log(err)};

		},
		registerRoutes: function() {
			var env = app.get('env');
			var config = options.providers;

			console.log('try to register routes');



			app.post('/signup', function(req,res,next) {
				passport.authenticate('local-signup', function(err,user,info) {
					if (err) 
						return next(err)
					if (!user)
						return res.json(info);
					else
						res.json({message:"user successfully created"})
				})(req,res,next);
			})
			

			
			app.get('/signup', function (req, res) {
			  res.send("error"+req.flash('message'));
			})



			app.post('/signup', passport.authenticate('local-signup', {
		        successRedirect : '/profile', // redirect to the secure profile section
		        failureRedirect : '/signup',
		         failureFlash : true // redirect back to the signup page if there is an error
		    }));

			app.get('/auth/facebook',
				passport.authenticate('facebook', {
					callbackURL: config.facebook[env].callBackURL, scope: [ 'email' ]
				}),
				function (req,res) {

				});

		



				app.get('/auth/facebook/callback',
						passport.authenticate('facebook', { failureRedirect: options.failureRedirect , scope: [ 'email' ] }),
						function(req, res) {
							res.redirect(303, options.successRedirect);
					});




		}
	}
};
