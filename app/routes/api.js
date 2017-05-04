/*
    API FUNCTIONS
    Functions for backend management
    ---
    (c) 2017 Leon Chang
 */
var express 	= require('express');
var app         = express();
var config      = require('../../config');
var jwt         = require('jsonwebtoken');
var mongoose    = require('mongoose');
var bcrypt      = require('bcrypt');
var sendgrid    = require('sendgrid')(config.sendgrid);
var helper      = require('sendgrid').mail;
var Form        = require('../models/forms');
var User        = require('../models/user');
var Sub         = require('../models/submission');
app.set('superSecret', config.secret);
//----- Authentication -----//
exports.middleware = function(req, res, next) {

    // check header or url parameters or post parameters for token
    //var token = req.body.token || req.params.token || req.headers['x-access-token'];
    var token = req.cookies.token || req.body.token || req.params.token || req.headers['x-access-token'];

    // decode token
    if (token) {

        // verifies secret and checks exp
        jwt.verify(token, app.get('superSecret'), function(err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    } else {

        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });

    }

};

exports.heartbeat = function(req,res) {
    res.json({ success: true });
};

exports.authenticate = function(req, res) {

    // find the user
    User.findOne({
        username: req.body.username
    }, function(err, user) {

        if (err) throw err;

        if (!user) {
            res.json({ success: false, message: 'Authentication failed. User not found.' });
        } else if (user) {

            // check if password matches using bcrypt
            bcrypt.compare(req.body.password, user.password, function(err, result) {
                if(result == true){
                    //remove hashed password and create token
                    var payload = {
                        "_id": user._id,
                        "username": user.username,
                        "name": user.name,
                        "email": user.email,
                        "admin": user.admin
                    };

                    var token = jwt.sign(payload, app.get('superSecret'), {
                        expiresIn: 86400 // expires in 24 hours
                    });

                    res.cookie('token',token, { maxAge: 900000, httpOnly: true });
                    res.json({
                        success: true,
                        message: 'Authenticated successfully!',
                        token: token
                    });
                } else {
                    res.json({ success: false, message: 'Authentication failed. Wrong password.' });
                }
            });
        }

    });
};

//----- Forms -----//
exports.form_list =  function(req, res) {
    Form.find({
        userID: req.decoded._id
    }, function(err, forms) {
        res.json(forms);
    });
};

exports.form_info =  function(req, res) {
    if(!mongoose.Types.ObjectId.isValid(req.params.form_id)){
        return res.json({success: false, message: 'Invalid ID'});
    }

    Form.findOne({
        _id: mongoose.Types.ObjectId(req.params.form_id)
    }, {"name": true, "active": true}, function(err, forms) {
        if (err) return res.json({success: false, message: err});

        Sub.count({formID: req.params.form_id}, function(err, c) {
            if (err) return res.json({success: false, message: err});
            var data = {
                "name" : forms.name,
                "active" : forms.active,
                "submissions" : c
            };
            res.json(data);
        });
    });
};

exports.form_single =  function(req, res) {
    if(!mongoose.Types.ObjectId.isValid(req.params.form_id)){
        return res.json({success: false, message: 'Invalid ID'});
    }

    Form.findOne({
        _id: mongoose.Types.ObjectId(req.params.form_id),
        userID: req.decoded._id
    }, function(err, forms) {
        if (err) return res.json({success: false, message: err});

        res.json(forms);
    });
};

exports.form_submissions = function(req, res){
    Sub.find({
        formID : req.params.form_id
    }, function(err, subs) {
        res.json(subs);
    });
};

exports.form_create = function(req, res) {
    var form = new Form({
        userID: req.decoded._id,
        name : req.body.name,
        redir_page : req.body.redir_page,
        active : true
    });
    form.save(function(err) {
        if (err) return console.error('[ERROR] ', err);

        res.json({ success: true });
    });
};

exports.form_update = function(req, res) {
    Form.findById(req.params.form_id, function(err, form){
        if (err) return res.json({success: false, message: err});

        form.name     = req.body.name;
        form.redir_page = req.body.redir_page;
        form.active   = req.body.active;

        form.save(function(err) {
            if (err) return res.json({success: false, message: err});

            res.json({success: true});
        });
    });
};

//----- Users -----//
exports.user_list = function(req, res) {
    User.find({}, {"username": true, "name": true, "email": true, "admin": true}, function(err, users) {
        if (err) return res.json({success: false, message: err});

        res.json(users);
    });
};

