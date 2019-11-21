const app_settings = require('./settings');
const helper = require('./utils');
const ip = require('ip');

exports.alerts_socket = function(socket){
    var redis_subscriber_impcap = helper.get_redis_subscriber();

    redis_subscriber_impcap.on('message', function(channel, message){
        message = JSON.parse(message);
        console.log(messages)

        if (helper.apply_filter(message, socket.handshake.session.filter)){
            socket.emit('message.alerts', message)
        }
    })

    redis_subscriber_impcap.subscribe(app_settings.darwin_alerts_publisher);

    socket.on('disconnect', function(data){
        console.log('Disconnected from alerts')
        redis_subscriber_impcap.unsubscribe(app_settings.darwin_alerts_publisher)
    })
}