current_vue = new Vue({
    el: "#page-content",
    delimiters: ['${', '}'],
    data: {
        queues: {},
        series: [],
        queues_values: {},
        bar_eps: null,
        queues_name: [],
        last_restart: null
    },

    mounted(){
        var self = this;

        var color_txt = "#000";
        if (dark)
            color_txt = "#fff";

        self.option_bar_eps = {
            legend: {
                data: [],
                textStyle: {
                    color: color_txt
                }
            },
            tooltip: {
                trigger: 'axis',
                formatter: function (params) {
                    params = params[0];
                    var date = new moment(params.name, "YYYY/MM/DD HH:mm:ss").format('DD/MM/YYYY HH:mm:ss');
                    return date + ' : ' + params.value[1];
                },
                axisPointer: {
                    animation: false
                }
            },
            xAxis: {
                type: 'time',
                boundaryGap: false,
                splitLine: {
                    show: false
                },
                axisLabel: {
                    fontSize: 15,
                    color: color_txt
                }
            },
            yAxis: {
                type: 'value',
                splitLine: {
                    show: false
                },
                axisLabel: {
                    fontSize: 15,
                    color: color_txt
                }
            },
            grid: {
                left: '2%',
                right: '2%',
                bottom: '0%',
                containLabel: true
            },
            series: []
        }

        if (dark)
            self.bar_eps = echarts.init(document.getElementById('bar-eps'));
        else
            self.bar_eps = echarts.init(document.getElementById('bar-eps'), echarts_theme);

        self.bar_eps.setOption(self.option_bar_eps);
        self.init_socket();

        var opts = {
            lines: 10,
            angle: 0,
            lineWidth: 0.41,
            pointer: {
                length: 0.75,
                strokeWidth: 0.035,
                color: 'rgba(0, 0, 0, 0.38)'
            },
            limitMax: 'true',
            colorStart: '#FFB300',
            colorStop: '#FFB300',
            strokeColor: '#FFB300',
            generateGradient: true
        };

        var target = document.getElementById('gauge-ram');
        self.gauge = new Gauge(target).setOptions(opts);
        self.gauge.maxValue = 100;
        self.gauge.animationSpeed = 32;
        self.gauge.set(0);
        self.gauge.setTextField(document.getElementById("gauge-ram-text"));

        window.onresize = function(){
            self.bar_eps.resize();
        }
    },

    methods: {
        match_height(){
            setTimeout(function(){
                $('.match-height').each(function() {
                    $(this).find('.panel').matchHeight({
                        byRow: true
                    });
                });
            }, 200)
        },

        init_socket(){
            var self = this;

            socket.on('connect', function(){
                socket.on('last_restart', function(data){
                    self.last_restart = data.date;
                    self.match_height();
                })

                socket.on('max_memory_used', function(data){
                    var max_memory_used = data.max;
                    var memory_used = (max_memory_used / total_memory) * 100;
                    self.gauge.set(memory_used);
                })

                socket.on('new_queue', function(data){
                    var name = data.name.replace(new RegExp('_', 'g'), ' ');
                    self.queues_name.push(name);
                    self.queues[name] = self.option_bar_eps.series.length;

                    var new_serie = {
                        name: name,
                        data: [],
                        type: 'line',
                        smooth: true,
                        symbol: 'none',
                        areaStyle: {}
                    }

                    self.option_bar_eps.legend.data.push(name);
                    self.series.push(new_serie);
                    self.option_bar_eps.series = self.series;
                    self.queues_values[name] = {};

                    self.bar_eps.setOption(self.option_bar_eps);
                    self.match_height();
                })

                socket.on('message', function(message){
                    var queue_name = message.name.replace(new RegExp('_', 'g'), ' ');
                    var data = message.data;

                    var date_tmp = moment(data.date_now).format("YYYY/MM/DD HH:mm:ss")

                    var data_chart = {
                        name: date_tmp,
                        value: [date_tmp, data.enqueued]
                    }

                    self.queues_values[queue_name] = data;
                    self.series[self.queues[queue_name]].data.push(data_chart)

                    if (self.series[self.queues[queue_name]].data.length > 300)
                        self.series[self.queues[queue_name]].data.shift();

                    self.bar_eps.setOption({
                        series: self.series
                    })

                    self.$forceUpdate();
                    self.match_height();
                })
            })
        },

        render_number(value){
            return numeral(value).format("0,0")
        }
    }
})
