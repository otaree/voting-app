var express = require('express');
var router = express.Router();
var Polls = require('../models/polls');
var PollInstance = require('../models/pollInstance');
var Option = require('../models/options');
var async = require('async');
var isLoggedIn = require('../common/auth_function');
var keys = require('../config/keys');




router.get('/create', isLoggedIn, function (req, res, next) {
    res.render('create_poll', {
        user: req.user,
        title: "Create Poll"
    });
});

router.post('/create', isLoggedIn, function (req, res, next) {

    var formElements = req.body;
    var optionArr = [];
    // loop through form value
    for (var value in formElements) {
        if (value.indexOf("option") != -1) {
            if (formElements[value] != '') {
                //console.log(value, formElements[value]);
                req.checkBody(value, 'Option must not be empty').notEmpty();
                req.sanitize(value).escape();
                req.sanitize(value).trim();
                optionArr.push(formElements[value]);

            }
        } else {
            req.checkBody('question', 'Question must not be empty').notEmpty();
            req.sanitize('question').escape();
            req.sanitize('question').trim();
        }

    }
    // create new Poll
    var newPoll = new Polls();
    newPoll.question = req.body.question;
    newPoll.user = req.user.id;

    // create new poll Instance 
    var pollInstance = new PollInstance();
    pollInstance.poll = newPoll.id;
    pollInstance.user = req.body.id;

    // create option object array to be inserted
    var insertArray = [];
    for (var i = 0; i < optionArr.length; i++) {
        var arr_obj = {};
        arr_obj.name = optionArr[i];
        arr_obj.poll = newPoll.id;
        insertArray.push(arr_obj);
    }

    var errors = req.validationErrors();
    if (errors) {
        res.render('create_poll', {
            errors: errors,
            user: req.user,
            title: "Create Poll"
        });
    } else {
        Polls.findOne({
            question: newPoll.question
        }, function (err, poll) {
            if (err) {
                next(err);
            }
            if (poll) {
                res.render('create_poll', {
                    alreadyExist: true,
                    user: req.user,
                    title: "Create Poll"
                });

            } else {
                async.parallel([
                    function (callback) {
                        newPoll.save(callback);
                    },
                    function (callback) {
                        pollInstance.save(callback);
                    },
                    function (callback) {
                        Option.insertMany(insertArray, callback);
                    }
                ], function (err, results) {
                    if (err) {
                        next(err);
                    }
                    res.redirect('/profile');
                });

            }
        });
    }
});


router.get('/', function (req, res, next) {
    Polls.find({}, function (err, thePolls) {
        if (err) {
            next(err);
        }
        if (thePolls.length > 0) {
            res.render("poll_list", {
                user: req.user,
                polls: thePolls,
                title: "Polls"
            });
        } else {
            res.render("poll_list", {
                user: req.user,
                title: "Polls"
            });
        }
    });
});

router.post('/', isLoggedIn, function (req, res, next) {

    async.parallel([
        function (callback) {
            PollInstance.findOneAndRemove({
                poll: req.body.id
            }, callback);
        },
        function (callback) {
            Option.remove({
                poll: req.body.id
            }, callback);
        },
        function (callback) {
            Polls.findByIdAndRemove(req.body.id, callback);
        }
    ], function (err, results) {
        if (err) {
            next(err);
        }
        res.json({
            success: true
        });
    });

});

router.get('/:id/update', isLoggedIn, function (req, res, next) {
    async.parallel({
        poll: function (callback) {
            Polls.findById(req.params.id)
                .select('question')
                .exec(callback)
        },
        options: function (callback) {
            Option.find({
                    poll: req.params.id
                })
                .select("name vote")
                .exec(callback)
        },
    }, function (err, results) {
        if (err) {
            next(err);
        }

        var poll = results.poll;
        var options = results.options;

        res.render('poll_update', {
            poll: poll,
            options: options,
            user: req.user,
            title: "Edit Poll"
        });
    });
});

router.post('/:id/update', isLoggedIn, function (req, res, next) {
    var formElements = req.body;
    var optionArr = [];
    // loop through form value
    for (var value in formElements) {
        if (formElements[value] != '') {
            //console.log(value, formElements[value]);
            req.sanitize(value).escape();
            req.sanitize(value).trim();
            var arr_obj = {};
            arr_obj.name = formElements[value];
            arr_obj.poll = req.params.id;
            optionArr.push(arr_obj);

        }
    }

    var errors = req.validationErrors();
    if (errors) {
        async.parallel({
            poll: function (callback) {
                Polls.findById(req.params.id)
                    .select('question')
                    .exec(callback)
            },
            options: function (callback) {
                Option.find({
                        poll: req.params.id
                    })
                    .select("name vote")
                    .exec(callback)
            },
        }, function (err, results) {
            if (err) {
                next(err);
            }
    
            var poll = results.poll;
            var options = results.options;
    
            res.render('poll_update', {
                poll: poll,
                options: options,
                user: req.user,
                title: "Edit Poll",
                errors: errors
            });
        });

    } else {
        if (optionArr.length > 0) {
            Option.insertMany(optionArr, function(err, results) {
                if (err) { next(err); }
            });
        }

        res.redirect("/poll/"+ req.params.id);
        
    }


});


