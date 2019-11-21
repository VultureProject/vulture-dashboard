
var color_txt = "#fff";
var area_color = "#344146";
if (dark){
    area_color = "#F47708";
    color_txt = "#000";
}

current_vue = new Vue({
    el: "#vue-page",
    delimiters: ['${', '}'],
    data: {
        chart_map: null,
        markpoints: []
    },

    mounted(){
        var self = this;

        var option_map = {
            backgroundColor: 'transparent',
            title : {
                show: false
            },
            geo: {
                name: "MAP",
                type: 'map',
                map: 'world',
                roam: true,
                label: {
                    emphasis: {
                        show: false,
                        color: color_txt
                    }
                },
                itemStyle: {
                    emphasis: {
                        areaColor: area_color
                    }
                },
                left: 50,
                right: 50,
                top: 50,
                bottom: 50
            },
            series : [{
                type: 'scatter',
                coordinateSystem: 'geo',
                data: []
            }]
        }

        self.chart_map = echarts.init(document.getElementById('chart-map'));
        self.chart_map.setOption(option_map, true)

        self.init_socket();

        window.onresize = function(){
            self.chart_map.resize();
        }
    },

    methods: {
        init_socket(){
            var self = this;

            socket.on('connect', function(){
                socket.on('message.node', function(data){
                    self.add_node_map(data);
                })
            })
        },

        reinitialize(){
            socket.emit('reinit', {});
            this.markpoints = [];
            this.chart_map.setOption({
                series: {
                    data: this.markpoints
                }
            })
        },

        add_node_map(data){
            var color = "#7BE141";
            var shape = "circle";

            if (data.reputation){
                shape = "triangle";
                color = "#F55145";
            }

            if (this.markpoints.length > 300)
                this.markpoints.shift();

            if (!data.geoip)
                return;

            this.markpoints.push({
                name: data.ip,
                itemStyle: {
                    shape: shape,
                    color: color
                },
                value: [
                    parseFloat(data.geoip.longitude),
                    parseFloat(data.geoip.latitude),
                    1
                ]
            })

            if (this.markpoints.length > 1000)
                this.markpoints.shift()

            this.chart_map.setOption({
                series: {
                    data: this.markpoints
                }
            })
        }
    }
})
