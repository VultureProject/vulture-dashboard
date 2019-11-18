module.exports = function(io){
    const express = require('express');
    const router = express.Router();

    router.get('/', function(req, res, next) {
        res.render('map', {
            socket_path: '/map',
            config: true
        });
    });

    return router;
}