var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Submissions model, _id is formID
module.exports = mongoose.model('Form', new Schema({
    userID : { type: String, required: true },
    name : { type: String, required: true },
    redir_page : { type : String },
    active : { type: Boolean, default: true },
    createdOn : { type: Date, default: Date.now }
}));