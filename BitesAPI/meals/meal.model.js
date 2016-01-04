var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var mealSchema = new Schema({
	title: String,
	description: String,
	deadline: Date,
	pickup: Date,
	price: Number,
	maxOrder: Number,
	numOrder: Number,
	mealLocation: String,
	ingredients: String,
	name: String,
	picture: String,
	oid: String,
	rating: Number,
	ratingArr: Array,
	ratingCount: Number,
	charId: String,
	userOID: String,
	userName: String,
	photo:String
});


var Meal = mongoose.model('Meal', mealSchema);
module.exports = Meal;
