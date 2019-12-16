const app_settings = require('./settings');
const helper = require('./utils');
const moment = require('moment');
const redis = require('redis');

exports.stats_socket = function(socket){
    var redis_subscriber_stats = helper.get_redis_subscriber();
    var queues = {};
    var queues_name = [];
    var last_restart = 0;
    var max_memory_used = 0;

    redis_subscriber_stats.on('message', function(channel, message){
        try{
            message = JSON.parse(message);

            var last_restart_timestamp = message.starttime * 1000;

            if (last_restart_timestamp > last_restart){
                last_restart = last_restart_timestamp;

                socket.emit('last_restart', {
                    date: moment(last_restart_timestamp).format('DD/MM/YYYY HH:mm:ss')
                })

                max_memory_used = 0;
                socket.emit('max_memory_used', {
                    max: max_memory_used
                })
            }

            var date_now = moment.utc();
            var nb_seconds_since_restart = ((date_now.unix()) - (last_restart_timestamp / 1000));
            var date_str = date_now.format("DD/MM/YYYY HH:mm:ss")

            var msg = message.stat;
            if (msg.name === "resource-usage"){
                if (max_memory_used < msg.maxrss){
                    max_memory_used = msg.maxrss;
                    socket.emit('max_memory_used', {
                        max: max_memory_used
                    })
                }
            } else if (msg.origin === "core.queue" && msg.name.startsWith('ruleset_')){
                var queue_name = msg.name.replace('ruleset_', '');

                if (queues_name.indexOf(queue_name) === -1){
                    socket.emit('new_queue', {
                        name: queue_name
                    })

                    queues_name.push(queue_name);
                    queues[queue_name] = {
                        total_events: 0,
                        old_enqueued: 0,
                        old_queue_size: 0,
                        max_eps: 0,
                        date_set: [],
                    }
                }

                if (queues[queue_name].date_set.indexOf(date_str) !== -1)
                    return;

                queues[queue_name].date_set.push(date_str);

                var old_enqueued = queues[queue_name].old_enqueued;

                if (old_enqueued === 0 || msg.enqueued < old_enqueued){
                    queues[queue_name].old_enqueued = msg.enqueued;
                    queues[queue_name].old_queue_size = msg.size;
                    return;
                }

                delta_queue_size = msg.size - queues[queue_name].old_queue_size;
                queues[queue_name].old_queue_size = msg.size;

                queues[queue_name].total_events = msg.enqueued;
                var enqueued = msg.enqueued - old_enqueued;

                queues[queue_name].enqueued = enqueued;
                queues[queue_name].processed = enqueued - delta_queue_size;
                queues[queue_name].old_enqueued = msg.enqueued;

                var average = parseInt(old_enqueued / nb_seconds_since_restart);

                if (average < 0)
                    average = 0;

                queues[queue_name].average = average;
                if (enqueued > queues[queue_name].max_eps)
                    queues[queue_name].max_eps = enqueued;

                queues[queue_name].size = msg.size;
                queues[queue_name].maxqsize = msg.maxqsize;
                queues[queue_name].full = msg.full;
                queues[queue_name].date_now = date_now;

                socket.emit('message', {
                    name: queue_name,
                    data: queues[queue_name]
                });
            }
        } catch(err){
            console.log(err)
        }
    })

    redis_subscriber_stats.subscribe(app_settings.stats_publisher);

    socket.on('disconnect', function(data){
        console.log('Disconnected from stats')
        redis_subscriber_stats.unsubscribe(app_settings.stats_publisher)
        redis_subscriber_stats.quit()
    })
}