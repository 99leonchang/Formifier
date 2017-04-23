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
var Form        = require('../models/forms');
var User        = require('../models/user');
app.set('superSecret', config.secret);
//----- Authentication -----//
exports.middleware = function(req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.params.token || req.headers['x-access-token'];

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

        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });

    }

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

exports.form_single =  function(req, res) {
    if(!mongoose.Types.ObjectId.isValid(req.params.form_id)){
        return res.json({success: false, message: 'Invalid ID'});
    }

    Form.find({
        _id: mongoose.Types.ObjectId(req.params.form_id),
        userID: req.decoded._id
    }, function(err, forms) {
        if (err) return res.json({success: false, message: err});

        res.json(forms);
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
    bcrypt.hash(req.body.password, 10, function(err, hash) {
        // store hash in database
        var newuser = new User({
            username: req.body.username,
            password: hash,
            name: req.body.name,
            email: req.body.email
            //admin: true
        });
        newuser.save(function(err) {
            if (err) return res.json({success: false, message: err});
            res.json({ success: true });
        });
    });
};