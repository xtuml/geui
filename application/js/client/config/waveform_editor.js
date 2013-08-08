/*

Defines the WaveformEditor configuration

Defines WaveformChart, WaveformTablePatterns,  
WaveformTableSegments, WaveformButtonsPatterns,
and WaveformButtonsSegments view classes.

*/


// WaveformEditor class -------//

function WaveformEditor(gui){
    //attibutes every config has
    this.gui = gui;

    this.enter_time = 1.45; //time it takes to enter in seconds
    this.exit_time = 0.9;  //time it takes to exit in seconds

    //object holding addresses to each of the views
    this.views = {
        WaveformChart: 'TL',
        WaveformTablePatterns: 'ML',
        WaveformTableSegments: 'MR',
        WaveformButtonsPatterns: 'BL',
        WaveformButtonsSegments: 'BR'
    };

    //create the views
    this.chart = new WaveformChart(this.gui.panels[this.views['WaveformChart']]);
    this.table_patterns = new WaveformTablePatterns(this.gui.panels[this.views['WaveformTablePatterns']]);
    this.table_segments = new WaveformTableSegments(this.gui.panels[this.views['WaveformTableSegments']]);
    this.buttons_patterns = new WaveformButtonsPatterns(this.gui.panels[this.views['WaveformButtonsPatterns']]);
    this.buttons_segments = new WaveformButtonsSegments(this.gui.panels[this.views['WaveformButtonsSegments']]);

    //setup the animation
    this.chart.element.style.left = 'calc(-100% - 10px)';
    this.chart.element.style.left = '-webkit-calc(-100% - 10px)';
    this.table_patterns.element.style.left = 'calc(-100% - 10px)';
    this.table_patterns.element.style.left = '-webkit-calc(-100% - 10px)';
    this.table_segments.element.style.left = 'calc(-200% - 10px)';
    this.table_segments.element.style.left = '-webkit-calc(-200% - 10px)';
    this.buttons_patterns.element.style.left = 'calc(-100% - 10px)';
    this.buttons_patterns.element.style.left = '-webkit-calc(-100% - 10px)';
    this.buttons_segments.element.style.left = 'calc(-200% - 10px)';
    this.buttons_segments.element.style.left = '-webkit-calc(-200% - 10px)';

}

//load tables
WaveformEditor.prototype.loadTable = function(rows, table_id){
    if (table_id == 'pattern'){

        //clear table rows
        for (r in this.table_patterns.rows){
            this.table_patterns.input_table.removeChild(this.table_patterns.rows[r]);           //remove the element
        }
        this.table_patterns.rows = [];
        this.table_patterns.row_count = 0;
        this.table_patterns.selected_row = -1;

        //add new rows
        for (row in rows){
            this.table_patterns.addRow(this.table_patterns.row_count, rows[row]);
        }

        //select the last row
        this.table_patterns.select(this.table_patterns.rows.length - 1);
    }
    else if (table_id == 'segment'){

        //clear table rows
        for (row in this.table_segments.rows){
            this.table_segments.input_table.removeChild(this.table_segments.rows[row]);       //remove the element
        }
        this.table_segments.rows = [];
        this.table_segments.row_count = 0;

        //add new rows
        for (row in rows){
            this.table_segments.addRow(this.table_segments.row_count, rows[row]);
        }

        //update plot band
        var pattern = this.gui.panels[this.gui.config.views['WaveformTablePatterns']].view.selected_row;
        this.gui.panels[this.gui.config.views['WaveformChart']].view.updateBand(pattern);
    }
    else{console.log(table_id);}
}

//load the waveform file
WaveformEditor.prototype.openWaveform = function(name){
    //httpcomm.eihttp.open_experiment(name);
}

//create a waveform
WaveformEditor.prototype.createWaveform = function(name){
    httpcomm.eihttp.create_experiment(name);
}

//prepare the config before entry
WaveformEditor.prototype.prepare = function(args){
    //remove the old elements
    this.gui.clearPanels();
    
    //add the elements
    this.gui.panels[this.views['WaveformChart']].addView(this.chart);
    this.gui.panels[this.views['WaveformTablePatterns']].addView(this.table_patterns);
    this.gui.panels[this.views['WaveformTableSegments']].addView(this.table_segments);
    this.gui.panels[this.views['WaveformButtonsPatterns']].addView(this.buttons_patterns);
    this.gui.panels[this.views['WaveformButtonsSegments']].addView(this.buttons_segments);

    //update size and position
    this.chart.panel.updateSize(this.chart.height, this.chart.width);
    this.chart.panel.updatePosition(this.chart.x, this.chart.y);
    this.table_patterns.panel.updateSize(this.table_patterns.height, this.table_patterns.width);
    this.table_patterns.panel.updatePosition(this.table_patterns.x, this.table_patterns.y);
    this.table_segments.panel.updateSize(this.table_segments.height, this.table_segments.width);
    this.table_segments.panel.updatePosition(this.table_segments.x, this.table_segments.y);
    this.buttons_patterns.panel.updateSize(this.buttons_patterns.height, this.buttons_patterns.width);
    this.buttons_patterns.panel.updatePosition(this.buttons_patterns.x, this.buttons_patterns.y);
    this.buttons_segments.panel.updateSize(this.buttons_segments.height, this.buttons_segments.width);
    this.buttons_segments.panel.updatePosition(this.buttons_segments.x, this.buttons_segments.y);

    // WAVEFORM CHART reset//
    //initate the chart
    this.chart.initiateChart();

    // WAVEFORM TABLE PATTERNS reset//

    // WAVEFORM TABLE SEGMENTS reset//

    //open waveform
    if (args[1] == 'open'){
        this.openWaveform(args[0]);
    }
    else if (args[1] == 'create'){
        this.createWaveform(args[0]);
    }
    else{}

    //enable signals applying to this config
    //disable all
    for (signal in httpcomm.signals){
        httpcomm.signals[signal].enabled = false;
    }
    //enable the ones needed
    httpcomm.signals['update_graph'].enabled = true;
    httpcomm.signals['load_table'].enabled = true;

}

//fly in animation
WaveformEditor.prototype.enter = function(delay){

    //run animation
    this.chart.element.className = 'app-cubby fly';
    $(this.chart.element).css('transition-delay', (delay + 0.5) + 's');
    $(this.chart.element).css('-webkit-transition-delay', (delay + 0.5) + 's');
    this.chart.element.style.left = '5px';

    this.table_segments.element.className = 'app-cubby fly';
    $(this.table_segments.element).css('transition-delay', (delay + 0.65) + 's');
    $(this.table_segments.element).css('-webkit-transition-delay', (delay + 0.65) + 's');
    this.table_segments.element.style.left = '5px';

    this.table_patterns.element.className = 'app-cubby fly';
    $(this.table_patterns.element).css('transition-delay', (delay + 0.8) + 's');
    $(this.table_patterns.element).css('-webkit-transition-delay', (delay + 0.8) + 's');
    this.table_patterns.element.style.left = '5px';

    this.buttons_segments.element.className = 'app-cubby fly';
    $(this.buttons_segments.element).css('transition-delay', (delay + 0.8) + 's');
    $(this.buttons_segments.element).css('-webkit-transition-delay', (delay + 0.8) + 's');
    this.buttons_segments.element.style.left = '5px';

    this.buttons_patterns.element.className = 'app-cubby fly';
    $(this.buttons_patterns.element).css('transition-delay', (delay + 0.95) + 's');
    $(this.buttons_patterns.element).css('-webkit-transition-delay', (delay + 0.95) + 's');
    this.buttons_patterns.element.style.left = '5px';

}

