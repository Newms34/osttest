const express = require('express');
const router = express.Router(),
    path = require('path'),
    models = require('../models/'),
    https = require('https'),
    async = require('async'),
    fs = require('fs'),
    mongoose = require('mongoose');
    router.use('/aths', require('./subroutes/aths'));
    router.get('*', function(req, res, next) {
        console.log('trying to get main page!')
        res.sendFile('index.html', { root: './views' })
    });
    router.use(function(req, res) {
        res.status(404).end();
    });
module.exports = router