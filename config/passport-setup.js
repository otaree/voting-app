var passport = require('passport');
var GithubStrategy = require('passport-github');
var keys = require('./keys');
var User = require('../models/users');

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});


passport.use(
    new GithubStrategy({
        clientID: keys.github.clientID,
        clientSecret: keys.github.clientSecret,
        callbackURL: "http://127.0.0.1:3000/auth/github/callback"
    }, function(accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
			User.findOne({ 'github.id': profile.id }, function (err, user) {
				if (err) {
					return done(err);
				}

				if (user) {
					return done(null, user);
				} else {
					var newUser = new User();

					newUser.github.id = profile.id;
					newUser.github.username = profile.username;
					newUser.github.displayName = profile.displayName;
					newUser.github.publicRepo = profile._json.public_repos;
					newUser.save(function (err) {
						if (err) {
							throw err;
						}
						console.log("new User " + newUser);
						return done(null, newUser);
					});
				}
			});
		});
    })
);