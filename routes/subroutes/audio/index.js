const express = require('express');
const router = express.Router(),
    path = require('path'),
    models = require('../../../models/'),
    async = require('async'),
    _ = require('lodash'),
    mongoose = require('mongoose'),
    mongo = require('mongodb'),
    ObjectID = mongo.ObjectID,
    session = require('express-session'),
    multer = require('multer'),
    keys = require('../../../config/keys.js'),
    GridFsStorage = require('multer-gridfs-storage'),
    Grid = require('gridfs-stream'),
    axios = require('axios'),
    isMod = (req, res, next) => {
        mongoose.model('User').findOne({ _id: req.session.passport.user }, function(err, usr) {
            if (!err && usr.mod) {
                next();
            } else {
                res.status(403).send('err');
            }
        })
    };
Grid.mongo = mongoose.mongo;
let gfs = null,
    dbc = mongoose.connection,
    storage = null,
    upload = null;
if (!keys.AWS_NODE_ENV || keys.AWS_NODE_ENV!='prod') {
    //just some quick env check. If we're developing locally, go ahead and use our local db. Otherwise, use the mlab db.
    mongoose.connect('mongodb://localhost:27017/linton');
} else {
    mongoose.connect(keys.MONGODB_URI);
}


// const dbc = mongoose.connection;
dbc.on('error', console.error.bind(console, 'connection error:'));
dbc.once('open', function(e) {
    console.log('Database for audio connected!')
    gfs = Grid(mongoose.connection.db);
    storage = GridFsStorage({
        // gfs: gfs,
        db: mongoose.connection.db,
        filename: function(req, file, cb) {
            // var datetimestamp = Date.now();
            // cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
            return file.originalname;
        },
        /** With gridfs we can store aditional meta-data along with the file */
        metadata: function(req, file, cb) {
            cb(null, { originalname: file.originalname });
        },
        root: 'ctFiles' //root name for collection to store files into
    });
    upload = multer({ //multer settings
        storage: storage,
        fileFilter: (req, file, cb) => {
            console.log('FILTER SEZ FILE INFO IS', file)
            mongoose.model('audioRecord').findOne({ filename: file.originalname }, function(err, fl) {
                if (fl && fl != null) {
                    console.log('already haz')
                    cb(new Error('Duplicate file!'), false)
                } else {
                    cb(null, true)
                }
            })
        }
    }).single('file');
    // console.log('MODELS AND SCHEMA',gridfs.model,gridfs.schema)
    // Audio = gridfs.model;
    // console.log('gridfs model',Audio)
})
const routeExp = function(io) {
    this.authbit = (req, res, next) => {
        if (!req.session || !req.session.passport || !req.session.passport.user) {
            //no passport userid
            res.status(401).send('err')
        } else {
            mongoose.model('User').findOne({ _id: req.session.passport.user }, function(err, usr) {
                if (!err && usr && !usr.isBanned) {
                    req.user = usr;
                    next();
                } else {
                    res.status(403).send('err');
                }
            })
        }
    };
    router.get('/getAudio', this.authbit, (req, res, next) => {
        // console.log('tryin to find file with name', req.query.filename)
        if (!req.query.filename) {
            mongoose.model('audioRecord').find({}, (err, frs) => {
                res.send(frs);
            })
        } else {
            // console.log("looking for",req.query)
            mongoose.model('audioRecord').findOne({ filename: req.query.filename }, (err, fr) => {
                fr = { fid: fr.fid }
                console.log('located sound with name',req.query.filename,'is',fr)
                gfs.files.find({}).toArray(function(err, aud) {
                    // console.log('AUD-->', aud, '<--AUD', err, typeof aud[0]._id)
                    const theFile = aud.find(f => {
                        // console.log(f, typeof f._id, f._id.toString(), fr.fid, f._id.toString() == fr.fid)
                        return f._id.toString() == fr.fid;
                    });
                    console.log(theFile)
                    // res.send(aud)
                    const readStream = gfs.createReadStream({
                        _id: fr.fid
                    });
                    res.header("Content-Type", "audio/mp3");
                    if (theFile) {
                        res.header('Content-Length', theFile.length);
                    }
                    res.header("X-Content-Type-Options", "nosniff");
                    res.header("Accept-Ranges", "bytes");
                    readStream.pipe(res);
                })
            })
        }
    })
    router.post('/setAudio', this.authbit, (req, res, next) => {
        upload(req, res, function(err, data) {
            console.log('err?', err)
            if (err) {
                res.json({ error_code: 1, err_desc: err.Error });
                return;
            }
            res.json({ error_code: 0, err_desc: null });
            // console.log(req.file.originalname,req.file)
            mongoose.model('audioRecord').create({
                filename: req.file.originalname,
                fid: req.file.id.toString(),
                school:process.env.MATHAPP_SCHOOL||null
            })
        });
    })
    return router;
}

module.exports = routeExp;