//fly out animation
WaveformEditor.prototype.exit = function(delay){

    //run animation
    this.chart.element.className = 'app-cubby fly';
    $(this.chart.element).css('transition-delay', delay + 's');
    $(this.chart.element).css('-webkit-transition-delay', delay + 's');
    this.chart.element.style.left = 'calc(-100% - 10px)';
    this.chart.element.style.left = '-webkit-calc(-100% - 10px)';

    this.table_patterns.element.className = 'app-cubby fly';
    $(this.table_patterns.element).css('transition-delay', (delay + 0.1) + 's');
    $(this.table_patterns.element).css('-webkit-transition-delay', (delay + 0.1) + 's');
    this.table_patterns.element.style.left = 'calc(-100% - 10px)';
    this.table_patterns.element.style.left = '-webkit-calc(-100% - 10px)';

    this.table_segments.element.className = 'app-cubby fly';
    $(this.table_segments.element).css('transition-delay', (delay + 0.25) + 's');
    $(this.table_segments.element).css('-webkit-transition-delay', (delay + 0.25) + 's');
    this.table_segments.element.style.left = 'calc(-200% - 10px)';
    this.table_segments.element.style.left = '-webkit-calc(-200% - 10px)';

    this.buttons_patterns.element.className = 'app-cubby fly';
    $(this.buttons_patterns.element).css('transition-delay', (delay + 0.25) + 's');
    $(this.buttons_patterns.element).css('-webkit-transition-delay', (delay + 0.25) + 's');
    this.buttons_patterns.element.style.left = 'calc(-100% - 10px)';
    this.buttons_patterns.element.style.left = '-webkit-calc(-100% - 10px)';

    this.buttons_segments.element.className = 'app-cubby fly';
    $(this.buttons_segments.element).css('transition-delay', (delay + 0.4) + 's');
    $(this.buttons_segments.element).css('-webkit-transition-delay', (delay + 0.4) + 's');
    this.buttons_segments.element.style.left = 'calc(-200% - 10px)';
    this.buttons_segments.element.style.left = '-webkit-calc(-200% - 10px)';

}

//-----------------------------//



// WaveformChart class --------//

function WaveformChart(panel){
    //attributes that all views have:
    this.panel = panel;
    this.element = document.createElement('div');
    this.element.className = 'app-cubby';
    this.content_pane = document.createElement('div');
    this.content_pane.className = 'app-content';
    this.element.appendChild(this.content_pane);
    //-----------------------------//

    this.chart;

    this.height = 'calc((100% - 64px) / 2)';
    this.height = '-webkit-calc((100% - 64px) / 2)';
    this.width = '100%'
    this.x = '0px';
    this.y = '0px';
    this.panel.updateSize(this.height, this.width);
    this.content_pane.id = 'chart_container';           //if want to have multiple waveforms loaded, 
                                                        //must change to a unique container name

    this.highlighted_segment = -1;                      //keeps track of which segment has a plot band
}

