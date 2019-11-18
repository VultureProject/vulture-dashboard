const app_settings = require('./settings');
const helper = require('./utils');
const ip = require('ip');

exports.logs_socket = function(socket){
    var redis_subscriber_impcap = helper.get_redis_subscriber();

    redis_subscriber_impcap.on('message', function(channel, message){
        message = JSON.parse(message);

        if (helper.apply_filter(message, socket.handshake.session.filter)){
            var ctx = false;

            if (!ip.isPrivate(message.net_src_ip))
                ctx = helper.format_ctx(message, true);
            else if (!ip.isPrivate(message.net_dst_ip))
                ctx = helper.format_ctx(message, false);

            if (ctx){
                message.city = ctx.city;
                message.country = ctx.country;
                message.iso_code = ctx.iso_code;
            }

            socket.emit('message.log', message)
        }
    })

    redis_subscriber_impcap.subscribe(app_settings.impcap_publisher);

    socket.on('disconnect', function(data){
        redis_subscriber_impcap.unsubscribe(app_settings.impcap_publisher)
    })
}