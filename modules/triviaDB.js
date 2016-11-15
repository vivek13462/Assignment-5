var mongoose = require("mongoose");

mongoose.connect('mongodb://localhost/triviaGame');

// Create a movie schema
var triviaGameSchema = mongoose.Schema({
    question: String,
    answer: String,
});

// Create a database collection model
var triviaGame = mongoose.model('triviaGame', triviaGameSchema);

module.exports.triviaGame = triviaGame;