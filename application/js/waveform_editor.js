/*

Defines the WaveformEditor configuration

Defines WaveformChart, WaveformTable, and 
WaveformButtons view classes.

*/


// WaveformEditor class -------//

function WaveformEditor(gui){
    this.gui = gui;
    this.gui.config = this;

    this.enter_time = 0.45; //time it takes to enter in seconds
    this.exit_time = 0.45;  //time it takes to exit in seconds

    //object holding addresses to each of the views
    this.views = {
        WaveformChart: 'TL',
        WaveformTable: 'ML',
        WaveformButtons: 'BL'
    };
}

WaveformEditor.prototype.enter = function(){
    //create the views
    new_gui.panels['TL'].addView(new WaveformChart(new_gui.panels['TL']));
    new_gui.panels['TL'].view.initiateChart();
    new_gui.panels['ML'].addView(new WaveformTable(new_gui.panels['ML']));
    new_gui.panels['BL'].addView(new WaveformButtons(new_gui.panels['BL']));

    //setup the animation
}

WaveformEditor.prototype.exit = function(){
}

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
    this.panel.updateSize(this.height, this.width);
    this.content_pane.id = 'chart_container';
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
            color: '#07F862',
            data: []
        }]
    };

    this.chart = new Highcharts.Chart(options);
}

//updates chart points
WaveformChart.prototype.updateChart = function(data){
    //deserialize data
    var data2 = $.deparam(data);
   
    //delete points 
    var delete_num = parseInt(data2["delete"]);
    for (var c = 0; c < delete_num; c++){
        this.chart.series[0].data[this.chart.series[0].data.length - 1].remove() 
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
                
            this.chart.series[0].addPoint(point);
                
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
                
            this.chart.series[0].data[index].update(point);
                    
        }
    }
    

}
//-----------------------------//



// WaveformTable class --------//

