module.exports = function(io){
    const express = require('express');
    const router = express.Router();
    const passport = require('passport'); 

	router.get('/login', function(req, res, next) {
		res.render('login');
	});

	router.post('/login', function(req, res, next){
		passport.authenticate('local', function(err, user, info){
			if (err) return next(err);

			if (!user)
				return res.render('login')

			req.login(user, function(err){
				if (err) return next(err);

				return res.redirect('/')
			})
		})(req, res, next);
	})

	router.post('/login', passport.authenticate('local', function(err, user, info){
		if (err) return 
	}));

	router.get('/logout', function(req, res){
		req.session.destroy();
		res.redirect('/');
	})

    return router;
}