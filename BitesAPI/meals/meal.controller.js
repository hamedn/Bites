/**
 * Program Controller
 */

var express = require('express');
var router = express.Router();
var Meal = require('mongoose').model('Meal');

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
	meal.mealDate = mealDate;
	meal.charId = mealCharId;
	meal.description = mealDesc;
	meal.deadline = mealDeadline;
	meal.pickup = mealPickup;
	meal.maxOrder = mealMaxOrder;
	meal.location = mealLocation;
	meal.ingredients = mealIngredients;
	meal.chefName = mealName;
	meal.picture = mealPicture;
	meal.charId = mealCharId;
	meal.rating = -5;


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
	    	res.json({message:"meal post successful"});
	    	//done(null, meal);
	    }
	});


});

router.post('/rating/:mealId/:rating', function(req, res, next) {
	var indivRate = req.body.rating;
	var mealId = req.params.mealId;

	var meal = Meal.findOne({'mealId': mealId}, function(err, meal) {
		if (err)
			throw err;
		res.json(meal);
	});

	if (meal.rating == -5) {
		meal.rating = indivRate;
	} else {
		meal.rating = (meal.rating + indivRate) / 2;
	}

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
		console.log(array[0].title);

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
