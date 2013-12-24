/*

Defines the CyclicVoltammetry configuration

Defines WaveformPreview, CVParameters,  
ExperimentParameters, CVTemplates,
SmallStatus, and ControlButtons view classes.

*/


// CyclicVoltammetry class ----//

CyclicVoltammetry.prototype = new Config();
CyclicVoltammetry.prototype.constructor = CyclicVoltammetry;
function CyclicVoltammetry(gui){
    this.initialize(gui);

    //object holding addresses to each of the views
    this.views = {
        WaveformChart: "TL",
        CVParameters: "TR",
        ExperimentParameters: "ML",
        CVTemplates: "MR",
        SmallStatus: "BL",
        ControlButtons: "BR"
    };

    this.chart = new WaveformPreview(this.gui.panels[this.views["WaveformChart"]]);
    this.cv_parameters = new CVParameters(this.gui.panels[this.views["CVParameters"]]);
    this.exp_parameters = new ExperimentParameters(this.gui.panels[this.views["ExperimentParameters"]]);
    this.templates = new CVTemplates(this.gui.panels[this.views["CVTemplates"]]);
    this.inst_status = new SmallStatus(this.gui.panels[this.views["SmallStatus"]]);
    this.buttons = new ControlButtons(this.gui.panels[this.views["ControlButtons"]]);

    // add view objects in animation order
    this.view_objects.push(this.cv_parameters);
    this.view_objects.push(this.chart);
    this.view_objects.push(this.buttons);
    this.view_objects.push(this.templates);
    this.view_objects.push(this.exp_parameters);
    this.view_objects.push(this.inst_status);

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

//load parameters
CyclicVoltammetry.prototype.loadParameters = function(rows, table_id){
}

//load the waveform file
CyclicVoltammetry.prototype.openWaveform = function(name){
    httpcomm.eihttp.open_experiment(name);
}

//create a waveform
CyclicVoltammetry.prototype.createWaveform = function(name){
    httpcomm.eihttp.create_experiment(name);
}
//prepare the config before entry
CyclicVoltammetry.prototype.prepare = function(args){
    this.updatePositions();

    // add header
    this.gui.addHeader(this.header_content);
    
    //add the elements
    this.gui.panels[this.views["WaveformChart"]].addView(this.chart);
    this.gui.panels[this.views["CVParameters"]].addView(this.cv_parameters);
    this.gui.panels[this.views["ExperimentParameters"]].addView(this.exp_parameters);
    this.gui.panels[this.views["CVTemplates"]].addView(this.templates);
    this.gui.panels[this.views["SmallStatus"]].addView(this.inst_status);
    this.gui.panels[this.views["ControlButtons"]].addView(this.buttons);

    // WAVEFORM CHART reset//

    // initiate chart
    this.chart.initiateChart();

    // if this is a new load
    if (args.length > 0) {
        // update header
        this.title.innerHTML = args[0];
        this.name = args[0];

        //open waveform
        if (args[1] == "open"){
            this.openWaveform(args[0]);
        }
        else if (args[1] == "create"){
            this.createWaveform(args[0]);
        }
        else{}
    }
    else {
        // request update by re-opening the experiment
        this.openWaveform(this.name);
    }

    //enable signals applying to this config
    //disable all
    for (signal in httpcomm.signals){
        httpcomm.signals[signal].enabled = false;
    }
    //enable the ones needed
    httpcomm.signals["update_graph"].enabled = true;

}

//-----------------------------//



// WaveformPreview class ------//

function WaveformPreview(panel){
    //attributes that all views have:
    this.panel = panel;
    this.element = document.createElement("div");
    this.element.className = "app-cubby";
    this.content_pane = document.createElement("div");
    this.content_pane.className = "app-content";
    this.element.appendChild(this.content_pane);
    //-----------------------------//

    this.chart;

    this.height = "50%";
    this.width = "60%"
    this.x = "0px";
    this.y = "0px";
    this.content_pane.id = "chart_container";           //if want to have multiple waveforms loaded, 
                                                        //must change to a unique container name
}

//starts up the chart
WaveformPreview.prototype.initiateChart = function(){
    //table options
    var options = {
        chart: {
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
                    return this.value + " s";
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
                    return this.value + " mV";
                }
            },
            lineWidth: 2
        },
        legend: {
            enabled: false
        },
        /*/
        tooltip: {
            formatter: function() {
                return ""+this.x+", "+ this.y +"s";
            }
        },
        /*/
        plotOptions: {
            line: {
                animation: false 
            }
        },
        tooltip: {
            enabled: false
        },
        series: [{
            color: "#07F862",
            data: []
        }]
    };

    this.chart = new Highcharts.Chart(options);
}

