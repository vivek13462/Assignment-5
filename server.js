var express=require('express');
redis = require('redis'),
client = redis.createClient(),
    assert = require('assert'),
    ObjectId = require('mongodb').ObjectID,
    
     http = require('http'),
    parser = require("body-parser"),
    movieDB = require('./modules/triviaDB'),
    MongoClient = require('mongodb').MongoClient,
  mongoose = require('mongoose'),  
 app = express();
var bodyParser = require('body-parser');
var server= require('http').createServer(app);
var io=require('socket.io').listen(server);

var mongodb = require('mongodb');


users=[];
connections=[];


server.listen(process.env.PORT || 3000);
console.log('server running...');
app.use(express.static('./'));
app.get('/', function(req,res){
    res.sendFile(__dirname+'/public/index.html'); 
});


io.sockets.on('connection', function(socket){
    connections.push(socket);
    console.log('connected: %s sockets connected', connections.length);

    //discounnect
    socket.on('disconnect', function(data){
        //if(! socket.username)return;
        users.splice(users.indexOf(socket.username),1);
        connections.splice(connections.indexOf(socket),1);
        console.log('Disconnected: %s sockets',connections.length) ;

    });
   

    //new user
    socket.on('new user',function(data,callback){
        callback(true);
        socket.username= data;
        users.push(socket.username);
        updateUsernames();
    })

    function updateUsernames(){
        io.sockets.emit('get users',users);
    }

 socket.on('score', function(data){
        console.log("Inside score...")
        console.log(data.questionId);
        console.log(data.givenAns);
        var user = data.currentUser;
        console.log(user);
        var flag;
        var possible = data.givenAns;
        var id = data.questionId;
        var actual = data.actualAns;
        var correct;
        if (actual == possible) {
            flag = 1;
            client.incr("right", function(err, reply) {
            });
        }
        if (actual != possible) {
            flag = 0;
            client.incr("wrong", function(err, reply) {
            });
        }
        var Right;
        var Wrong;
        client.get("right", function(err, reply) {
            Right = reply;
            console.log("Right : " + Right);
            client.get("wrong", function(err, reply) {
                Wrong = reply;
                console.log("Wrong : " + Wrong);
                var data = {"right" : Right, "wrong" : Wrong, "flag" : flag};
                io.sockets.emit('score', data);
                console.log(data);
            });
        });
        //console.log(data);
    });




});


// Connect to the db
 var MongoClient = mongodb.MongoClient;
 MongoClient.connect("mongodb://localhost:27017/Gampeapp", function(err, db) {
    if(!err) {
        console.log("We are connected");
    }
    else{console.log(err);}
    db.createCollection('trivia_records', {strict:true}, function(err, collection) {});    
    var collection = db.collection('trivia_records');
    var stream = collection.find({'id':1}).stream();
    stream.on("data", function(item) {
        console.log(item);
        });
    stream.on("end", function() {});


});



    app.engine('.html', require('ejs').__express);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'html');

    client.set("right", 0);
    client.set("wrong", 0);

var jsonParser = parser.json({
    type: 'application/json'
});
var router = express.Router();

app.use(parser.urlencoded({
    extended: true
}));
app.use(parser.json());

 var url = 'mongodb://localhost:27017/Gameapp';


//mongoose.connect(url);
mongoose.set('debug', true);


var triviaGameSchema = new mongoose.Schema({
    question: String,
    answer: String
});

var collectionName = 'trivia_records';

// Create a database collection model
var triviaGameDB = mongoose.model('Gameapp', triviaGameSchema, collectionName);
/*app.post('/question', function(req, res) {

    var question = req.body["question"];
    var answer = req.body["answer"];
   
 
    
    var insertDocument = function(db, callback) {

        

        db.collection('question_trivia_records').insert({
            "question" : question,
            "answer" : answer
        });
    
        var data = db.collection('question_trivia_records').find().toArray(function(err, documents) {

            res.json(documents);
                
        });
    };

    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);

        insertDocument(db, function() {
            db.close();
        });
    });

});*/


app.post('/question', function(req, res) {
    
    var question = req.body.question;
    var answer = req.body.answer;
    var insertDocument = function(db, callback) {
        db.collection('trivia_records').insert({
            "question": question,
            "answer": answer
        });
        var data = db.collection('trivia_records').find().toArray(function(err, documents) {
            var randomQue = documents[Math.floor(Math.random() * documents.length)];
            console.log(randomQue);
            res.json({newQuestion:randomQue});
            getQuestion(randomQue);
        });
    };
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        insertDocument(db, function() {
            db.close();
        });
    });
});

getQuestion = function(question){
        io.sockets.emit('newQue', question);
        console.log('inside getQuestion.....');
    }


app.get('/question', function(req, res) {
   /* console.log("db issueee??");*/
    var totalQue;
    triviaGameDB.find({}, '_id question answer', function(err, documents){
        if(err){
            console.log('error'+err);
            res.json({message: err});
        }
        else{
            var randomQue = documents[Math.floor(Math.random() * documents.length)];
            console.log(randomQue);
            res.json({newQuestion:randomQue});
            getQuestion(randomQue);
        }
    });
});




// app.post('/answer', function(req, res){

//     var possible = req.body["possibleAns"];
//     var id = req.body["answerId"];
//     var actual = req.body["answer"];
//     var correct;

            
//     if(actual == possible){
                
//         client.incr("right", function(err, reply){
//             console.log("Right: " +reply);
//         });
//         res.json(true);
//     }
        
//     if(actual != possible){
            
//         client.incr("wrong", function(err, reply){
//             console.log("Wrong: " +reply);
//         });
//         res.json(false);
//     }

// });

/*app.get('/score', function(req, res){

    var right;
    var wrong;
    
    client.get("right", function(err, reply){
        right = reply;
        console.log("Right : "+right);

        client.get("wrong", function(err, reply){
            wrong = reply;
            console.log("Wrong : "+wrong);
                res.json({
                    "right" : right,
                    "wrong" : wrong
                });
        });

    });
});*/



   

   


require('./routes/index')(app);

io.sockets.on('connection', function(socket){
    socket.on('New Question', function(data){
        io.sockets.emit('appending', data);

    });
});


