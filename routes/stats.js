module.exports = function(io){
    const express = require('express');
    const router = express.Router();

    router.get('/$', function(req, res, next) {
        res.render('stats2', {
            socket_path: '/stats',
            filter: false
        });
    })

    return router;
}