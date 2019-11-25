module.exports = function(io){
    const express = require('express');
    const router = express.Router();

    router.get('/', function(req, res, next) {
        res.render('alerts', {
            socket_path: '/dashboard/alerts',
            config: true
        });
    });

    return router;
}
