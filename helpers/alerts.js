const app_settings = require('./settings');
const helper = require('./utils');
const ip = require('ip');

exports.alerts_socket = function(socket){
    var redis_subscriber_alert = helper.get_redis_subscriber();

    redis_subscriber_alert.on('message', function(channel, message){
        message = JSON.parse(message);
        console.log(messages)

        if (helper.apply_filter(message, socket.handshake.session.filter)){
            socket.emit('message.alerts', message)
        }
    })

    redis_subscriber_alert.subscribe(app_settings.darwin_alerts_publisher);

    socket.on('disconnect', function(data){
        console.log('Disconnected from alerts')
        redis_subscriber_alert.unsubscribe(app_settings.darwin_alerts_publisher)
        redis_subscriber_alert.quit()
    })
}