/**
 * Program Controller
 */

var express = require('express');
var router = express.Router();
var Meal = require('mongoose').model('Meal');
var User = require('mongoose').model('User');
var mongo = require('mongodb');

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




	meal.save(function(err) {
	    if (err)
	        throw err;
	    else {
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
						res.json({message:"meal post successful",data:req.body});
					}
				})

			});


	    }
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
			return new Date(b.pickup) - new Date (a.pickup);
		});

		for (var i = 0; i < array.length; i++) {
			console.log(array[i].pickup);
		};

		res.json(array);
	});
});

router.delete('/:programId', function(req, res, next) {

});

module.exports = function(app) {
  app.use('/meals', router);
};
