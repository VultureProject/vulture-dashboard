var socket = null;
var started = false;


var config_vue = new Vue({
    el: '#config',
    delimiters: ['${', '}'],
    data: {
        socket: null,
        play: true,
        state: "Pause</i>",
        config: {
            max_rows: 30
        }
    },

    mounted(){
        this.start_dashboard()
    },

    methods: {

        render_class_playpause(){
            console.log("here")
            if (this.play)
                return "btn-label fa fa-pause"
            else
                return "btn-label fa fa-play"
        },

        start_dashboard(){
            var self = this;
            self.socket = io('/')

            self.socket.on('connect', function(){
                console.log('connected')
                self.socket.emit('config', self.config)

                self.socket.on('message.node', function(data){
                    append_node(data);
                })

                self.socket.on('message.edge', function(data){
                    append_edge(data);
                })

                self.socket.on('message.del_node', function(data){
                    delete_node(data);
                })
            })
        },

        stop_dashboard(){
            var self = this;
            if (self.socket)
                self.socket.disconnect();
        },

        update_config(e){
            e.preventDefault();

            this.stop_dashboard();
            this.start_dashboard()
        },

        playpause(){
            if (this.play){
                this.stop_dashboard();
                this.play = false;
                this.state = "Play";
            } else {
                this.start_dashboard();
                this.play = true;
                this.state = "Pause"
            }
        }
    }
})


$(function(){
    /*$(window).unbind('blur');
    $(window).blur(function(){
        config_vue.stop_dashboard();
    });

    $(window).unbind('focus');
    $(window).focus(function(){
        config_vue.start_dashboard();
    });*/

    init_carto();
})