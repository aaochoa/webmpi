var sys = require('sys');
var exec = require('child_process').exec;


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

exports.shell = shell;
exports.userDir = userDir;



// content : info control (textarea - checkbox - inputs - selects)
// log : all outputs
// typeof variable == "undefined"