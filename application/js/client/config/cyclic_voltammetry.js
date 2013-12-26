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

    this.exp_type = "Cyclic Voltammetry";

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

    this.type = document.createElement("div");
    this.type.className = "label italic";
    this.type.style.height = "55px";
    this.type.style.right = "350px";
    this.type.innerHTML = this.exp_type;
    this.header_content.appendChild(this.type);

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

    // STATUS reset //

    this.inst_status.box_center.innerHTML = "";

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

    this.height = "calc(100% - 64px)";
    this.height = "-webkit-calc(100% - 64px)";
    this.width = "40%";
    this.x = "60%";
    this.y = "0px";

    // attributes
    this.label_text = "CV Parameters";

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
    this.value_format = [ 
        {
            placeholder: "Initial potential",
            label: "Initial potential",
            units: "mV",
            format: "real"
        },
        {
            placeholder: "Number of segments",
            label: "Number of segments",
            units: "segs",
            format: "integer"
        },
        {
            placeholder: "Switching potential 1",
            label: "Switching potential 1",
            units: "mV",
            format: "real"
        },
        {
            placeholder: "Scan rate",
            label: "Scan rate",
            units: "mV/s",
            format: "real"
        },
        {
            placeholder: "Switching potential 2",
            label: "Switching potential 2",
            units: "mV",
            format: "real"
        },
        {
            placeholder: "Quiet time",
            label: "Quiet time",
            units: "s",
            format: "positive_real"
        },
        {
            placeholder: "Final potential",
            label: "Final potential",
            units: "mV",
            format: "real"
        },
        {
            placeholder: "Full scale (+/-)",
            label: "Full scale (+/-)",
            units: "s",
            format: "positive_real"
        }
    ]

    // add components
    // label
    this.label = document.createElement("div");
    this.label.className = "small-label";
    this.label.innerHTML = this.label_text;
    this.content_pane.appendChild(this.label);

    // parameter table
    this.table = document.createElement("div");
    this.table.className = "parameters-table";
    this.content_pane.appendChild(this.table);

    // parameters
    this.parameters = []
    for (var i = 0; i < 8; i++) {
        var parameter = document.createElement("div");
        parameter.className = "parameter-cell"
        parameter.style.left = (i % 2 * 50) + "%"
        parameter.style.top = (Math.floor(i / 2) * 16.6) + "%"

        var parameter_title = document.createElement("div");
        parameter_title.className = "parameter-label";
        parameter_title.style.top = "calc(50% - 27px)";
        parameter_title.style.top = "-webkit-calc(50% - 27px)";
        parameter_title.innerHTML = this.value_format[i].label;

        var parameter_input_wrapper = document.createElement("div");
        parameter_input_wrapper.className = "input-wrapper";
        parameter_input_wrapper.style.top = "calc(50% + 1px)";
        parameter_input_wrapper.style.top = "-webkit-calc(50% + 1px)";
        var parameter_input = document.createElement("input");
        parameter_input.className = "value-input";
        parameter_input.placeholder = this.value_format[i].placeholder;
        parameter_input.onblur = function(){
            //table_patterns.validateSimple([row.row_num, 2],"parameter_value", table_patterns.value_format["parameter_value"]["format"]);
        };
        parameter_input.onkeypress = function(e){
           if (e.keyCode == 13){        //enter key 
               //table_patterns.update(row.row_num);
           }
        }
        var parameter_label = document.createElement("div");
        parameter_label.className = "input-label";
        parameter_label.innerHTML = this.value_format[i].units;
        parameter_input_wrapper.appendChild(parameter_input);
        parameter_input_wrapper.appendChild(parameter_label);
        parameter.appendChild(parameter_title);
        parameter.appendChild(parameter_input_wrapper);

        this.parameters.push(parameter);
        this.table.appendChild(parameter);
    }


    // apply button
    this.apply = document.createElement("div");
    this.apply.className = "small-btn";
    this.apply.style.width = "100px";
    this.apply.style.right = "0px";
    this.apply.style.bottom = "0px";
    this.apply_symbol = document.createElement("div");
    this.apply_symbol.className = "text-btn blue-text";
    this.apply_symbol.innerHTML = "Apply";
    this.apply_symbol.onclick = function(){};
    this.apply_symbol.tabIndex = 0;
    this.apply_symbol.onkeypress = function(e){if(e.keyCode == 13){}};
    this.apply.appendChild(this.apply_symbol);
    this.content_pane.appendChild(this.apply);


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

    // attributes
    this.label_text = "Experiment Parameters";

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

    //add components
    //label
    this.label = document.createElement("div");
    this.label.className = "small-label";
    this.label.innerHTML = this.label_text;
    this.content_pane.appendChild(this.label);

    // parameter table
    this.table = document.createElement("div");
    this.table.className = "parameters-table";
    this.content_pane.appendChild(this.table);

    // apply button
    this.apply = document.createElement("div");
    this.apply.className = "small-btn";
    this.apply.style.width = "100px";
    this.apply.style.right = "0px";
    this.apply.style.bottom = "0px";
    this.apply_symbol = document.createElement("div");
    this.apply_symbol.className = "text-btn blue-text";
    this.apply_symbol.innerHTML = "Apply";
    this.apply_symbol.onclick = function(){};
    this.apply_symbol.tabIndex = 0;
    this.apply_symbol.onkeypress = function(e){if(e.keyCode == 13){}};
    this.apply.appendChild(this.apply_symbol);
    this.content_pane.appendChild(this.apply);

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

    // attributes
    this.label_text = "Templates";

    //add components
    //label
    this.label = document.createElement("div");
    this.label.className = "small-label";
    this.label.innerHTML = this.label_text;
    this.content_pane.appendChild(this.label);

    // parameter table
    this.table = document.createElement("div");
    this.table.className = "parameters-table";
    this.content_pane.appendChild(this.table);

    // use button
    this.use = document.createElement("div");
    this.use.className = "small-btn";
    this.use.style.width = "100px";
    this.use.style.right = "0px";
    this.use.style.bottom = "0px";
    this.use_symbol = document.createElement("div");
    this.use_symbol.className = "text-btn blue-text";
    this.use_symbol.innerHTML = "Use";
    this.use_symbol.onclick = function(){};
    this.use_symbol.tabIndex = 0;
    this.use_symbol.onkeypress = function(e){if(e.keyCode == 13){}};
    this.use.appendChild(this.use_symbol);
    this.content_pane.appendChild(this.use);

    // remove button
    this.remove = document.createElement("div");
    this.remove.className = "small-btn";
    this.remove.style.width = "100px";
    this.remove.style.right = "104px";
    this.remove.style.bottom = "0px";
    this.remove_symbol = document.createElement("div");
    this.remove_symbol.className = "text-btn red-text";
    this.remove_symbol.innerHTML = "Delete";
    this.remove_symbol.onclick = function(){};
    this.remove_symbol.tabIndex = 0;
    this.remove_symbol.onkeypress = function(e){if(e.keyCode == 13){}};
    this.remove.appendChild(this.remove_symbol);
    this.content_pane.appendChild(this.remove);

    // container for rows
    this.rows = [];
    this.row_count = 0;
    this.selected_row = -1;

    this.addRow("Default");
    this.addRow("LevisTemplate");

}

