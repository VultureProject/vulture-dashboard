const app_settings = require('./settings');
const helper = require('./utils')

exports.carto_socket = function(socket){
    var redis_subscriber_impcap = helper.get_redis_subscriber();

    var nodes = [];
    var edges = [];
    var tags = [""];
    var nb_tags = 0;

    socket.on('reinit', function(message){
        nodes = [];
        edges = [];
    })

    redis_subscriber_impcap.on('message', function(channel, message){
        var message = JSON.parse(message);

        var src_reputation = message.ctx_src_reputation;
        var dst_reputation = message.ctx_dst_reputation;
        var src_tags = message.ctx_src_tags;
        var dst_tags = message.ctx_dst_tags;

        if (helper.apply_filter(message, socket.handshake.session.filter)){
            var src_ip = message.net_src_ip;
            var dst_ip = message.net_dst_ip;
            var port = message.net_dst_port;

            if (src_tags !== ""){
                src_tags = src_tags.split(',')
                tags.push.apply(tags, src_tags);
                tags = Array.from(new Set(tags));
            } else {
                src_tags = null;
            }

            if (dst_tags !== ""){
                dst_tags = dst_tags.split(',')
                tags.push.apply(tags, dst_tags);
                tags = Array.from(new Set(tags));
            } else {
                dst_tags = null;
            }

            if (nb_tags !== tags.length){
                nb_tags = tags.length;
                socket.emit('message.tags', {
                    tags: tags
                })
            }

            if (nodes.indexOf(src_ip) === -1){
                var cluster = helper.apply_groupby(src_tags, socket.handshake.session.group_by);

                nodes.push(src_ip);
                socket.emit('message.node', {
                    ip: src_ip,
                    tags: src_tags,
                    cluster: cluster,
                    reputation: src_reputation
                })
            }

            if (nodes.indexOf(dst_ip) === -1){
                var cluster = helper.apply_groupby(dst_tags, socket.handshake.session.group_by);

                nodes.push(dst_ip);
                socket.emit('message.node', {
                    ip: dst_ip,
                    tags: dst_tags,
                    cluster: cluster,
                    reputation: dst_reputation
                })
            }

            var tmp1 = src_ip + "|" + dst_ip;
            var tmp2 = dst_ip + "|" + src_ip;

            if (edges.indexOf(tmp1) === -1 && edges.indexOf(tmp2) === -1){
                edges.push(tmp1);
                edges.push(tmp2);
                socket.emit('message.edge', message);
            }

            var number_of_nodes = app_settings.number_of_nodes;
            if (socket.handshake.session.config_carto)
                number_of_nodes = socket.handshake.session.config_carto.number_of_nodes;

            if (nodes.length >= number_of_nodes){
                var n = nodes.length - number_of_nodes;

                for (var i=0; i<=n; i++){
                    socket.emit('message.del_node', {
                        ip: nodes[i]
                    })
                }

                nodes.splice(0, n);
            }
        }

    })

    redis_subscriber_impcap.subscribe(app_settings.impcap_publisher);

    socket.on('disconnect', function(data){
        redis_subscriber_impcap.unsubscribe(app_settings.impcap_publisher)
    })
}