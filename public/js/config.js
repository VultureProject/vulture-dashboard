function notify(type, title, message){
    PNotify.closeAll();

    PNotify.alert({
        icon: true,
        text: message,
        title: title,
        type: type
    });
}


$(function(){
    $('#playpause').on('click', function(){
        var state = $(this).data('play');

        if (state){
            // Pausing
            socket.disconnect();
            $(this).data('play', false);
            $(this).html('<i class="fa fa-play"></i>&nbsp;&nbsp;PLAY')
        } else {
            socket.open();
            $(this).data('play', true);
            $(this).html('<i class="fa fa-pause"></i>&nbsp;&nbsp;PAUSE')
        }
    })

    if ($('#aside-container').length === 1){

        socket.on('config', function(message){
            if (message.status)
                current_vue.reinitialize()
        })

        config_vue = new Vue({
            el: "#aside-container",
            delimiters: ['${', '}'],
            data: {
                tags: []
            },

            mounted(){
                this.construct_sql_query();
                this.init_tags();
            },
            methods: {
                construct_sql_query(){
                    var tags = $('#tags-filter').val().split(',');
                    var selected_filter = $('#selected_filter').val();

                    if (!selected_filter){
                        $('#sql').html("");
                        $('#sql-query-div').hide();
                        return;
                    }

                    $('#sql-query-div').show();
                    var sql = selected_filter + " IN (" + tags.join(', ') + ")";
                    $('#sql').html(sql);
                },

                init_tags(){
                    $('#tags-filter').tagEditor({
                        forceLowercase: false,
                        placeholder: ["192.168.1.0", "172.16.1.0/24"]
                    });
                },

                render_selected(tag){
                    if (tag === selected_tag)
                        return "selected";
                    return "";
                },

                reinit_config(){
                    var self = this;

                    $.post(
                        '/config/cancel/',
                        null,

                        function(response){
                            notify('success', "Success", "Configuration reinitialized");
                            $('#tags-filter').tagEditor('destroy');
                            $('#tags-filter').val('');

                            selected_tag = "";
                            self.init_tags();
                            $('#number_of_nodes').val(number_of_nodes);

                            $('#selected_filter').val('');
                            $('#group_by').val('');

                            socket.emit('config.cancel', {})

                            self.construct_sql_query();
                            current_vue.reinitialize();
                        }
                    )
                },

                apply_config(e){
                    PNotify.closeAll();

                    var self = this;
                    var tags = $('#tags-filter').val();
                    var selected_filter = $('#selected_filter').val();
                    var number_of_nodes = null;

                    if ($('#number_of_nodes').length)
                        number_of_nodes = parseInt($('#number_of_nodes').val());

                    var group_by = null;
                    if ($('#group_by').length){
                        group_by = $('#group_by').val();
                        selected_tag = group_by;
                    }

                    if (selected_filter && tags === ""){
                        notify('error', "Invalid config", "Please define a value to filter on");
                        return;
                    }

                    tags = tags.split(',');
                    data = {
                        number_of_nodes: number_of_nodes,
                        key_filter: selected_filter,
                        value_filter: JSON.stringify(tags),
                        group_by: group_by
                    }

                    $.post(
                        '/config/',
                        data,

                        function(response){
                            if (!response.status){
                                notify('error', 'Invalid configuration', response.error);
                                return;
                            }

                            $("body").click();
                            self.construct_sql_query();
                            notify('success', 'Success', 'Configuration applied');
                            socket.emit('config', data);
                        }
                    )
                }
            }
        })
    }
})