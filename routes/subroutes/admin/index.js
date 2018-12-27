const express = require('express');
const router = express.Router(),
    path = require('path'),
    models = require('../../../models/'),
    exorcist = require('nodemon'),
    fs = require('fs'),
    _ = require('lodash'),
    images = require('base64-to-image'),
    mongoose = require('mongoose'),
    session = require('express-session'),
    axios = require('axios'),
    isAdmin = (req, res, next) => {
        if (!req.session || !req.session.passport) {
            res.redirect('../')
        }
        mongoose.model('User').findOne({ _id: req.session.passport.user }, function(err, usr) {
            if (!err && usr.mod && usr.isAdmin) {
                next();
            } else {
                // res.status(403).send('err');
                res.redirect('../')
            }
        })
    };
mongoose.Promise = Promise;

const routeExp = function(io) {
    this.authbit = (req, res, next) => {
        if (!req.session || !req.session.passport || !req.session.passport.user) {
            //no passport userid
            res.redirect('../')
        } else {
            mongoose.model('User').findOne({ _id: req.session.passport.user }, function(err, usr) {
                if (!err && usr && !usr.isBanned) {
                    req.user = usr;
                    next();
                } else {
                    res.redirect('../')
                }
            })
        }
    };
    router.get('/', this.authbit, isAdmin, function(req, res, next) {
        // console.log(req.session.passport)
        return res.sendFile('admin.html', { root: './views' });
    })
    router.get('/stop', this.authbit, isAdmin, (req, res, next) => {
        // res.send('see console for bitz')
        if (!req.user.isAdmin) {
            return res.send('err');
        }
        console.log('ADMIN IS STOPPING THE SERVER!')
        res.send('done!')
        setTimeout(function() {
            exorcist.emit('quit');
            process.exit();
        }, 50)
    })
    router.post('/colors', this.authbit, isAdmin, (req, res, next) => {
        // res.send('err')
        // fs.readFile('./build/scss/components/bulma.js','utf-8',function(err,resp){
        //  res.send({r:resp,e:err})
        // })
        let newData = `
.col-style-one{
    background:${req.body.one.bg};
    color:${req.body.one.fg}!important;
}
.col-style-two{
    background:${req.body.two.bg};
    color:${req.body.two.fg}!important;
}
.col-style-one-hoverable{
    background:${req.body.one.bg};
    color:${req.body.one.fg}!important;
}
.col-style-two-hoverable{
    background:${req.body.two.bg};
    color:${req.body.two.fg}!important;
}
.col-style-one-hoverable:hover,.col-style-one-hoverable.is-active{
    background:${req.body.one.bgHover}!important;
}
.col-style-two-hoverable:hover,.col-style-two-hoverable.is-active{
    background:${req.body.two.bgHover}!important;
}`
        // fs.writeFileSync('./build/scss/components/school-vars.css',newData,'utf-8');
        console.log('newData', newData)
        fs.writeFileSync('./public/css/school-vars.css', newData, 'utf-8');
        res.send('done');
    })
    router.post('/setLogo', this.authbit, isAdmin, (req, res, next) => {
        // const data = req.body.uri.replace(/^data:image\/\w+;base64,/, ""),
        // bufr = images(new Buffer(data,'base64')).encode('png');
        fs.unlink('./public/img/logo.png', (err) => {
            console.log('removed old logo! rewriting!')
            images(req.body.uri,'./public/img/',{fileName:'logo',type:'png'})
            res.send('done');
            // fs.writeFile('./public/img/logo.png', bufr, (err, fl) => {
            //     res.send('done')
            // })
        })
    })
    return router;
}
// console.log('IMAGES',images)
module.exports = routeExp;