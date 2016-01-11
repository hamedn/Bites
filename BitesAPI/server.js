var express = require('express');
var Config = require('./config');
var glob = require('glob');
var app = express();


var mkdirp = require('mkdirp');

mkdirp('./public/uploads/', function(err) { 
if (err)
	throw err;
    // path was created unless there was error
    console.log("made uploads directory");
});


require('./manifest')(app);


app.listen(process.env.PORT || 3000);
//app.listen(Config.get('/server/port'));

require('./ascii');

