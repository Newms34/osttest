const express = require('express'),
    app = express(),
    http = require('http'),
    server = http.Server(app),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    cookie = require('cookie'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    session = require('express-session'),
    compression = require('compression');
app.use(compression());
app.use(cors());
const sesh = session({
    secret: 'ea augusta est et carissima',
    saveUninitialized: true,
});
app.use(sesh);


const mongoose = require('mongoose'),
    models = require('./models/');

if (!process.env.NODE_ENV || process.env.NODE_ENV != 'prod') {
    //just some quick env check. If we're developing locally, go ahead and use our local db. Otherwise, use the mlab db.
    //in addition, if local AND windows, set our school to the fake school 'woghartz'
    mongoose.connect('mongodb://localhost:27017/ost');
    console.log('Using local db')
} else {
    console.log('Using REMOTE db')
    mongoose.connect(keys.MONGODB_URI);
}
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(e) {
    console.log('Database connected!')
})

app.use(cookieParser('spero eam beatam esse'))
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb', parameterLimit: 1000000 }));
app.use(bodyParser.json({ limit: '500mb' }));
const routes = require('./routes');
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));
app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});
app.use('/', routes);
//if we're on heroku, they set their own port, so we get that from the PORT environment variable
server.listen(process.env.PORT || 8080);
server.on('error', function(err) {
    console.log('Oh no! Err:', err)
});
server.on('listening', function(lst) {
    console.log('Server is listening!')
});
server.on('request', function(req) {
    // console.log(req.body);
})

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.log('Client (probly) err:', err)
    res.send('Error!' + err)
});