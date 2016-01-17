var express = require('express');
var handlebars = require('handlebars'),
  fs = require('fs');
var router = express.Router();
var Meal = require('mongoose').model('Meal');
var User = require('mongoose').model('User');
var mongo = require('mongodb');





router.get('/:charId', function(req, res, next) {

fs.readFile('./views/meal.html', 'utf-8', function(error, source){

	Meal.findOne({'charId': req.params.charId}, function(err, meal) {
		if (err || meal == null) {
			res.send("404 error");
			return;
		}
		else {
			var data = meal;
			data.body = process.argv[2];


			 var template = handlebars.compile(source);
			 var html = template(data);
			 res.send(html)
			 console.log(data);


		}
	});



});


});



module.exports = function(app) {

  app.use('/m', router);


	console.log("HANDLEBARS LOADED");

}