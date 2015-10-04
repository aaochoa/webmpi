var sys = require('sys');
var exec = require('child_process').exec;
var nodemailer = require("nodemailer");
var uuid = require('node-uuid');
var userModel = require('./models/account');

var task=0;
var nusers;
var orders;

function usercount(){
    userModel.count({}, function (err, count) { 
    nusers=count;
        //console.log("users "+ nusers);
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
        // pending
        return orders;
    }
     if (op===4){
        // pending
         return 0;
    }
    
    
}


function userstate(req,res,userModel){

    userModel.find({ 'state': false }, function (err, docs) {
       //console.log(docs);
        var string="";
        var content=req.body;
        content.name = req.user.username;        
        
        for(var i = 0; i < docs.length; i++) {
        var obj =docs[i];

        var temp= "[username: " + obj.username + "] [name: " + obj.name +" ] [lastname: "+ obj.lastname + "] [email: " + obj.email + "] \n";
        string= string + temp;    
        //temp.concat(obj.name);
        //temp.concat(obj.lastname);
        //temp.concat(obj.email);
    }
        content.info = string;
        console.log(string);
        res.render("admin/users.html",{header : content });
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

// content : info control (textarea - checkbox - inputs - selects)
// log : all outputs
// typeof variable == "undefined"