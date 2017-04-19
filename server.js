var express 	= require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var helmet      = require('helmet');

var config = require('./config');
//Routes
var routes   = require('./app/routes');

//===== Init =====//
var port = process.env.PORT || 8080;
mongoose.connect(config.database); // connect to database
app.use(helmet());

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));

//===== Route Handlers =====//

//Frontend
app.get('/', routes.basic);

//Tests
app.post('/setup', routes.api.user_create); //Insecure, remove later
app.get('/remove', routes.test_remove);

//Submission
app.post('/s/:form_id', routes.form_submit);

//API
var apiRoutes = express.Router();

apiRoutes.post('/authenticate', routes.api.authenticate);

apiRoutes.use(routes.api.middleware);

//Protected Routes
apiRoutes.get('/', function(req, res) {
    res.json({ message: 'Welcome to the Formifier backend API.' });
});

//Forms
apiRoutes.get('/forms', routes.api.form_list);
apiRoutes.get('/forms/:form_id', routes.api.form_single);
apiRoutes.post('/forms/create', routes.api.form_create);
apiRoutes.put('/forms/:form_id', routes.api.form_update);

//Users
//TODO: Verify admin/correct user
apiRoutes.get('/users', routes.api.user_list);
apiRoutes.get('/users/:user_id', routes.api.user_single);
apiRoutes.post('/users/create', routes.api.user_create);
apiRoutes.put('/users/:user_id', routes.api.user_create);



//Development
apiRoutes.get('/submissions', function(req, res) {
    Sub.find({}, function(err, subs) {
        res.json(subs);
    });
});

apiRoutes.get('/check', function(req, res) {
    res.json(req.decoded);
});


app.use('/api', apiRoutes);


app.listen(port);
console.log('API online at http://localhost:' + port);