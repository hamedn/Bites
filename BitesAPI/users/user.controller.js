/**
 * Program Controller
 */

var express = require('express');
var router = express.Router();
var User = require('mongoose').model('User');
var mongo = require('mongodb');

router.get('/individual/:oid', function(req, res, next) {


	var o_id = new mongo.ObjectID(req.params.oid);

	User.findOne({'_id': o_id}, function(err, user) {
		if (err)
			throw err;
		user.accessToken = "nice try."
		user.password = "nice try."
		res.json(user);
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

module.exports = function(app) {
  app.use('/users', router);
};
