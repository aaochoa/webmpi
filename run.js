var sys = require('sys');
var exec = require('child_process').exec;
var nodemailer = require("nodemailer");
var uuid = require('node-uuid');
var userModel = require('./models/account');
var fs = require('fs');

// content : info control (textarea - checkbox - inputs - selects)
// log : all outputs

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
     console.log(content.condor);
     task++; // to display running task in admin views
     //var codepath= "./codes/";
     var codepath= "/exports/condor/codes/";
     var dircode=req.user.username;
     var allpath = codepath+dircode;
     var option="";
     var TIME_LIMIT_1 =  1 * 1000 * 60,
	 TIME_LIMIT_2 =  5 * 1000 * 60
         MAX_BUFFER = 500 * 2048;
     var op = 0;

     // create a source file
     fs.writeFileSync(codepath+req.user.username+'/temp.c', content.text.toString());

     if(content.cpu=='false' && content.mpi=='false' && content.condor=='false' ){
             // only g++
	 op = 0;
         option = "g++ -g -Wall "+ allpath+"/temp.c -o "+ allpath +"/binary";
         console.log("cpu=false & mpi=false");
       }


     if(content.cpu=='true' && content.mpi=='false' && content.condor=='false'){
             // only g++
         op = 0;
	 option = "g++ -g -Wall "+ allpath+"/temp.c -o "+ allpath +"/binary";
         console.log("cpu=on & mpi=false");

       }

     if(content.cpu=='false' && content.mpi=='false' && content.condor=='true'){
             // g++ and htcondor
	 op = 1;
         option = "g++ -g -Wall "+ allpath+"/temp.c -o "+ allpath +"/binary";
         console.log("cpu=false & mpi=false");
       }

     if(content.cpu=='true' && content.mpi=='false' && content.condor=='true'){
             // g++ and htcondor
	 op = 1;
         option = "g++ -g -Wall "+ allpath+"/temp.c -o "+ allpath +"/binary";
         console.log("cpu=false & mpi=false");
       }

     if(content.cpu=='true' && content.mpi=='true' && content.condor=='false' ){
             // only MPI
         op = 2;
	 console.log("cpu=on & mpi=on");
         //option = "mpicc -Wall -o "+ allpath+"/binary "+ allpath +"/temp.c";
	 option = "mpic++.mpich -Wall "+ allpath +"/temp.c -o"+ allpath + "/binary";
       }

     if(content.cpu=='false' && content.mpi =='true' && content.condor=='false'){
             //only MPI
	 op = 2;
         console.log("cpu=false & mpi=on");
	 option = "mpic++.mpich -Wall "+ allpath +"/temp.c -o"+ allpath + "/binary";

       }


     if(content.cpu=='false' && content.mpi =='true' && content.condor=='true'){
             //MPI and htcondor
	 op = 3;
         console.log("cpu=false & mpi=on");
	 option = "mpic++.mpich -Wall "+ allpath +"/temp.c -o"+ allpath + "/binary";

       }


     if(content.cpu=='true' && content.mpi =='true' && content.condor=='true'){
             //MPI and htcondor
	 op = 3;
         console.log("cpu=false & mpi=on");
	 option = "mpic++.mpich -Wall "+ allpath +"/temp.c -o"+ allpath + "/binary";

       }


      content.btn='visible'; // Set button

      if( content.text.search(/.*system\(.*/) == -1){


           // first compile then run

	  if(op==0){ // when we use a simple g++ program

	      var run=";./binary";
	      var extra = " ";
	      var cleaner = " ";

              var child = exec(option, { timeout: TIME_LIMIT_1 },function (error, stdout, stderr){

              //sys.print('stdout: ' + stdout);
              var log = stdout + stderr;
              //sys.print('stderr: ' + stderr);

              if (error !== null) {
                log = 'ERROR:  ' + error + " - code: "+ error.code + " - Signal : "+ error.signal ;
		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify(log)); // send result of program
                task--;
                return;
              }

	      var child = exec("cd "+codepath+dircode+run, { timeout: TIME_LIMIT_1 },function (error, stdout, stderr){
		  var log = stdout + stderr;
		  if (error !== null) {
                  	log = 'ERROR:  ' + error + " - code: "+ error.code + " - Signal : "+ error.signal ;
              	   }
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify(log)); // send result of program
		        task--;
		        return;
            	});
            });
	  }


	  if(op==1){ // g++ and HTCondor

	      var machine = "machine_count = "+ content.machines;
	      var run = ";condor_submit sub.sub";
	      var extra = "cp ./condorsub/sub.sub ./condorsub/output.sh "+allpath+"; echo \""+machine+"\" >> "+allpath+"/sub.sub"+";echo \"queue\">> "+allpath+"/sub.sub;"; // add machine cout.
	      var cleaner = ";rm errfile.* logfile outfile.* sub.sub output.sh;"; // just show files before of execute this
	      var wait = ";condor_wait logfile;./output.sh "; // call script
	      // wait for condor execute

	      var child = exec(extra+option, { timeout: TIME_LIMIT_2 },function (error, stdout, stderr){
              //sys.print('stdout: ' + stdout);
              var log = stdout + stderr;
              //sys.print('stderr: ' + stderr);

              if (error !== null) {
                log = 'ERROR: ' + error + " - code: "+ error.code + " - Signal : "+ error.signal ;
		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify(log)); // send result of program
                task--;
                return;

              }


	      var child = exec("cd "+codepath+dircode+run+wait+cleaner, { timeout: TIME_LIMIT_2 },function (error, stdout, stderr){
		  var log = stdout + stderr;
			  if (error !== null) {
		          	log = 'ERROR:  ' + error + " - code: "+ error.code + " - Signal : "+ error.signal ;
		      	   }
				res.writeHead(200, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify(log)); // send result of program
				task--;
				return;
		    	});
              });

	}



	  if(op==2){ // only mpi

	      var run=";mpirun -n " + content.machines + " --hostfile " + "hosts" + " ./binary" ;
	      var extra = "cp ./condorsub/hosts "+allpath+";";
	      var cleaner = ";rm hosts ";

              var child = exec(extra+option, { timeout: TIME_LIMIT_1 },function (error, stdout, stderr){

              //sys.print('stdout: ' + stdout);
              var log = stdout + stderr;
              //sys.print('stderr: ' + stderr);

              if (error !== null) {
                log = 'ERROR:  ' + error + " - code: "+ error.code + " - Signal : "+ error.signal ;
		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify(log)); // send result of program
                task--;
                return;
              }

	      var child = exec("cd "+codepath+dircode+run+cleaner, { timeout: TIME_LIMIT_1 },function (error, stdout, stderr){
		  var log = stdout + stderr;
		  if (error !== null) {
                  	log = 'ERROR:  ' + error + " - code: "+ error.code + " - Signal : "+ error.signal ;
              	   }
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify(log)); // send result of program
		        task--;
		        return;
            	});
            });

	  }



	  if(op==3){ // mpi and HTCondor

	      var machine = "machine_count = "+ content.machines;
	      var run = ";condor_submit sub.sub";
	      var extra = "cp ./condorsub/sub.sub ./condorsub/output.sh "+allpath+"; echo \""+machine+"\" >> "+allpath+"/sub.sub"+";echo \"queue\">> "+allpath+"/sub.sub;"; // add machine cout.
	      var cleaner = ";rm errfile.* logfile outfile.* sub.sub output.sh;"; // just show files before of execute this
	      var wait = ";condor_wait logfile;./output.sh "; // call script
	      // wait for condor execute

	      var child = exec(extra+option, { timeout: TIME_LIMIT_2 },function (error, stdout, stderr){
              //sys.print('stdout: ' + stdout);
              var log = stdout + stderr;
              //sys.print('stderr: ' + stderr);

              if (error !== null) {
                log = 'ERROR: ' + error + " - code: "+ error.code + " - Signal : "+ error.signal ;
		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify(log)); // send result of program
                task--;
                return;

              }


	      var child = exec("cd "+codepath+dircode+run+wait+cleaner, { timeout: TIME_LIMIT_2 },function (error, stdout, stderr){
		  var log = stdout + stderr;
			  if (error !== null) {
		          	log = 'ERROR:  ' + error + " - code: "+ error.code + " - Signal : "+ error.signal ;
		      	   }
				res.writeHead(200, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify(log)); // send result of program
				task--;
				return;
		    	});
              });

	}

        }else{
            log = "You must not use system instructions"
            res.render("test.html",{message : content , logs : log});
            task--;
            return;
        }
}

