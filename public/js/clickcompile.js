window.onload = function() {
    
    document.getElementById("runcodebtn").onclick = function(){        
             
        document.getElementById("form").submit();
        
        
              document.getElementById("infoarea").value=<%- JSON.stringify(logs)%>;              
              document.getElementById("CPU").checked=<%- JSON.stringify(message.cpu)%>;
              document.getElementById("GPU").checked=<%- JSON.stringify(message.gpu)%>;              
              document.getElementById("MPI").checked=<%- JSON.stringify(message.mpi)%>;
              document.getElementById("CONDOR").checked=<%- JSON.stringify(message.condor)%>;
              document.getElementById("condorout").value=<%- JSON.stringify(logs)%>;
              document.getElementById("sub").value=<%- JSON.stringify(message.submitfile)%>;
              document.getElementById("select").value=<%- JSON.stringify(message.select)%>;
            
    }  
}




// runcodebtn

   