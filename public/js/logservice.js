var fs = require('fs');
var dns = require('dns');

function savelog(ruta){
      
    
    var callback =  function (err, add, fam,callback_while) {                
                var fecha = new Date();
                var registro = fs.createWriteStream('./logs.txt',{'flags':'a'});
                registro.write(fecha + ' ' + ruta + ' ' + add + '\n');                   
                var callback_while = function(error,ahora){ var ahora = new Date().getTime(); 
                //while(new Date().getTime() < ahora + 10000);
                                                     
                }
            }
            
     dns.lookup(require('os').hostname(),callback);        
}

exports.savelog = savelog; 
