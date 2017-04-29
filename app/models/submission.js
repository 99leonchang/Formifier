var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Submissions model
module.exports = mongoose.model('Submission', new Schema({
    formID : { type: String, required: true },
    timestamp : { type: Date, default: Date.now },
    data : Schema.Types.Mixed
}));