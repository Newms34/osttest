const express = require('express');
const router = express.Router(),
    path = require('path'),
    models = require('../../../models/'),
    uuid = require('uuid'),
    async = require('async'),
        _ = require('lodash'),
        mongoose = require('mongoose'),
        session = require('express-session');
mongoose.Promise = Promise;

router.get('/checkMod', this.authbit, isMod, (req, res, next) => {
    res.send('ok')
})
router.get('/getUsr', this.authbit, (req, res, next) => {
    mongoose.model('User').findOne({ _id: req.session.passport.user }, function(err, usr) {
        usr.salt = null;
        usr.pass = null;
        res.send(usr)
    })
});


module.exports = router;