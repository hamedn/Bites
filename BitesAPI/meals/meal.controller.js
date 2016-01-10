/**
 * Program Controller
 */

var express = require('express');
var router = express.Router();
var Meal = require('mongoose').model('Meal');
var User = require('mongoose').model('User');
var mongo = require('mongodb');
var multipart = require('connect-multiparty');
var shortId = require('shortid');
var mime = require('mime');
var fs = require("fs");
var mv = require('mv');



function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
};

router.post('/', function(req, res, next) {


	var mealTitle = req.body.title;
	var mealPrice = req.body.price;
	var mealDesc = req.body.description;
	var mealDate = req.body.mealDate;
	var mealDeadline = req.body.orderDeadline;
	var mealPickup = req.body.pickup;
	var mealMaxOrder = req.body.maxOrder;
	var mealNumOrder = req.body.numOrder;
	var mealLocation = req.body.mealLocation;
	var mealIngredients = req.body.ingredients;
	var mealName = req.body.name;
	var mealPicture = req.body.picture;
	var mealCharId = randomString(64, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'); 
	
	var meal = new Meal();
	meal.title = mealTitle;
	meal.price = mealPrice;
	meal.charId = mealCharId;
	meal.description = mealDesc;
	meal.deadline = mealDeadline;
	meal.pickup = mealPickup;
	meal.maxOrder = mealMaxOrder;
	meal.mealLocation = mealLocation;
	meal.ingredients = mealIngredients;
	meal.chefName = mealName;
	meal.picture = mealPicture;
	meal.charId = mealCharId;
	meal.rating = -5;
	meal.ratingCount = 0;
	meal.ratingArr = [];
	meal.userOID = req.body.userOID;
	meal.userName = req.body.userName;

	/*
	meal.deadline = mealDeadline;
	meal.pickup = mealPickup;
	meal.maxOrder = mealMaxOrder;
	meal.location = mealLocation;
	meal.ingredients = mealIngredients;
	meal.name = mealName;
	*/


var o_id = new mongo.ObjectID(req.body.userOID);

	User.findOne({'_id': o_id}, function(err, user) {
				if (err)
					throw err;
				console.log(user);
				user.mealArray.push(meal._id)

				user.save(function(err) {
					if (err)
						throw err;
					else {

						meal.profilePicture = user.profilePicture



							meal.save(function(err) {
						    if (err)
						        throw err;
						    else {
								res.json({message:"meal post successful",id:meal._id,data:req.body});
										
						    }
						});



					}
				})

			});








	

});

router.post('/rating', function(req, res, next) {
	var indivRate = parseInt(req.body.rating);

	var o_id = new mongo.ObjectID(req.body.oid);

	Meal.findOne({'_id': o_id}, function(err, meal) {
		if (err)
			throw err;

		if (meal.ratingCount == 0) {
			meal.rating = indivRate;
			meal.ratingArr.push(indivRate);
			meal.ratingCount++;
		} else {
			meal.ratingCount++;
			meal.ratingArr.push(indivRate);
			var sum = 0;
			for (var i = 0; i<meal.ratingArr.length; i++) {
				sum += meal.ratingArr[i];
			}

			meal.rating = sum / meal.ratingCount;
		}

		meal.save(function(err) {
	    	if (err)
	        	throw err;
	    	else {
	    		res.json({message:"rating post successful"});
	    		//done(null, meal);
	    	}
		});
	});
});

router.post('/delete/:oid', function(req, res, next) {
	var o_id = new mongo.ObjectID(req.params.oid);

	Meal.remove({'_id': o_id}, function(err, meal) {
		if (err) {
			throw err;
		} else {

			useroid = meal.userOID;
			var oid = new mongo.ObjectID(useroid);

			User.findOne({'_id': oid}, function(err, user) {
				if (err)
					throw err;
				if (user != null) {

					search_term = {"$oid":req.params.oid};

					for (var i=user.mealArray.length-1; i>=0; i--) {
					    if (user.mealArray[i] == search_term) {
					        user.mealArray.splice(i, 1);
					        console.log("found and removed meal");
					    }
					}

					user.save(function(err) {
						if (err)
							throw err;
						else {
							res.json({message:"meal successfully deleted"});


						}
					})



				}
				else {
					console.log("USER IS NULL!!!!");
				}
			});

		}

	});
});

router.get('/search/:oid', function(req, res, next) {

	var o_id = new mongo.ObjectID(req.params.oid);
	console.log(req.body);

	Meal.findOne({'_id': o_id}, function(err, meal) {
		if (err)
			throw err;
		console.log(meal);
		res.json(meal);
	});
});

router.get('/individual/:charId', function(req, res, next) {
	var charId = req.params.charId;
	console.log(req.params.charId);

	Meal.findOne({'charId': charId}, function(err, meal) {
		if (err)
			throw err;
		res.json(meal);
	});
});

router.get('/getAll/', function(req, res, next) {

	Meal.find({}, function(err, meals) {
		console.log("in getAll");
		//console.log(meals);

		var array = eval(meals);

		array.sort(function(a,b) {
			if (a.orderDeadline < b.orderDeadline) {
				return -1
			} else if (a.orderDeadline > b.orderDeadline){
				return 1;
			} else {
				return 0;
			};
		});

		for (var i = 0; i < array.length; i++) {
			console.log(array[i].orderDeadline);
		};

		res.json(array);
	});
});

router.delete('/:programId', function(req, res, next) {

});

/*

router.post('/uploadPicture', function(req, res, next) {
	console.log("BLAH");
	res.send("BLAH");
});
*/


var multipartMiddleware = multipart();
router.post('/uploadPicture/:oid', multipartMiddleware, function(req, resp) {


console.log("THIS IS DA ID" + req.params.oid)

		var file = req.files.file;
			var path = file.path;
			var destFileName = "uploads/" + shortId.generate()+'.'+mime.extension(file.type);

		console.log(destFileName);
		console.log(file);



		mv(path, "./public/" + destFileName, function(err) {
		    // handle the error
		    if (err)
		    	throw err;



		    var o_id = new mongo.ObjectID(req.params.oid);

			Meal.findOne({'_id': o_id}, function(err, meal) {
				if (err)
					throw err;

				meal.photo = destFileName;
				meal.save(function(err) {
					if (err)
						throw err;
					else {
						
						console.log("moved filed");
		   			    resp.send("Successfully posted meals");

					}
				})

			});

		    
		});



	

 // console.log(req.body, req.files);
  // don't forget to delete all req.files when done 
});




module.exports = function(app) {
  app.use('/meals', router);
};
