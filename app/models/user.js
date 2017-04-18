var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Mongoose model
module.exports = mongoose.model('User', new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    //email_activated: { type: Boolean, required: true},
    //temp_token: { type: Boolean, required: true },
    admin: Boolean
}));