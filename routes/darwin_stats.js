module.exports = function(io){
	const app_settings = require('../helpers/settings')
    const express = require('express');
    const router = express.Router();
    const os = require('os');

    router.get('/', function(req, res, next) {
        res.render('darwin_stats', {
            socket_path: app_settings.websocket_path + '/darwin/stats',
            nb_cpus: os.cpus().length
        });
    });

    return router;
}
