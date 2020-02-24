
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

        add_table_alert(data){
            if (this.alerts.length === 25)
                this.alerts.pop();

            this.alerts.unshift(data);
        }
    }
})
