const express = require('express'),
    app = express(),
    http = require('http'),
    server = http.Server(app),
    io = require('socket.io')(server),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    cookie = require('cookie'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    session = require('express-session'),
    passport = require('passport'),
    keys = require('./config/keys.js'),
    // LocalStrategy = require('passport-local').Strategy,
    compression = require('compression');
app.use(compression());
app.use(cors());
const sesh = session({
    secret: 'ea augusta est et carissima',
    saveUninitialized: true,
});
app.use(sesh);
app.use(passport.initialize());
app.use(passport.session());
const passportSetup = require('./config/passport-setup');


const mongoose = require('mongoose'),
    models = require('./models/');

if (!keys.AWS_NODE_ENV || keys.AWS_NODE_ENV != 'prod') {
    //just some quick env check. If we're developing locally, go ahead and use our local db. Otherwise, use the mlab db.
    //in addition, if local AND windows, set our school to the fake school 'woghartz'
    mongoose.connect('mongodb://localhost:27017/linton');
    console.log('Using local db')
    if (!keys.OS || !keys.OS.indexOf('Windows') > -1) {
        keys.MATHAPP_SCHOOL = 'woghartz';
    }
} else {
    console.log('Using REMOTE db')
    mongoose.connect(keys.MONGODB_URI);
}
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(e) {
    console.log('Database connected!')
    // console.log('MODELS AND SCHEMA',gridfs.model,gridfs.schema)
    // Audio = gridfs.model;
    // console.log('gridfs model',Audio)
})

app.use(cookieParser('spero eam beatam esse'))
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb', parameterLimit: 1000000 }));
app.use(bodyParser.json({ limit: '500mb' }));
const routes = require('./routes')(io);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));
app.set('io', io)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));
app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});
app.use('/', routes);
// var server = http.Server(app);
// var io = require('socket.io')(server);
let names = [];
// io.use(function(socket, next) {
//     sesh(socket.request, socket.request.res, next);
// });
let isFirstCon = true;
io.on('connection', function(socket) {
    //death stuff
    // socket.on('disconnect',()=>{
    //     console.log('someone left q.q')
    //     socket.emit('reqHeartBeat',{})
    //     names = [];
    // })
    if (isFirstCon) {
        isFirstCon = false;
        socket.emit('doLogout')
    }
    socket.on('hbResp', function(n) {
        // console.log('heartbeat response from',n)
        for (let i = 0; i < names.length; i++) {
            if (names[i].name == n.name) {
                names[i].t = Date.now();
            }
        }
        let now = Date.now();
        names = names.filter(nm => now - nm.t < 1000)
    })

    // //new login stuff
    socket.on('hiIm', function(n) {
        //on a new person connecting, add them to our list and then push out the list of all names.
        names.push({ name: n.name, t: Date.now() });
        console.log('NEW USER', n, 'ALL USERS', names)
        // socket.emit('allNames',names);
    })

    socket.on('getOnline', function() {
        socket.emit('allNames', names);
    })
    setInterval(function() {
        socket.emit('reqHeartBeat', {});
        socket.emit('allNames', names)
    }, 500);

    //messaging (for chat!)
    socket.on('chatMsg', function(msgObj) {
        console.log('chat message sent! Obj was', msgObj)
        msgObj.time = Date.now();
        io.emit('msgOut', msgObj)
    })
});
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