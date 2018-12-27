const express = require('express');
const router = express.Router(),
    path = require('path'),
    models = require('../../../models/'),
    async = require('async'),
        _ = require('lodash'),
        mongoose = require('mongoose'),
        session = require('express-session'),
        axios = require('axios'),
        isMod = (req, res, next) => {
            mongoose.model('User').findOne({ _id: req.session.passport.user }, function(err, usr) {
                if (!err && usr.mod) {
                    next();
                } else {
                    res.status(403).send('err');
                }
            })
        },
        preSaveCorrect = (req, res, next) => {
            //for match and fillin, check to make sure that this problem is CORRECT
            if (!req.body.termOne || !req.body.termTwo || !req.body.answer) {
                res.status(400).send('missing'); //missing terms!
            } else {
                let isOk = true;
                if (req.body.operation == '+') {
                    isOk = (req.body.termOne + req.body.termTwo) == req.body.answer;
                } else if (req.body.operation == '-') {
                    isOk = (req.body.termOne - req.body.termTwo) == req.body.answer;
                } else if (req.body.operation == '/') {
                    isOk = (req.body.termOne / req.body.termTwo) == req.body.answer;
                } else {
                    isOk = (req.body.termOne * req.body.termTwo) == req.body.answer;
                };
                if (!isOk) {
                    res.status(400).send('wrong'); //wrong answer!
                } else {
                    next();
                }
            }
        },
        schoolOpts =[process.env.MATHAPP_SCHOOL,null];