function WaveformTable(panel){
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
    this.width = '100%';
    this.panel.updateSize(this.height, this.width);

    //temporary fix. will be changed when I implement automatic resizing of the panels.
    this.panel.element.style.top = 'calc((100% - 64px) / 2)';
    this.panel.element.style.top = '-webkit-calc((100% - 64px) / 2)';

    //container for the value rows
    this.input_table = document.createElement('div');
    this.input_table.className = 'input-table';
    this.input_table.parent_view = this;
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
        integer: {
            method: function integer(value){
                return /^(0|-?[1-9][0-9]*)$/.test(value);
            },
            message: 'Enter a valid integer',
            decimals: 0
        },
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
        },
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
WaveformTable.prototype.addRow = function(position, values){
    var row = document.createElement('div');
    row.className = 'table-row row-ease';
    var y = position * 50;
    row.style.top = y + 'px';
    row.parent_view = this;
    row.selected = false
    row.row_num = position + 1;
    row.onblur = function(){alert('blur')};

    var select_cell = document.createElement('div');
    select_cell.className = 'select-cell';
    select_cell.name = 'select_cell';
    select_cell.parent_view = this;
    var select_dot = document.createElement('div');
    select_dot.className = 'select-dot';
    select_dot.parent_view = this;
    select_dot.parent_row = row;
    select_cell.appendChild(select_dot);
    select_cell.onclick = function(e){
        var dot;
        if (e.target.childNodes.length > 0){
            dot = e.target.childNodes[0];
        }
        else{
            dot = e.target;
        }
        if (dot.className == 'select-dot'){
            dot.className = 'select-dot selected';
            dot.parent_row.selected = true;
        }
        else{
            dot.className = 'select-dot';
            dot.parent_row.selected = false;
        }
        var selected = dot.parent_view.getSelected();
        if (selected.length == dot.parent_view.row_count){
            dot.parent_view.labels.childNodes[0].childNodes[0].className = 'select-dot selected';
        }
        else{
            dot.parent_view.labels.childNodes[0].childNodes[0].className = 'select-dot';
        }
    };
    row.appendChild(select_cell);

    var number_cell = document.createElement('div');
    number_cell.className = 'number-cell';
    number_cell.name = 'number_cell';
    number_cell.innerHTML = position + 1;
    number_cell.parent_view = this;
    number_cell.row_num = position + 1;
    number_cell.onmouseover = function(e){e.target.parent_view.numOver(e.target);};
    number_cell.onmouseout = function(e){e.target.parent_view.numOut(e.target);};
    number_cell.onmousedown = function(e){e.target.parent_view.startDrag(e);};
    row.appendChild(number_cell);

    var start_cell = document.createElement('div');
    start_cell.className = 'value-cell';
    start_cell.name = 'start_cell';
    start_cell.style.left = '100px';
    start_cell.parent_view = this;
    var start_input_wrapper = document.createElement('div');
    start_input_wrapper.className = 'input-wrapper';
    start_input_wrapper.parent_view = this;
    start_input_wrapper.parent_row = this;
    var start_input = document.createElement('input');
    start_input.className = 'value-input';
    start_input.placeholder = this.value_format['start_value']['placeholder'];
    start_input.parent_view = this;
    start_input.parent_row = row;
    start_input.value = this.formatNum(values[0], this.value_format['start_value']['format']);
    start_input.onblur = function(e){
        e.target.parent_view.validateSimple([e.target.parent_row.row_num, 2],'start_value',e.target.parent_view.value_format['start_value']['format']);
    };
    start_input.onkeypress = function(e){
       if (e.keyCode == 13){        //enter key 
           e.target.parent_view.update(e.target.parent_row.row_num);
       }
    }
    var start_label = document.createElement('div');
    start_label.className = 'input-label';
    start_label.parent_view = this;
    start_label.parent_row = this;
    start_label.innerHTML = this.value_format['start_value']['units'];
    start_input_wrapper.appendChild(start_input);
    start_input_wrapper.appendChild(start_label);
    start_cell.appendChild(start_input_wrapper);
    row.appendChild(start_cell);

    var end_cell = document.createElement('div');
    end_cell.className = 'value-cell';
    end_cell.name = 'end_cell';
    end_cell.style.left = 'calc(((100% - 150px) / 5) + 100px)';
    end_cell.style.left = '-webkit-calc(((100% - 150px) / 5) + 100px)';
    end_cell.parent_view = this;
    var end_input_wrapper = document.createElement('div');
    end_input_wrapper.className = 'input-wrapper';
    end_input_wrapper.parent_view = this;
    end_input_wrapper.parent_row = this;
    var end_input = document.createElement('input');
    end_input.className = 'value-input';
    end_input.placeholder = this.value_format['end_value']['placeholder'];
    end_input.parent_view = this;
    end_input.parent_row = row;
    end_input.value = this.formatNum(values[1], this.value_format['end_value']['format']);
    end_input.onblur = function(e){
        e.target.parent_view.validateSimple([e.target.parent_row.row_num, 3],'end_value',e.target.parent_view.value_format['end_value']['format']);
    };
    end_input.onkeypress = function(e){
       if (e.keyCode == 13){        //enter key 
           e.target.parent_view.update(e.target.parent_row.row_num);
       }
    }
    var end_label = document.createElement('div');
    end_label.className = 'input-label';
    end_label.parent_view = this;
    end_label.parent_row = this;
    end_label.innerHTML = this.value_format['end_value']['units'];
    end_input_wrapper.appendChild(end_input);
    end_input_wrapper.appendChild(end_label);
    end_cell.appendChild(end_input_wrapper);
    row.appendChild(end_cell);

    var rate_cell = document.createElement('div');
    rate_cell.className = 'value-cell';
    rate_cell.name = 'rate_cell';
    rate_cell.style.left = 'calc((((100% - 150px) / 5) * 2) + 100px)';
    rate_cell.style.left = '-webkit-calc((((100% - 150px) / 5) * 2) + 100px)';
    rate_cell.parent_view = this;
    var rate_input_wrapper = document.createElement('div');
    rate_input_wrapper.className = 'input-wrapper';
    rate_input_wrapper.parent_view = this;
    rate_input_wrapper.parent_row = this;
    var rate_input = document.createElement('input');
    rate_input.className = 'value-input';
    rate_input.placeholder = this.value_format['rate']['placeholder'];
    rate_input.parent_view = this;
    rate_input.parent_row = row;
    rate_input.value = this.formatNum(values[2], this.value_format['rate']['format']);
    rate_input.onblur = function(e){
        e.target.parent_view.validateSimple([e.target.parent_row.row_num, 4],'rate',e.target.parent_view.value_format['rate']['format']);
    };
    rate_input.onkeypress = function(e){
       if (e.keyCode == 13){        //enter key 
           e.target.parent_view.update(e.target.parent_row.row_num);
       }
    }
    var rate_label = document.createElement('div');
    rate_label.className = 'input-label';
    rate_label.parent_view = this;
    rate_label.parent_row = this;
    rate_label.innerHTML = this.value_format['rate']['units'];
    rate_input_wrapper.appendChild(rate_input);
    rate_input_wrapper.appendChild(rate_label);
    rate_cell.appendChild(rate_input_wrapper);
    row.appendChild(rate_cell);

    var duration_cell = document.createElement('div');
    duration_cell.className = 'value-cell';
    duration_cell.name = 'duration_cell';
    duration_cell.style.left = 'calc((((100% - 150px) / 5) * 3) + 100px)';
    duration_cell.style.left = '-webkit-calc((((100% - 150px) / 5) * 3) + 100px)';
    duration_cell.parent_view = this;
    var duration_input_wrapper = document.createElement('div');
    duration_input_wrapper.className = 'input-wrapper';
    duration_input_wrapper.parent_view = this;
    duration_input_wrapper.parent_row = this;
    var duration_input = document.createElement('input');
    duration_input.className = 'value-input';
    duration_input.placeholder = this.value_format['duration']['placeholder'];
    duration_input.parent_view = this;
    duration_input.parent_row = row;
    duration_input.value = this.formatNum(values[3], this.value_format['duration']['format']);
    duration_input.onblur = function(e){
        e.target.parent_view.validateSimple([e.target.parent_row.row_num, 5],'duration',e.target.parent_view.value_format['duration']['format']);
    };
    duration_input.onkeypress = function(e){
       if (e.keyCode == 13){        //enter key 
           e.target.parent_view.update(e.target.parent_row.row_num);
       }
    }
    var duration_label = document.createElement('div');
    duration_label.className = 'input-label';
    duration_label.parent_view = this;
    duration_label.parent_row = this;
    duration_label.innerHTML = this.value_format['duration']['units'];
    duration_input_wrapper.appendChild(duration_input);
    duration_input_wrapper.appendChild(duration_label);
    duration_cell.appendChild(duration_input_wrapper);
    row.appendChild(duration_cell);

    var repeat_cell = document.createElement('div');
    repeat_cell.className = 'value-cell';
    repeat_cell.name = 'repeat_cell';
    repeat_cell.style.left = 'calc((((100% - 150px) / 5) * 4) + 100px)';
    repeat_cell.style.left = '-webkit-calc((((100% - 150px) / 5) * 4) + 100px)';
    repeat_cell.parent_view = this;
    var repeat_input_wrapper = document.createElement('div');
    repeat_input_wrapper.className = 'input-wrapper';
    repeat_input_wrapper.parent_view = this;
    repeat_input_wrapper.parent_row = this;
    var repeat_input = document.createElement('input');
    repeat_input.className = 'value-input';
    repeat_input.placeholder = this.value_format['repeat_value']['placeholder'];
    repeat_input.parent_view = this;
    repeat_input.parent_row = row;
    repeat_input.value = this.formatNum(values[4], this.value_format['repeat_value']['format']);
    repeat_input.onblur = function(e){
        e.target.parent_view.validateSimple([e.target.parent_row.row_num, 6],'repeat_value',e.target.parent_view.value_format['repeat_value']['format']);
    };
    repeat_input.onkeypress = function(e){
       if (e.keyCode == 13){        //enter key 
           e.target.parent_view.update(e.target.parent_row.row_num);
       }
    }
    var repeat_label = document.createElement('div');
    repeat_label.className = 'input-label';
    repeat_label.parent_view = this;
    repeat_label.parent_row = this;
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
    update_cell.parent_view = this;
    var update_button = document.createElement('div');
    update_button.className = 'btn';
    update_button.style.height = '44px';
    update_button.style.width = '44px';
    update_button.style.top = '2px';
    update_button.style.left = '2px';
    update_button.parent_view = this;
    var update_symbol = document.createElement('div');
    update_symbol.className = 'update-btn';
    update_symbol.parent_view = this;
    update_symbol.parent_row = row;
    update_symbol.tabIndex = 0;
    update_symbol.onclick = function(e){e.target.parent_view.update(e.target.parent_row.row_num)}
    update_symbol.onkeypress = function(e){
        if (e.keyCode == 13){        //enter key 
            e.target.parent_view.update(e.target.parent_row.row_num);
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
WaveformTable.prototype.addMainRow = function(){
    var row = document.createElement('div');
    row.className = 'main-row';
    row.style.top = '0px';
    row.parent_view = this;

    var select_cell = document.createElement('div');
    select_cell.className = 'select-cell';
    select_cell.parent_view = this;
    var select_dot = document.createElement('div');
    select_dot.className = 'select-dot';
    select_dot.style.top = '7px';
    select_dot.parent_view = this;
    select_cell.appendChild(select_dot);
    select_cell.onclick = function(e){
        var dot;
        if (e.target.childNodes.length > 0){
            dot = e.target.childNodes[0];
        }
        else{
            dot = e.target;
        }
        if (dot.className == 'select-dot'){
            dot.className = 'select-dot selected';
            for (var c = 0;c < dot.parent_view.rows.length;c++){
                dot.parent_view.rows[c].selected = true;
                dot.parent_view.rows[c].childNodes[0].childNodes[0].className = 'select-dot selected';
            }
        }
        else{
            dot.className = 'select-dot';
            for (var c = 0;c < dot.parent_view.rows.length;c++){
                dot.parent_view.rows[c].selected = false;
                dot.parent_view.rows[c].childNodes[0].childNodes[0].className = 'select-dot';
            }
        }
    };
    row.appendChild(select_cell);

    var number_cell = document.createElement('div');
    number_cell.className = 'number-cell';
    number_cell.parent_view = this;
    row.appendChild(number_cell);

    var start_cell = document.createElement('div');
    start_cell.className = 'label-cell';
    start_cell.style.left = '100px';
    start_cell.parent_view = this;
    start_cell.innerHTML = this.value_format['start_value']['label'];
    row.appendChild(start_cell);

    var end_cell = document.createElement('div');
    end_cell.className = 'label-cell';
    end_cell.style.left = 'calc(((100% - 150px) / 5) + 100px)';
    end_cell.style.left = '-webkit-calc(((100% - 150px) / 5) + 100px)';
    end_cell.parent_view = this;
    end_cell.innerHTML = this.value_format['end_value']['label'];
    row.appendChild(end_cell);

    var rate_cell = document.createElement('div');
    rate_cell.className = 'label-cell';
    rate_cell.style.left = 'calc((((100% - 150px) / 5) * 2) + 100px)';
    rate_cell.style.left = '-webkit-calc((((100% - 150px) / 5) * 2) + 100px)';
    rate_cell.parent_view = this;
    rate_cell.innerHTML = this.value_format['rate']['label'];
    row.appendChild(rate_cell);

    var duration_cell = document.createElement('div');
    duration_cell.className = 'label-cell';
    duration_cell.style.left = 'calc((((100% - 150px) / 5) * 3) + 100px)';
    duration_cell.style.left = '-webkit-calc((((100% - 150px) / 5) * 3) + 100px)';
    duration_cell.parent_view = this;
    duration_cell.innerHTML = this.value_format['duration']['label'];
    row.appendChild(duration_cell);

    var repeat_cell = document.createElement('div');
    repeat_cell.className = 'label-cell';
    repeat_cell.style.left = 'calc((((100% - 150px) / 5) * 4) + 100px)';
    repeat_cell.style.left = '-webkit-calc((((100% - 150px) / 5) * 4) + 100px)';
    repeat_cell.parent_view = this;
    repeat_cell.innerHTML = this.value_format['repeat_value']['label'];
    row.appendChild(repeat_cell);

    var update_cell = document.createElement('div');
    update_cell.className = 'update-cell';
    update_cell.style.left = 'calc(100% - 50px)';
    update_cell.style.left = '-webkit-calc(100% - 50px)';
    update_cell.parent_view = this;
    row.appendChild(update_cell);

    this.content_pane.appendChild(row);
    return row;
}

// changes appearance of number cell when hovered
WaveformTable.prototype.numOver = function(num){
    num.innerHTML = '';
    num.className = 'number-cell dots';
}

// changes appearance of number cell when mouse out
WaveformTable.prototype.numOut = function(num){
    num.className = 'number-cell';
    num.innerHTML = num.row_num;
}


//validates the format of the numbers only
//called everytime the focus leaves the input box and when it is submitted
WaveformTable.prototype.validateSimple = function(address, type, method){
    //validation code 
    var value_cell = this.rows[address[0] - 1].childNodes[address[1]];
    var value = $.trim(value_cell.childNodes[0].childNodes[0].value);

    if (value == '' || this.validate_methods[method]['method'](value)){
        value_cell.className = 'value-cell';
        value_cell.childNodes[0].childNodes[0].placeholder = this.value_format[type]['placeholder'];
        if (value != ''){
            value_cell.childNodes[0].childNodes[0].value = this.formatNum(value, method);
        }
        return true;
    }
    else{
        value_cell.className = 'value-cell value-invalid';
        value_cell.childNodes[0].childNodes[0].value = '';
        value_cell.childNodes[0].childNodes[0].placeholder = this.validate_methods[method]['message'];
        return false;
    }

}

//validates the interdependencies of the values 
WaveformTable.prototype.validateComplex = function(row_num){
    //variable if ok to submit or not
    var submit = false;

    //row_num is the index of the row starting at 1 not 0
    var value_inputs = [
        this.rows[row_num - 1].childNodes[2].childNodes[0].childNodes[0],
        this.rows[row_num - 1].childNodes[3].childNodes[0].childNodes[0],
        this.rows[row_num - 1].childNodes[4].childNodes[0].childNodes[0],
        this.rows[row_num - 1].childNodes[5].childNodes[0].childNodes[0]
    ];

    var repeat_input = this.rows[row_num - 1].childNodes[6].childNodes[0];

    //check repeat cell
    //check if it's blank
    if (repeat_input.value == ''){
        repeat_input.parentNode.className = 'value-cell value-invalid';
        repeat_input.placeholder = 'Must enter a value';
    }

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
WaveformTable.prototype.formatNum = function(value, method){
    return (value*1).toFixed(this.validate_methods[method]['decimals']);
}

//updates a row's values and posts the update to the server
WaveformTable.prototype.update = function(row_num){
    //row_num is row index (starting at 1)
    if (
        this.validateSimple([row_num, 2], 'start_value', this.value_format['start_value']['format']) &&
        this.validateSimple([row_num, 3], 'end_value', this.value_format['end_value']['format']) &&
        this.validateSimple([row_num, 4], 'rate', this.value_format['rate']['format']) &&
        this.validateSimple([row_num, 5], 'duration', this.value_format['duration']['format']) &&
        this.validateSimple([row_num, 6], 'repeat_value', this.value_format['repeat_value']['format']) &&
        this.validateComplex(row_num)
    ){
        var update_message = '';
        update_message += 'start_value=' + this.rows[parseInt(row_num) - 1].childNodes[2].childNodes[0].childNodes[0].value;
        update_message += '&end_value=' + this.rows[parseInt(row_num) - 1].childNodes[3].childNodes[0].childNodes[0].value;
        update_message += '&rate=' + this.rows[parseInt(row_num) - 1].childNodes[4].childNodes[0].childNodes[0].value;
        update_message += '&duration=' + this.rows[parseInt(row_num) - 1].childNodes[5].childNodes[0].childNodes[0].value;
        update_message += '&repeat_value=' + this.rows[parseInt(row_num) - 1].childNodes[6].childNodes[0].childNodes[0].value;
        update_message += '&position=' + (parseInt(row_num) - 1);
        var self = this;
        this.update_callback = function(data){
            self.panel.gui.panels['TL'].view.updateChart(data);
        }
        
        $.post('update_segment',update_message,this.update_callback);
    }
}

// gets the selected rows and returns as array of row indices
WaveformTable.prototype.getSelected = function(){
    var selected = [];
    for (var c = 0;c < this.rows.length;c++){
        if (this.rows[c].selected == true){
            selected.push(c);
        }
    }
    return selected;
}

// updates the positions of the rows when it's deleted or moved
WaveformTable.prototype.updatePositions = function(){
    for (var c = 0;c < this.rows.length;c++){
        var y = c * 50;
        this.rows[c].style.top = y + 'px';
        this.rows[c].childNodes[1].innerHTML = (c + 1);
        this.rows[c].row_num = (c + 1);
        this.rows[c].childNodes[1].row_num = (c + 1);
    }
}

//starts drag of a row
WaveformTable.prototype.startDrag = function(ev){
    //bring row to front
    for (var c = 0;c < this.rows.length;c++){
        this.rows[c].style.zIndex = 0;
    }
    ev.target.parentNode.style.zIndex = 1;

    //set offset variables
    this.y_offset = ev.offsetY;
    this.table_offset = ev.pageY - (ev.offsetY + ev.target.parentNode.offsetTop);
    this.drag_row = ev.target.parentNode;
    this.drag_row_index = this.drag_row.row_num - 1;
    this.drag_initial_index = this.drag_row_index;
    this.drag_row.className = 'table-row';

    //add listeners
    this.input_table.onmousemove = function(e){
        e.target.parent_view.drag(e);
    };
    this.input_table.onmouseup = function(e){
        e.target.parent_view.endDrag(e);
    };
    $(this.input_table).mouseleave(function(e){
        e.target.parent_view.endDrag(e);
    });
}

//dragging a row
WaveformTable.prototype.drag = function(ev){
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
            this.rows[c].row_num = (c + 1);
            this.rows[c].childNodes[1].row_num = (c + 1);
        }
    }

}

//ends the drag of a row
WaveformTable.prototype.endDrag = function(ev){
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
    this.drag_row.className = 'table-row row-ease';

    //post updates to the server
    var move_message = this.drag_initial_index + ',' + this.drag_row_index;
    var self = this;
    this.move_callback = function(data){

        self.panel.gui.panels['TL'].view.updateChart(data);
    }
    $.post('move_segment',move_message,this.move_callback);

    //remove listeners
    this.input_table.onmousemove = null;
    $(this.input_table).unbind();
    this.input_table.onmouseup = null;
}

//-----------------------------//



// WaveformButtons class ------//
function WaveformButtons(panel){
    //attributes that all views have:
    this.panel = panel;
    this.element = document.createElement('div');
    this.element.className = 'app-cubby';
    this.content_pane = document.createElement('div');
    this.content_pane.className = 'app-content';
    this.element.appendChild(this.content_pane);
    //------------------------------//

    this.height = '64px';
    this.width = '100%';
    this.panel.updateSize(this.height, this.width);
    
    //temporary fix. will be changed when I implement automatic resizing of the panels.
    this.panel.element.style.top = 'calc(100% - 64px)';
    this.panel.element.style.top = '-webkit-calc(100% - 64px)';

    this.add = document.createElement('div');
    this.add.className = 'btn';
    this.add.parent_view = this;
    this.add_symbol = document.createElement('div');
    this.add_symbol.className = 'add-btn';
    this.add_symbol.parent_view = this;
    this.add_symbol.onclick = function(e){e.target.parent_view.add_segment();};
    this.add_symbol.tabIndex = 0;
    this.add_symbol.onkeypress = function(e){if(e.keyCode == 13){e.target.parent_view.add_segment();}};
    this.add.appendChild(this.add_symbol);
    this.content_pane.appendChild(this.add);

    this.remove = document.createElement('div');
    this.remove.className = 'btn';
    this.remove.style.left = '52px';
    this.remove.parent_view = this;
    this.remove_symbol = document.createElement('div');
    this.remove_symbol.className = 'delete-btn';
    this.remove_symbol.parent_view = this;
    this.remove_symbol.onclick = function(e){e.target.parent_view.delete_segment();};
    this.remove_symbol.tabIndex = 0;
    this.remove_symbol.onkeypress = function(e){if(e.keyCode == 13){e.target.parent_view.delete_segment();}};
    this.remove.appendChild(this.remove_symbol);
    this.content_pane.appendChild(this.remove);
    
    this.save = document.createElement('div');
    this.save.className = 'btn';
    this.save.style.left = '104px';
    this.save.parent_view = this;
    this.save_symbol = document.createElement('div');
    this.save_symbol.className = 'save-btn';
    this.save_symbol.parent_view = this;
    this.save_symbol.onclick = function(e){e.target.parent_view.save_experiment();};
    this.save_symbol.tabIndex = 0;
    this.save_symbol.onkeypress = function(e){if(e.keyCode == 13){e.target.parent_view.save_experiment();}};
    this.save.appendChild(this.save_symbol);
    this.content_pane.appendChild(this.save);

    this.back = document.createElement('div');
    this.back.className = 'btn';
    this.back.style.right = '0px';
    this.back.parent_view = this;
    this.back_symbol = document.createElement('div');
    this.back_symbol.className = 'back-btn';
    this.back_symbol.parent_view = this;
    this.back_symbol.onclick = function(e){e.target.parent_view.go_back();};
    this.back_symbol.tabIndex = 0;
    this.back_symbol.onkeypress = function(e){if(e.keyCode == 13){e.target.parent_view.go_back();}};
    this.back.appendChild(this.back_symbol);
    this.content_pane.appendChild(this.back);

}

//posts an add segment request to the server. adds a default row with start and end 0, rate 0, and duration 10
WaveformButtons.prototype.add_segment = function(){
    var add_message = '';
    add_message += 'start_value=0&end_value=0&rate=0&duration=10&repeat_value=1&position='
    var position = this.panel.gui.panels['ML'].view.row_count;
    add_message += position;
    var self = this;
    this.add_callback = function(data){
        //add new table row
        self.panel.gui.panels['ML'].view.addRow(position, [0,0,0,10,1]);

        //update select dots
        var selected = self.panel.gui.panels['ML'].view.getSelected();
        if (selected.length == self.panel.gui.panels['ML'].view.row_count){
            self.panel.gui.panels['ML'].view.labels.childNodes[0].childNodes[0].className = 'select-dot selected';
        }
        else{
            self.panel.gui.panels['ML'].view.labels.childNodes[0].childNodes[0].className = 'select-dot';
        }
        self.panel.gui.panels['TL'].view.updateChart(data);

        //check if scrollbar needed
    }
    $.post('add_segment',add_message,this.add_callback);
}

//deletes selected rows. if none selected, deletes the last one. if all selected, deletes all but the first one
WaveformButtons.prototype.delete_segment = function(){
    //find rows to delete
    var table = this.panel.gui.panels['ML'].view;
    positions = table.getSelected().reverse();  //reverse order so array indices don't get mixed up
    if (positions.length == 0){
        positions.push(table.rows.length - 1);
    }
    if (positions.length == table.rows.length){
        positions = positions.splice(0, (positions.length - 1));
    }

    //create string of segments to delete
    var csv = '';
    for (var n = 0; n < positions.length; n++){
        csv += positions[n].toString() + ',';
        table.input_table.removeChild(table.rows[positions[n]]);    //remove the element
        table.rows.splice(positions[n], 1);                         //remove from row list
        table.row_count --;
    }
    csv = csv.substring(0,csv.length - 1);

    //update the rows in the table
    table.updatePositions();

    //post the delete request
    var self = this;
    this.delete_callback = function(data){
        self.panel.gui.panels['TL'].view.updateChart(data);
    }
    $.post('delete_segment',csv,this.delete_callback); //post to server to delete segment
}

//posts a save to the server
WaveformButtons.prototype.save_experiment = function(){
    this.save_callback = function(data){
        alert('saved');
    }
    $.post('save',this.save_callback); //post to server to save experiment
}

//go back to the previous screen
WaveformButtons.prototype.go_back = function(){
    alert('back');
}

//-----------------------------//
