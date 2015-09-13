var sys = require('sys');
var exec = require('child_process').exec;
var nodemailer = require("nodemailer");



function shell(req,content,res){ 
    
      jsonToValue(content); // change undefined json value to false.
    
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
                return;  
            });
                
        }else{
            log = "You must not use system instructions"
            res.render("test.html",{message : content , logs : log});
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

function rePass(res,usermail,db){
    //db.getCollection('accounts').findOne({email: "1@yopmail.com"},{username:1 , _id:0 })
     db.findOne({ email: usermail },function(err, user) {
         if (err) throw err;         
        
         if (user) {         
             
                 res.send("under construction");
    //var pass="bbhERMOxO"; ---> imposible hacer esto 
    
    /* 
    var smtpTransport = nodemailer.createTransport({
       service: "gmail",
       auth: {
           user: "siriusmpiweb@gmail.com",
           pass: "siriuslab2015"
       }
    });
    
    smtpTransport.sendMail({
       from: "siriusmpiweb@gmail.com", // sender address
       to: email, // comma separated list of receivers
       subject: "Recuperacion de contrasena WEB-MPI ✔", // Subject line
       text: "Su contrasena es:   "+pass+"  Gracias  por usar el servicio de WEB-MPI" // plaintext body
                }, function(error, response){
               if(error){
                   console.log(error);
               }else{
                   //console.log("Message sent: " + response.message);
               }
    });

 */
             
         
        }else{
            console.log("no existe");
            res.send("under construction");
      }
  // object of the user
 
   });
  
}

exports.shell = shell;
exports.userDir = userDir;
exports.rePass = rePass;



// content : info control (textarea - checkbox - inputs - selects)
// log : all outputs
// typeof variable == "undefined"