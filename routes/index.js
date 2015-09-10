var express = require('express');
var router = express.Router();
var logs = require('../public/js/logservice');
var run = require('../run');


/* GET home page. */

// LOGS: route middleware that will happen on every request

router.use(function(req,res,next){    
    //console.log(req.method,req.url);
   // logs.savelog(req.url);   
    next();
    // continue doing what we were doing and go to the route
});

router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/editor', function(req, res) {
  var content = req.body;
  content.codebox='// Welcome to the MPI-COMPILER  Powered By SIRIUS lab'
  content.cpu = true;
  content.gpu = false;
  content.mpi = false;
  content.condor = false;
  content.submitfile = "submit file";
  content.select = "1";
  var info = " Your output area ";    
  res.render('test.html',{message : content , logs: info });
});

//To handle the text editor actions

router.post('/editor', function(req, res,next) {
    var content = req.body;
    run.shell(content,res);
});




module.exports = router;
