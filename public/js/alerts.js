
current_vue = new Vue({
    el: '#vue-page',
    delimiters: ['${', '}'],
    data: {
        logs: []
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
            this.logs = [];
        },

        format_date(date){
            return moment(date).format('DD/MM/YYYY HH:mm:ss')
        },

        add_table_alert(data){
            if (this.logs.length === 25)
                this.logs.pop();

            this.logs.unshift(data);
        }
    }
})
