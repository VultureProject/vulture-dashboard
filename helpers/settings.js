
var settings = {
	log_level: "dev",
    redis_port: 6379,
    number_of_nodes: 100,
    redis_socket: "/var/sockets/redis/redis.sock",
    redis_use_socket: false,
    redis_host: "10.59.10.250cd ..",
    impcap_publisher: "vlt.rsyslog.impcap",
    stats_publisher: "vlt.rsyslog.stats",
    darwin_alerts_publisher: "",
    ip_filter_keys: ['net_src_ip', 'net_dst_ip'],
    int_filter_keys: ['net_src_port', 'net_dst_port', 'net_ttl']
}

module.exports = settings;