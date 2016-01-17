var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Customer = new Schema({
	name: String,
	email: String
});

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
	photo:String,
	profilePicture:String,
	chefToken: String,
	customers:[Customer]
});


var Meal = mongoose.model('Meal', mealSchema);
//module.exports = Meal;
module.exports = {
	Meal: Meal
}
