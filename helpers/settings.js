
var settings = {
    number_of_nodes: 100,
    redis_port: 6379,
    redis_socket: "/var/sockets/redis/redis.sock",
    redis_use_socket: true,
    redis_host: "",
    impcap_publisher: "vlt.rsyslog.impcap",
    stats_publisher: "vlt.rsyslog.stats",
    darwin_alerts_publisher: "",
    ip_filter_keys: ['net_src_ip', 'net_dst_ip'],
    int_filter_keys: ['net_src_port', 'net_dst_port', 'net_ttl']
}

module.exports = settings;