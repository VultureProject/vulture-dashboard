var network;
var vis_tmp_nodes = new vis.DataSet();
var vis_tmp_edges = new vis.DataSet();

var clusterIndex = 0;
var clusters = [];
var lastClusterZoomLevel = 0;
var clusterFactor = 0.9;

var color_txt = "#000";
if (dark)
    color_txt = "#fff";

function init_carto(){
    var container = document.getElementById('chart-carto');

    var data = {
        nodes: vis_tmp_nodes,
        edges: vis_tmp_edges
    }

    var options = {
        nodes: {
            shape: 'dot',
            size: 20,
            font: {
                size: 15,
                color: color_txt
            },
            borderWidth: 2
        },
        edges: {
            width: 2,
            smooth: {
                type: 'continuous'
            }
        },
        groups: {
            private: {
                size: 10,
                shape: "triangle",
                color: "#7BE141"
            },
            public: {
                size: 10,
                shape: "dot",
                color: "#FFA807"
            }
        }
    };

    network = new vis.Network(container, data, options);

    network.on("selectNode", function(params) {
        if (params.nodes.length == 1) {
            if (network.isCluster(params.nodes[0]) == true) {
                network.openCluster(params.nodes[0]);
            }
        }
    });
}

function delete_node(data){
    vis_tmp_nodes.remove(data.ip);
}

function cluster_network(){
    var clusterOptionsByData = {
        joinCondition:function(childOptions) {
            return childOptions.cid == 1;
        },
        clusterNodeProperties: {
            id: 'cidCluster',
            borderWidth: 3,
        }
    };

    network.cluster(clusterOptionsByData);
}

function append_node(data){
    var color = false;
    var group = "public";


    if (isPrivateIP(data.ip))
        group = "private";

    if (data.reputation)
        color = "#F55145";

    var tmp = {
        id: data.ip,
        label: data.ip,
        group: group
    }

    if (color)
        tmp.color = color;

    if (data.cluster)
        tmp.cid = data.cluster;

    try{
        vis_tmp_nodes.add(tmp)
    } catch(err){}

    var group_by = $('#group_by').val();
    if (group_by)
        cluster_network();
}

function append_edge(data){
    vis_tmp_edges.add({
        from: data.net_src_ip,
        to: data.net_dst_ip,
        length: 100,
        label: data.net_dst_port
    })
}


current_vue = new Vue({
    el: '#vue-page',
    delimiters: ['${', '}'],
    data: {},

    mounted(){
        init_carto();
        this.init_socket();  
    },

    methods: {
        init_socket(){
            var self = this;

            socket.on('connect', function(){
                socket.on('message.node', function(data){
                    append_node(data);
                })

                socket.on('message.edge', function(data){
                    append_edge(data)
                })

                socket.on('message.del_node', function(data){
                    delete_node(data);
                })

                socket.on('message.tags', function(data){
                    config_vue.tags = data.tags;
                })
            })
        },

        reinitialize(){
            vis_tmp_nodes = new vis.DataSet();
            vis_tmp_edges = new vis.DataSet();
            network.destroy();

            socket.emit('reinit', {})
            init_carto();
        }
    }
})

$(function(){
    $('#number_of_nodes').on('focus', function(){
        $('#help_text_number_of_nodes').show();
    })

    $('#number_of_nodes').on('blur', function(){
        $('#help_text_number_of_nodes').hide();
    })
})