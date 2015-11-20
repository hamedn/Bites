/**
 * Program Controller
 */

var express = require('express');
var router = express.Router();
var User = require('mongoose').model('User');


router.get('/individual/:token', function(req, res, next) {
	var token = req.params.token;
	console.log(token);

	User.findOne({'accessToken': token}, function(err, user) {
		if (err)
			throw err;
		res.json(user);
	});

});



module.exports = function(app) {
  app.use('/users', router);
};
