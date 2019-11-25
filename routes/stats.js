module.exports = function(io){
    const app_settings = require('../helpers/settings');
    const express = require('express');
    const router = express.Router();
    const os = require('os');

    router.get('/$', function(req, res, next) {
    	var total_ram = os.totalmem() / 1000;

        res.render('stats', {
            socket_path: app_settings.websocket_path + '/stats',
            total_ram: total_ram,
            hostname: app_settings.hostname,
            filter: false
        });
    })

    return router;
}