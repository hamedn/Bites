var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;


var userSchema = new Schema({
	username: String,
	password: String,
	email: String,
	authId: String,
	name: String,
	created: Date,
	accessToken: String
});


userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};



var User = mongoose.model('User', userSchema);
module.exports = User;