mongoose.Promise = Promise;

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
    this.checkPset = (req, res, next) => {
        mongoose.model('pset').findOne({ _id: req.body.pSet }, (err, pSet) => {
            if (err || !pSet) {
                res.status(400).send('err');
            } else {
                next();
            }
        })
    }
    router.post('/newProbSet', this.authbit, isMod, (req, res, next) => {
        mongoose.model('pSet').findOne({ title: req.body.title }, function(errf, psf) {
            if (psf) {
                return res.send('dup')
            }
            req.body.school = process.environment.MATHAPP_SCHOOL || null;
            mongoose.model('pSet').create(req.body, function(err, p) {
                // res.send(p)
                req.body.probs.forEach(prb => {
                    prb.pSet = p._id;
                    mongoose.model(prb.kind).create(prb);
                });
                //now do tags
                p.tags.forEach(t => {
                    mongoose.model('tag').findOne({ tag: t }, (err, t) => {
                        if (!t) {
                            //no tag, so create it!
                            mongoose.model('tag').create({ tag: t });
                        }
                    })
                });
                res.send('done');
            })
        })
    })
    router.get('/tags', this.authbit, isMod, (req, res, next) => {
        //gets all tags
        mongoose.model('tag').find({}, (err, tgs) => {
            res.send(tgs);
        })
    })
    router.get('/tag', this.authbit, isMod, (req, res, next) => {
        //make a single tag
        mongoose.model('tag').findOne({ tag: req.query.tag }, (err, tg) => {
            if (tg) {
                res.status(304).send('duplicate');
            } else {
                mongoose.model('tag').create({ tag: req.query.tag }, (errsv, tgsv) => {
                    res.send('done');
                })
            }
        })
    })
    //these three routes are for adding INDIVIDUAL problems to a problem set; not creating it!
    router.post('/makeprobFillin', this.authbit, isMod, preSaveCorrect, (req, res, next) => {
        mongoose.model('probFillin').create(req.body, (err, resp) => {
            res.send('done');
        })
    });
    router.post('/makeprobMatch', this.authbit, isMod, preSaveCorrect, (req, res, next) => {
        mongoose.model('probMatch').create(req.body, (err, resp) => {
            res.send('done');
        })
    })
    router.post('/makeprobPick', this.authbit, isMod, (req, res, next) => {
        mongoose.model('probPick').create(req.body, (err, resp) => {
            res.send('done');
        })
    });

    router.post('/makeprobSimple', this.authbit, isMod, (req, res, next) => {
        mongoose.model('probSimple').create(req.body, (err, resp) => {
            res.send('done');
        })
    });

    //get a problem 'page' (pSet)
    //disabled for now since this seems insecure
    // router.get('/probSet', this.authbit, (req, res, next) => {
    //     if (!req.query.id) {
    //         res.status(400).send('noId')
    //     }
    //     mongoose.model('pSet').findOne({ _id: req.query.id }, (err, pSet) => {
    //         if (!pSet || (pSet.kind && ['probFillin', 'probMatch', 'probPick'].indexOf(pset.kind) < 0)) {
    //             res.status(400).send('err');
    //             return false;
    //         }
    //         mongoose.model(pset.kind).find({ pSet: pSet._id }, (err, probs) => {
    //             res.send({ pg: pSet, probs: probs });
    //         })
    //     })
    // });
    router.get('/probSetByClass', this.authbit, (req, res, next) => {
        //for this particular class, get the next assigned lesson
        //should NOT require school
        if (!req.query.c) {
            res.status(400).send('err');
        }
        mongoose.model('User').findOne({ _id: req.session.passport.user }, (erru, usr) => {
            //got the user. now find the problem set with that current class
            let pSetClass = usr.nextPSet.find(p => p.cid == req.query.c);
            if (!pSetClass || !pSetClass.pid) {
                return res.send('noclass');
            }
            // res.send(usr)
            mongoose.model('pSet').findOne({ _id: pSetClass.pid }, (errp, ps) => {
                console.log('Next pset for ', usr.user, 'is', ps)
                if (errp || !ps) {
                    return res.status(400).send('err');
                }
                mongoose.model(ps.kind).find({ pSet: ps._id }).lean().exec((errq, probs) => {
                    if (errq || !probs) {
                        return res.status(400).send('err');
                    }
                    res.send({
                        ps: ps,
                        qs: probs.map(qo => {
                            if (ps.kind == 'probFillin') {
                                delete qo.ans;
                            }
                            return qo;
                        })
                    })
                })
            })
        })
    });
    router.get('/all', this.authbit, isMod, (req, res, next) => {
        console.log('class', req.query.c)
        if (!req.query.c || req.query.c == 'undefined' || req.query.c == 'null') {
            return res.send([])
        }
        mongoose.model('course').findOne({ _id: req.query.c }, (errc, cs) => {
            console.log('tried to find COURSE', req.query.c, cs, errc)
            //find all psets that are either A) in this school or B) have no school
            mongoose.model('pSet').find({school:{$in:schoolOpts}}).lean().exec((err, pset) => {
                console.log('ERR', err, 'PSET', pset)
                if (!pset || !pset.length) {
                    return res.send(pset);
                }
                const pSetIds = pset.map(t => t._id.toString());
                console.log('PSETIDS', pSetIds)
                mongoose.model('probFillin').find({ pSet: { $in: pSetIds } }, (errpfs, probfs) => {
                    mongoose.model('probMatch').find({ pSet: { $in: pSetIds } }, (errpms, probms) => {
                        mongoose.model('probPick').find({ pSet: { $in: pSetIds } }, (errps, probps) => {
                            mongoose.model('probSimple').find({ pSet: { $in: pSetIds } }, (errss, probs) => {
                                probs = probs.concat(probms).concat(probfs).concat(probps);
                                console.log('FIRST PSET', pset[0], 'NUM PROBS', probs.length, 'FIRST PROB', probs[0])
                                pset = pset.map(pt => {
                                    pt.probs = _.cloneDeep(probs.filter(q => q.pSet == pt._id.toString()));
                                    pt.order = cs.pSets.indexOf(pt._id);
                                    return pt;
                                })
                                res.send(pset);
                            })
                        })
                    })
                })
            })
        })
    })
    router.post('/changePsetClassStatus', this.authbit, isMod, (req, res, next) => {
        // connect or disconnect a problem set with a class.
        if (!req.body.pset || !req.body.course || req.body.course.teacher != req.user.user) {
            return res.status(400).send('err');
        }
        console.log('incoming info', req.body)
        mongoose.model('pSet').findOne({ _id: req.body.pset._id }, (err, pst) => {
            if (!pst||(req.user.school!=pst.school && pst.school!==null)){
                res.status(400).send('err');//wrong school!
            }
            let psCsPos = pst.courses.indexOf(req.body.course._id.toString());
            console.log('pos', psCsPos, 'pset', pst, 'mode', req.body.mode, 'course', req.body.course)
            if (req.body.mode && psCsPos < 0) {
                //add course to the pSet's list of courses
                pst.courses.push(req.body.course._id.toString());
            } else if (!req.body.mode && psCsPos > -1) {
                pst.courses.splice(psCsPos, 1);
            }
            pst.save((err, pssv) => {
                //now gotta do the same for course
                mongoose.model('course').findOne({ _id: req.body.course._id }, (err, cs) => {
                    let csPsPos = cs.pSets.findIndex(t => t.pSet == pst._id.toString());
                    if (req.body.mode && (csPsPos < 0 || cs.pSets[csPsPos].pSet === null)) {
                        //add pset to this courses list of psets
                        cs.pSets.push({
                            pSet: pst._id.toString(),
                            next: null
                        });
                    } else if (!req.body.mode && csPsPos > -1) {
                        cs.pSets[csPsPos].pSet = null;
                    }
                    cs.save((cserr, cssv) => {
                        res.send('done');
                    })
                })
            })
        })
    })
    router.post('/setNextLesson', this.authbit, isMod, (req, res, next) => {
        if (!req.body.cid || !req.body.pidOne) {
            return res.status(400).send('err');
        }
        mongoose.model('course').findOne({ _id: req.body.cid }, (err, crs) => {
            const thePset = crs.pSets.find(t => t.pSet == req.body.pidOne);
            if (crs.teacher != req.user.user || !thePset) {
                //wrong teacher or lesson is not part of this pset yet
                return res.status(400).send('err');
            }
            thePset.next = req.body.pidTwo || null;
            crs.save((errsv, crssv) => {
                res.send('done');
            })
        })
    })
    return router;
}

module.exports = routeExp;