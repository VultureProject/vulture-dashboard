const app_settings = require('./settings');
const redis = require('redis');
const ip = require('ip');
const ip_address = require('ip-address');
const isCidr = require('is-cidr');
const Address4 = require('ip-address').Address4;
const Address6 = require('ip-address').Address6;
const moment = require('moment');


exports.format_ctx = function(message, is_src){
    var ctx = {
        reputation: false,
        country: false,
        city: false,
        iso_code: false,
        latitude: false,
        longitude: false
    }

    if (is_src){
        ctx.reputation = message.ctx_src_reputation;
        ctx.country = message.ctx_src_country_name;
        ctx.city = message.ctx_src_city_name;
        ctx.iso_code = message.ctx_src_iso_code;
        ctx.latitude = message.ctx_src_latitude;
        ctx.longitude = message.ctx_src_longitude;
        ctx.tags = message.reputation_ctx_tags;
    } else {
        ctx.reputation = message.ctx_dst_reputation;
        ctx.country = message.ctx_dst_country_name;
        ctx.city = message.ctx_dst_city_name;
        ctx.iso_code = message.ctx_dst_iso_code;
        ctx.latitude = message.ctx_dst_latitude;
        ctx.longitude = message.ctx_dst_longitude;
        ctx.tags = message.reputation_ctx_tags;
    }

    return ctx;
}

exports.get_redis_subscriber = function(){
    var config = {
        retry_strategy: function (options) {
            if (options.error && options.error.code === 'ECONNREFUSED') {
                // End reconnecting on a specific error and flush all commands with
                // a individual error
                return new Error('The server refused the connection');
            }
            if (options.total_retry_time > 1000 * 60 * 60) {
                // End reconnecting after a specific timeout and flush all commands
                // with a individual error
                return new Error('Retry time exhausted');
            }
            if (options.attempt > 10) {
                // End reconnecting with built in error
                return undefined;
            }
            // reconnect after
            return Math.min(options.attempt * 100, 3000);
        }
    }

    if (app_settings.redis_use_socket){
        config.path = app_settings.redis_socket;
    } else {
        config.host = app_settings.redis_host,
        config.port = app_settings.redis_port
    }

    return redis.createClient(config);
}

exports.apply_filter = function(message, filter){
    if (!filter)
        return true;

    if (app_settings.ip_filter_keys.indexOf(filter.key_filter) !== -1){
        // IP Filter
        if (filter.value_filter.indexOf(message[filter.key_filter]) !== -1)
            return true;

        for (var i in filter.value_filter){
            var value = filter.value_filter[i];

            var cidr = isCidr(value);
            if (cidr === 4 || cidr === 6){
                if (ip.cidrSubnet(value).contains(message[filter.key_filter]))
                    return true;
            }
        }

        return false;
    } else if (app_settings.int_filter_keys.indexOf(filter.key_filter) !== -1){
        // INT Filter
        if (filter.value_filter.indexOf(message[filter.key_filter]) !== -1){
            return true;
        }
    }
}

exports.apply_groupby = function(src_tags, group_by){
    if (src_tags)
        return src_tags.indexOf(group_by) !== -1;
    return false;
}

exports.config = function(socket){
    socket.on('config', function(data){
        let number_of_nodes = data.number_of_nodes;
        let key_filter = data.key_filter;
        let value_filter = JSON.parse(data.value_filter);
        let group_by = data.group_by;

        if (app_settings.int_filter_keys.indexOf(key_filter) !== -1){
            var ports = [];
            for (var i in value_filter)
                ports.push(parseInt(value_filter[i]))

            value_filter = ports;
        }

        if (key_filter !== ""){
            var filter = {
                key_filter: key_filter,
                value_filter: value_filter
            }

            socket.handshake.session.filter = filter
        }

        var config = {
            number_of_nodes: app_settings.number_of_nodes   
        }

        if (number_of_nodes)
            config.number_of_nodes = number_of_nodes

        socket.handshake.session.config_carto = config;

        if (group_by !== "")
            socket.handshake.session.group_by = group_by;

        socket.handshake.session.save()

        socket.emit('config', {'status': true})
    })

    socket.on('config.cancel', function(data){
        socket.handshake.session.filter = null;
        socket.handshake.session.group_by = null;
        socket.handshake.session.config_carto = {
            number_of_nodes: app_settings.number_of_nodes
        };

        socket.handshake.session.save();
    })
}