//updates chart points
WaveformPreview.prototype.updateChart = function(points){
   
    //add points
    if (points != null){
        var options = {
            color: "#07F862",
            marker: {
                enabled: true,
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
            data: points
        }
        this.chart.series[0].remove(false);
        this.chart.addSeries(options);
    }
}

//-----------------------------//



// CVParameters class -----------------//

function CVParameters(panel){
    //attributes that all views have:
    this.panel = panel;
    this.element = document.createElement("div");
    this.element.className = "app-cubby";
    this.content_pane = document.createElement("div");
    this.content_pane.className = "app-content";
    this.element.appendChild(this.content_pane);
    //------------------------------//

    this.height = "70%";
    this.width = "40%";
    this.x = "60%";
    this.y = "0px";

    //object for checking input format
    this.validate_methods = {
        real: {
            method: function real(value){
                return /^(0|(-?([1-9][0-9]*)?\.[0-9]*)|(-?[1-9][0-9]*)|(0\.[0-9]*)|(-?0?\.[0-9]*[1-9][0-9]*))$/.test(value);
            },
            message: "Enter a valid real",
            decimals: 1
        },
        positive_real: {
            method: function positive_real(value){
                return /^((([1-9][0-9]*)(\.[0-9]*))|(\.[0-9]*[1-9][0-9]*)|([1-9][0-9]*))$/.test(value);
            },
            message: "Enter a positive real",
            decimals: 1
        }
    }

    //object for input placeholders, label names, units, and number format
    this.value_format = {
        start_value: {
            placeholder: "Start potential",
            label: "Start Potential",
            units: "mV",
            format: "real"
        },
        end_value: {
            placeholder: "End potential",
            label: "End Potential",
            units: "mV",
            format: "real"
        },
        rate: {
            placeholder: "Sweep rate",
            label: "Sweep Rate",
            units: "mV/s",
            format: "real"
        },
        duration: {
            placeholder: "Duration",
            label: "Duration",
            units: "s",
            format: "positive_real"
        }
    }

}

//validates the format of the numbers only
//called everytime the focus leaves the input box and when it is submitted
CVParameters.prototype.validateSimple = function(address, type, method){
    //validation code 
    var value_cell = this.rows[address[0]].childNodes[address[1]];
    var value = $.trim(value_cell.childNodes[0].childNodes[0].value);

    if (value == "" || this.validate_methods[method]["method"](value)){                                 //all ok
        value_cell.className = "value-cell pattern-cell";                                               //put back to normal
        value_cell.childNodes[0].childNodes[0].placeholder = this.value_format[type]["placeholder"];    //reset placeholder
        if (value != ""){
            value_cell.childNodes[0].childNodes[0].value = this.formatNum(value, method);               //format number
        }
        return true;
    }
    else{                                                                                               //invalid fomat
        value_cell.className = "value-cell pattern-cell value-invalid";                                 //turn red
        value_cell.childNodes[0].childNodes[0].value = "";                                              //clear cell
        value_cell.childNodes[0].childNodes[0].placeholder = this.validate_methods[method]["message"];  //give error message
        return false;
    }

}

//validates the interdependencies of the values 
CVParameters.prototype.validateComplex = function(row_num){
    //variable if ok to submit or not
    var submit = false;

    //check repeat cell
    var repeat_input = this.rows[row_num].childNodes[2].childNodes[0].childNodes[0]
    //check if it"s blank
    if (repeat_input.value == ""){
        repeat_input.parentNode.parentNode.className = "value-cell pattern-cell value-invalid";
        repeat_input.placeholder = "Must enter a value";
        submit = false;
    }
    else{
        submit = true;
    }

    return submit;
}

//puts a number to a specified number of decimals (through this.validate_methods)
CVParameters.prototype.formatNum = function(value, method){
    return (value*1).toFixed(this.validate_methods[method]["decimals"]);
}

//updates a row"s values and posts the update to the server
CVParameters.prototype.update = function(row_num){
    //row_num is row index
    if (this.validateSimple([row_num, 2], "repeat_value", this.value_format["repeat_value"]["format"])){
        if (this.validateComplex(row_num)){
            var repeat_value = this.rows[row_num].childNodes[2].childNodes[0].childNodes[0].value;
            var position = (row_num);

            //send update signal
            httpcomm.eihttp.update_pattern(repeat_value, position);

        }
    }
}

//-----------------------------//



// ExperimentParameters class --------//

function ExperimentParameters(panel){
    //attributes that all views have:
    this.panel = panel;
    this.element = document.createElement("div");
    this.element.className = "app-cubby";
    this.content_pane = document.createElement("div");
    this.content_pane.className = "app-content";
    this.element.appendChild(this.content_pane);
    //------------------------------//

    this.height = "35%";
    this.width = "30%";
    this.x = "0px";
    this.y = "50%";

    //object for checking input format
    this.validate_methods = {
        real: {
            method: function real(value){
                return /^(0|(-?([1-9][0-9]*)?\.[0-9]*)|(-?[1-9][0-9]*)|(0\.[0-9]*)|(-?0?\.[0-9]*[1-9][0-9]*))$/.test(value);
            },
            message: "Enter a valid real",
            decimals: 1
        },
        positive_real: {
            method: function positive_real(value){
                return /^((([1-9][0-9]*)(\.[0-9]*))|(\.[0-9]*[1-9][0-9]*)|([1-9][0-9]*))$/.test(value);
            },
            message: "Enter a positive real",
            decimals: 1
        }
    }

    //object for input placeholders, label names, units, and number format
    this.value_format = {
        start_value: {
            placeholder: "Start potential",
            label: "Start Potential",
            units: "mV",
            format: "real"
        },
        end_value: {
            placeholder: "End potential",
            label: "End Potential",
            units: "mV",
            format: "real"
        },
        rate: {
            placeholder: "Sweep rate",
            label: "Sweep Rate",
            units: "mV/s",
            format: "real"
        },
        duration: {
            placeholder: "Duration",
            label: "Duration",
            units: "s",
            format: "positive_real"
        }
    }

}

//validates the format of the numbers only
//called everytime the focus leaves the input box and when it is submitted
ExperimentParameters.prototype.validateSimple = function(address, type, method){
    //validation code 
    var value_cell = this.rows[address[0]].childNodes[address[1]];
    var value = $.trim(value_cell.childNodes[0].childNodes[0].value);

    if (value == "" || this.validate_methods[method]["method"](value)){         //all ok
        value_cell.className = "value-cell segment-cell";                       //set to normal
        value_cell.childNodes[0].childNodes[0].placeholder = this.value_format[type]["placeholder"];    //reset placeholder
        if (value != ""){
            value_cell.childNodes[0].childNodes[0].value = this.formatNum(value, method);               //format number
        }
        return true;
    }
    else{                                                                       //wrong format
        value_cell.className = "value-cell segment-cell value-invalid";         //turn red
        value_cell.childNodes[0].childNodes[0].value = "";                      //clear cell
        value_cell.childNodes[0].childNodes[0].placeholder = this.validate_methods[method]["message"];  //give error message
        return false;
    }

}

//updates a row"s values and posts the update to the server
ExperimentParameters.prototype.update = function(row_num){
    //row_num is row index
    if (
        this.validateSimple([row_num, 2], "start_value", this.value_format["start_value"]["format"]) &&
        this.validateSimple([row_num, 3], "end_value", this.value_format["end_value"]["format"]) &&
        this.validateSimple([row_num, 4], "rate", this.value_format["rate"]["format"]) &&
        this.validateSimple([row_num, 5], "duration", this.value_format["duration"]["format"])
    ){
        if (this.validateComplex(row_num)){
            var start_value = this.rows[row_num].childNodes[2].childNodes[0].childNodes[0].value;
            var end_value = this.rows[row_num].childNodes[3].childNodes[0].childNodes[0].value;
            var rate = this.rows[row_num].childNodes[4].childNodes[0].childNodes[0].value;
            var duration = this.rows[row_num].childNodes[5].childNodes[0].childNodes[0].value;
            var position = row_num;

            //send update signal
            var pattern = this.panel.gui.panels[this.panel.gui.config.views["WaveformTablePatterns"]].view.selected_row;
            httpcomm.eihttp.update_segment(start_value, end_value, rate, duration, position, pattern);

            //add segment plot band
            this.panel.gui.panels[this.panel.gui.config.views["WaveformChart"]].view.addSegmentBand(position);

        }
    }
}

//-----------------------------//



// CVTemplates class ------------------//
function CVTemplates(panel){
    //attributes that all views have:
    this.panel = panel;
    this.element = document.createElement("div");
    this.element.className = "app-cubby";
    this.content_pane = document.createElement("div");
    this.content_pane.className = "app-content";
    this.element.appendChild(this.content_pane);
    //------------------------------//

    this.height = "35%";
    this.width = "30%";
    this.x = "30%";
    this.y = "50%";

}
//-----------------------------//



// SmallStatus class ------------------//
function SmallStatus(panel){
    //attributes that all views have:
    this.panel = panel;
    this.element = document.createElement("div");
    this.element.className = "app-cubby";
    this.content_pane = document.createElement("div");
    this.content_pane.className = "app-content";
    this.element.appendChild(this.content_pane);
    //------------------------------//

    this.height = "15%";
    this.width = "60%";
    this.x = "0";
    this.y = "85%";

}
//-----------------------------//



// ControlButtons class ------------------//
function ControlButtons(panel){
    //attributes that all views have:
    this.panel = panel;
    this.element = document.createElement("div");
    this.element.className = "app-cubby";
    this.content_pane = document.createElement("div");
    this.content_pane.className = "app-content";
    this.element.appendChild(this.content_pane);
    //------------------------------//

    this.height = "30%";
    this.width = "40%";
    this.x = "60%";
    this.y = "70%";

}
//-----------------------------//