//starts up the chart
WaveformChart.prototype.initiateChart = function(){
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
        /*/
        tooltip: {
            formatter: function() {
                return ''+this.x+', '+ this.y +'s';
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
WaveformChart.prototype.updateChart = function(points){
   
    //add points
    //this.chart.series[0].setData([], false);
    if (points != null){
        for (p in points){
            this.chart.series[0].addPoint(points[p], false);
        }
        this.chart.redraw();
    }

    //update band
    var pattern = this.panel.gui.panels[this.panel.gui.config.views['WaveformTablePatterns']].view.selected_row;
    if (pattern != -1){
        this.updateBand(pattern);
    }

    //update segment band
    var position = this.highlighted_segment
    if (this.highlighted_segment != -1){
        this.removeSegmentBand(this.highlighted_segment);
    }
    this.addSegmentBand(position);

}

//update plotband
WaveformChart.prototype.updateBand = function(position){

    //calculate start and stop
    var pattern_rows = this.panel.gui.panels[this.panel.gui.config.views['WaveformTablePatterns']].view.rows;
    var segment_rows = this.panel.gui.panels[this.panel.gui.config.views['WaveformTableSegments']].view.rows;

    //assign start
    var start = pattern_rows[position].start_time;

    //add up all durations
    var duration = 0;
    for (var c = 0; c < segment_rows.length; c++){
        duration += parseFloat(segment_rows[c].childNodes[5].childNodes[0].childNodes[0].value);
    }

    //multiply by number of repeats
    duration *= pattern_rows[position].childNodes[2].childNodes[0].childNodes[0].value;

    //update other patterns start times
    if (pattern_rows[position].duration != 0){
        var d_change = duration - pattern_rows[position].duration;
    }
    else{
        var d_change = 0;
    }
    for (var c = position + 1; c < pattern_rows.length; c++){
        pattern_rows[c].start_time += d_change;
    }

    //update pattern duration
    pattern_rows[position].duration = duration;

    //assign stop
    var stop = start + duration;

    //remove old band
    this.chart.xAxis[0].removePlotBand('band');

    //set options
    var options = {
        color: 'rgba(135,206,250,0.3)',
        from: start,
        to: stop,
        id: 'band'
    }
    
    //add new band
    this.chart.xAxis[0].addPlotBand(options);
}

//add plotband for segment
WaveformChart.prototype.addSegmentBand = function(position){
    if (this.highlighted_segment != position){

        //update highlighted segment
        this.highlighted_segment = position;

        //calculate start and stop
        var table_patterns = this.panel.gui.panels[this.panel.gui.config.views['WaveformTablePatterns']].view;
        var pattern = table_patterns.rows[table_patterns.selected_row];
        var segment_rows = this.panel.gui.panels[this.panel.gui.config.views['WaveformTableSegments']].view.rows;

        //assign start
        var start = pattern.start_time;
        for (var c = 0; c < position; c++){
            start += parseFloat(segment_rows[c].childNodes[5].childNodes[0].childNodes[0].value);
        }

        //assign stop
        var stop = start + parseFloat(segment_rows[position].childNodes[5].childNodes[0].childNodes[0].value);

        //assign number of bands
        var num_bands = parseInt(pattern.childNodes[2].childNodes[0].childNodes[0].value);

        for (var c = 0; c < num_bands; c++){
            //set options
            var options = {
                color: 'rgba(135,206,250,0.2)',
                from: start + (c * pattern.duration / num_bands),
                to: stop + (c * pattern.duration / num_bands),
                id: position + '_' + c
            }
            
            //add new band
            this.chart.xAxis[0].addPlotBand(options);
        }
    }
}

//remove plotband for segment
WaveformChart.prototype.removeSegmentBand = function(position){
    if (this.highlighted_segment == position){

        //update highlighted segment
        this.highlighted_segment = -1;

        var table_patterns = this.panel.gui.panels[this.panel.gui.config.views['WaveformTablePatterns']].view;
        var pattern = table_patterns.rows[table_patterns.selected_row];

        //assign number of bands
        var num_bands = parseInt(pattern.childNodes[2].childNodes[0].childNodes[0].value);
        
        for (var c = 0; c < num_bands; c++){
            this.chart.xAxis[0].removePlotBand(position + '_' + c);
        }
    }
}

//-----------------------------//



// WaveformTablePatterns class --------//

function WaveformTablePatterns(panel){
    //attributes that all views have:
    this.panel = panel;
    this.element = document.createElement('div');
    this.element.className = 'app-cubby';
    this.content_pane = document.createElement('div');
    this.content_pane.className = 'app-content';
    this.element.appendChild(this.content_pane);
    //------------------------------//

    this.height = 'calc((100% - 64px) / 2)';
    this.height = '-webkit-calc((100% - 64px) / 2)';
    this.width = 'calc(100% - (150px + (((100% - 300px) / 5) * 4)))';
    this.width = '-webkit-calc(100% - (150px + (((100% - 300px) / 5) * 4)))';
    this.x = '0px';
    this.y = 'calc((100% - 64px) / 2)';
    this.y = '-webkit-calc((100% - 64px) / 2)';

    //container for the value rows
    this.input_table = document.createElement('div');
    this.input_table.className = 'input-table';
    this.content_pane.appendChild(this.input_table);

    this.rows = [];             //container for table rows
    this.row_count = 0;         //number of rows in the table
    this.current_row;           //row number of the row that's being edited
    this.selected_row = -1;     //keep track of row that is selected

    //drag attributes
    this.y_offset = 0;
    this.table_offset = 0;
    this.drag_row = null;
    this.drag_row_index = 0;
    this.drag_initial_index = 0;

    //object for checking input format
    this.validate_methods = {
        integer: {
            method: function integer(value){
                return /^(0|-?[1-9][0-9]*)$/.test(value);
            },
            message: 'Enter a valid integer',
            decimals: 0
        },
    }

    //object for input placeholders, label names, units, and number format
    this.value_format = {
        repeat_value: {
            placeholder: 'Repeat number',
            label: 'Number of Repeats',
            units: 'times',
            format: 'integer'
        }
    }

    //adds the label row
    this.labels = this.addMainRow();

}

// add a value row
WaveformTablePatterns.prototype.addRow = function(position, values){

    var table_patterns = this;

    var row = document.createElement('div');
    row.className = 'table-row row-ease table-row-hover';
    var y = parseInt(position) * 50;
    row.style.top = y + 'px';
    row.selected = false;
    row.full_selected = false;
    row.start_time = values[1];
    row.duration = values[2];
    row.row_num = position;
    row.onclick = function(){
        table_patterns.select(row.row_num);
    }

    var select_cell = document.createElement('div');
    select_cell.className = 'select-cell';
    select_cell.name = 'select_cell';
    var select_dot = document.createElement('div');
    select_dot.className = 'select-dot';
    select_cell.appendChild(select_dot);
    select_cell.onclick = function(){table_patterns.select_dots(select_dot, row)};
    row.appendChild(select_cell);

    var number_cell = document.createElement('div');
    number_cell.className = 'number-cell';
    number_cell.name = 'number_cell';
    number_cell.innerHTML = parseInt(position) + 1;
    number_cell.onmouseover = function(){table_patterns.numOver(number_cell)};
    number_cell.onmouseout = function(){table_patterns.numOut(number_cell, row.row_num)};
    number_cell.onmousedown = function(e){table_patterns.startDrag(e, row)};
    row.appendChild(number_cell);

    var repeat_cell = document.createElement('div');
    repeat_cell.className = 'value-cell pattern-cell';
    repeat_cell.name = 'repeat_cell';
    repeat_cell.style.left = '100px';
    var repeat_input_wrapper = document.createElement('div');
    repeat_input_wrapper.className = 'input-wrapper';
    var repeat_input = document.createElement('input');
    repeat_input.className = 'value-input';
    repeat_input.placeholder = this.value_format['repeat_value']['placeholder'];
    repeat_input.value = this.formatNum(values[0], this.value_format['repeat_value']['format']);
    repeat_input.onblur = function(){
        table_patterns.validateSimple([row.row_num, 2],'repeat_value', table_patterns.value_format['repeat_value']['format']);
    };
    repeat_input.onkeypress = function(e){
       if (e.keyCode == 13){        //enter key 
           table_patterns.update(row.row_num);
       }
    }
    var repeat_label = document.createElement('div');
    repeat_label.className = 'input-label';
    repeat_label.innerHTML = this.value_format['repeat_value']['units'];
    repeat_input_wrapper.appendChild(repeat_input);
    repeat_input_wrapper.appendChild(repeat_label);
    repeat_cell.appendChild(repeat_input_wrapper);
    row.appendChild(repeat_cell);

    var update_cell = document.createElement('div');
    update_cell.className = 'update-cell';
    update_cell.style.left = 'calc(100% - 50px)';
    update_cell.style.left = '-webkit-calc(100% - 50px)';
    update_cell.name = 'update_cell';
    var update_button = document.createElement('div');
    update_button.className = 'btn';
    update_button.style.height = '44px';
    update_button.style.width = '44px';
    update_button.style.top = '2px';
    update_button.style.left = '2px';
    var update_symbol = document.createElement('div');
    update_symbol.className = 'update-btn';
    update_symbol.tabIndex = 0;
    update_symbol.onclick = function(){table_patterns.update(row.row_num)}
    update_symbol.onkeypress = function(e){
        if (e.keyCode == 13){        //enter key 
            table_patterns.update(row.row_num);
        }
    }
    update_button.appendChild(update_symbol);
    update_cell.appendChild(update_button);
    row.appendChild(update_cell);

    this.input_table.appendChild(row);
    this.row_count += 1;
    this.rows.push(row);
}

// add the label row
WaveformTablePatterns.prototype.addMainRow = function(){

    var table_patterns = this;

    var row = document.createElement('div');
    row.className = 'main-row';
    row.style.top = '0px';

    var select_cell = document.createElement('div');
    select_cell.className = 'select-cell';
    var select_dot = document.createElement('div');
    select_dot.className = 'select-dot';
    select_dot.style.top = '7px';
    select_cell.appendChild(select_dot);
    select_cell.onclick = function(){
        if (select_dot.className == 'select-dot'){
            select_dot.className = 'select-dot selected';
            for (var c = 0;c < table_patterns.rows.length;c++){
                table_patterns.rows[c].selected = true;
                table_patterns.rows[c].childNodes[0].childNodes[0].className = 'select-dot selected';
            }
        }
        else{
            select_dot.className = 'select-dot';
            for (var c = 0;c < table_patterns.rows.length;c++){
                table_patterns.rows[c].selected = false;
                table_patterns.rows[c].childNodes[0].childNodes[0].className = 'select-dot';
            }
        }
    };
    row.appendChild(select_cell);

    var number_cell = document.createElement('div');
    number_cell.className = 'number-cell';
    row.appendChild(number_cell);

    var repeat_cell = document.createElement('div');
    repeat_cell.className = 'label-cell pattern-cell';
    repeat_cell.style.left = '100px';
    repeat_cell.innerHTML = this.value_format['repeat_value']['label'];
    row.appendChild(repeat_cell);

    var update_cell = document.createElement('div');
    update_cell.className = 'update-cell';
    update_cell.style.left = 'calc(100% - 50px)';
    update_cell.style.left = '-webkit-calc(100% - 50px)';
    row.appendChild(update_cell);

    this.content_pane.appendChild(row);
    return row;
}

// changes appearance of number cell when hovered
WaveformTablePatterns.prototype.numOver = function(num){
    num.innerHTML = '';
    num.className = 'number-cell dots';
}

// changes appearance of number cell when mouse out
WaveformTablePatterns.prototype.numOut = function(num, row_num){
    num.className = 'number-cell';
    num.innerHTML = row_num + 1;
}


//validates the format of the numbers only
//called everytime the focus leaves the input box and when it is submitted
WaveformTablePatterns.prototype.validateSimple = function(address, type, method){
    //validation code 
    var value_cell = this.rows[address[0]].childNodes[address[1]];
    var value = $.trim(value_cell.childNodes[0].childNodes[0].value);

    if (value == '' || this.validate_methods[method]['method'](value)){                                 //all ok
        value_cell.className = 'value-cell pattern-cell';                                               //put back to normal
        value_cell.childNodes[0].childNodes[0].placeholder = this.value_format[type]['placeholder'];    //reset placeholder
        if (value != ''){
            value_cell.childNodes[0].childNodes[0].value = this.formatNum(value, method);               //format number
        }
        return true;
    }
    else{                                                                                               //invalid fomat
        value_cell.className = 'value-cell pattern-cell value-invalid';                                 //turn red
        value_cell.childNodes[0].childNodes[0].value = '';                                              //clear cell
        value_cell.childNodes[0].childNodes[0].placeholder = this.validate_methods[method]['message'];  //give error message
        return false;
    }

}

//validates the interdependencies of the values 
WaveformTablePatterns.prototype.validateComplex = function(row_num){
    //variable if ok to submit or not
    var submit = false;

    //check repeat cell
    var repeat_input = this.rows[row_num].childNodes[2].childNodes[0].childNodes[0]
    //check if it's blank
    if (repeat_input.value == ''){
        repeat_input.parentNode.parentNode.className = 'value-cell pattern-cell value-invalid';
        repeat_input.placeholder = 'Must enter a value';
        submit = false;
    }
    else{
        submit = true;
    }

    return submit;
}

//puts a number to a specified number of decimals (through this.validate_methods)
WaveformTablePatterns.prototype.formatNum = function(value, method){
    return (value*1).toFixed(this.validate_methods[method]['decimals']);
}

//updates a row's values and posts the update to the server
WaveformTablePatterns.prototype.update = function(row_num){
    //row_num is row index
    if (this.validateSimple([row_num, 2], 'repeat_value', this.value_format['repeat_value']['format'])){
        if (this.validateComplex(row_num)){
            var repeat_value = this.rows[row_num].childNodes[2].childNodes[0].childNodes[0].value;
            var position = (row_num);

            //send update signal
            httpcomm.eihttp.update_pattern(repeat_value, position);

        }
    }
}

// gets the selected rows and returns as array of row indices
WaveformTablePatterns.prototype.getSelected = function(){
    var selected = [];
    for (var c = 0;c < this.rows.length;c++){
        if (this.rows[c].selected == true){
            selected.push(c);
        }
    }
    return selected;
}

//Selects row for deleting
WaveformTablePatterns.prototype.select_dots = function(dot, row){
    if (dot.className == 'select-dot'){
            dot.className = 'select-dot selected';
            row.selected = true;
        }
        else{
            dot.className = 'select-dot';
            row.selected = false;
        }
        var selected = this.getSelected();
        if (selected.length == this.row_count){
            this.labels.childNodes[0].childNodes[0].className = 'select-dot selected';
        }
        else{
            this.labels.childNodes[0].childNodes[0].className = 'select-dot';
        }
}

//Selects row to display segments inside
WaveformTablePatterns.prototype.select = function(row_num, reload){

    var row = this.rows[row_num];
    if (row.full_selected == false){
        //update row
        row.className = 'table-row row-ease selected-row';                                  //highlight as selected
        row.full_selected = true;


        //unselect old selected
        if (this.selected_row != -1){
            this.rows[this.selected_row].className = 'table-row row-ease open-row-hover'    //change selected to normal (only one selected at a time)
            this.rows[this.selected_row].full_selected = false;
        }
        this.selected_row = row_num;
    }

    if (reload != false){
        // reload segment table
        httpcomm.eihttp.request_table('segment', row_num);
    }

}

// updates the positions of the rows when it's deleted or moved
WaveformTablePatterns.prototype.updatePositions = function(){
    for (var c = 0;c < this.rows.length;c++){
        var y = c * 50;
        this.rows[c].style.top = y + 'px';
        this.rows[c].childNodes[1].innerHTML = (c + 1);
        this.rows[c].row_num = c;
    }
}

//starts drag of a row
WaveformTablePatterns.prototype.startDrag = function(ev, row){

    //unselect all
    this.selected_row = -1;
    for (r in this.rows){
        this.rows[r].className = 'table-row row-ease table-row-hover';
        this.rows[r].full_selected = false;
    }

    //update selected row
    this.select(row.row_num);

    //bring row to front
    for (var c = 0;c < this.rows.length;c++){
        this.rows[c].style.zIndex = 0;
    }
    row.style.zIndex = 1;

    //set offset variables
    this.y_offset = ev.offsetY;
    this.table_offset = ev.pageY - (ev.offsetY + ev.target.parentNode.offsetTop);
    this.drag_row = row;
    this.drag_row_index = this.drag_row.row_num;
    this.drag_initial_index = this.drag_row_index;
    this.drag_row.className = 'table-row table-row-hover';

    //add listeners
    var table_patterns = this;

    this.input_table.onmousemove = function(e){
        table_patterns.drag(e);
    };
    this.input_table.onmouseup = function(e){
        table_patterns.endDrag(e);
    };
    $(this.input_table).mouseleave(function(e){
        table_patterns.endDrag(e);
    });
}

//dragging a row
WaveformTablePatterns.prototype.drag = function(ev){
    //move row
    var new_y = ev.pageY - (this.y_offset + this.table_offset);
    if (new_y < 0){
        new_y = 0;
    }
    else if (new_y > (this.row_count - 1) * 50){
        new_y = (this.row_count - 1) * 50;
    }
    var index = Math.round(new_y / 50);
    this.drag_row.style.top = new_y + 'px';

    //rearrange other rows
    if (index != this.drag_row_index){                  //if it has moved a position
        this.rows.splice(this.drag_row_index, 1);
        this.rows.splice(index, 0, this.drag_row);
        this.drag_row_index = index;
        for (var c = 0;c < this.rows.length;c++){
            if (c != index){                            //all the other rows
                var y = c * 50;
                this.rows[c].style.top = y + 'px';
                this.rows[c].childNodes[1].innerHTML = (c + 1);
            }
            this.rows[c].row_num = c;
        }
    }

}

//ends the drag of a row
WaveformTablePatterns.prototype.endDrag = function(ev){
    //lock to a multiple of 50
    var new_y = ev.pageY - (this.y_offset + this.table_offset);
    var index = new_y / 50;
    new_y = Math.round(index) * 50;
    if (new_y < 0){
        new_y = 0;
    }
    else if (new_y > (this.row_count - 1) * 50){
        new_y = (this.row_count - 1) * 50;
    }
    this.drag_row.style.top = new_y + 'px';
    this.drag_row.className = 'table-row row-ease table-row-hover';

    //send move signal to the server
    httpcomm.eihttp.move_pattern(this.drag_initial_index, this.drag_row_index)

    //update each row's start_time
    for (var c = 0; c < this.rows.length; c++){
        if (c == 0){
            this.rows[c].start_time = 0;
        }
        else{
            console.log(this.rows[c - 1].start_time, this.rows[c - 1].duration);
            this.rows[c].start_time = this.rows[c - 1].start_time + this.rows[c - 1].duration;
        }
    }

    //unselect all
    this.selected_row = -1;
    for (r in this.rows){
        this.rows[r].className = 'table-row row-ease table-row-hover';
        this.rows[r].full_selected = false;
    }

    //update selected row
    this.select(this.drag_row_index, false);

    //remove listeners
    this.input_table.onmousemove = null;
    $(this.input_table).unbind();
    this.input_table.onmouseup = null;
}

//-----------------------------//



// WaveformTableSegments class --------//

function WaveformTableSegments(panel){
    //attributes that all views have:
    this.panel = panel;
    this.element = document.createElement('div');
    this.element.className = 'app-cubby';
    this.content_pane = document.createElement('div');
    this.content_pane.className = 'app-content';
    this.element.appendChild(this.content_pane);
    //------------------------------//

    this.height = 'calc((100% - 64px) / 2)';
    this.height = '-webkit-calc((100% - 64px) / 2)';
    this.width = 'calc(100% - (150px + ((100% - 300px) / 5)))';
    this.width = '-webkit-calc(100% - (150px + ((100% - 300px) / 5)))';
    this.x = 'calc(150px + ((100% - 300px) / 5))';
    this.x = '-webkit-calc(150px + ((100% - 300px) / 5))';
    this.y = 'calc((100% - 64px) / 2)';
    this.y = '-webkit-calc((100% - 64px) / 2)';

    //container for the value rows
    this.input_table = document.createElement('div');
    this.input_table.className = 'input-table';
    this.content_pane.appendChild(this.input_table);

    this.rows = [];             //container for table rows
    this.row_count = 0;         //number of rows in the table
    this.current_row;           //row number of the row that's being edited

    //drag attributes
    this.y_offset = 0;
    this.table_offset = 0;
    this.drag_row = null;
    this.drag_row_index = 0;
    this.drag_initial_index = 0;

    //object for checking input format
    this.validate_methods = {
        real: {
            method: function real(value){
                return /^(0|(-?([1-9][0-9]*)?\.[0-9]*)|(-?[1-9][0-9]*)|(0\.[0-9]*)|(-?0?\.[0-9]*[1-9][0-9]*))$/.test(value);
            },
            message: 'Enter a valid real',
            decimals: 3
        },
        positive_real: {
            method: function positive_real(value){
                return /^((([1-9][0-9]*)(\.[0-9]*))|(\.[0-9]*[1-9][0-9]*)|([1-9][0-9]*))$/.test(value);
            },
            message: 'Enter a positive real',
            decimals: 3
        }
    }

    //object for input placeholders, label names, units, and number format
    this.value_format = {
        start_value: {
            placeholder: 'Start potential',
            label: 'Start Potential',
            units: 'mV',
            format: 'real'
        },
        end_value: {
            placeholder: 'End potential',
            label: 'End Potential',
            units: 'mV',
            format: 'real'
        },
        rate: {
            placeholder: 'Sweep rate',
            label: 'Sweep Rate',
            units: 'mV/s',
            format: 'real'
        },
        duration: {
            placeholder: 'Duration',
            label: 'Duration',
            units: 's',
            format: 'positive_real'
        }
    }

    //adds the label row
    this.labels = this.addMainRow();
}

// add a value row
WaveformTableSegments.prototype.addRow = function(position, values){

    var table_segments = this;

    var row = document.createElement('div');
    row.className = 'table-row row-ease table-row-hover';
    var y = parseInt(position) * 50;
    row.style.top = y + 'px';
    row.selected = false
    row.row_num = parseInt(position);

    var chart = this.panel.gui.panels[this.panel.gui.config.views['WaveformChart']].view;
    $(row).mouseenter(function(){chart.addSegmentBand(row.row_num)});
    $(row).mouseleave(function(){chart.removeSegmentBand(row.row_num)});

    var select_cell = document.createElement('div');
    select_cell.className = 'select-cell';
    select_cell.name = 'select_cell';
    var select_dot = document.createElement('div');
    select_dot.className = 'select-dot';
    select_cell.appendChild(select_dot);
    select_cell.onclick = function(e){
        if (select_dot.className == 'select-dot'){
            select_dot.className = 'select-dot selected';
            row.selected = true;
        }
        else{
            select_dot.className = 'select-dot';
            row.selected = false;
        }
        var selected = table_segments.getSelected();
        if (selected.length == table_segments.row_count){
            table_segments.labels.childNodes[0].childNodes[0].className = 'select-dot selected';
        }
        else{
            table_segments.labels.childNodes[0].childNodes[0].className = 'select-dot';
        }
    };
    row.appendChild(select_cell);

    var number_cell = document.createElement('div');
    number_cell.className = 'number-cell';
    number_cell.name = 'number_cell';
    number_cell.innerHTML = parseInt(position) + 1;
    number_cell.onmouseover = function(){table_segments.numOver(number_cell)};
    number_cell.onmouseout = function(){table_segments.numOut(number_cell, row.row_num)};
    number_cell.onmousedown = function(e){table_segments.startDrag(e, row)};
    row.appendChild(number_cell);

    var start_cell = document.createElement('div');
    start_cell.className = 'value-cell segment-cell';
    start_cell.name = 'start_cell';
    start_cell.style.left = '100px';
    var start_input_wrapper = document.createElement('div');
    start_input_wrapper.className = 'input-wrapper';
    var start_input = document.createElement('input');
    start_input.className = 'value-input';
    start_input.placeholder = this.value_format['start_value']['placeholder'];
    start_input.value = this.formatNum(values[0], this.value_format['start_value']['format']);
    start_input.onblur = function(){
        table_segments.validateSimple([row.row_num, 2],'start_value', table_segments.value_format['start_value']['format']);
    };
    start_input.onkeypress = function(e){
       if (e.keyCode == 13){        //enter key 
           table_segments.update(row.row_num);
       }
    }
    var start_label = document.createElement('div');
    start_label.className = 'input-label';
    start_label.innerHTML = this.value_format['start_value']['units'];
    start_input_wrapper.appendChild(start_input);
    start_input_wrapper.appendChild(start_label);
    start_cell.appendChild(start_input_wrapper);
    row.appendChild(start_cell);

    var end_cell = document.createElement('div');
    end_cell.className = 'value-cell segment-cell';
    end_cell.name = 'end_cell';
    end_cell.style.left = 'calc(((100% - 150px) / 4) + 100px)';
    end_cell.style.left = '-webkit-calc(((100% - 150px) / 4) + 100px)';
    var end_input_wrapper = document.createElement('div');
    end_input_wrapper.className = 'input-wrapper';
    var end_input = document.createElement('input');
    end_input.className = 'value-input';
    end_input.placeholder = this.value_format['end_value']['placeholder'];
    end_input.value = this.formatNum(values[1], this.value_format['end_value']['format']);
    end_input.onblur = function(){
        table_segments.validateSimple([row.row_num, 3],'end_value', table_segments.value_format['end_value']['format']);
    };
    end_input.onkeypress = function(e){
       if (e.keyCode == 13){        //enter key 
           table_segments.update(row.row_num);
       }
    }
    var end_label = document.createElement('div');
    end_label.className = 'input-label';
    end_label.innerHTML = this.value_format['end_value']['units'];
    end_input_wrapper.appendChild(end_input);
    end_input_wrapper.appendChild(end_label);
    end_cell.appendChild(end_input_wrapper);
    row.appendChild(end_cell);

    var rate_cell = document.createElement('div');
    rate_cell.className = 'value-cell segment-cell';
    rate_cell.name = 'rate_cell';
    rate_cell.style.left = 'calc((((100% - 150px) / 4) * 2) + 100px)';
    rate_cell.style.left = '-webkit-calc((((100% - 150px) / 4) * 2) + 100px)';
    var rate_input_wrapper = document.createElement('div');
    rate_input_wrapper.className = 'input-wrapper';
    var rate_input = document.createElement('input');
    rate_input.className = 'value-input';
    rate_input.placeholder = this.value_format['rate']['placeholder'];
    rate_input.value = this.formatNum(values[2], this.value_format['rate']['format']);
    rate_input.onblur = function(){
        table_segments.validateSimple([row.row_num, 4],'rate', table_segments.value_format['rate']['format']);
    };
    rate_input.onkeypress = function(e){
       if (e.keyCode == 13){        //enter key 
           table_segments.update(row.row_num);
       }
    }
    var rate_label = document.createElement('div');
    rate_label.className = 'input-label';
    rate_label.innerHTML = this.value_format['rate']['units'];
    rate_input_wrapper.appendChild(rate_input);
    rate_input_wrapper.appendChild(rate_label);
    rate_cell.appendChild(rate_input_wrapper);
    row.appendChild(rate_cell);

    var duration_cell = document.createElement('div');
    duration_cell.className = 'value-cell segment-cell';
    duration_cell.name = 'duration_cell';
    duration_cell.style.left = 'calc((((100% - 150px) / 4) * 3) + 100px)';
    duration_cell.style.left = '-webkit-calc((((100% - 150px) / 4) * 3) + 100px)';
    var duration_input_wrapper = document.createElement('div');
    duration_input_wrapper.className = 'input-wrapper';
    var duration_input = document.createElement('input');
    duration_input.className = 'value-input';
    duration_input.placeholder = this.value_format['duration']['placeholder'];
    duration_input.value = this.formatNum(values[3], this.value_format['duration']['format']);
    duration_input.onblur = function(){
        table_segments.validateSimple([row.row_num, 5],'duration', table_segments.value_format['duration']['format']);
    };
    duration_input.onkeypress = function(e){
       if (e.keyCode == 13){        //enter key 
           table_segments.update(row.row_num);
       }
    }
    var duration_label = document.createElement('div');
    duration_label.className = 'input-label';
    duration_label.innerHTML = this.value_format['duration']['units'];
    duration_input_wrapper.appendChild(duration_input);
    duration_input_wrapper.appendChild(duration_label);
    duration_cell.appendChild(duration_input_wrapper);
    row.appendChild(duration_cell);

    var update_cell = document.createElement('div');
    update_cell.className = 'update-cell';
    update_cell.style.left = 'calc(100% - 50px)';
    update_cell.style.left = '-webkit-calc(100% - 50px)';
    update_cell.name = 'update_cell';
    var update_button = document.createElement('div');
    update_button.className = 'btn';
    update_button.style.height = '44px';
    update_button.style.width = '44px';
    update_button.style.top = '2px';
    update_button.style.left = '2px';
    var update_symbol = document.createElement('div');
    update_symbol.className = 'update-btn';
    update_symbol.tabIndex = 0;
    update_symbol.onclick = function(){table_segments.update(row.row_num)}
    update_symbol.onkeypress = function(e){
        if (e.keyCode == 13){        //enter key 
            table_segments.update(row.row_num);
        }
    }
    update_button.appendChild(update_symbol);
    update_cell.appendChild(update_button);
    row.appendChild(update_cell);

    this.input_table.appendChild(row);
    this.row_count += 1;
    this.rows.push(row);
}

// add the label row
WaveformTableSegments.prototype.addMainRow = function(){

    var table_segments = this;

    var row = document.createElement('div');
    row.className = 'main-row';
    row.style.top = '0px';

    var select_cell = document.createElement('div');
    select_cell.className = 'select-cell';
    var select_dot = document.createElement('div');
    select_dot.className = 'select-dot';
    select_dot.style.top = '7px';
    select_cell.appendChild(select_dot);
    select_cell.onclick = function(){
        if (select_dot.className == 'select-dot'){
            select_dot.className = 'select-dot selected';
            for (var c = 0;c < table_segments.rows.length;c++){
                table_segments.rows[c].selected = true;
                table_segments.rows[c].childNodes[0].childNodes[0].className = 'select-dot selected';
            }
        }
        else{
            select_dot.className = 'select-dot';
            for (var c = 0;c < table_segments.rows.length;c++){
                table_segments.rows[c].selected = false;
                table_segments.rows[c].childNodes[0].childNodes[0].className = 'select-dot';
            }
        }
    };
    row.appendChild(select_cell);

    var number_cell = document.createElement('div');
    number_cell.className = 'number-cell';
    row.appendChild(number_cell);

    var start_cell = document.createElement('div');
    start_cell.className = 'label-cell segment-cell';
    start_cell.style.left = '100px';
    start_cell.innerHTML = this.value_format['start_value']['label'];
    row.appendChild(start_cell);

    var end_cell = document.createElement('div');
    end_cell.className = 'label-cell segment-cell';
    end_cell.style.left = 'calc(((100% - 150px) / 4) + 100px)';
    end_cell.style.left = '-webkit-calc(((100% - 150px) / 4) + 100px)';
    end_cell.innerHTML = this.value_format['end_value']['label'];
    row.appendChild(end_cell);

    var rate_cell = document.createElement('div');
    rate_cell.className = 'label-cell segment-cell';
    rate_cell.style.left = 'calc((((100% - 150px) / 4) * 2) + 100px)';
    rate_cell.style.left = '-webkit-calc((((100% - 150px) / 4) * 2) + 100px)';
    rate_cell.innerHTML = this.value_format['rate']['label'];
    row.appendChild(rate_cell);

    var duration_cell = document.createElement('div');
    duration_cell.className = 'label-cell segment-cell';
    duration_cell.style.left = 'calc((((100% - 150px) / 5) * 4) + 100px)';
    duration_cell.style.left = '-webkit-calc((((100% - 150px) / 4) * 3) + 100px)';
    duration_cell.innerHTML = this.value_format['duration']['label'];
    row.appendChild(duration_cell);

    var update_cell = document.createElement('div');
    update_cell.className = 'update-cell';
    update_cell.style.left = 'calc(100% - 50px)';
    update_cell.style.left = '-webkit-calc(100% - 50px)';
    row.appendChild(update_cell);

    this.content_pane.appendChild(row);
    return row;
}

// changes appearance of number cell when hovered
WaveformTableSegments.prototype.numOver = function(num){
    num.innerHTML = '';
    num.className = 'number-cell dots';
}

// changes appearance of number cell when mouse out
WaveformTableSegments.prototype.numOut = function(num, row_num){
    num.className = 'number-cell';
    num.innerHTML = row_num + 1;
}


//validates the format of the numbers only
//called everytime the focus leaves the input box and when it is submitted
WaveformTableSegments.prototype.validateSimple = function(address, type, method){
    //validation code 
    var value_cell = this.rows[address[0]].childNodes[address[1]];
    var value = $.trim(value_cell.childNodes[0].childNodes[0].value);

    if (value == '' || this.validate_methods[method]['method'](value)){         //all ok
        value_cell.className = 'value-cell segment-cell';                       //set to normal
        value_cell.childNodes[0].childNodes[0].placeholder = this.value_format[type]['placeholder'];    //reset placeholder
        if (value != ''){
            value_cell.childNodes[0].childNodes[0].value = this.formatNum(value, method);               //format number
        }
        return true;
    }
    else{                                                                       //wrong format
        value_cell.className = 'value-cell segment-cell value-invalid';         //turn red
        value_cell.childNodes[0].childNodes[0].value = '';                      //clear cell
        value_cell.childNodes[0].childNodes[0].placeholder = this.validate_methods[method]['message'];  //give error message
        return false;
    }

}

//validates the interdependencies of the values 
WaveformTableSegments.prototype.validateComplex = function(row_num){
    //variable if ok to submit or not
    var submit = false;

    //row_num is the index of the row
    var value_inputs = [
        this.rows[row_num].childNodes[2].childNodes[0].childNodes[0],
        this.rows[row_num].childNodes[3].childNodes[0].childNodes[0],
        this.rows[row_num].childNodes[4].childNodes[0].childNodes[0],
        this.rows[row_num].childNodes[5].childNodes[0].childNodes[0]
    ];

    //check interdependent cells
    //check how many blank cells there are
    var blanks = [];
    for (var c = 0;c < value_inputs.length;c++){
        if (value_inputs[c].value == ''){
            blanks.push(c);
        }
    }
    //if more than one blank, throw error
    if (blanks.length > 1){
        for (var i = 0;i < blanks.length;i++){
            value_inputs[blanks[i]].parentNode.className = 'value-cell value-invalid';
            value_inputs[blanks[i]].placeholder = 'Must enter a value';
        }
    }
    //if one blank, fill in
    //based on this equation: (end_value - start_value) = rate * duration
    else if (blanks.length == 1){
        submit = true;
        if (blanks[0] == 0){        //fill in start value
            value_inputs[0].value = this.formatNum(parseFloat(value_inputs[1].value) - (parseFloat(value_inputs[2].value) * parseFloat(value_inputs[3].value)),this.value_format['start_value']['format']);
        }
        else if (blanks[0] == 1){   //fill in end value
            value_inputs[1].value = this.formatNum(parseFloat(value_inputs[0].value) + (parseFloat(value_inputs[2].value) * parseFloat(value_inputs[3].value)),this.value_format['end_value']['format']);
        }
        else if (blanks[0] == 2){   //fill in rate
            value_inputs[2].value = this.formatNum((parseFloat(value_inputs[1].value) - parseFloat(value_inputs[0].value)) / parseFloat(value_inputs[3].value),this.value_format['rate']['format']);
        }
        else if (blanks[0] == 3){   //fill in duration
            if (parseFloat(value_inputs[2].value) != 0){
                var new_value = this.formatNum((parseFloat(value_inputs[1].value) - parseFloat(value_inputs[0].value)) / parseFloat(value_inputs[2].value),this.value_format['duration']['format']);
                if (new_value > 0){
                    value_inputs[3].value = new_value;
                }
                else{
                    alert('Field values must agree');
                    submit = false;
                }
            }
            else{
                alert('Cannot calculate duration');
                submit = false;
            }
        }
        else{submit = false;}
    }
    //if all filled, check interdependencies
    //based on this equation: (end_value - start_value) = rate * duration
    else{
        if ((parseFloat(value_inputs[1].value) - parseFloat(value_inputs[0].value)).toFixed(3)  == (parseFloat(value_inputs[2].value) * parseFloat(value_inputs[3].value)).toFixed(3)){
            submit = true;
        }
        else {
            alert('Field values must agree');
            submit = false;
        }
    }

    return submit;
}

//puts a number to a specified number of decimals (through this.validate_methods)
WaveformTableSegments.prototype.formatNum = function(value, method){
    return (value*1).toFixed(this.validate_methods[method]['decimals']);
}

//updates a row's values and posts the update to the server
WaveformTableSegments.prototype.update = function(row_num){
    //row_num is row index
    if (
        this.validateSimple([row_num, 2], 'start_value', this.value_format['start_value']['format']) &&
        this.validateSimple([row_num, 3], 'end_value', this.value_format['end_value']['format']) &&
        this.validateSimple([row_num, 4], 'rate', this.value_format['rate']['format']) &&
        this.validateSimple([row_num, 5], 'duration', this.value_format['duration']['format'])
    ){
        if (this.validateComplex(row_num)){
            var start_value = this.rows[row_num].childNodes[2].childNodes[0].childNodes[0].value;
            var end_value = this.rows[row_num].childNodes[3].childNodes[0].childNodes[0].value;
            var rate = this.rows[row_num].childNodes[4].childNodes[0].childNodes[0].value;
            var duration = this.rows[row_num].childNodes[5].childNodes[0].childNodes[0].value;
            var position = row_num;

            //send update signal
            var pattern = this.panel.gui.panels[this.panel.gui.config.views['WaveformTablePatterns']].view.selected_row;
            httpcomm.eihttp.update_segment(start_value, end_value, rate, duration, position, pattern);

            //add segment plot band
            this.panel.gui.panels[this.panel.gui.config.views['WaveformChart']].view.addSegmentBand(position);

        }
    }
}

// gets the selected rows and returns as array of row indices
WaveformTableSegments.prototype.getSelected = function(){
    var selected = [];
    for (var c = 0;c < this.rows.length;c++){
        if (this.rows[c].selected == true){
            selected.push(c);
        }
    }
    return selected;
}

// updates the positions of the rows when it's deleted or moved
WaveformTableSegments.prototype.updatePositions = function(){
    for (var c = 0;c < this.rows.length;c++){
        var y = c * 50;
        this.rows[c].style.top = y + 'px';
        this.rows[c].childNodes[1].innerHTML = (c + 1);
        this.rows[c].row_num = c;
    }
}

//starts drag of a row
WaveformTableSegments.prototype.startDrag = function(ev, row){
    //bring row to front
    for (var c = 0;c < this.rows.length;c++){
        this.rows[c].style.zIndex = 0;
    }
    row.style.zIndex = 1;

    //set offset variables
    this.y_offset = ev.offsetY;
    this.table_offset = ev.pageY - (ev.offsetY + ev.target.parentNode.offsetTop);
    this.drag_row = ev.target.parentNode;
    this.drag_row_index = this.drag_row.row_num;
    this.drag_initial_index = this.drag_row_index;
    this.drag_row.className = 'table-row';

    //add listeners
    var table_segments = this;

    this.input_table.onmousemove = function(e){
        table_segments.drag(e);
    };
    this.input_table.onmouseup = function(e){
        table_segments.endDrag(e);
    };
    $(this.input_table).mouseleave(function(e){
        table_segments.endDrag(e);
    });
}

//dragging a row
WaveformTableSegments.prototype.drag = function(ev){
    //move row
    var new_y = ev.pageY - (this.y_offset + this.table_offset);
    if (new_y < 0){
        new_y = 0;
    }
    else if (new_y > (this.row_count - 1) * 50){
        new_y = (this.row_count - 1) * 50;
    }
    var index = Math.round(new_y / 50);
    this.drag_row.style.top = new_y + 'px';

    //rearrange other rows
    if (index != this.drag_row_index){
        this.rows.splice(this.drag_row_index, 1);
        this.rows.splice(index, 0, this.drag_row);
        this.drag_row_index = index;
        for (var c = 0;c < this.rows.length;c++){
            if (c != index){
                var y = c * 50;
                this.rows[c].style.top = y + 'px';
                this.rows[c].childNodes[1].innerHTML = (c + 1);
            }
            this.rows[c].row_num = c;
        }
    }

}

//ends the drag of a row
WaveformTableSegments.prototype.endDrag = function(ev){
    //lock to a multiple of 50
    var new_y = ev.pageY - (this.y_offset + this.table_offset);
    var index = new_y / 50;
    new_y = Math.round(index) * 50;
    if (new_y < 0){
        new_y = 0;
    }
    else if (new_y > (this.row_count - 1) * 50){
        new_y = (this.row_count - 1) * 50;
    }
    this.drag_row.style.top = new_y + 'px';
    this.drag_row.className = 'table-row row-ease table-row-hover';

    //send move signal to the server
    var pattern = this.panel.gui.panels[this.panel.gui.config.views['WaveformTablePatterns']].view.selected_row;
    httpcomm.eihttp.move_segment(this.drag_initial_index, this.drag_row_index, pattern)

    //update highlighted segment
    var chart = this.panel.gui.panels[this.panel.gui.config.views['WaveformChart']].view;
    chart.removeSegmentBand(chart.highlighted_segment);
    chart.addSegmentBand(this.drag_row_index);

    //remove listeners
    this.input_table.onmousemove = null;
    $(this.input_table).unbind();
    this.input_table.onmouseup = null;
}

//-----------------------------//



// WaveformButtonsPatterns class ------//
function WaveformButtonsPatterns(panel){
    //attributes that all views have:
    this.panel = panel;
    this.element = document.createElement('div');
    this.element.className = 'app-cubby';
    this.content_pane = document.createElement('div');
    this.content_pane.className = 'app-content';
    this.element.appendChild(this.content_pane);
    //------------------------------//

    this.height = '64px';
    this.width = 'calc(100% - (150px + (((100% - 300px) / 5) * 4)))';
    this.width = '-webkit-calc(100% - (150px + (((100% - 300px) / 5) * 4)))';
    this.x = '0px';
    this.y = 'calc(100% - 64px)';
    this.y = '-webkit-calc(100% - 64px)';

    var buttons_patterns = this;

    this.add = document.createElement('div');
    this.add.className = 'btn';
    this.add_symbol = document.createElement('div');
    this.add_symbol.className = 'add-btn';
    this.add_symbol.onclick = function(){buttons_patterns.add_pattern();};
    this.add_symbol.tabIndex = 0;
    this.add_symbol.onkeypress = function(e){if(e.keyCode == 13){buttons_patterns.add_pattern();}};
    this.add.appendChild(this.add_symbol);
    this.content_pane.appendChild(this.add);

    this.remove = document.createElement('div');
    this.remove.className = 'btn';
    this.remove.style.left = '52px';
    this.remove_symbol = document.createElement('div');
    this.remove_symbol.className = 'delete-btn';
    this.remove_symbol.onclick = function(){buttons_patterns.delete_pattern();};
    this.remove_symbol.tabIndex = 0;
    this.remove_symbol.onkeypress = function(e){if(e.keyCode == 13){buttons_patterns.delete_pattern();}};
    this.remove.appendChild(this.remove_symbol);
    this.content_pane.appendChild(this.remove);
    
}

//posts an add segment request to the server. adds a default row with start and end 0, rate 0, and duration 10
WaveformButtonsPatterns.prototype.add_pattern = function(){

    var add_defaults = [0, 0, 0, 10, 1];

    var table_patterns = this.panel.gui.panels[this.panel.gui.config.views['WaveformTablePatterns']].view;

    var position = table_patterns.row_count;
    //send add signal
    httpcomm.eihttp.add_pattern(add_defaults[0], add_defaults[1], add_defaults[2], add_defaults[3], add_defaults[4]);

    //update select dots
    table_patterns.labels.childNodes[0].childNodes[0].className = 'select-dot';

}

//deletes selected rows. if none selected, deletes the last one. if all selected, deletes all but the first one
WaveformButtonsPatterns.prototype.delete_pattern = function(){
    //find rows to delete
    var table = this.panel.gui.panels[this.panel.gui.config.views['WaveformTablePatterns']].view;
    positions = table.getSelected().reverse();  //reverse order so array indices don't get mixed up
    if (positions.length == 0){
        positions.push(table.rows.length - 1);
    }
    if (positions.length == table.rows.length){
        positions = positions.splice(0, (positions.length - 1));
    }

    //send delete signal
    httpcomm.eihttp.delete_pattern(positions);

}

//-----------------------------//



// WaveformButtonsSegments class ------//
function WaveformButtonsSegments(panel){
    //attributes that all views have:
    this.panel = panel;
    this.element = document.createElement('div');
    this.element.className = 'app-cubby';
    this.content_pane = document.createElement('div');
    this.content_pane.className = 'app-content';
    this.element.appendChild(this.content_pane);
    //------------------------------//

    this.height = '64px';
    this.width = 'calc(100% - (150px + ((100% - 300px) / 5)))';
    this.width = '-webkit-calc(100% - (150px + ((100% - 300px) / 5)))';
    this.x = 'calc(150px + ((100% - 300px) / 5))';
    this.x = '-webkit-calc(150px + ((100% - 300px) / 5))';
    this.y = 'calc(100% - 64px)';
    this.y = '-webkit-calc(100% - 64px)';

    var buttons_segments = this;

    this.add = document.createElement('div');
    this.add.className = 'btn';
    this.add_symbol = document.createElement('div');
    this.add_symbol.className = 'add-btn';
    this.add_symbol.onclick = function(){buttons_segments.add_segment();};
    this.add_symbol.tabIndex = 0;
    this.add_symbol.onkeypress = function(e){if(e.keyCode == 13){buttons_segments.add_segment();}};
    this.add.appendChild(this.add_symbol);
    this.content_pane.appendChild(this.add);

    this.remove = document.createElement('div');
    this.remove.className = 'btn';
    this.remove.style.left = '52px';
    this.remove_symbol = document.createElement('div');
    this.remove_symbol.className = 'delete-btn';
    this.remove_symbol.onclick = function(){buttons_segments.delete_segment();};
    this.remove_symbol.tabIndex = 0;
    this.remove_symbol.onkeypress = function(e){if(e.keyCode == 13){buttons_segments.delete_segment();}};
    this.remove.appendChild(this.remove_symbol);
    this.content_pane.appendChild(this.remove);
    
    this.save = document.createElement('div');
    this.save.className = 'btn';
    this.save.style.right = '52px';
    this.save_symbol = document.createElement('div');
    this.save_symbol.className = 'save-btn';
    this.save_symbol.onclick = function(){buttons_segments.save_experiment();};
    this.save_symbol.tabIndex = 0;
    this.save_symbol.onkeypress = function(e){if(e.keyCode == 13){buttons_segments.save_experiment();}};
    this.save.appendChild(this.save_symbol);
    this.content_pane.appendChild(this.save);

    this.back = document.createElement('div');
    this.back.className = 'btn';
    this.back.style.right = '0px';
    this.back_symbol = document.createElement('div');
    this.back_symbol.className = 'back-btn';
    this.back_symbol.onclick = function(){buttons_segments.go_back();};
    this.back_symbol.tabIndex = 0;
    this.back_symbol.onkeypress = function(e){if(e.keyCode == 13){buttons_segments.go_back();}};
    this.back.appendChild(this.back_symbol);
    this.content_pane.appendChild(this.back);

}

//posts an add segment request to the server. adds a default row with start and end 0, rate 0, and duration 10
WaveformButtonsSegments.prototype.add_segment = function(){

    var add_defaults = [0, 0, 0, 10];

    var position = this.panel.gui.panels[this.panel.gui.config.views['WaveformTableSegments']].view.row_count;
    var pattern = this.panel.gui.panels[this.panel.gui.config.views['WaveformTablePatterns']].view.selected_row;

    //send add signal
    httpcomm.eihttp.add_segment(add_defaults[0], add_defaults[1], add_defaults[2], add_defaults[3], pattern);

    //add new table row
    this.panel.gui.panels[this.panel.gui.config.views['WaveformTableSegments']].view.addRow(position, add_defaults);

    //update select dots
    this.panel.gui.panels[this.panel.gui.config.views['WaveformTableSegments']].view.labels.childNodes[0].childNodes[0].className = 'select-dot';

}

//deletes selected rows. if none selected, deletes the last one. if all selected, deletes all but the first one
WaveformButtonsSegments.prototype.delete_segment = function(){
    //find rows to delete
    var table = this.panel.gui.panels[this.panel.gui.config.views['WaveformTableSegments']].view;
    positions = table.getSelected().reverse();  //reverse order so array indices don't get mixed up
    if (positions.length == 0){
        positions.push(table.rows.length - 1);
    }
    if (positions.length == table.rows.length){
        positions = positions.splice(0, (positions.length - 1));
    }

    //send delete signal
    var pattern = this.panel.gui.panels[this.panel.gui.config.views['WaveformTablePatterns']].view.selected_row;
    httpcomm.eihttp.delete_segment(positions, pattern);

    //delete rows
    for (var n = 0; n < positions.length; n++){
        table.input_table.removeChild(table.rows[positions[n]]);    //remove the element
        table.rows.splice(positions[n], 1);                         //remove from row list
        table.row_count --;
    }

    //update the rows in the table
    table.updatePositions();

}

//posts a save to the server
WaveformButtonsSegments.prototype.save_experiment = function(){
    httpcomm.eihttp.save_experiment();
    alert('saved');
}

//go back to the previous screen
WaveformButtonsSegments.prototype.go_back = function(){
    client.gui.popConfig([]);
}

//-----------------------------//
