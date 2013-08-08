/*

Defines the RunExperiment configuration

Defines DataChart view class.

*/


// RunExperiment class -------//

function RunExperiment(gui){
    //attibutes every config has
    this.gui = gui;

    this.enter_time = 1.45; //time it takes to enter in seconds
    this.exit_time = 0.9;  //time it takes to exit in seconds

    //object holding addresses to each of the views
    this.views = {
        DataChart: 'TL'
    };

    //create the views
    this.chart = new DataChart(this.gui.panels[this.views['DataChart']]);

    //setup the animation
    this.chart.element.style.left = 'calc(-100% - 10px)';
    this.chart.element.style.left = '-webkit-calc(-100% - 10px)';

}

//prepare the config before entry
RunExperiment.prototype.prepare = function(args){
    //remove the old elements
    this.gui.clearPanels();
    
    //add the elements
    this.gui.panels[this.views['DataChart']].addView(this.chart);

    //update size and position
    this.chart.panel.updateSize(this.chart.height, this.chart.width);
    this.chart.panel.updatePosition(this.chart.x, this.chart.y);

    // WAVEFORM CHART reset//
    //initate the chart
    if (this.chart.chart != null){
        this.chart.chart.destroy();
    }
    this.chart.initiateChart();

    //start the data polling
    httpcomm.receive_data();

    //enable signals applying to this config
    //disable all
    for (signal in httpcomm.signals){
        httpcomm.signals[signal].enabled = false;
    }
    //enable the ones needed
    httpcomm.signals['data'].enabled = true;

}

//fly in animation
RunExperiment.prototype.enter = function(delay){

    //run animation
    this.chart.element.className = 'app-cubby fly';
    $(this.chart.element).css('transition-delay', (delay + 0.5) + 's');
    $(this.chart.element).css('-webkit-transition-delay', (delay + 0.5) + 's');
    this.chart.element.style.left = '5px';

}

//fly out animation
RunExperiment.prototype.exit = function(delay){

    //run animation
    this.chart.element.className = 'app-cubby fly';
    $(this.chart.element).css('transition-delay', delay + 's');
    $(this.chart.element).css('-webkit-transition-delay', delay + 's');
    this.chart.element.style.left = 'calc(-100% - 10px)';
    this.chart.element.style.left = '-webkit-calc(-100% - 10px)';

}

//-----------------------------//



// DataChart class --------//

function DataChart(panel){
    //attributes that all views have:
    this.panel = panel;
    this.element = document.createElement('div');
    this.element.className = 'app-cubby';
    this.content_pane = document.createElement('div');
    this.content_pane.className = 'app-content';
    this.element.appendChild(this.content_pane);
    //-----------------------------//

    this.chart = null;

    this.height = '100%';
    this.width = '100%'
    this.x = '0px';
    this.y = '0px';
    this.panel.updateSize(this.height, this.width);
    this.content_pane.id = 'chart_container';           //if want to have multiple waveforms loaded, 
}

//starts up the chart
DataChart.prototype.initiateChart = function(){
    //table options
    var options = {
        chart: {
            animation: {
                duration: 200
            },
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
            showLastLabel: true,
            max: 0.8,
            min: 0
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
            lineWidth: 2,
            max: 0.0000157839,
            min: -0.0000255252
        },
        legend: {
            enabled: false
        },
        tooltip: {
            enabled: false
        },
        series: [{
            animation: {
                duration: 200
            },
            color: '#07F862',
            marker: {
                enabled: false,
                symbol: 'circle',
                states: {
                    select: {
                        fillColor: 'red'
                    }
                }
            },
            states: {
                hover: {
                    enabled: false
                }
            },
            data: []
        }]
    };

    this.chart = new Highcharts.Chart(options);
}

//updates chart points
DataChart.prototype.updateChart = function(points){

    var rate = 250 / points.length;
   
    //add points
    //
    if (points != null){
        for (p in points){
            this.chart.series[0].addPoint(points[p], false);
        }
        this.chart.redraw();
    }

}

//clears chart
DataChart.prototype.clearChart = function(points){
    this.chart.series[0].setData([]);
}

//-----------------------------//
