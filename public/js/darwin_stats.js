current_vue = new Vue({
    el: "#page-content",
    delimiters: ['${', '}'],
    data: {
        filters_stats: {},
        filters: {},
        filters_name: [],
        series: [],
        filters_values: {},
        series: [],
    },

    mounted(){
        var self = this;

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

        var target = document.getElementById('gauge-cpu');
        self.gauge_cpu = new Gauge(target).setOptions(opts);
        self.gauge_cpu.maxValue = 100 * nb_cpus;
        self.gauge_cpu.animationSpeed = 32;
        self.gauge_cpu.set(0);
        self.gauge_cpu.setTextField(document.getElementById("gauge-cpu-text"));

        var target = document.getElementById('gauge-mem');
        self.gauge_mem = new Gauge(target).setOptions(opts);
        self.gauge_mem.maxValue = 100;
        self.gauge_mem.animationSpeed = 32;
        self.gauge_mem.set(0);
        self.gauge_mem.setTextField(document.getElementById("gauge-mem-text"));

        var color_txt = "#000";
        if (dark)
            color_txt = "#fff";

        self.option_bar_message_received = {
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
            self.bar_message_received = echarts.init(document.getElementById('bar-received'));
        else
            self.bar_message_received = echarts.init(document.getElementById('bar-received'), echarts_theme);

        self.bar_message_received.setOption(self.option_bar_message_received);

        self.init_socket();
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
            self.match_height();

            socket.on('connect', function(){
                socket.on('new_filter', function(data){
                    var name = data.name.replace(new RegExp('_', 'g'), ' ');
                    self.filters_name.push(name);
                    self.filters[name] = self.option_bar_message_received.series.length;

                    var new_serie = {
                        name: name,
                        data: [],
                        type: 'line',
                        smooth: true,
                        symbol: 'none',
                        areaStyle: {}
                    }

                    self.option_bar_message_received.legend.data.push(name);
                    self.series.push(new_serie);
                    self.option_bar_message_received.series = self.series;
                    self.filters_values[name] = {};

                    self.bar_message_received.setOption(self.option_bar_message_received);
                    self.match_height();
                })

                socket.on('filters_stats', function(message){
                    var cpu_percent = 0;
                    var mem_percent = 0;

                    $.each(message, function(filter_name, filter_stats){
                        if (filter_stats.status !== "error"){
                            cpu_percent += filter_stats.proc_stats.cpu_percent;
                            mem_percent += filter_stats.proc_stats.memory_percent;
                        }
                    })

                    self.gauge_cpu.set(cpu_percent);
                    self.gauge_mem.set(mem_percent);
                    self.$forceUpdate();
                    self.match_height();
                })

                socket.on('stats_received', function(message){
                    var filter_name = message.name.replace(new RegExp('_', 'g'), ' ');
                    var data = message.data;

                    var date_tmp = moment().format('YYYY/MM/DD HH:mm:ss');

                    var data_chart = {
                        name: date_tmp,
                        value: [date_tmp, data.received]
                    }

                    self.filters_values[filter_name] = data;

                    self.series[self.filters[filter_name]].data.push(data_chart);

                    if (self.series[self.filters[filter_name]].data.length > 300)
                        self.series[self.filters[filter_name]].data.shift();

                    self.bar_message_received.setOption({
                        series: self.series
                    })
                })
            })
        },

        render_number(value){
            return numeral(value).format("0,0")
        },

        render_status(state){
            if (state)
                return `<label class='label label-success'>&nbsp;&nbsp;</label>&nbsp;<b>Running</b>`;
            return `<label class='label label-danger'>&nbsp;&nbsp;</label>&nbsp;<b>Not running</b>`;
        }
    }
})
