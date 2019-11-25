module.exports = function(io){
    const express = require('express');
    const router = express.Router();
    const os = require('os');

    router.get('/$', function(req, res, next) {
    	var total_ram = os.totalmem() / 1000;
    	var hostname = os.hostname();

        res.render('stats', {
            socket_path: '/dashboard/stats',
            total_ram: total_ram,
            hostname: hostname,
            filter: false
        });
    })

    return router;
}