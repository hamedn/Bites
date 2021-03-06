/**
 * Program Controller
 */

var express = require('express');
var router = express.Router();
var Meal = require('mongoose').model('Meal');
var User = require('mongoose').model('User');
var mongo = require('mongodb');


router.get('/email', function(req, res, next) {
	res.json({"restrict":false});
});


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

		finalScore = -5;
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

	console.log("TRIED TO GET USER BY TOKEN:" + req.headers.accesstoken);

	User.findOne({'accessToken': req.headers.accesstoken}, function(err, user) {
		if (err)
			throw err;
		if (user != null) {
		user.accessToken = "nice try."
		user.password = "nice try."
		res.json(user);
		}
		else {
			res.send("failed to find user");
			console.log("USER IS NULL, user.controller:85");
		}
	});


});

router.post('/changechef', function(req, res, next) {

	User.findOne({'accessToken': req.body.accessToken}, function(err, user) {
		if (err) {
			res.send("fail");
			throw err;
		}

		if (req.body.isChef != null) {
			user.isChef = req.body.isChef;

		}

		if (req.body.phone && req.body.phone.length > 0) {
			user.phone = req.body.phone;
		}
		

		user.save(function(err) {
			if (err) res.send("fail");

			res.send("success");
			console.log("changed chef " + req.body.accessToken + " status to " + req.body.isChef)
		})

		
	});

});

router.post('/changephone', function(req, res, next) {
	var o_id = new mongo.ObjectID(req.body.oid)
	User.findOne({'_id': o_id}, function(err, user) {
		if (err) {
			res.send("fail");
			throw err;
		}

		console.log(user);
		user.phone = req.body.phone;

		user.save(function(err) {
			if (err) res.send("fail");

			res.send("SUCCESS");
			console.log("changed user " + req.body.oid + " phone to " + req.body.phone)
		})

		
	});

});

var multipart = require('connect-multiparty');




module.exports = function(app) {


	var env = app.get("env")
	var cred = require("../credentials.js");

router.post('/changepicture/:oid', function(req, res, next) {

	var id = req.params.oid

var base64 = req.body.image;

var base64Data = base64.replace(/^data:image\/png;base64,/, "");

var filename = "public/uploads/" + id + ".png";

require("fs").writeFile(filename, base64Data, 'base64', function(err) {
  
	var o_id = new mongo.ObjectID(id);

			User.findOne({'_id': o_id}, function(err, user) {
				if (err)
					throw err;

				user.profilePicture = cred.location[env] + "uploads/" + id + ".png" ;
				user.save(function(err) {
					if (err)
						throw err;
					else {
						
						console.log("moved filed picture: " + user.profilePicture);
		   			    res.send("Successfully updated propic");

					}
				})

			});



});

});






  app.use('/users', router);
};
