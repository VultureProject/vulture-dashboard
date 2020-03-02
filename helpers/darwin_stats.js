const app_settings = require('./settings');
const helper = require('./utils');
const moment = require('moment');
const redis = require('redis');

exports.stats_socket = function(socket){
    var redis_subscriber_stats = helper.get_redis_subscriber();
    var filters = {};
    var filters_name = [];

    redis_subscriber_stats.on('message', function(channel, message){
        try{
            message = JSON.parse(message);
            socket.emit('filters_stats', message)

            for (var filter_name in message){
                var stats = message[filter_name];

                if (filters_name.indexOf(filter_name) === -1){
                    socket.emit('new_filter', {
                        name: filter_name
                    })

                    filters_name.push(filter_name);
                    filters[filter_name] = {
                        total_received: 0,
                        old_received: 0,
                        received: 0
                    }
                }

                var old_received = filters[filter_name].old_received;
                if (old_received === 0 || stats.received < old_received){
                    filters[filter_name].old_received = stats.received;
                } else {
                    filters[filter_name].total_received = stats.received;
                    var received = stats.received - old_received;
                    filters[filter_name].received = received;
                    filters[filter_name].old_received = stats.received;
                }

                filters[filter_name].running = stats.status === "running";
                filters[filter_name].entryErrors = stats.entryErrors;
                filters[filter_name].matches = stats.matches;
                filters[filter_name].failures = stats.failures;

                socket.emit('stats_received', {
                    name: filter_name,
                    data: filters[filter_name]
                })
            }
        } catch(err){
            console.log(err)
        }
    })

    redis_subscriber_stats.subscribe(app_settings.darwin_stats_publisher);

    socket.on('disconnect', function(data){
        console.log('Disconnected from stats')
        redis_subscriber_stats.unsubscribe(app_settings.darwin_stats_publisher)
        redis_subscriber_stats.quit()
    })
}