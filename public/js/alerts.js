
current_vue = new Vue({
    el: '#vue-page',
    delimiters: ['${', '}'],
    data: {
        alerts: []
    },

    mounted(){
        this.init_socket();
    },

    methods: {
        init_socket(){
            var self = this;

            socket.on('connect', function(){
                socket.on('message.alerts', function(data){
                    self.add_table_alert(data);
                })
            })
        },

        reinitialize(){
            this.alerts = [];
        },

        format_date(date){
            return moment(date).format('DD/MM/YYYY HH:mm:ss')
        },

        format_ip(key, data){
            var label = data[key];
            var reputation = false;

            if (key === "net_src_ip"){
                if (data.ctx_src_reputation)
                    reputation = data.ctx_src_reputation;
            } else if (key === "net_dst_ip"){
                if (data.ctx_dst_reputation)
                    reputation = data.ctx_dst_reputation;
            }

            if (reputation)
                label += "&nbsp;&nbsp;<span class='label label-danger pull-right'>" + reputation + "</label>"

            return label;
        },

        add_table_alert(data){
            if (this.alerts.length === 25)
                this.alerts.pop();

            this.alerts.unshift(data);
        }
    }
})
