var express 	= require('express');
var app         = express();
var jwt         = require('jsonwebtoken');
var mongoose    = require('mongoose');
var bcrypt      = require('bcrypt');
var config      = require('../config');
var Sub         = require('./models/submission');
var Form        = require('./models/forms');
var User        = require('./models/user');

app.set('superSecret', config.secret);

//===== FORM FUNCTIONS =====//
//TODO: Check active, referrer redirect
exports.form_submit = function(req, res) {
    //Validate formID
    if(!mongoose.Types.ObjectId.isValid(req.params.form_id)){
        return res.json({success: false, message: 'Invalid ID'});
    }

    Form.findOne({
        _id: mongoose.Types.ObjectId(req.params.form_id)
    }, function(err, form) {

        if (err) return console.error('[ERROR] ', err);

        if (!form) {
            res.json({success: false, message: 'Submission failed. Form not found.'});
        } else if (form) {
            // save submission
            var sub = new Sub({
                formID: req.params.id,
                data: req.body
            });
            sub.save(function(err) {
                if (err) return console.error('[ERROR] ', err);

                console.log('Submission saved successfully');
                res.json({ success: true });
            });
        }
    });
};

//===== API FUNCTIONS =====//
exports.api = require('./routes/api');

//TESTS BELOW
exports.test_remove = function(req, res) {
    User.remove({ _id: req.params.id }, function (err) {
        if (err) throw err;

        console.log('User removed successfully');
        res.json({ success: true });
    });
};

exports.basic = function(req, res) {
    res.send('Hello! The API is at http://localhost:8080/api');
};