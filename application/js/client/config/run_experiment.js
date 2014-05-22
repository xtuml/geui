/*

Defines the RunExperiment configuration

Defines DataChart view class.

*/


// RunExperiment class -------//

RunExperiment.prototype = new Config();
RunExperiment.prototype.constructor = RunExperiment;
function RunExperiment(gui){
    this.initialize(gui);

    //object holding addresses to each of the views
    this.views = {
        DataChart: "TL"
    };

    //create the views
    this.chart = new DataChart(this.gui.panels[this.views["DataChart"]]);

    // add view objects in animation order
    this.view_objects.push(this.chart);

    // build header
    this.header_content = document.createElement("div");
    this.header_content.className = "app-content";

    var editor = this;

    this.title = document.createElement("div");
    this.title.className = "label";
    this.title.style.height = "55px";
    this.title.style.left = "75px";
    this.title.innerHTML = "N/A";
    this.header_content.appendChild(this.title);

    this.back = document.createElement("div");
    this.back.className = "btn";
    this.back.style.left = "0px";
    this.back_symbol = document.createElement("img");
    this.back_symbol.title = "Go back";
    this.back_symbol.className = "back-btn";
    this.back_symbol.onclick = function(){editor.go_back();};
    this.back_symbol.tabIndex = 0;
    this.back_symbol.onkeypress = function(e){if(e.keyCode == 13){editor.go_back();}};
    this.back.appendChild(this.back_symbol);
    this.header_content.appendChild(this.back);

}

//prepare the config before entry
RunExperiment.prototype.prepare = function(args){
    this.updatePositions();
    
    // add header
    this.gui.addHeader(this.header_content);

    //add the elements
    this.gui.panels[this.views["DataChart"]].addView(this.chart);

    // WAVEFORM CHART reset//
    //initate the chart
    if (this.chart.chart != null){
        this.chart.chart.destroy();
    }
    this.chart.initiateChart();
    this.pending_points = [];

    // if this is a new load
    if (args.length > 0) {
        // update header
        this.title.innerHTML = args[0];
        this.name = args[0];
    }


    //enable signals applying to this config
    //disable all
    for (signal in httpcomm.signals){
        httpcomm.signals[signal].enabled = false;
    }
    //enable the ones needed
    httpcomm.signals["data"].enabled = true;

}

//-----------------------------//



// DataChart class --------//

function DataChart(panel){
    //attributes that all views have:
    this.panel = panel;
    this.element = document.createElement("div");
    this.element.className = "app-cubby";
    this.content_pane = document.createElement("div");
    this.content_pane.className = "app-content";
    this.element.appendChild(this.content_pane);
    //-----------------------------//

    this.chart = null;
    this.pending_points = []

    this.height = "100%";
    this.width = "100%"
    this.x = "0px";
    this.y = "0px";
    this.panel.updateSize(this.height, this.width);
    this.content_pane.id = "chart_container";           //if want to have multiple waveforms loaded, 
}

//starts up the chart
DataChart.prototype.initiateChart = function(){
    //table options
    var options = {
        chart: {
            animation: false,
            renderTo: "chart_container",
            type: "line",
            style: {
                margin: "0 auto"
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
                    return this.value +"s";
                }
            },
            showLastLabel: true,
            //max: 0.9,
            //min: -0.1
            /*/
            max: 50000,
            min: -50000 
            /*/
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
            //max: 0.0000157839,
            //min: -0.0000255252
            /*/
            max: 2500000000,
            min: 0
            /*/
        },
        legend: {
            enabled: false
        },
        tooltip: {
            enabled: false
        },
        series: [{
            animation: false,
            color: "#07F862",
            marker: {
                enabled: false,
                symbol: "circle",
                states: {
                    select: {
                        fillColor: "red"
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
DataChart.prototype.updateChart = function(){

    var points_graphed = 0;

    var poll_rate = 5;              //rate of polling data from server
    var rate = 25;                  //frames per second refresh time

    var packet = [];                //current packet of points
    var n = rate / poll_rate;       //number of iterations for each poll

    var num_points = 0;             //number of points to graph in each iteration
    var counter = n;

    var chart = this.chart;         //reference to chart
    var pending_points = this.pending_points;   //reference to pending_points


    updating = setInterval(function(){
        
        if (counter == n){
            if (packet.length == 0){
                if (pending_points.length > 0){
                    //grab new packet
                    packet = pending_points.shift();
                    //check stop code
                    num_points = Math.ceil(packet.length / n);
                    counter = 0;
                    if (packet == "stop"){
                        console.log(points_graphed);
                        clearInterval(updating);
                    }
                }
                else{
                    packet = [];
                    console.log("no points");
                }
            }
            else{
                alert("this is a problem");
            }
        }
        else{
            //calculate points to graph in this iteration
            if (num_points < packet.length){
                var to = num_points;
            }
            else{
                var to = packet.length;
            }
            var points = packet.slice(0, to);

            //graph the points
            for (p in points){
                chart.series[0].addPoint(points[p], false);
                points_graphed ++;
            }
            chart.redraw();

            //update packet
            packet = packet.slice(to, packet.length);

            //increment counter
            counter ++;
        }
    }, 1000 / rate);

}

//clears chart
DataChart.prototype.clearChart = function(points){
    this.chart.series[0].setData([]);
}

//-----------------------------//