exports.user_single = function(req, res) {
    User.findById(req.params.user_id, {"username": true, "name": true, "email": true, "admin": true}, function(err, user) {
        if (err) return res.json({success: false, message: err});

        res.json(user);
    });
};

exports.user_update = function(req, res) {
    User.findById(req.params.user_id, {"username": true, "name": true, "email": true, "admin": true}, function(err, user) {
        if (err) return res.json({success: false, message: err});

        user.username = req.body.username;
        user.name = req.body.name;
        user.email = req.body.email;

        user.save(function(err) {
            if(err) return res.json({success: false, message: err});
            res.json({success: true});
        });
    });
};

exports.user_create = function(req, res) {
    User.count({email: req.body.email}, function (err, count){
        if(count>0){
            return res.json({success: false, message: 'Email already exists!'});
        }
    });
    bcrypt.hash(req.body.password, 10, function(err, hash) {
        if (err) return res.json({success: false, message: err});

        // store hash in database
        var newuser = new User({
            username: req.body.username,
            password: hash,
            name: req.body.name,
            email: req.body.email
            //admin: true
        });
        newuser.save(function(err, user) {
            if (err) return res.json({success: false, message: err});

            var from_email = new helper.Email(config.host_email);
            var to_email = new helper.Email(user.email);
            var subject = 'Formifier Email Confirmation';
            var content = new helper.Content(
                'text/html', '<p style="color:lightgrey; margin-top: 1em;">This message was triggered by a user signup on the Formifier system. If you have no recollection of singing up, you can safely ignore this email.</p>');
            var mail = new helper.Mail(from_email, subject, to_email, content);

            var payload = {
                "_id": user._id,
                "username": user.username,
                "name": user.name,
                "email": user.email
            };

            var token = jwt.sign(payload, app.get('superSecret'), {
                expiresIn: 86400 // expires in 24 hours
            });

            mail.personalizations[0].addSubstitution(
                new helper.Substitution('%confirm_url%', config.host+'/confirm?token='+token));
            mail.setTemplateId(config.templates.confirm);


            var request = sendgrid.emptyRequest({
                method: 'POST',
                path: '/v3/mail/send',
                body: mail.toJSON(),
            });

            sendgrid.API(request, function(err, response) {
                if (err) {
                    return res.json({success: false, message: err});
                } else {
                    res.json({ success: true });
                }
            });

        });
    });
};

exports.user_confirm = function(req, res){
    jwt.verify(req.params.token, app.get('superSecret'), function(err, decoded) {
        if (err) {
            return res.json({ success: false, message: 'Failed to verify token.' });
        } else {
            // if everything is good, save to request for use in other routes
            User.findById(decoded._id, {"email_activated": true}, function(err, user) {
                if (err) return res.json({success: false, message: err});

                if(user.email_activated) return res.json({success: false, message: "User already verified."});

                user.email_activated = true;

                user.save(function(err) {
                    if(err) return res.json({success: false, message: err});
                    res.json({success: true});
                });
            });
        }
    });
};

exports.user_resend = function(req, res){
    User.findOne({
        email: req.body.email
    }, function(err, user) {
        if (err) {
            return res.json({ success: false, message: err });
        } else {
            if(user.email_activated){
                return res.json({ success: false, message: 'User already activated.' });
            } else {
                var from_email = new helper.Email(config.host_email);
                var to_email = new helper.Email(user.email);
                var subject = 'Formifier Email Confirmation';
                var content = new helper.Content(
                    'text/html', '<p style="color:lightgrey; margin-top: 1em;">This message was triggered by a user signup on the Formifier system. If you have no recollection of singing up, you can safely ignore this email.</p>');
                var mail = new helper.Mail(from_email, subject, to_email, content);

                var payload = {
                    "_id": user._id,
                    "username": user.username,
                    "name": user.name,
                    "email": user.email
                };

                var token = jwt.sign(payload, app.get('superSecret'), {
                    expiresIn: 86400 // expires in 24 hours
                });

                mail.personalizations[0].addSubstitution(
                    new helper.Substitution('%confirm_url%', config.host+'/confirm?token='+token));
                mail.setTemplateId(config.templates.confirm);


                var request = sendgrid.emptyRequest({
                    method: 'POST',
                    path: '/v3/mail/send',
                    body: mail.toJSON(),
                });

                sendgrid.API(request, function(error, response) {
                    if (err) {
                        return res.json({success: false, message: err});
                    } else {
                        res.json({ success: true });
                    }
                });
            }
        }
    });
};