CVTemplates.prototype.addRow = function(text){

    var row = document.createElement("div");
    row.className = "open-row row-ease open-row-hover";
    row.style.top = (this.row_count * 34 + 4) + "px";
    row.innerHTML = text;
    row.parent_view = this;
    row.row_num = this.row_count;
    row.selected = false;
    row.tabIndex = 0;
    row.onclick = function(e){e.target.parent_view.select(e.target.row_num)}
    row.onkeypress = function(e){if(e.keyCode == 13){e.target.parent_view.select(e.target.row_num)}}

    this.table.appendChild(row);
    this.row_count ++;
    this.rows.push(row);

}

CVTemplates.prototype.select = function(row_num){

    var row = this.rows[row_num];
    if (row.selected == false){
        row.className = "open-row row-ease selected-row";                                //highlight as selected
        row.selected = true;
        if (this.selected_row != -1){
            this.rows[this.selected_row].className = "open-row row-ease open-row-hover"  //change selected to normal (only one selected at a time)
            this.rows[this.selected_row].selected = false;
        }
        this.selected_row = row_num;
    }
    else{
        row.className = "open-row row-ease open-row-hover";                              //back to normal
        row.selected = false;
        this.selected_row = -1;
    }

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

    // status box
    this.box = document.createElement("div");
    this.box.className = "status-container";
    this.status_box = document.createElement("div");
    this.status_box.className = "status-box";
    this.box_center = document.createElement("div");
    this.box_center.className = "status-center";
    this.status_box.appendChild(this.box_center);
    this.box.appendChild(this.status_box);
    this.content_pane.appendChild(this.box); 

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

    this.height = "64px";
    this.width = "40%";
    this.x = "60%";
    this.y = "calc(100% - 64px)";
    this.y = "-webkit-calc(100% - 64px)";

    // create buttons
    // button labels
    this.edit_label = "Edit waveform";
    this.download_label = "Download experiment";
    this.save_label = "Save experiment";
    this.run_label = "Enter run mode";

    var buttons = this;

    // edit button
    this.edit = document.createElement("div");
    this.edit.className = "btn";
    this.edit.style.left = "0px";
    this.edit.style.width = "calc((100% - 12px) / 4)";
    this.edit_symbol = document.createElement("img");
    this.edit_symbol.className = "edit-btn";
    this.edit_symbol.style.width = "100%";
    this.edit_symbol.onclick = function(){buttons.edit_waveform()};
    this.edit_symbol.onmouseover = function(){buttons.panel.gui.panels[buttons.panel.gui.config.views["SmallStatus"]].view.box_center.innerHTML = buttons.edit_label};
    this.edit_symbol.onmouseout = function(){buttons.panel.gui.panels[buttons.panel.gui.config.views["SmallStatus"]].view.box_center.innerHTML = ""};
    this.edit_symbol.tabIndex = 0;
    this.edit_symbol.onkeypress = function(e){if(e.keyCode == 13){buttons.edit_waveform()}};
    this.edit.appendChild(this.edit_symbol);
    this.content_pane.appendChild(this.edit);

    // download button
    this.download = document.createElement("div");
    this.download.className = "btn";
    this.download.style.left = "25%";
    this.download.style.width = "calc((100% - 12px) / 4)";
    this.download_symbol = document.createElement("img");
    this.download_symbol.className = "download-btn";
    this.download_symbol.style.width  = "100%";
    this.download_symbol.onclick = function(){buttons.download_experiment()};
    this.download_symbol.onmouseover = function(){buttons.panel.gui.panels[buttons.panel.gui.config.views["SmallStatus"]].view.box_center.innerHTML = buttons.download_label};
    this.download_symbol.onmouseout = function(){buttons.panel.gui.panels[buttons.panel.gui.config.views["SmallStatus"]].view.box_center.innerHTML = ""};
    this.download_symbol.tabIndex = 0;
    this.download_symbol.onkeypress = function(e){if(e.keyCode == 13){buttons.download_experiment()}};
    this.download.appendChild(this.download_symbol);
    this.content_pane.appendChild(this.download);

    // save button
    this.save = document.createElement("div");
    this.save.className = "btn";
    this.save.style.left = "50%";
    this.save.style.width = "calc((100% - 12px) / 4)";
    this.save_symbol = document.createElement("img");
    this.save_symbol.className = "save-btn";
    this.save_symbol.style.width  = "100%";
    this.save_symbol.onclick = function(){buttons.save_experiment()};
    this.save_symbol.onmouseover = function(){buttons.panel.gui.panels[buttons.panel.gui.config.views["SmallStatus"]].view.box_center.innerHTML = buttons.save_label};
    this.save_symbol.onmouseout = function(){buttons.panel.gui.panels[buttons.panel.gui.config.views["SmallStatus"]].view.box_center.innerHTML = ""};
    this.save_symbol.tabIndex = 0;
    this.save_symbol.onkeypress = function(e){if(e.keyCode == 13){buttons.save_experiment()}};
    this.save.appendChild(this.save_symbol);
    this.content_pane.appendChild(this.save);

    // run button
    this.run = document.createElement("div");
    this.run.className = "btn";
    this.run.style.right = "0px";
    this.run.style.width = "calc((100% - 12px) / 4)";
    this.run_symbol = document.createElement("img");
    this.run_symbol.className = "run-btn";
    this.run_symbol.style.width  = "100%";
    this.run_symbol.onclick = function(){buttons.run_experiment()};
    this.run_symbol.onmouseover = function(){buttons.panel.gui.panels[buttons.panel.gui.config.views["SmallStatus"]].view.box_center.innerHTML = buttons.run_label};
    this.run_symbol.onmouseout = function(){buttons.panel.gui.panels[buttons.panel.gui.config.views["SmallStatus"]].view.box_center.innerHTML = ""};
    this.run_symbol.tabIndex = 0;
    this.run_symbol.onkeypress = function(e){if(e.keyCode == 13){buttons.run_experiment()}};
    this.run.appendChild(this.run_symbol);
    this.content_pane.appendChild(this.run);

}

ControlButtons.prototype.edit_waveform = function() {
    client.gui.newConfig(editor, [client.gui.config.name, "open"]);
}

ControlButtons.prototype.download_experiment = function() {
}

ControlButtons.prototype.save_experiment = function() {
    httpcomm.eihttp.save_experiment();
    alert("saved");
}

ControlButtons.prototype.run_experiment = function() {
    client.gui.newConfig(run_exp, [client.gui.config.name]);
}

//-----------------------------//
