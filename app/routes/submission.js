var Sub    = require('./app/models/submission');

exports.submitForm = function(req, res) {
    // verify FormID exists
    Form.findOne({
        _id: req.params.id
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