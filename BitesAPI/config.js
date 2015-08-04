var Confidence = require('confidence');
var path = require('path');

var criteria = {
  env: process.env.NODE_ENV
};

var config = {
  name: 'landme',
  root: path.normalize(__dirname),
  mongo:  {
    uri: 'mongodb://composer:composed@ds031581.mongolab.com:31581/heroku_4sbvgqg8'
  },
  server: {
    port: {
      $filter: 'env',
      test: 9090,
      $default: 3000
    },
    host: {
      $filter: 'env',
      prod: 'localhost',
      $default: 'localhost'
    }
  }
};


var store = new Confidence.Store(config);


exports.get = function(key) {
  return store.get(key, criteria);
};


exports.meta = function(key) {
  return store.meta(key, criteria);
};
