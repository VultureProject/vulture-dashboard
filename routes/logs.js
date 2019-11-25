module.exports = function(io){
    const express = require('express');
    const router = express.Router();

    router.get('/', function(req, res, next) {
        res.render('logs', {
            socket_path: '/dashboard/logs',
            config: true
        });
    });

    return router;
}
