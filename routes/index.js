const express = require('express');
const router = express.Router(),
    path = require('path'),
    models = require('../models/'),
    https = require('https'),
    async = require('async'),
    fs = require('fs'),
    mongoose = require('mongoose');


module.exports = function(io) {
    router.use('/user', require('./subroutes/users')(io));
    router.use('/prob', require('./subroutes/probs')(io));
    router.use('/audio', require('./subroutes/audio')(io));
    router.use('/admin',require('./subroutes/admin')(io))
    router.get('/logo', function(req, res, next) {
        // let logo = !!fs.existsSync('./public/img/logo.jpg')?'/img/logo.jpg':'/img/blanklogo.png';
        // console.log('logo',fs.readdirSync('./public/img'),)
        const logo = fs.readdirSync('./public/img').find(t=>t.slice(0,t.lastIndexOf('.'))=='logo')||'blanklogo.png';
        res.sendFile('/img/'+logo, { root: './public' })
    });
    router.get('*', function(req, res, next) {
        console.log('trying to get main page!')
        res.sendFile('index.html', { root: './views' })
    });
    router.use(function(req, res) {
        res.status(404).end();
    });
    return router;
};

//helper stuff
Array.prototype.findOne = function(p,v){
    let i=0;
    if(typeof p!=='string'||!this.length){
        return false;
    }
    for(i;i<this.length;i++){
        if(this[i][p] && this[i][p]==v){
            return i;
        }
    }
    return false;
}

Array.prototype.removeOne=function(n){
    this.splice(this.indexOf(n),1);
}