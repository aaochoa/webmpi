var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
    username: { type: String, required: true, unique: true },
    password: String,
    email:{ type: String, required: true, unique: true },
    name:String,
    lastname:String,
    recovery:String,
    isadmin:Boolean,
    state:Boolean,
    comment:[{
        date:String, 
        subject: String, 
        body : String }],
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('accounts', Account);
