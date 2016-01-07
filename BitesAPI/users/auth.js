var User = require('./user.model.js'),
	passport = require('passport'),
	credentials = require('../credentials.js'),
	FacebookStrategy = require('passport-facebook').Strategy,
	LocalStrategy = require('passport-local').Strategy,
	StripeStrategy = require('passport-stripe').Strategy;

var stripe = require("stripe")("sk_test_TGVJ5AB4dXa1eaYooQr0MTN8");
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
			console.log("session used")
			app.use(passport.initialize());
			app.use(passport.session());
			app.use(flash());


			passport.use('local-login', new LocalStrategy({
		        // by default, local strategy uses username and password, we will override with email
		        usernameField : 'email',
		        passwordField : 'password',
		        passReqToCallback : true // allows us to pass back the entire request to the callback
		    },
		    function(req, email, password, done) { // callback with email and password from our form

		        // find a user whose email is the same as the forms email
		        // we are checking to see if the user trying to login already exists
		        User.findOne({ 'email' :  email }, function(err, user) {
		            // if there are any errors, return the error before anything else
		            if (err)
		                return done(err);

		            // if no user is found, return the message
		            if (!user)
		                return done(null, false, {message: "No user found"}); // req.flash is the way to set flashdata using connect-flash

		            // if the user is found but the password is wrong
		            if (!user.validPassword(password))
		                return done(null, false, {message: "Sorry, that password is wrong."}); // create the loginMessage and save it to session as flashdata

		            // all is well, return successful user
		            return done(null, user);
		        });

		    }));

			
			passport.use('local-signup', new LocalStrategy({
       			    usernameField : 'email',
        			passwordField : 'password',
        			passReqToCallback : true 
			    },
			    function(req, email, password, done) {

			    	process.nextTick(function() {


					 console.log("tried to make user");
					// console.log(req);

			        User.findOne({ 'email' :  email }, function(err, user) {
			            if (err) {
			                return done(err);
			            }
			            
			            if (user) {
			                return done(null, false, {message: "Sorry, that email is already taken."});
			            } 

			            else {

			                var newUser  = new User();
			                newUser.name = req.body.name;
			                newUser.isChef = req.body.isChef;
			                console.log(req.body.name);
			                newUser.mealArray = [];
			                newUser.email = email;
			                newUser.rating = 5;
			                newUser.profilePicture = credentials.location[env] + "defaultprofile.gif"
			                newUser.password = newUser.generateHash(password);
			               	newUser.accessToken = newUser.generateHash(password);
			               	
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
				profileFields: ['id', 'emails','picture.type(large)','name','displayName'],
			},
			function (accessToken, refreshToken, profile, done) {
				var authId = 'facebook' + profile.id;



				User.findOne({authId: authId}, function(err, user) {
					if (err) return done(err,null);
					if (user) {
						user.accessToken = accessToken
						user.save(function(err) {
							if (err) return done(err,null);
							return done(null,user);
						})
					}
					else {

					user = new User({
						authId: authId,
						name: profile.displayName,
						email: profile.emails[0].value,
						created: Date.now(),
						facebook: profile._json,
						profilePicture: profile.photos[0].value
					});
					user.mealArray = [];
					user.rating = 5;
					user.accessToken = accessToken;
					user.save(function(err) {
						if (err) return done(err,null);
						done(null,user);
					})
				}

				});


				/*
				POTENTIAL BUG WITH ASYNC.
				*/
				options.successRedirect = config.facebook[env].successURL + "?oauth_token=" + accessToken;
				console.log(accessToken);

			}));





			//stripe connect authentication
			passport.use('stripe', new StripeStrategy({
        		clientID: "ca_7VvNpW0Em2iOnDuxSOHQyygV9PvtAfCs",
        		clientSecret: "sk_test_TGVJ5AB4dXa1eaYooQr0MTN8",
        		callbackURL: credentials.stripecallback[env]
      		},
	      		function(accessToken, refreshToken, stripe_properties, done) {
	      			console.log(accessToken + " " + stripe_properties);
	        		User.findOrCreate({ stripeId: stripe_properties.stripe_user_id }, function (err, user) {
	        			console.log(user);
	          			return done(err, user);
	        		});
	      			}
	    		));

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
						res.json({message:"User Successfully Created", accessToken:user.accessToken,oid:user._id})
				})(req,res,next);
			});
			
			app.post('/saveCreditCard', function(req,res,next) {
				
				console.log("reached /saveCreditCard. data is " + req.body.cardNumber + req.body.cvc + req.body.exp_month + req.body.exp_year);

				//var stripe = require("stripe")("sk_test_TGVJ5AB4dXa1eaYooQr0MTN8");
				var customerID = "";
				var lastFour = req.body.cardNumber.slice(-4);

				//create a Stripe token with the given card information
				stripe.tokens.create({
				  card: {
				  	//will eventually change this data to be the entered data, for now just use testing card info
				    "number": req.body.cardNumber,
				    "exp_month": req.body.exp_month,
				    "exp_year": req.body.exp_year,
				    "cvc": req.body.cvc
				  }
				}, function(err, token) {
				  	//once token has been made use that token to create customer object so that card data will be saved for future transactions
				  	
				  	if (err) {
				  		res.json({message:"FAIL",reason:err});
				  		//throw err;
				  	}
				  	else {

				  	console.log("successfully created token " + token.id);
				  	
				  	//create the Customer object
				  	stripe.customers.create({
					  description: 'Customer for test@example.com',
					  source: token.id // obtained with Stripe.js
					}, function(err, customer) {

						if (err) {
							res.json({message:"FAIL",reason:err});
							//throw err;
						}
					  
					  //Customer has been created, save the Customer id to the user info in database
					  console.log("successfully created customer " + customer.id);
					  customerID = customer.id;


					  console.log("userToken" + req.body.userToken);

					  User.findOne({ 'accessToken' :  req.body.userToken }, function(err, user) {
			            if (err) {
			            	res.json({message:"FAIL",reason:err});
			               // return done(err);
			            }
			            else {
			            
			            if (user) {
			            	console.log("user.email" + user.email);
			                console.log("found user");
			                user.stripeCustomerToken = customerID;
			                user.creditCardLastFourDigits = lastFour;
			                user.save(function(err) {
				                if (err){
				                	res.json({message:"FAIL",reason:err});
				                    console.log('Error')
				                } else {
				                	res.json({message:"SUCCESS"});
				                    console.log('Sucess')
				                }
				            });
			            } 

			        }

			           	}); 


					  return customerID;
					});

	}

				});
				//return customerID;
				
			
			});

			app.post('/saveChefStripeDetails', function(req,res,next) {
				User.findOne({ 'accessToken' :  req.body.userToken }, function(err, user) {
		            if (err) {
		                return done(err);
		            }
		            
		            if (user) {
		            	console.log("user.email" + user.email);

		                user.chefStripeAccessToken = req.body.accessToken;
		                user.chefStripeRefreshToken = req.body.refreshToken;
		                user.chefStripeUserId = req.body.stripeUserId;

		                user.save(function(err) {
			                if (err){
			                    console.log('Error')
			                } else {
			                    console.log('Sucess')
			                }
			            });
		            } 

		        }); 
			});

			app.post('/makeTransaction', function(req, res) {
				//var stripe = require('stripe')(PLATFORM_SECRET_KEY);

				var payment = req.body.transAmount;
				var source = req.body.customerToken;
				var receiver = req.body.chefToken;

				var fee = 0.03 * payment;

				stripe.charges.create({
				  amount: payment,
				  currency: 'usd',
				  source: {source},
				  application_fee: fee
				}, {stripe_account: receiver},
				  function(err, charge) {
				    // check for `err`
				    // do something with `charge`
				  });
			});

			app.post('/login', function(req,res,next) {
				passport.authenticate('local-login', function(err,user,info) {
					if (err) 
						return next(err)
					if (!user)
						return res.json(info);
					else
						res.json({message:"login successful",accessToken:user.accessToken,oid:user._id})
				})(req,res,next);
			});

			

			app.get('/auth/facebook',
				passport.authenticate('facebook', {
					callbackURL: config.facebook[env].callBackURL, scope: [ 'email' , 'public_profile' ]
				}),
				function (req,res) {

			});

	
				app.get('/auth/facebook/callback',
						passport.authenticate('facebook', { failureRedirect: options.failureRedirect , scope: [ 'email','public_profile' ] }),
						function(req, res) {
							res.redirect(303, options.successRedirect);
					});


			//stripe authentication
			app.get('/auth/stripe', passport.authenticate('stripe'));

			/*	app.get('/auth/stripe/callback',
	      			passport.authenticate('stripe', { failureRedirect: '/' }),
	      			function(req, res) {
	        			// Successful authentication, redirect home.
	        			console.log("successfully reached callback");
	        			res.redirect('/');
	      			});
			*/


			app.get('/auth/stripe/callback', function() {
				console.log("reached callback");
			})

		}
	}
};
