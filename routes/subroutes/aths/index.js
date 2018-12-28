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

router.post('/new',(req, res, next) => {
    const vals = {};
    Object.keys(req.body).forEach(t=>{
        vals[t] = req.body[t].data
    });
    mongoose.model('Ath').create(vals,function(err,r){
        console.log(err,r)
        res.send('done');
    })
})
router.put('/edit',(req, res, next) => {
    const vals = {};
    Object.keys(req.body).forEach(t=>{
        vals[t] = req.body[t].data
    });
    mongoose.model('Ath').findOneAndUpdate({_id:req.body.id},vals,function(err,r){
        console.log(err,r)
        res.send('done');
    })
})
router.get('/all',(req, res, next) => {
    mongoose.model('Ath').find({},(err,all)=>{
        res.send(all);
    })
});
//I know you wanted just 3 (presumably POST to create the athlete, PUT to edit it, and GET to get all athletes). I'm adding these for more functionality
router.get('/one',(req,res,next)=>{
    mongoose.model('Ath').findOne({_id:req.query.id},function(err,resp){
        res.send(resp||'notFound');
    })
})
router.delete('/one',(req,res,next)=>{
    mongoose.model('Ath').findOne({_id:req.query.id}).remove(function(err,resp){
        res.send('done');
    })
})


module.exports = router;