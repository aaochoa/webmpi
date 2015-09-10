var sys = require('sys');
var exec = require('child_process').exec;


function shell(content,res){ 
    
      jsonToValue(content); // change undefined json value to false.
    
      if( content.codebox.search(/.*system\(.*/) == -1){
          
           // primero compilar para luego ejecutar  
          
              var child = exec(content.codebox, function (error, stdout, stderr){

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

exports.shell = shell;


// content : info control (textarea - checkbox - inputs - selects)
// log : all outputs
// typeof variable == "undefined"