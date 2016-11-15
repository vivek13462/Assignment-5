'use strict';

var express = require('express');
//var router = express.Router();

module.exports=function(app){

app.get('/', function(req, res) {
	app.use(express.static('public'));
  res.render('index', { title: 'TriviaGame' });
});

};