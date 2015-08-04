var express = require('express');
var Config = require('./config');
var glob = require('glob');
var app = express();



require('./manifest')(app);


app.listen(process.env.PORT || 3000);
//app.listen(Config.get('/server/port'));

require('./ascii');

