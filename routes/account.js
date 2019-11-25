module.exports = function(io){
    const express = require('express');
    const router = express.Router();
    const passport = require('passport'); 

	router.get('/login', function(req, res, next) {
		res.render('login');
	});

	router.post('/login', passport.authenticate('local', {
		successRedirect: '/dashboard/',
		failureRedirect: '/dashboard/auth/login',
	  	failureFlash: true,
	}));

	router.get('/logout', function(req, res){
		req.session.destroy();
		res.redirect('/dashboard/');
	})

    return router;
}