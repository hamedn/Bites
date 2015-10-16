var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var mealSchema = new Schema({
	title: String,
	description: String,
	orderDeadline: Date,
	pickup: Date,
	price: Number,
	maxOrder: Number,
	mealLocation: String,
	ingredients: String,
	name: String 
});


var Meal = mongoose.model('Meal', mealSchema);
module.exports = Meal;
