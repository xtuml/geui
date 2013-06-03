function initiateGraph(){
  
    //table options
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
            line: {
                marker: {
                    enable: false
                },
                animation: false 
            }
        },
        series: [{
            color: '#FF0000',
            data: []
        }]
    };

    chart = new Highcharts.Chart(options);
}

//updates chart points
function updateChart(data){
    //deserialize data
    var data2 = $.deparam(data);
   
    //delete points 
    var delete_num = parseInt(data2["delete"]);
    for (var c = 0; c < delete_num*2; c++){
        chart.series[0].data[chart.series[0].data.length - 1].remove() 
    }

    //add points
    if (data2["add"] != 'None'){
        var lines = data2["add"].split('\n');
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

    //update points
    if (data2["update"] != 'None'){
        var lines2 = data2["update"].split('\n');
        for (line in lines2){
            var items = lines2[line].split(',');

            //populate array
            var point = [parseFloat(items[1]),parseFloat(items[2])];
            var index = parseInt(items[0]);
                
            chart.series[0].data[index].update(point);
                    
        }
    }
    

}
