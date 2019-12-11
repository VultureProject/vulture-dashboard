var echarts_theme = {
    color: ["#05509e","#0c8fcf","#8bc34a",
    "#cddc39","#ffc107","#f18705",
    "#e95014","#d6171a","#e9538e",
    "#ce0d80","#bc61a2","#662060"],

    backgroundColor: 'rgba(0,0,0,0)',
    title: {
        show: false
    },
    legend: {
        orient: 'horizontal',
        x: 'center',
        y: 'top',
        backgroundColor: 'rgba(255,255,255,0)',
        borderColor: '#212529',
        borderWidth: 0,
        itemGap: 10,
        itemWidth: 15,
        itemHeight: 12,
        textStyle: {
            color: '#212529'
        }
    },
    dataRange: {
        show: true,
        orient: 'vertical',
        x: 'left',
        y: 'bottom',
        backgroundColor: 'rgba(255,255,255,0)',
        borderColor: '#212529',
        borderWidth: 0,
        padding: 5,
        itemGap: 10,
        itemWidth: 20,
        itemHeight: 14,
        splitNumber: 5,
        color:'#212529',
        textStyle: {
            color: '#212529'
        }
    },
    toolbox: {
        show: false,
        orient: 'horizontal',
        x: 'right',
        y: 'top',
        color : ['#212529','#22bb22','#4b0082','#d2691e'],
        backgroundColor: 'rgba(255,255,255,0)',
        borderColor: '#212529',
        borderWidth: 0,
        padding: 5,
        itemGap: 10,
        itemSize: 16,
        featureImageIcon : {},
        featureTitle : {
            mark : 'Marquer',
            markUndo : 'Retour',
            markClear : 'Clear',
            dataZoom : 'Zoom',
            dataZoomReset : 'Reset',
            dataView : 'Donnees',
            lineChart : 'Lignes',
            barChart : 'Batons',
            restore : 'Restaurer',
            saveAsImage : 'Images'
        }
    },
    tooltip: {
        trigger: 'item',
        showDelay: 20,
        hideDelay: 100,
        transitionDuration : 0.4,
        backgroundColor: '#212529',
        borderColor: '#212529',
        borderRadius: 4,
        borderWidth: 0,
        padding: 5,
        axisPointer : {
            type : 'line',
            lineStyle : {
                color: '#48b',
                width: 0,
                type: 'solid'
            },
            shadowStyle : {
                width: 'auto',
                color: '#212529'
            }
        },
        textStyle: {
            color: '#fff'
        }
    },
    dataZoom: {
        orient: 'horizontal',
        backgroundColor: 'rgba(0,0,0,0)',
        dataBackgroundColor: '#212529',
        fillerColor: 'rgba(144,197,237,0.2)',
        handleColor: 'rgba(70,130,180,0.8)'
    },
    grid: {
        top: '60',
        bottom: '60',
        left: '10%',
        right: '10%',
        backgroundColor: 'rgba(255,255,255,0)',
        borderWidth: 0.2,
        borderColor: 'rgba(0,0,0,0.2)'
    },
    xAxis: {
        boundaryGap: false
    },
    yAxis: {
        boundaryGap: false
    },
    categoryAxis: {
        position: 'bottom',
        nameLocation: 'start',
        axisLine: {
            show: true,
            lineStyle: {
                color: '#212529',
                width: 1,
                type: 'solid'
            },
            textStyle: {
                color: '#212529'
            }
        },
        axisTick: {
            show: false,
            interval: 'auto',
            inside : false,
            length :5,
            lineStyle: {
                color: '#212529',
                width: 1
            }
        },
        axisLabel: {
            show: true,
            interval: 'auto',
            rotate: 0,
            margin: 10,
            formatter: function (label_legend_x) {
                if (label_legend_x.length > 15) {
                    label_legend_x = label_legend_x.slice(0, 15) + "...";
                }
                return label_legend_x
            },
            textStyle: {
                color: '#212529'
            }
        },
        splitLine: {
            show: false,
            lineStyle: {
                color: ['#212529'],
                width: 1,
                type: 'solid'
            }
        },
        splitArea: {
            show: false,
            areaStyle: {
                color: ['rgba(250,250,250,0.3)','rgba(200,200,200,0.3)']
            }
        }
    },
    valueAxis: {
        position: 'left',
        nameLocation: 'end',
        boundaryGap: [0, 0],
        splitNumber: 5,
        axisLine: {
            show: true,
            lineStyle: {
                color: '#212529',
                width: 1,
                type: 'solid'
            }
        },
        axisTick: {
            show: true,
            inside : false,
            length :5,
            lineStyle: {
                color: '#212529',
                width: 0.5
            }
        },
        axisLabel: {
            show: true,
            rotate: 0,
            margin: 20,
            type: null,
            clickable: false,
            textStyle: {
                color: '#212529',
                baseline: 'middle'
            }
        },
        splitLine: {
            show: true,
            lineStyle: {
                color: 'rgba(0,0,0,0.1)',
                width: 0.5,
                type: 'solid'
            }
        },
        splitArea: {
            show: false,
            areaStyle: {
                color: ['rgba(250,250,250,0.3)','rgba(200,200,200,0.3)']
            }
        }
    },
    bar: {
        barMinHeight: 0,
        barGap: '30%',
        barCategoryGap : '20%',
        itemStyle: {
            normal: {
                barBorderColor: '#212529',
                barBorderRadius: 0,
                barBorderWidth: 0,
                label: {
                    show: false
                }
            },
            emphasis: {
                barBorderColor: 'rgba(0,0,0,0.2)',
                barBorderRadius: 0,
                barBorderWidth: 0,
                label: {
                    show: true
                }
            }
        }
    },
    line: {
        itemStyle: {
            normal: {
                label: {
                    show: false
                },
                lineStyle: {
                    width: 2,
                    type: 'solid',
                    shadowColor : 'rgba(0,0,0,0)',
                    shadowBlur: 5,
                    shadowOffsetX: 3,
                    shadowOffsetY: 3
                }
            },
            emphasis: {
                label: {
                    show: false
                }
            }
        }
    },
    radar : {
        itemStyle: {
            normal: {
                label: {
                    show: false
                },
                lineStyle: {
                    width: 2,
                    type: 'solid'
                }
            },
            emphasis: {
                label: {
                    show: false
                }
            }
        },
        symbolSize: 2
    },
    funnel: {
        itemStyle: {
            normal: {
                borderWidth: 0
            },
            emphasis: {
                borderWidth: 0
            }
        }
    },
    textStyle: {
        decoration: 'none',
        fontFamily: 'Lato, Verdana, sans-serif',
        fontSize: 12,
        fontStyle: 'normal',
        fontWeight: 'normal'
    },
    symbolList : [
      'circle', 'rectangle', 'triangle', 'diamond',
      'emptyCircle', 'emptyRectangle', 'emptyTriangle', 'emptyDiamond'
    ],
    loadingText : 'Loading...',
    nameConnector: ' & ',
    valueConnector: ' : '
};
