var sys = require('sys');
var exec = require('child_process').exec;
var nodemailer = require("nodemailer");
var uuid = require('node-uuid');
var userModel = require('./models/account');

var task=0;
var nusers;
var orders;
var support;

function usercount(){
    userModel.count({}, function (err, count) { 
    nusers=count;
    });  
}
 
function userpending(userModel){
    userModel.count({ 'state': false },function (err, count) { 
    orders=count;    
    });
}



function shell(req,content,res){ 
    
      jsonToValue(content); // change undefined json value to false.
      task++;    
       
    
      if( content.codebox.search(/.*system\(.*/) == -1){
          
          var codepath= " codes/"; 
          var dircode=req.user.username;
          
           // first compile then run   
          
              var child = exec(content.codebox+codepath+dircode, function (error, stdout, stderr){

              //sys.print('stdout: ' + stdout);
              var log = stdout + stderr;
              //sys.print('stderr: ' + stderr);

              if (error !== null) {
                log = 'exec error: ' + error;
              }
                res.render("test.html",{message : content , logs : log});
                task--; 
                return; 
                 
            });
                
        }else{
            log = "You must not use system instructions"
            res.render("test.html",{message : content , logs : log});
            task--; 
            return;
            
        
        }
}

function jsonToValue(content){
    if(typeof content.cpu === "undefined"){
        content.cpu = false;
    }
    
     if(typeof content.gpu === "undefined"){
        content.gpu = false;
    }
    
     if(typeof content.mpi === "undefined"){
        content.mpi = false;
    }
    
     if(typeof content.condor === "undefined"){
        content.condor = false;
    }

}

function userDir(username){
     var codepath= "codes/"; 
     var child = exec("mkdir "+codepath+username, function (error, stdout, stderr){
              if (error !== null) {
                sys.print('exec error: ' + error);
              }
    });
}


function compileOptions(){

}



function htcOut(){

}

function sendPass(res,usermail,db){
    //db.getCollection('accounts').findOne({email: "1@yopmail.com"},{username:1 , _id:0 })
    var weblink= "http://localhost:3000/reset";
     db.findOne({ email: usermail },function(err, user) {
         if (err) throw err;         
        
         if (user) {            
                    
                    // Find a single email
             
                    db.findOne({  email: usermail }, function(err, query) {
                      if (err) return console.error(err);
                      //console.dir(query.recovery);
                        
                        
                var smtpTransport = nodemailer.createTransport({
                   service: "gmail",
                   auth: {
                       user: "siriusmpiweb@gmail.com",
                       pass: "siriuslab2015"
                   }
                });

                smtpTransport.sendMail({
                   from: "siriusmpiweb@gmail.com", // sender address
                   to: usermail, // comma separated list of receivers
                   subject: "Recuperacion de contrasena WEB-MPI ✔", // Subject line
                   text: "Codigo de verificacion para crear una nueva contrasena :   "+query.recovery+" Ingresa a "+weblink+"  Gracias  por usar el servicio de WEB-MPI" // plaintext 
                            }, function(error, response){
                           if(error){
                               console.log(error);
                           }else{
                                    res.redirect("/");
                                  }
          
                           });                 
                    
                    });         
        }else{
            console.log("no existe");
            res.send("under construction");
      }
  // object of the user
 
   });
  
}

function changePass(res,req,db){
    
    db.findOne({ recovery: req.body.token },function(err, user) {   
         if (err) throw err;         
        
         if (user) {
             
              if(user.email === req.body.email ){                    

                  //  db.update({ _id : {$eq:query.id}}, {$set: {password:req.body.newpass }}, function(err, result){
                    //      console.log("Updated successfully");
                      //    console.log(result);
                        //});
                      
                      db.remove({ _id : {$eq:query.id}}).exec();
                       db.register(new db({ username : query.username , 
                                   email: query.email,
                                   name: query.name,
                                   lastname: query.lastname,
                                   recovery: uuid.v4()    
                                 }), req.body.newpass, function(err, account) {
                                    if (err) {
                                      return res.render("register", {info: "Database error"});
                                    }
                                    res.redirect("/login");                                        
                                });
                                                   
                    }else{
                       res.send("Email not valid");       
                    }                                     
                      
         }else{ // end user   
            res.send("Token not valid"); // security issue
         }     
    }); // end db.findOne 1
}

function adminview(op,userModel){
    if(op===1){
        return task;
    }
    if(op===2){        
        return nusers;
    }
    if (op===3){
        return orders;
    }
     if (op===4){
        // pending
         return support;
    }
    
    
}


function userstate(req,res,userModel){
    var string="";
    var stringuser="";
    var content=req.body;
    
     userModel.find({}, function (err, all) {
        
         for(var i = 0; i < all.length; i++) {
            var user=all[i];
             
             var t= "[username: " + user.username + "] [name: " + user.name +" ] [lastname: "+ user.lastname + "] [email: " + user.email + "] \n";
        stringuser= stringuser + t;
            
     
        }
         content.list = stringuser;      
         
          userModel.find({ 'state': false }, function (err, docs) {
       //console.log(docs);
        
        content.name = req.user.username;        
        
        for(var i = 0; i < docs.length; i++) {
        var obj =docs[i];

        var temp= "[username: " + obj.username + "] [name: " + obj.name +" ] [lastname: "+ obj.lastname + "] [email: " + obj.email + "] \n";
        string= string + temp;       
    }
        content.info = string;
        
        res.render("admin/users.html",{header : content });
    }); 
         
         
         
         
     }); // end find all users
    
   

}


function activateuser(req,res,userModel){
    var content=req.body;
    
    userModel.update({ username: req.body.username },{state: true} ,function(err, user) {   
         if (err) throw err;         
        
         if (user) {
             
             orders--;
             userstate(req,res,userModel);
         
         }else{
            res.send("invalid username to update");
         }
    });
}

function removeuser(req,res,userModel){
    
    var content=req.body;
    
    userModel.find({ username: req.body.rmusername }).remove(function(err, user) {   
         if (err) throw err;         
        
         if (user) {             
             
             nusers--;
             userstate(req,res,userModel);
         
         }else{
            res.send("invalid username to remove");
         }
    });
}



function savesuggestion(req,res,userModel){
    var content=req.body;
    userModel.update({ username: req.user.username },  
    {
        '$push': {
                  comment : {  
                                'date': req.body.date,
                                'subject': req.body.subject,
                                'body': req.body.body    
    }}} ,function(err, user) {   
         if (err) throw err;         
        
         if (user) {
             support++;
             res.send('Suggestion added');
             //userstate(req,res,userModel);
         
         }else{
            res.send("invalid username to update");
         }
        });
}




function usersuggs(req,res,userModel){

    var string="";
    var content=req.body;
    
    userModel.find({ }, function (err, docs) {        
        content.name = req.user.username;        
        
        for(var i = 0; i < docs.length; i++) {
        var obj =docs[i];
        
        if(obj.comment.length>0){      
            
         obj.comment.forEach(function (item) {
             if(item!=undefined){
                 var temp=  "[username: " + obj.username + "] "+ item + "] \n";
                 string= string + temp;
             }
            
             
            });   
        
        }
    }
        content.info = string;
        
        res.render("admin/suggestions.html",{header : content });
    }); 
         
}

function suggcount(userModel){
    
     userModel.find({ }, function (err, docs) {
     
          for(var i = 0; i < docs.length; i++) {
            var obj =docs[i];
            support = obj.comment.length;
          }     
     });
}


function removesugg(req,res,UserModel){

     var content=req.body;
    //Article.findByIdAndUpdate(   
        userModel.update({ username: req.body.username },  
        {  $pull: { 'comment' : { _id: req.body.id } } },function(err, model) {   
             if (err) throw err;         

             if (model) {
                 console.log(model);
                 support--;
                 usersuggs(req,res,userModel);

             }else{
                res.send("invalid id");
             }
        });        
}

exports.shell = shell;
exports.userDir = userDir;
exports.sendPass = sendPass;
exports.changePass = changePass;
exports.adminview = adminview;
exports.usercount = usercount;
exports.userpending = userpending;
exports.userstate = userstate;
exports.activateuser = activateuser;
exports.removeuser = removeuser;
exports.savesuggestion = savesuggestion;
exports.usersuggs = usersuggs;
exports.suggcount = suggcount;
exports.removesugg = removesugg;

// content : info control (textarea - checkbox - inputs - selects)
// log : all outputs
// typeof variable == "undefined"