router.get('/:id', function (req, res, next) {   

    if (req.user) {
        async.parallel({
            poll: function (callback) {
                Polls.findById(req.params.id)
                    .select('question')
                    .exec(callback)
            },
            options: function (callback) {
                Option.find({
                        poll: req.params.id
                    })
                    .select("name vote")
                    .exec(callback)
            },
            pollInstance: function (callback) {
                PollInstance.findOne({
                        poll: req.params.id
                    })
                    .select('voted')
                    .exec(callback);
            }
        }, function (err, results) {
            if (err) {
                next(err);
            }

            var poll = results.poll;
            var options = results.options;
            var voted = results.pollInstance.voted;

            res.render('poll', {
                poll: poll,
                options: options,
                user: req.user,
                voted: voted,
                home: keys.home.url,
                title: "Cast Vote"
            });
        });
    } else {
        var voted;
        if (req.session.poll) {
            voted = req.session.poll.filter(function(pollObj) {
                return pollObj.pollId === req.params.id;
            });

            if (voted.length < 1) {
                var obj = {voted: false, pollId: req.params.id};
                req.session.poll.push(obj);
                voted = [obj];
            }
    
        } else {
            req.session.poll = [{voted: false, pollId: req.params.id}];
            voted = [{voted: false, pollId: req.params.id}];
        }
        voted = voted[0].voted;
        async.parallel({
            poll: function (callback) {
                Polls.findById(req.params.id)
                    .select('question')
                    .exec(callback)
            },
            options: function (callback) {
                Option.find({
                        poll: req.params.id
                    })
                    .select("name vote")
                    .exec(callback)
            },
        }, function (err, results) {
            if (err) {
                next(err);
            }
            //console.log("RESULT:" + results.options);
            var poll = results.poll;
            var options = results.options;
            //console.log("question", question);
            //console.log("options", options);
            res.render('poll', {
                poll: poll,
                options: options,
                user: req.user,
                voted: voted,
                home: keys.home.url,
                title: "Cast Vote"
            });
        });
    }

});

router.post('/:id', function (req, res, next) {

    if (req.body.options) {
        if (req.user) {
            async.parallel({
                poll: function (callback) {
                    Polls.findById(req.params.id)
                        .select('question')
                        .exec(callback)
                },
                update_vote: function (callback) {
                    Option.findOneAndUpdate({
                        name: req.body.options
                    }, {
                        $inc: {
                            vote: 1
                        }
                    }, {
                        new: true
                    }, callback);
                },
                update_pollInstance: function (callback) {
                    PollInstance.findOneAndUpdate({
                        poll: req.params.id
                    }, {
                        $set: {
                            voted: true
                        }
                    }, {
                        new: true
                    }, callback);
                }
            }, function (err, results) {
                if (err) {
                    next(err);
                }
                //console.log("RESULT:" + results.options);
                var poll = results.poll;
                var voted = results.update_pollInstance;

                Option.find({
                        poll: req.params.id
                    })
                    .select("name vote")
                    .exec(function (err, options) {
                        if (err) {
                            next(err);
                        }

                        res.render('poll', {
                            poll: poll,
                            options: options,
                            user: req.user,
                            home: keys.home.url,
                            voted: voted
                        });
                    });

            });
        } else {
            var voted = true;
            if (req.session.poll) {
                for (var i = 0; i < req.session.poll.length; i++) {
                    if (req.session.poll[i]["pollId"] === req.params.id) {
                        req.session.poll[i]["voted"] = true;
                    }
                }
            }
            async.parallel({
                poll: function (callback) {
                    Polls.findById(req.params.id)
                        .select('question')
                        .exec(callback)
                },
                update_vote: function (callback) {
                    Option.findOneAndUpdate({
                        name: req.body.options
                    }, {
                        $inc: {
                            vote: 1
                        }
                    }, {
                        new: true
                    }, callback);
                },

            }, function (err, results) {
                if (err) {
                    next(err);
                }
                //console.log("RESULT:" + results.options);
                var poll = results.poll;
                Option.find({
                        poll: req.params.id
                    })
                    .select("name vote")
                    .exec(function (err, options) {
                        if (err) {
                            next(err);
                        }

                        res.render('poll', {
                            poll: poll,
                            options: options,
                            voted: voted,
                            home: keys.home.url,
                            title: "Cast Vote"
                        });
                    });

            });
        }
    } else {
        async.parallel({
            poll: function (callback) {
                Polls.findById(req.params.id)
                    .select('question')
                    .exec(callback)
            },
            options: function (callback) {
                Option.find({
                        poll: req.params.id
                    })
                    .select("name vote")
                    .exec(callback)
            },
        }, function (err, results) {
            if (err) {
                next(err);
            }
            //console.log("RESULT:" + results.options);
            var poll = results.poll;
            var options = results.options;
            //console.log("question", question);
            //console.log("options", options);
            res.render('poll', {
                poll: poll,
                options: options,
                user: req.user,
                voted: false,
                notselected: true,
                home: keys.home.url,
                title: "Cast Vote"
            });
        });
    }
});



module.exports = router;