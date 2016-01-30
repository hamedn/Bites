var User = require('./user.model.js'),
	passport = require('passport'),
	credentials = require('../credentials.js'),
	FacebookStrategy = require('passport-facebook').Strategy,
	LocalStrategy = require('passport-local').Strategy,
	StripeStrategy = require('passport-stripe').Strategy;

var Meal = require("../meals/meal.model.js").Meal;
var stripe = require("stripe")("sk_live_pDJdLN8F6bHfQhswLlJk7wpx"); //using live production key
var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var flash    = require('connect-flash');
var nodemailer = require('nodemailer');

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
			                newUser.phone = req.body.phone;
			                console.log(req.body.name);
			                newUser.mealArray = [];
			                newUser.email = email;
			                newUser.rating = -5;
			                newUser.profilePicture = credentials.location[env] + "defaultprofile.gif"
			                newUser.password = newUser.generateHash(password);
			               	newUser.accessToken = newUser.generateHash(password + Math.random());
			               	
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
						options.successRedirect = config.facebook[env].successURL + "?oauth_token=" + accessToken + "?exists=true";
						user.save(function(err) {
							if (err) return done(err,null);
							return done(null,user);
						})
					}
					else {

					options.successRedirect = config.facebook[env].successURL + "?oauth_token=" + accessToken + "?exists=false";
					user = new User({
						authId: authId,
						name: profile.displayName,
						email: profile.emails[0].value,
						created: Date.now(),
						facebook: profile._json,
						profilePicture: profile.photos[0].value
					});
					user.mealArray = [];
					user.rating = -5;
					user.accessToken = accessToken;
					user.phone = '000';
					user.save(function(err) {
						if (err) return done(err,null);
						done(null,user);
					})
				}

				});


				/*
				POTENTIAL BUG WITH ASYNC.
				*/
				console.log(accessToken);

			}));





			//stripe connect authentication
			passport.use('stripe', new StripeStrategy({
        		clientID: "ca_7VvNpW0Em2iOnDuxSOHQyygV9PvtAfCs",
        		clientSecret: "sk_live_pDJdLN8F6bHfQhswLlJk7wpx", //live key
        		callbackURL: credentials.stripecallback[env],
        		scope: "read_write"
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
				  	} else {

				  		console.log("successfully created token " + token.id);
				  	
					  	//create the Customer object
					  	stripe.customers.create({
						  description: 'Customer for Bites user with oid: ' + req.body.id,
						  source: token.id // obtained with Stripe.js
						}, function(err, customer) {

							if (err) {
								console.log("failed to create customer");
								res.json({message:"FAIL",reason:err});
								//throw err;
							} else {
								//Customer has been created, save the Customer id to the user info in database
								console.log("successfully created customer " + customer.id);
								customerID = customer.id;
								console.log("userToken" + req.body.userToken);

								User.findOne({ 'accessToken' :  req.body.userToken }, function(err, user) {
						        	if (err) {
						          		res.json({message:"FAIL",reason:err});
						            	// return done(err);
						        	} else {
							            if (user) {
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
						}

					  	return customerID;
					});

			}

			});
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
			                	res.json({message:"SUCCESS"})
			                    console.log('Sucess')
			                }
			            });
		            } 

		        }); 
			});

			app.post('/makeTransaction', function(req, res) {
				//var stripe = require('stripe')(PLATFORM_SECRET_KEY);

				var payment = req.body.transAmount * 100;
				var source = req.body.source;
				var receiver = req.body.receiver;

				console.log("source " + source + " , receiver " + receiver);

				var fee = 0.10 * payment;

				payment = payment - fee;
				
				stripe.charges.create({
				  amount: payment,
				  currency: 'usd',
				  customer: source,
				  destination: receiver,
				  description: "Purchase with Bites",
				  application_fee: fee
				},
				  function(err, charge) {
				    // check for `err`
				    if (err) {
				    	console.log("error making transaction" + err);
				    	return err;
				    } else {
				    	console.log("made transaction");
				    	return res.json({message: "SUCCESS"});
				    };
				    // do something with `charge`
				  });
			});

			app.post('/saveOrder', function(req, res) {
				//var stripe = require('stripe')(PLATFORM_SECRET_KEY);
				var userName = "", userEmail = "";
				var newCustomer = "";
				User.findOne({ 'accessToken' :  req.body.userToken }, function(err, user) {
		            if (err) {
		                return done(err);
		            }
		            
		            if (user) {
		            	console.log("user.email" + user.email);

		            	var newOrder = {mealId: req.body.mealId};

		                user.orders.push(newOrder);
		                newCustomer = user;
		                userName = user.name;
		                userEmail = user.email;

		                user.save(function(err) {
			                if (err){
			                    return res.json({message:"Error " ,reason:err});
			                } else {
			                	
				    			Meal.findOne({'_id':  mongo.ObjectID(req.body.mealId) }, function(err, meal) {
						        	console.log("found meal");
									if (err) {
										console.log('couldnt find meal');
										return res.json({message: "Error " + err});
									}
									else if (meal) {
										//var newCustomer = user;
										meal.customers.push(newCustomer);
										meal.numOrder++;
										console.log("pushing meal to customers array");

										meal.save(function(err) {
							                if (err){
							                	console.log("FINAL FAIL");
							                    return res.json({message:"Error " + err});

							                } else {
							                	console.log("FINAL SUCCESS");
							                	return res.json({message:"SUCCESS"});
							                }
						            	});
									}
								});

			                    console.log('Success');
			                }
			            });
		            } 

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

			app.post('/getChefToken', function(req, res) {
				console.log("retrieving chef token");
				User.findOne({ 'accessToken' :  req.body.userToken }, function(err, user) {
		            if (err) {
		                return done(err);
		            }
		            
		            if (user) {
		            	console.log("found user");
		            	if (user.chefStripeUserId) {
		            		console.log("chef id");
		            		console.log("user.phone" + user.phone);
		            		return res.json({message: "SUCCESS", chefToken: user.chefStripeUserId, chefPhone: user.phone});
		            	} else {
		            		return res.json({message: "NO CHEF TOKEN"});
		            	}	
		            }
		        }); 
			});

			app.post('/sendEmail', function(req, res) {
				console.log("sending email");
				var name = req.body.name;
				var email = req.body.email;

				var emailText = "Hello " + name + ",\n\n" + "Welcome to Bites! Here's a quick guide on how to use our service.\n\n1. You're hungry. Open up Bites and find a meal that looks tasty.\n\n2. Place an order before the order dealine for the meal.\n\n3. Find your meal at the location specified by the chef before the pickup deadline.\n\n\nHave any questions or feedback? Shoot us an email at bitesappmail@gmail.com.\n\nThanks,\nBites";

				//var htmlText = "<html><div style='position:absolute; width:100%; background-color:#67BF68; height: 60px; left:0px; top:0px;'>		<img src='http://www.bitesapp.com/img/portfolio/bg/bg-logo.png' style='display:inline-block; margin-left: 20px; margin-top:10px;' ></div><div style='border: 1px solid black;'>	<div style='margin-left: 20px;'>	<div style=''>		<p>Hello " + name + ",<br><br>Welcome to Bites! Here&#39;s a quick guide on how to use our service.</p>	</div>	<div style='margin-left:40px; margin-top:25px;'>		<div style='height: 0px;'> 			<img src='http://www.bitesapp.com/img/inst1.png' style='width:50px; height:50px; display: inline-block;'/>			<p style='display:inline-block; height: 0px; vertical-align:top; margin-left: 10px; margin-top:18px;'>You&#39;re hungry. Open up Bites and find a meal that looks tasty.</p>		</div>		<div style='height: 0px; margin-top:0px;'> 			<img src='http://www.bitesapp.com/img/inst2.png' style='width:50px; height:50px; display: inline-block;'/>			<p style='display:inline-block; height: 0px; vertical-align:top; margin-left: 10px; margin-top:18px;'>Place an order before the order deadline for the meal.</p>		</div>		<div style='height: 0px; margin-top:0px;'> 			<img src='http://www.bitesapp.com/img/inst3.png' style='width:50px; height:50px; display: inline-block;'/>			<p style='display:inline-block; height: 0px; vertical-align:top; margin-left:10px; margin-top:18px;'>Find your food at the location specified by the chef.</p>		</div>			</div>	<div>		<p><br>Have any questions or feedback? Shoot us an email at bitesappmail@gmail.com.<br><br>Thanks,<br>Bites</p>	</div>	</div></div></html>";

				var transporter = nodemailer.createTransport('smtps://bitesappmail%40gmail.com:WallachH8@smtp.gmail.com');

				// setup e-mail data with unicode symbols
				var mailOptions = {
				    from: 'Bites App <admin@bitesapp.com>', // sender address
				    to: email, // list of receivers
				    subject: 'Welcome to Bites!', // Subject line
				    text: emailText // plaintext body
				    //html: htmlText // html body
				};

				// send mail with defined transport object
				transporter.sendMail(mailOptions, function(error, info){
				    if(error){
				        return console.log(error);
				    }
				    console.log('Message sent: ' + info.response);
				});
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
			});

		}
	}
};
