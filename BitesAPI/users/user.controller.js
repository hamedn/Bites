/**
 * Program Controller
 */

var express = require('express');
var router = express.Router();
var Meal = require('mongoose').model('Meal');
var User = require('mongoose').model('User');
var mongo = require('mongodb');

router.get('/individual/:oid', function(req, res, next) {


	var o_id = new mongo.ObjectID(req.params.oid);

	User.findOne({'_id': o_id}, function(err, user) {
		if (err)
			throw err;
		if (user != null) {
			user.accessToken = "nice try."
			user.password = "nice try."
			res.json(user);
		}
		else {
			console.log("USER IS NULL!!!!");
		}
	});

});

router.get('/updateRating/:oid', function(req, res, next) {
	var o_id = new mongo.ObjectID(req.params.oid);

	User.findOne({'_id': o_id}, function(err, user) {
		if (err)
			throw err;

		finalScore = 5;
		//Now that you've found the user, loop through all meals and average out the scores
		mealList = user.mealArray;
		if (mealList.length == 0) {res.json({"rating":5})}
		else {
			Meal.find({
			    '_id': { $in: mealList}
			}, function(err, docs){
			     finalScore = 0;
			     for ( i = 0; i < docs.length; i++) {
			     	finalScore += docs[i].rating;
			     }


			     user.rating = finalScore/(docs.length);

			     user.save(function(err) {
					if (err)
						throw err;
					else {
						res.json({"rating":(finalScore/(docs.length))})

					}
				})

			})
		}
	});



});


router.get('/byToken', function(req, res, next) {

	User.findOne({'accessToken': req.headers.accesstoken}, function(err, user) {
		if (err)
			throw err;
		user.accessToken = "nice try."
		user.password = "nice try."
		res.json(user);
	});


});

router.post('/changechef', function(req, res, next) {

	User.findOne({'accessToken': req.body.accessToken}, function(err, user) {
		if (err) {
			res.send("fail");
			throw err;
		}

		user.isChef = req.body.isChef

		user.save(function(err) {
			if (err) res.send("fail");

			res.send("success");
			console.log("changed chef " + req.body.accessToken + " status to " + req.body.isChef)
		})

		
	});

});


module.exports = function(app) {
  app.use('/users', router);
};
