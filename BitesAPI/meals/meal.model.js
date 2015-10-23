var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var mealSchema = new Schema({
	title: String,
	description: String,
	orderDeadline: Date,
	pickup: Date,
	price: Number,
	maxOrder: Number,
	numOrder: Number,
	mealLocation: String,
	ingredients: String,
	name: String,
	picture: String, 
	charId: String
});


var Meal = mongoose.model('Meal', mealSchema);
module.exports = Meal;
