var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();
var logs = require('../public/js/logservice');
var run = require('../run');
var uuid = require('node-uuid');
var app = require('../app');


/* GET home page. */

// LOGS: route middleware that will happen on every request

router.use(function(req,res,next){
    //console.log(req.method,req.url);
   // logs.savelog(req.url);
    next();
    // continue doing what we were doing and go to the route
});


router.get('/', function (req, res) {

     if(typeof req.user === "undefined"){
         res.render('index', { user : "Anon-User" });
    }else{
     res.render('index', { user : req.user.username })
    }

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

  if (req.isAuthenticated()){
    res.render('test.html',{message : content , logs: info });
  }else{
    res.redirect('/login');
}

});

//To handle the text editor actions

router.post('/editor', function(req, res,next) {

if (req.isAuthenticated()){
        run.shell(req,req.body,res);
  }else{
    res.redirect('/login');
}
});


router.get('/register', function(req, res) {
  if (!req.isAuthenticated()) {
    res.render('register', {info: " " });
  } else {
    req.logout();
    req.session.save(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
  }
});

router.post('/register', function(req, res, next) {

      Account.register(new Account({ username : req.body.username ,
                                     email: req.body.email,
                                     name: req.body.name,
                                     lastname: req.body.lastname,
                                     recovery: uuid.v4(),
                                     isadmin : false
                                   }), req.body.password, function(err, account) {
          if (err) {
            return res.render("register", {info: "Sorry. That username already exists. Try again."});
          }

          passport.authenticate('local')(req, res, function () {
              req.session.save(function (err) {
                  if (err) {
                      return next(err);
                  }
                  //create a workspace for new users
                  run.userDir(req.user.username);
                  res.redirect('/');
              });
          });
      });
});


router.get('/login', function(req, res) {
    res.render('login', { user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res, next) {
    req.session.save(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

router.get('/logout', function(req, res, next) {
    req.logout();
    req.session.save(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});


router.post('/recovery', function(req, res) {
    //console.log(id);
    run.sendPass(res,req.body.email,Account);

});

router.get('/reset', function(req, res) {
    res.render("reset.html");

});

router.post('/reset', function(req, res) {
    //res.render("reset.html");
    run.changePass(res,req,Account);
});

//==============================================================================
//Just to test an admin page layout
router.get('/admin', function(req, res) {
    if (req.isAuthenticated() && req.user.isadmin===true ){

        res.render("admin/admin.html"); 
     }else{
         res.send("unauthorized area");
     }      
});

router.get('/tables', function(req, res) {
    if (req.isAuthenticated() && req.user.isadmin===true ){
  
        res.render("admin/tables.html");
        //run.term;  
     }else{
         res.send("unauthorized area");
     }

});

router.get('/forms', function(req, res) {
      
     if(req.user.isadmin===true && req.user.isadmin===true  ){
        res.render("admin/forms.html");
        //run.term;  
     }else{
         res.send("unauthorized area");
     }      


});


//==============================================================================



//rePass(email,db)

module.exports = router;
