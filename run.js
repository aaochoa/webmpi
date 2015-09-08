var sys = require('sys');
var exec = require('child_process').exec;


function shell(content,res){ 
    
      if( content.search(/.*system\(.*/) == -1){
          
           // primero compilar para luego ejecutar  
          
              var child = exec(content, function (error, stdout, stderr){

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

exports.shell = shell;


