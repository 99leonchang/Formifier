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
//TODO: Check active
exports.form_submit = function(req, res) {
    //Validate formID
    if(!mongoose.Types.ObjectId.isValid(req.params.form_id)){
        return res.redirect('/error?ref='+req.get('Referrer')+'&error=Invalid%20ID');
    }

    Form.findOne({
        _id: mongoose.Types.ObjectId(req.params.form_id)
    }, function(err, form) {

        if (err) return res.redirect('/error?ref='+req.get('Referrer')+'&error='+encodeURI(err));

        if (!form) {
            //res.json({success: false, message: 'Submission failed. Form not found.'});
            var message = 'Submission failed. Form not found.';
            return res.redirect('/error?ref='+req.get('Referrer')+'&error='+encodeURI(message));
        } else if (form) {
            if(!form.active) return res.redirect('/error?ref='+req.get('Referrer')+'&error=Form%20not%20active');

            // save submission
            var sub = new Sub({
                formID: req.params.form_id,
                data: req.body
            });
            sub.save(function(err) {
                //TODO: Better errors
                if (err) return res.redirect('/error?ref='+req.get('Referrer')+'&error='+encodeURI(err));

                console.log('Submission saved successfully');

                //Redirects
                if(form.redir_page) res.redirect(form.redir_page);
                else res.redirect('/thankyou?ref='+req.get('Referrer'));
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