function userDir(username){ // create a exclusive dir to each user in the system
     var codepath= "/exports/condor/codes/";
     var child = exec("mkdir "+codepath+username+";touch "+codepath+username+"/temp.c"+";touch "+codepath+username+"/binary", function (error, stdout, stderr){

         if (error !== null) {
                sys.print('exec error: ' + error);
              }
    });
}

function sendPass(res,usermail,db){

    var weblink= "http://localhost:3000/reset";
     db.findOne({ email: usermail },function(err, user) {
         if (err) throw err;

         if (user) {

                    // Find a single email

                    db.findOne({  email: usermail }, function(err, query) {
                      if (err) return console.error(err);

                    var smtpTransport = nodemailer.createTransport({
                       service: "gmail",
                       auth: {
                           user: "siriusmpiweb@gmail.com", //Your sirius wifi pass
                           pass: ""
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

                    });  // end find One
        }else{
            console.log("no existe");
            res.send("under construction");
      }
  // object of the user

   });

}

function changePass(res,req,db){

    db.findOne({ recovery: req.body.token },function(err, user) {  // search token
         if (err) throw err;

         if (user) {

              if(user.email === req.body.email ){  // if email is valid

                      db.remove({ _id : {$eq:user.id}}).exec(); // remove user
                       db.register(new db({ username : user.username , // create a new user whit the same values
                                   email: user.email,
                                   name: user.name,
                                   lastname: user.lastname,
                                   recovery: uuid.v4(),
                                   isadmin : user.isadmin,
                                   state : user.state
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
