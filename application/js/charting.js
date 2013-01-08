function initiateGraph(){
  
    var options = {
        chart: {
            renderTo: 'chart_container',
            type: 'line',
            style: {
                margin: '0 auto'
            },
            zoomType: "xy"
        },
        credits: {
            enabled: false
        },
        exporting: {
            enabled: false
        },
        title: {
            text:null 
        },
        xAxis: {
            title: {
                enabled: false
            },
            labels: {
                formatter: function() {
                    return this.value +'s';
                }
            },
            showLastLabel: true
        },
        yAxis: {
            title: {
                text:null 
            },
            labels: {
                formatter: function() {
                    return this.value;
                }
            },
            lineWidth: 2
        },
        legend: {
            enabled: false
        },
        tooltip: {
            formatter: function() {
                return ''+this.x+', '+ this.y +'s';
            }
        },
        plotOptions: {
            spline: {
                marker: {
                    enable: false
                },
                animation: true
            }
        },
        series: [{
            data: [[0,0]]
        }]
    };

    chart = new Highcharts.Chart(options);
}

function updateChart(data){
    //split lines

    var lines = data.split('\n');
    for (line in lines){
        var items = lines[line].split(',');

        //populate array
        var point = [];

        for (item in items){
            point.push(parseFloat(items[item]));
        }
            
        chart.series[0].addPoint(point);
                
    }
}

