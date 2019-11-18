module.exports = function(io){
    const express = require('express');
    const router = express.Router();

    router.get('/', function(req, res, next) {
        res.render('carto', {
            socket_path: '/carto',
            config: true
        });
    });

    return router;
}