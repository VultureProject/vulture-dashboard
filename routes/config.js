module.exports = function(){
    const express = require('express');
    const router = express.Router();
    const app_settings = require('../helpers/settings');

    const ip = require('ip');
    const isCidr = require('is-cidr');
    const Address4 = require('ip-address').Address4;
    const Address6 = require('ip-address').Address6;

    router.post('/$', function(req, res, next) {
        let number_of_nodes = req.body.number_of_nodes;
        if (!number_of_nodes)
            number_of_nodes = app_settings.number_of_nodes;

        let key_filter = req.body.key_filter;
        let value_filter = JSON.parse(req.body.value_filter);
        let group_by = req.body.group_by;

        if (key_filter !== ""){
            if (app_settings.ip_filter_keys.indexOf(key_filter) !== -1){
                for (var i in value_filter){
                    var value = value_filter[i];

                    if (!isCidr(value)){
                        if (ip.isV4Format(value)){
                            var address = new Address4(value)
                            if (!address.isValid()){
                                res.json({
                                    status: false,
                                    error: value + " is an Invalid IPv4 address"
                                })
                                return;
                            }
                        } else if (ip.isV6Format(value)){
                            var address = new Address6(value)
                            if (!address.isValid()){
                                res.json({
                                    status: false,
                                    error: value + " is an Invalid IPv6 address"
                                })
                                return;
                            }
                        } else {
                            res.json({
                                status: false,
                                error: value + " is not a valid IP Address"
                            })
                            return;
                        }
                    }
                }
            } else if (app_settings.int_filter_keys.indexOf(key_filter) !== -1){
                var ports = [];
                for (var i in value_filter){
                    var tmp = parseInt(value_filter[i]);
                    if (isNaN(tmp)){
                        res.json({
                            status: false,
                            error: value_filter[i] + " is not a correct number"
                        })
                        return;
                    }

                    ports.push(tmp);
                }

                key_filter = ports;
            }            
                
            req.session.filter = {
                key_filter: key_filter,
                value_filter: value_filter
            }
        }

        if (group_by === "")
            group_by = false;

        req.session.group_by = group_by;

        req.session.config_carto = {
            number_of_nodes: number_of_nodes
        }

        req.session.save(function(err){
            res.json({status: true});
        })
    });

    router.post('/cancel', function(req, res, next){
        req.session.group_by = null;
        req.session.filter = null;
        req.session.config = null;
        req.session.save(function(err){
            res.json({status: true});
        })
    })

    router.post('/theme', function(req, res, next){
        req.session.dark = req.body.dark;
        req.session.save();
        res.json({})
    })

    return router;
}