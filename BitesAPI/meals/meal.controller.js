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
	meal.location = mealLocation;
	meal.ingredients = mealIngredients;
	meal.chefName = mealName;
	meal.picture = mealPicture;
	meal.charId = mealCharId;


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
		var foodMap = {};

		meals.forEach(function(meal) {
			foodMap[meal._id] = meal;
			console.log(meal);
		})
		
		res.send(foodMap);
	});
});

router.delete('/:programId', function(req, res, next) {

});

module.exports = function(app) {
  app.use('/meals', router);
};
