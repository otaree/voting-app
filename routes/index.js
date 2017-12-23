var express = require('express');
var router = express.Router();
var Polls = require('../models/polls');
var isLoggedIn = require('../common/auth_function');

/* GET home page. */
router.get('/',  function(req, res, next) {
  res.render('index', { title: 'Voting App', user: req.user});
});

router.get('/profile', isLoggedIn, function(req, res) {
  Polls.find({}, function (err, thePolls) {
    if (err) {
        next(err);
    }
    if (thePolls.length > 0) {
      res.render('profile', {user: req.user.github, polls: thePolls, title: "Profile"});
    } else {
      res.render('profile', {user: req.user.github, title: "Profile"});
    }
});
});

module.exports = router;
