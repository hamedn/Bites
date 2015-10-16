/**
 * Program Controller
 */

var express = require('express');
var router = express.Router();
var Meal = require('mongoose').model('Meal');


router.post('/', function(req, res, next) {


	var mealTitle = req.body.title;
	var mealPrice = req.body.price;


	var meal = new Meal();
	meal.title = mealTitle;
	meal.price = mealPrice;

	meal.save(function(err) {
	    if (err)
	        throw err;
	    return done(null, meal);
	});


});

router.get('/', function(req, res, next) {

});

router.delete('/:programId', function(req, res, next) {

});

module.exports = function(app) {
  app.use('/meals', router);
};
