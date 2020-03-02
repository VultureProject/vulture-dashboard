module.exports = function(io){
	const app_settings = require('../helpers/settings')
    const express = require('express');
    const router = express.Router();

    router.get('/', function(req, res, next) {
        res.render('alerts', {
            socket_path: app_settings.websocket_path + '/alerts',
            config: true
        });
    });

    return router;
}
