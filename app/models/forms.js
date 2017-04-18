var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Submissions model, _id is formID
module.exports = mongoose.model('Form', new Schema({
    userID : String,
    name : String,
    active : Boolean,
    createdOn : { type: Date, default: Date.now }
}));