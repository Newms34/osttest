const express = require('express');
const router = express.Router(),
    path = require('path'),
    models = require('../../../models/'),
    fs = require('fs'),
    uuid = require('uuid'),
    async = require('async'),
        // admin = require('../../../config/keys.js').admin,
        _ = require('lodash'),
        mongoose = require('mongoose'),
        session = require('express-session'),
        passport = require('passport'),
        axios = require('axios'),
        isMod = (req, res, next) => {
            mongoose.model('User').findOne({ _id: req.session.passport.user }, function(err, usr) {
                if (!err && usr.mod) {
                    req.user = usr;
                    next();
                } else {
                    res.status(403).send('err');
                }
            })
        },
        config = require('../../../config/keys.js')
        schoolOpts = [config.MATHAPP_SCHOOL, null];
let sgApi;
if (fs.existsSync('sparky.json')) {
    sparkyConf = JSON.parse(fs.readFileSync('sparky.json', 'utf-8'));
} else {
    sparkyConf = {
        SPARKPOST_API_KEY: process.env.SPARKPOST_API_KEY,
        SPARKPOST_API_URL: process.env.SPARKPOST_API_URL,
        SPARKPOST_SANDBOX_DOMAIN: process.env.SPARKPOST_SANDBOX_DOMAIN,
        SPARKPOST_SMTP_HOST: process.env.SPARKPOST_SMTP_HOST,
        SPARKPOST_SMTP_PASSWORD: process.env.SPARKPOST_SMTP_PASSWORD,
        SPARKPOST_SMTP_PORT: process.env.SPARKPOST_SMTP_PORT,
        SPARKPOST_SMTP_USERNAME: process.env.SPARKPOST_SMTP_USERNAME,
        SENDGRID_API: process.env.SENDGRID_API
    }
}
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(sparkyConf.SENDGRID_API);
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
    router.get('/allUsrs', this.authbit, (req, res, next) => {
        mongoose.model('User').find({ school: { $in: schoolOpts } }, function(err, usrs) {
            res.send(usrs.map(u => {
                return { name: u.user, mod: !!u.mod };
            }));
        })
    });
    router.get('/setOneRead', this.authbit, (req, res, next) => {
        if (!req.query.id) {
            res.send('err');
        }
        mongoose.model('User').findOne({ _id: req.session.passport.user }, function(err, usr) {
            usr.msgs.incoming.find(m => m._id == req.query.id).read = true;
            usr.save((errsv, usrsv) => {
                res.send(usrsv);
            })
        })
    })
    router.get('/setAllRead', this.authbit, (req, res, next) => {
        if (!req.query.id) {
            res.send('err');
        }
        mongoose.model('User').findOne({ _id: req.session.passport.user }, function(err, usr) {
            usr.incoming.msgs.forEach(m => m.read = true);
            usr.save((errsv, usrsv) => {
                res.send(usrsv);
            })
        })
    });
    router.post('/changeAva', this.authbit, (req, res, next) => {
        mongoose.model('User').findOne({ _id: req.session.passport.user }, function(err, usr) {
            usr.avatar = req.body.img;
            console.log('USER NOW', req.body, usr)
            usr.save((errsv, usrsv) => {
                res.send(usrsv);
            })
        })
    });

    //admin stuff
    router.get('/makeMod', this.authbit, isMod, (req, res, next) => {
        mongoose.model('User').findOneAndUpdate({ user: req.query.user, school: { $in: schoolOpts } }, { $set: { mod: true } }, function(err, nm) {
            if (err || !nm) {
                res.status(400).send('err');
            }
            mongoose.model('User').find({}, function(err, usrs) {
                res.send(usrs.map(u => {
                    u.msgs = null;
                    return u;
                }));
            })
        })
    })

    router.get('/toggleBan', this.authbit, isMod, (req, res, next) => {
        mongoose.model('User').findOne({ user: req.query.user, school: { $in: schoolOpts } }, function(err, usr) {
            // console.log('BANNING', req.query.user, usr)
            if (err || !usr) {
                res.status(400).send('err'); //most likely, user doesnt exist OR teacher is trying to ban student from another school
            }
            usr.isBanned = !usr.isBanned;
            usr.save(function(err, resp) {
                mongoose.model('User').find({ school: { $in: schoolOpts } }, function(err, usrs) {
                    res.send(usrs.map(u => {
                        u.msgs = null;
                        return u;
                    }));
                })
            })
        })
    })
    //msg stuff
    router.post('/sendMsg', this.authbit, (req, res, next) => {
        //user sends message to another user
        console.log('SEND MSG', req.body)
        //fuser: from user (logged in user), tuser: to user
        mongoose.model('User').findOne({ _id: req.session.passport.user }, function(ferr, fusr) {

            mongoose.model('User').findOne({ 'user': req.body.to }, function(err, tusr) {
                if (!tusr || err || !req.body.msg) {
                    console.log(tusr, err)
                    res.send('err');
                } else {
                    tusr.msgs.incoming.push({
                        from: fusr.user,
                        msg: req.body.msg
                    })
                    tusr.save(function(errtsv, tusrsv) {
                        io.emit('msgDashRef', { who: req.body.to }); //send out to trigger refresh
                        fusr.msgs.outgoing.push({
                            to: tusr.user,
                            msg: req.body.msg
                        })
                        fusr.save(function(errfsv, fusr) {
                            io.emit('msgDashRef', { who: fusr.user })
                            res.send('done');
                        });
                    });
                }
            });
        });
    });
    router.post('/delMsg', this.authbit, (req, res, next) => {
        //user deletes an old message by user and id.
        mongoose.model('User').findOne({ _id: req.session.passport.user }, function(err, usr) {
            if (!usr || err) {
                res.send('err');
            } else {
                console.log('USER', usr.user, 'MSGS', usr.msgs, 'MSG BODY', req.body)
                const whichBox = req.body.to ? 'outgoing' : 'incoming';
                const idx = usr.msgs[whichBox].findIndex(t => t.uniqId = req.body.uniqId);
                console.log('INDEX', idx, 'WHICH', whichBox)
                // return res.send('see console')
                usr.msgs[whichBox].splice(idx, 1);
                usr.save(function(err, usr) {
                    res.send(usr);
                })
            }
        })
    });
    router.post('/repMsg', this.authbit, (req, res, next) => {
        //sends a message to all users flagged as 'mods' with message body, to, from
        mongoose.model('User').findOne({ _id: req.session.passport.user }, (erru, usr) => {
            const theMsg = usr.msgs.incoming.filter(m => m._id == req.body._id)[0];
            if (theMsg.isRep) {
                res.send('dupRep');
                return false;
            }
            mongoose.model('User').find({ user: req.body.theMod, school: { $in: schoolOpts } }, (err, mod) => {
                //send to each of the mods
                if (!mod.mod) {
                    return res.status(400).send('err')
                }
                mod.msgs.incoming.push({
                    from: usr.user,
                    msg: `<h3>Reported Message</h3>
                    <br>Date:${new Date(req.body.time).toLocaleString()}
                    <br>From:${req.body.from}
                    <br>To:${usr.user}
                    <br>Message:${req.body.msg}`
                })
                mod.save();
                //set this msg's report status to true
                theMsg.isRep = true;
                // console.log('SET ISREP TO TRUE: usr', usr, 'ID', req.body._id, 'MSG', usr.msgs.incomingfilter(m => m._id == req.body._id)[0])
                usr.save((err, usr) => {
                    res.send(usr);
                });
            })
        })
    })
    //end of msgs
    router.get('/unconfirmed', this.authbit, isMod, (req, res, next) => {
        mongoose.model('User').find({ confirmed: false, school:{$in:schoolOpts}}, function(err, uc) {
            // console.log()
            res.send(uc.map(t => {
                return {
                    name: t.user,
                    id: t._id,
                    startDate:t.startDate?new Date(t.startDate).toLocaleString():null
                }
            }))
        })
    })
    router.get('/denyConfirm',this.authbit, isMod, (req,res,next)=>{
        mongoose.model('User').findOne({_id:req.query.u}).remove((err,st)=>{
            res.send('done');
        })
    })
    router.get('/confirm', this.authbit, isMod, (req, res, next) => {
        if (!req.query.u) {
            res.status(400).send('err')
        }
        mongoose.model('User').findOneAndUpdate({ '_id': req.query.u, school: { $in: schoolOpts } }, { confirmed: true }, function(err, usr) {
            if (err) {
                res.send(err);
            }
            mongoose.model('User').find({}, (erra, usra) => {
                res.send(usra);
            })
        })
    })
    // router.get('/usrData', function(req, res, next) {
    //     mongoose.model('User').findOne({ _id: req.session.passport.user }, function(err, usr) {
    //         // console.log('found:', usr)
    //         usr.pass=null;
    //         usr.salt=null;
    //         res.send(usr);
    //     });
    // });
    router.get('/chkLog', (req, res, next) => {
        console.log(req.session)
        if (req.session && req.session.passport && req.session.passport.user) {
            res.send(req.session.passport)
        } else {
            res.send(false)
        }
    })

    router.post('/new', function(req, res, next) {
        passport.authenticate('local-signup', function(err, user, info) {
            console.log('err', err, 'usr', user, 'inf', info)
            res.send('done! maybe')
        })(req, res, next);
    });
    router.post('/login', function(req, res, next) {
        passport.authenticate('local-login', function(err, usr, info) {
            console.log('err', err, 'usr IS', usr, 'inf', info, 'pass candidate', req.body.pass, 'correct?')
            if (!info) {
                return res.send(false);
            }
            const correctSchool = (usr.school === null || usr.school == config.MATHAPP_SCHOOL);
            if (usr && !usr.isBanned && usr.confirmed && correctSchool) {
                req.session.passport = { user: usr._id };
                usr.pass = null;
                usr.salt = null;
                res.send(usr);
            }
            if (usr.isBanned) {
                return res.status(403).send('banned');
            } else if (!usr.confirmed) {
                return res.status(400).send('unconfirmed')
            } else if (!correctSchool) {
                return res.status(400).send('wrongSchool')
            }
        })(req, res, next);
    });
    router.get('/nameOkay', function(req, res, next) {
        //returns true if the name is NOT found!
        mongoose.model('User').find({ 'user': req.query.name, school: { $in: schoolOpts } }, function(err, user) {
            console.log('USER CHECK', user);
            res.send(!user.length)
        });
    });
    router.get('/logout', function(req, res, next) {
        /*this function logs out the user. It has no confirmation stuff because
        1) this is on the backend
        2) this assumes the user has ALREADY said "yes", and
        3) logging out doesn't actually really require any credentials (it's logging IN that needs em!)
        */
        console.log('usr sez bai');
        req.session.destroy();
        res.send('logged');
    });
    router.get('/forgotEmail', function(req, res, next) {
        /*
        Email reset code for this user to reset password
        response list:
        err: no user specified
        noUsr: user not found
        noEmail: user found, but no email (so cannot set reset stuff+email)
        google: user has a google account, so we can't reset the password*/
        if (!req.query.user) {
            return res.status(400).send('err');
        }
        console.log(req.query)
        mongoose.model('User').findOne({ user: req.query.user, school: { $in: schoolOpts } }, (err, usr) => {
            if (err || !usr) {
                return res.send('noUsr');
            } else if (usr.googleId) {
                return res.send('google')
            } else if (!usr.email) {
                return res.send('noEmail');
            }
            const resetCode = uuid.v4();
            usr.reset = resetCode;

            // return res.send('User would get code of '+resetCode)

            usr.save((eus, dus) => {
                const resetUrl = `${req.query.origin}/user/reset?k=${resetCode}`;
                const msg = {
                    to: usr.email,
                    from: 'no-reply@mathapp.herokuapp.com',
                    subject: 'Password Reset',
                    text: 'Someone (hopefully you!) requested a reset email for your MathApp account. If you did not request this, just ignore this email. Otherwise, go to ' + resetUrl + '!',
                    html: 'Someone (hopefully you!) requested a reset email for your MathApp account. <br>If you did not request this, just ignore this email.<br>Otherwise, click <a href="' + resetUrl + '">here</a>'
                };
                // sgMail.send(msg);
                res.end('done')
            });
        })
    })
    router.get('/forgotMsg', function(req, res, next) {
        /*
        send msg to teacher to reset this user 
        response list:
        err: no user specified
        noTeacher: no teacher
        noUsr: user not found
        google: user has a google account, so we can't reset the password*/
        if (!req.query.user || !req.query.teacher) {
            return res.status(400).send('err');
        }
        if (req.query.user == req.query.teacher) {
            return res.send('dup');
        }
        mongoose.model('User').findOne({ user: req.query.user }, (err, usr) => {
            if (err || !usr) {
                return res.send('noUsr');
            } else if (!req.query.teacher) {
                return res.send('noTeacher');
            } else if (usr.googleId) {
                return res.send('google')
            }
            mongoose.model('User').findOne({ user: req.query.teacher }, (errt, tchr) => {
                if (errt || !tchr) {
                    return res.send('noTeacher');
                }
                const resetCode = uuid.v4();
                usr.reset = resetCode;
                const resetUrl = `${req.query.origin}/user/reset?k=${resetCode}`;
                usr.save((eus, dus) => {
                    tchr.msgs.incoming.push({
                        from: 'SYSTEM',
                        msg: `${req.query.user} requested a password reset! Please click the link below to pick a password for them.<br><a href='${resetUrl}'>Click Here</a>`
                    })
                    tchr.save((terr, tsv) => {
                        res.send('done')
                    })
                })
            })
        })
    })

    router.get('/reset', function(req, res, next) {
        //reset page rendering for teacher who a) has a reset code and b) is a mod (teacher)
        const rst = req.query.k;
        if (!rst) {
            res.send(false);
        } else {
            mongoose.model('User').findOne({ reset: rst }, function(err, usr) {
                if (err || !usr) {
                    res.send(false);
                } else {
                    res.send(usr.user);
                }

            })
        }
    });
    router.post('/resetPwd/', function(req, res, next) {
        if (!req.body.pass || !req.body.key) {
            res.send('err');
        } else {
            mongoose.model('User').findOne({ reset: req.body.key }, function(err, usr) {
                if (err || !usr) {
                    res.send('err');
                } else {
                    console.log('usr before set:', usr, 'and body', req.body)
                    const usrModel = mongoose.model('User'),
                        salt = usrModel.generateSalt(),
                        pass = usrModel.encryptPassword(req.body.pass, salt);
                    usr.salt = salt;
                    usr.pass = pass;
                    usr.reset = null;
                    usr.save();
                    res.send('done')
                }
            })
        }
    })
    router.get('/setEmail', authbit, (req, res, next) => {
        if (!req.query.email || !req.query.email.match(/((\w+)\.*)+@(\w*)(\.\w+)+/g) || req.query.email.match(/((\w+)\.*)+@(\w*)(\.\w+)+/g)[0].length != req.query.email.length) {
            res.send('err');
            return false;
        }
        mongoose.model('User').findOne({ _id: req.session.passport.user }, function(err, usr) {
            usr.email = req.query.email;
            usr.save((errsv, usrsv) => {
                res.send(usrsv);
            })
        })
    })
    // router.get('/google',(req,res,next)=>{
    //     console.log('GOOGLE AUTH ROUTE!')
    //     res.send('hi!');
    // })
    router.get('/google', passport.authenticate('google-signup', {
        scope: ['profile']
    }));
    router.get('/googleRedir', passport.authenticate('google-signup'), (req, res) => {
        // res.send(req.user);
        console.log('REDIR response USER IS', req.session.passport.user)
        mongoose.model('User').findOne({ _id: req.session.passport.user }, function(err, usr) {
            console.log('USER FOUND VIA REDIRECT:', usr, 'SCHOOL', config.MATHAPP_SCHOOL)
            if (usr.school && config.MATHAPP_SCHOOL && config.MATHAPP_SCHOOL != usr.school) {
                //WRONG SCHOOL!
                req.session.destroy();
                return res.redirect('../login?wrongSchool')
            }
            res.redirect('../')
        });
        // res.status(200).send(responseHTML);
    });
    router.post('/newCourse', this.authbit, isMod, (req, res, next) => {
        console.log(req.user);
        // return res.send('NEH');
        if (!req.user) {
            return res.status(400).send('err');
        }
        const newCourse = {
            title: req.body.title,
            description: req.body.desc,
            teacher: req.user.user,
            school: config.MATHAPP_SCHOOL
        }
        console.log('newCourse', newCourse)
        mongoose.model('course').create(newCourse, (err, crs) => {
            mongoose.model('User').findOne({ _id: req.session.passport.user }, function(erru, usr) {
                console.log('newCourse', crs, 'User', usr)
                // return res.send('SEE CONSOLE')
                mongoose.model('course').find({ teacher: usr.user }, function(errc, respc) {
                    //find and send all courses back to front for this user
                    usr.classes.push(crs._id);
                    usr.save((errsu, usrsu) => {
                        res.send(respc);
                    });
                })
            })
        })
    })
    router.post('/temp', (req, res, next) => {
        // TEMP route to test temp stuff.Yep
        console.log('Triggered temp route!');
        res.send('temp route data! (not really)')
    })
    router.get('/getCourse', this.authbit, (req, res, next) => {
        //find all courses to which student blongz
        const theCourses = req.query.c.split(',').filter(t => t.length);
        console.log('lookin for courses', theCourses)
        mongoose.model('course').find({ _id: { $in: theCourses } }).lean().exec((err, resp) => {
            console.log(err, 'courses found', resp)
            if (err || !resp) {
                return res.send({
                    title: 'No Course',
                    description: "You haven't been assigned to a course yet! Talk to your teacher!",
                    teacher: "N/A"
                });
            } else {
                const pSetIds = _.uniq([].concat(...resp.filter(q => q.pSets && q.pSets.length).map(t => {
                    console.log('T PSET', t.pSets);
                    return t.pSets.map(q => q.pSet)
                })).filter(t => !!t));
                mongoose.model('pSet').find({ _id: { $in: pSetIds } }).lean().exec((errp, respp) => {
                    console.log('pSet response in (/getCourse)', respp)
                    resp.forEach(r => {
                        console.log("R in pSet Retrieval (/getCourse)", r)
                        if (!r.pSets) {
                            return false;
                        }
                        r.pSets = r.pSets.map(rp => respp.find(q => q._id == rp.pSet))
                    })
                    res.send(resp);
                })
            }
        })
    })
    router.get('/getCourses', this.authbit, (req, res, next) => {
        console.log('looking for this userz classes');
        mongoose.model('User').findOne({ _id: req.session.passport.user }, function(err, usr) {
            mongoose.model('course').find({ _id: { $in: usr.classes } }).lean().exec((err, crs) => {
                res.send(crs);
            })
        });
    })
    router.get('/getStudents', this.authbit, isMod, (req, res, next) => {
        console.log('looking for OTHER students');
        mongoose.model('User').find({ user: { $ne: req.user.user }, mod: false, school: { $in: schoolOpts } }).lean().exec((err, stoodz) => {
            // find all users that are 1) not equal to this user and 2) not mods (teachers) and 3) in this school
            res.send(stoodz.map(s => {
                s.salt = null;
                s.pass = null;
                return s;
            }));
        })
    })
    router.post('/changeClassStatus', this.authbit, isMod, (req, res, next) => {
        // req.body.mode=req.body.mode.toString()==true
        if (!req.body.student || !req.body.course || req.body.course.teacher != req.user.user || (req.body.course.school !== null && req.body.course.school !== config.MATHAPP_SCHOOL)) {
            return res.status(400).send('err');
        }
        mongoose.model('User').findOne({ _id: req.body.student._id }, (err, stdnt) => {
            crsStudPos = stdnt.classes.indexOf(req.body.course._id.toString());
            console.log('pos', crsStudPos, 'student', stdnt, 'mode', req.body.mode, 'course', req.body.course)
            if (req.body.mode && crsStudPos < 0) {
                //add student
                stdnt.classes.push(req.body.course._id.toString());
            } else if (!req.body.mode && crsStudPos > -1) {
                stdnt.classes.splice(crsStudPos, 1);
            }
            stdnt.save((err, stsv) => {
                res.send('doen');
            })
        })
    });
    router.post('/assign', this.authbit, isMod, (req, res, next) => {
        mongoose.model('User').findOne({ _id: req.body.user }, (err, st) => {
            console.log('ASSIGNMENT DATA', st, req.body)
            if (err || !st || (config.MATHAPP_SCHOOL !== null && !!st.school && st.school != config.MATHAPP_SCHOOL)) {
                return res.status(400).send('err'); //incorrect skool
            }
            let theNP = st.nextPSet.find(np => np.cid == req.body.course);
            if (!theNP) {
                st.nextPSet.push({
                    cid: req.body.course,
                    pid: req.body.assign
                })
            } else {
                theNP.pid = req.body.assign;
            }
            st.save((errs, sts) => {
                res.send('done')
            })
        })
    })
    router.post('/submit', this.authbit, (req, res, next) => {
        mongoose.model('User').findOne({ _id: req.session.passport.user }, function(err, usr) {
            const ansIds = req.body.qs.map(q => q._id);
            mongoose.model(req.body.pSet.kind).find({ _id: { $in: ansIds } }).lean().exec((err, qs) => {
                const results = qs.map(qo => {
                    let usrAns = req.body.qs.find(qt => qt._id == qo._id),
                        isCorrect = false;
                    console.log('this question is', qo, 'found user answer is', usrAns)
                    if (req.body.pSet.kind !== 'probPick') {
                        isCorrect = usrAns && usrAns.pickedAns && qo.ans.toString().trim() == usrAns.pickedAns.toString().trim();
                    } else {
                        let yesOrNo = eval(qs.termOne + qs.op + qs.termTwo) == qs.ans ? 'yes' : 'no'; //whether the correct answer is Yes or No
                        isCorrect = (usrAns && usrAns.pickedAns && yesOrNo == usrAns.pickedAns);
                    }
                    return { isCorrect: !!isCorrect, pid: qo._id, answer: usrAns.pickedAns || null };
                })
                //now results is a list of answers and their 'correctness' as prepared for the usr model;
                mongoose.model('pSet').findOne({ _id: req.body.pSet._id, school: { $in: schoolOpts } }, (err, ps) => {
                    if (!ps || ps.courses.indexOf(req.body.cid) < 0 || !usr.nextPSet.find(t => t.cid == req.body.cid)) {
                        //this course is not a valid course for this pset
                        return res.status(400).send('err');
                    }
                    //NOTE: we DO not save yet!
                    let doneObj = {
                        cid: req.body.cid,
                        setId: ps._id,
                        startTime: req.body.pSet.startTime,
                        endTime: req.body.pSet.endTime,
                        order: ps.order,
                        probs: results
                    }
                    if (usr.pSetDone.find(p => p.cid == doneObj.cid && p.setId == doneObj.setId)) {
                        //this class and pset combo has already been done
                        return res.status(400).send('duplicate');
                    }
                    //push this into the set of done problems
                    // const thisClass = usr.nextPSet.find(t=>t.cid==doneObj.cid)
                    mongoose.model('course').findOne({ _id: req.body.cid }, (errc, crs) => {
                        if ((ps.school != null && ps.school != config.MATHAPP_SCHOOL) || (crs.school != null && crs.school != config.MATHAPP_SCHOOL)) {
                            //WRONG school for course OR pset OR user
                            return res.status(400).send('err')
                        }
                        let theLesson = crs.pSets.find(t => t.pSet == req.body.pSet._id);
                        //set this class's next course to null unless it has a 'next'
                        usr.nextPSet.find(t => t.cid == doneObj.cid).pid = theLesson.next || null;
                        usr.pSetDone.push(doneObj);
                        usr.save((errsv, usrsv) => {
                            res.send(theLesson.next || null)
                        })
                    })
                })
            })
        });
    })
    router.post('/getUserProbSet', this.authbit, isMod, (req, res, next) => {
        if (!req.body.userId || !req.body.setId || !req.body.courseId) {
            //no set ID or no student ID
            return res.status(400).send('err');
        }
        mongoose.model('User').findOne({ _id: req.body.userId, school: { $in: schoolOpts } }, function(err, usr) {
            if (err || !usr) {
                return res.status(400).send('err');
            }
            const theWork = usr.pSetDone.find(t => {
                console.log('TRYING pSet', t)
                return t.setId == req.body.setId && t.cid == req.body.courseId
            });
            console.log('theWork', theWork, req.body)
            res.send(theWork)
        })
    })
    router.post('/emailAboutProblem', this.authbit, isMod, (req, res, next) => {
        if (!req.body.userId || !req.body.setId || !req.body.courseId) {
            //no set ID or no student ID
            return res.status(400).send('err');
        }
        mongoose.model('course').findOne({ _id: req.body.courseId }, (errc, crs) => {
            if (!crs || errc || crs.teacher != req.user.user) {
                //wrong teacher or err
                return res.status(400).send('err');
            }
            mongoose.model('User').findOne({ _id: req.body.userId }, (errs, stu) => {
                if (!stu || errs) {
                    return res.status(400).send('err');
                }
                mongoose.model('pSet').findOne({ _id: req.body.setId }, (errp, pset) => {
                    if (!pset || errp) {
                        return res.status(400).send('err');
                    }
                    const uniqId = Math.floor(Math.random() * 9999999).toString(32);
                    stu.msgs.incoming.push({
                        from: req.user.user,
                        msg: `Hi, ${stu.user}! Your teacher, ${req.user.user} wants to talk to you about the assignment ${pset.title}.`,
                        uniqId: uniqId
                    });
                    stu.save((errsv, stusv) => {
                        req.user.msgs.outgoing.push({
                            to: stu.user,
                            msg: `You sent a message to student ${stu.user} regarding assignment ${pset.title}.`,
                            uniqId: uniqId
                        })
                        req.user.save((esv, usv) => {
                            res.send('done')
                        })
                    })
                })
            })
        })
    })
    router.post('/replyMsg', this.authbit, (req, res, next) => {
        mongoose.model('User').findOne({ _id: req.session.passport.user }, (errf, fusr) => {
            mongoose.model('User').findOne({ user: req.body.from }, (errt, tusr) => {
                console.log('msg reply route!', req.body)
                if (errf || errt || !tusr || !fusr) {
                    return res.status(400).send('err');
                }
                const theId = Math.floor(Math.random() * 9999999).toString(32);
                tusr.msgs.incoming.push({
                    from: fusr.user,
                    msg: 'Reply:<br>' + req.body.msg,
                    uniqId: theId
                })
                tusr.save((errtsv, tusrsv) => {
                    io.emit('msgDashRef', { who: req.body.from })
                })
                fusr.msgs.outgoing.push({
                    to: tusr.user,
                    msg: 'Reply:<br>' + req.body.msg,
                    uniqId: theId
                })
                fusr.save((errfsv, fusrsv) => {
                    res.send(fusrsv);
                })
            })
        });
    })
    router.get('/allMods', (req, res, next) => {
        mongoose.model('User').find({ mod: true, school: { $in: schoolOpts } }, (err, mods) => {
            res.send(mods.map(u => u.user));
        })
    })
    router.get('/allDone', this.authbit, (req, res, next) => {
        const usr = req.session.passport.user;
        // const usr = '5bb25d88cca0eb1cdcb210da'
        mongoose.model('User').findOne({ _id: usr }).lean().exec((err, usr) => {
            const pSetIds = usr.pSetDone.map(t => t.setId);
            //need PROB ids too
            const probIds = [].concat(...usr.pSetDone.map(p => {
                return p.probs.map(q => q.pid);
            }));
            mongoose.model('pSet').find({ _id: { $in: pSetIds } }).lean().exec((errp, psets) => {
                mongoose.model('probFillin').find({ _id: { $in: probIds } }).lean().exec((errpf, pf) => {
                    mongoose.model('probMatch').find({ _id: { $in: probIds } }).lean().exec((err, pm) => {
                        mongoose.model('probPick').find({ _id: { $in: probIds } }).lean().exec((err, pp) => {
                            mongoose.model('probSimple').find({ _id: { $in: probIds } }).lean().exec((err, ps) => {
                                const allProbQs = pf.concat(pm).concat(pp).concat(ps);
                                usr.pSetDone.forEach(psd => {
                                    let thePset = psets.find(p => p._id == psd.setId);
                                    psd.picture = thePset.picture;
                                    psd.kind = thePset.kind;
                                    psd.title = thePset.title;
                                    psd.text = thePset.text;
                                    psd.probs.forEach(psq => {
                                        let theProb = allProbQs.find(aq => aq._id == psq.pid)
                                        psq.termOne = theProb.termOne || null;
                                        psq.op = theProb.op || null;
                                        psq.termTwo = theProb.termTwo || null;
                                        if (psd.kind == 'probPick') {
                                            psq.realAns = theProb.ans
                                        }
                                        psq.desc = theProb.desc || null;
                                    })
                                })
                                usr.salt = null;
                                usr.pass = null;
                                usr.mod = null;
                                usr.isBanned = null;
                                usr.confirmed = null;
                                res.send(usr.pSetDone);
                            })
                        })
                    })
                })
            })
        });
    })
    return router;
}

module.exports = routeExp;