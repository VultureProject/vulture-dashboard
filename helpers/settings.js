const fs = require('fs');

const ca_file = fs.readFileSync("/var/db/pki/ca.pem");
const key_file = fs.readFileSync("/var/db/pki/node.pem");
const hostname = fs.readFileSync('/etc/host-hostname').toString().trim();

var settings = {
    hostname: hostname,
    websocket_path: "/socket.io",
	log_level: "info",
    number_of_nodes: 100,
    redis_socket: "/var/sockets/redis/redis.sock",
    redis_use_socket: true,
    redis_host: "",
    redis_port: 6379,
    impcap_publisher: "vlt.rsyslog.impcap",
    stats_publisher: "vlt.rsyslog.stats",
    darwin_alerts_publisher: "",
    ip_filter_keys: ['net_src_ip', 'net_dst_ip'],
    int_filter_keys: ['net_src_port', 'net_dst_port', 'net_ttl'],
    mongo_connection: {
        url: "mongodb://" + hostname + ":9091/vulture",
        options: {
            ssl: true,
            replicaSet: "vulture",
            connectTimeoutMS: 10,
            socketTimeoutMS: 10,
            useUnifiedTopology: true,
            useNewUrlParser: true,
            sslValidate: true,
            sslCert: key_file,
            sslKey: key_file,
            sslCA: ca_file
        }
    }
}

module.exports = settings;