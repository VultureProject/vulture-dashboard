const app_settings = require('./settings');
const helper = require('./utils');
const ip = require('ip');


exports.map_socket = function(socket){
    var redis_subscriber_impcap = helper.get_redis_subscriber();
    var nodes = [];

    socket.on('reinit', function(message){
        nodes = [];
    })

    redis_subscriber_impcap.on('message', function(channel, message){
        message = JSON.parse(message);

        if (helper.apply_filter(message, socket.handshake.session.filter)){
            var ctx = false;
            var node_ip;

            if (ip.isPrivate(message.net_src_ip)){
                ctx = helper.format_ctx(message, true);
                node_ip = message.net_src_ip;
            } else if (ip.isPrivate(message.net_dst_ip)){
                ctx = helper.format_ctx(message, false);
                node_ip = message.net_dst_ip;
            }

            if (node_ip){
                var ctx = helper.format_ctx(message);

                if (ctx.country){
                    if (nodes.indexOf(node_ip) === -1){
                        nodes.push(node_ip);

                        socket.emit('message.node', {
                            ip: node_ip,
                            reputation: ctx.reputation,
                            geoip: {
                                city: ctx.city,
                                latitude: ctx.latitude,
                                longitude: ctx.longitude
                            }
                        })
                    }
                }
            }
        }
    })

    redis_subscriber_impcap.subscribe(app_settings.impcap_publisher);

    socket.on('disconnect', function(data){
        console.log('Disconnected from map')
        redis_subscriber_impcap.unsubscribe(app_settings.impcap_publisher)
    })
}