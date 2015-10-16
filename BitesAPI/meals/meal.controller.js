/**
 * Program Controller
 */

var express = require('express');
var router = express.Router();
var Program = require('mongoose').model('Meal');


router.post('/', function(req, res, next) {

});

router.get('/', function(req, res, next) {

});

router.delete('/:programId', function(req, res, next) {

});

module.exports = function(app) {
  app.use('/meals', router);
};
