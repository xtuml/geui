/*

Defines WaveformChart, WaveformTable, and WaveformButtons
classes.

*/


// WaveformChart class --------//

function WaveformChart(panel){
    //attributes that all views have:
    this.panel = panel;
    this.element = document.createElement('div');
    this.element.className = 'app-cubby';
    this.content_pane = document.createElement('div');
    this.content_pane.className = 'app-content';
    this.element.appendChild(this.content_pane);

    this.chart;

    this.height = 'calc((100% - 64px) / 2)';
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

    this.height = 'calc((100% - 64px) / 2)';
    this.width = '100%';
    this.panel.updateSize(this.height, this.width);

    //temporary fix. will be changed when I implement automatic resizing of the panels.
    this.panel.element.style.top = 'calc((100% - 64px) / 2)';

    this.input_table = document.createElement('div');
    this.input_table.className = 'input-table';
    this.content_pane.appendChild(this.input_table);

    this.addMainRow();

    this.row_count = 0;
    this.rows = []
}

WaveformTable.prototype.addRow = function(position, values){
    var row = document.createElement('div');
    row.className = 'table-row';
    var y = position * 50;
    row.style.top = y + 'px';
    row.parent_view = this;
    row.selected = false
    row.row_num = position + 1;

    var select_cell = document.createElement('div');
    select_cell.className = 'select-cell';
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
    };
    row.appendChild(select_cell);

    var number_cell = document.createElement('div');
    number_cell.className = 'number-cell';
    number_cell.innerHTML = position + 1;
    number_cell.parent_view = this;
    number_cell.row_num = position + 1;
    number_cell.onmouseover = function(e){e.target.parent_view.numOver(e.target);};
    number_cell.onmouseout = function(e){e.target.parent_view.numOut(e.target);};
    row.appendChild(number_cell);

    var start_cell = document.createElement('div');
    start_cell.className = 'value-cell';
    start_cell.style.left = '100px';
    start_cell.parent_view = this;
    var start_input = document.createElement('input');
    start_input.className = 'value-input';
    start_input.placeholder = 'Start value';
    start_input.parent_view = this;
    start_input.parent_row = row;
    start_input.value = values[0];
    start_input.onkeypress = function(e){
       if (e.keyCode == 13){        //enter key 
           e.target.parent_view.update(e.target.parent_row.row_num);
       }
    }
    start_cell.appendChild(start_input);
    row.appendChild(start_cell);

    var end_cell = document.createElement('div');
    end_cell.className = 'value-cell';
    end_cell.style.left = 'calc(((100% - 100px) / 5) + 100px)';
    end_cell.parent_view = this;
    var end_input = document.createElement('input');
    end_input.className = 'value-input';
    end_input.placeholder = 'End value';
    end_input.parent_view = this;
    end_input.parent_row = row;
    end_input.value = values[1];
    end_input.onkeypress = function(e){
       if (e.keyCode == 13){        //enter key 
           e.target.parent_view.update(e.target.parent_row.row_num);
       }
    }
    end_cell.appendChild(end_input);
    row.appendChild(end_cell);

    var rate_cell = document.createElement('div');
    rate_cell.className = 'value-cell';
    rate_cell.style.left = 'calc((((100% - 100px) / 5) * 2) + 100px)';
    rate_cell.parent_view = this;
    var rate_input = document.createElement('input');
    rate_input.className = 'value-input';
    rate_input.placeholder = 'Rate';
    rate_input.parent_view = this;
    rate_input.parent_row = row;
    rate_input.value = values[2];
    rate_input.onkeypress = function(e){
       if (e.keyCode == 13){        //enter key 
           e.target.parent_view.update(e.target.parent_row.row_num);
       }
    }
    rate_cell.appendChild(rate_input);
    row.appendChild(rate_cell);

    var duration_cell = document.createElement('div');
    duration_cell.className = 'value-cell';
    duration_cell.style.left = 'calc((((100% - 100px) / 5) * 3) + 100px)';
    duration_cell.parent_view = this;
    var duration_input = document.createElement('input');
    duration_input.className = 'value-input';
    duration_input.placeholder = 'Duration';
    duration_input.parent_view = this;
    duration_input.parent_row = row;
    duration_input.value = values[3];
    duration_input.onkeypress = function(e){
       if (e.keyCode == 13){        //enter key 
           e.target.parent_view.update(e.target.parent_row.row_num);
       }
    }
    duration_cell.appendChild(duration_input);
    row.appendChild(duration_cell);

    var repeat_cell = document.createElement('div');
    repeat_cell.className = 'value-cell';
    repeat_cell.style.left = 'calc((((100% - 100px) / 5) * 4) + 100px)';
    repeat_cell.parent_view = this;
    var repeat_input = document.createElement('input');
    repeat_input.className = 'value-input';
    repeat_input.placeholder = 'Repeat value';
    repeat_input.parent_view = this;
    repeat_input.parent_row = row;
    repeat_input.value = values[4];
    repeat_input.onkeypress = function(e){
       if (e.keyCode == 13){        //enter key 
           e.target.parent_view.update(e.target.parent_row.row_num);
       }
    }
    repeat_cell.appendChild(repeat_input);
    row.appendChild(repeat_cell);

    this.input_table.appendChild(row);
    this.row_count += 1;
    this.rows.push(row);
}

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
    start_cell.innerHTML = 'Start value';
    row.appendChild(start_cell);

    var end_cell = document.createElement('div');
    end_cell.className = 'label-cell';
    end_cell.style.left = 'calc(((100% - 100px) / 5) + 100px)';
    end_cell.parent_view = this;
    end_cell.innerHTML = 'End value';
    row.appendChild(end_cell);

    var rate_cell = document.createElement('div');
    rate_cell.className = 'label-cell';
    rate_cell.style.left = 'calc((((100% - 100px) / 5) * 2) + 100px)';
    rate_cell.parent_view = this;
    rate_cell.innerHTML = 'Sweep rate';
    row.appendChild(rate_cell);

    var duration_cell = document.createElement('div');
    duration_cell.className = 'label-cell';
    duration_cell.style.left = 'calc((((100% - 100px) / 5) * 3) + 100px)';
    duration_cell.parent_view = this;
    duration_cell.innerHTML = 'Duration';
    row.appendChild(duration_cell);

    var repeat_cell = document.createElement('div');
    repeat_cell.className = 'label-cell';
    repeat_cell.style.left = 'calc((((100% - 100px) / 5) * 4) + 100px)';
    repeat_cell.parent_view = this;
    repeat_cell.innerHTML = 'Number of repeats';
    row.appendChild(repeat_cell);

    this.content_pane.appendChild(row);
    return row;
}

/*WaveformTable.prototype.hello = function(){
    this.element.className = 'app-cubby fly-out';
    this.element.style.left = 'calc(100% + 10px)';
}*/

WaveformTable.prototype.numOver = function(num){
    num.innerHTML = '';
    num.className = 'number-cell dots';
}

WaveformTable.prototype.numOut = function(num){
    num.className = 'number-cell';
    num.innerHTML = num.row_num;
}

WaveformTable.prototype.update = function(row_num){
    var update_message = '';
    update_message += 'start_value=' + this.rows[parseInt(row_num) - 1].childNodes[2].childNodes[0].value;
    update_message += '&end_value=' + this.rows[parseInt(row_num) - 1].childNodes[3].childNodes[0].value;
    update_message += '&rate=' + this.rows[parseInt(row_num) - 1].childNodes[4].childNodes[0].value;
    update_message += '&duration=' + this.rows[parseInt(row_num) - 1].childNodes[5].childNodes[0].value;
    update_message += '&repeat_value=' + this.rows[parseInt(row_num) - 1].childNodes[6].childNodes[0].value;
    update_message += '&position=' + (parseInt(row_num) - 1);
    var self = this;
    this.update_callback = function(data){
        self.panel.gui.panels['TL'].view.updateChart(data);
    }
    $.post('update_segment',update_message,this.update_callback);
}

WaveformTable.prototype.getSelected = function(){
    var selected = [];
    for (var c = 0;c < this.rows.length;c++){
        if (this.rows[c].selected == true){
            selected.push(c);
        }
    }
    return selected;
}

WaveformTable.prototype.updatePositions = function(){
    for (var c = 0;c < this.rows.length;c++){
        var y = c * 50;
        this.rows[c].style.top = y + 'px';
        this.rows[c].childNodes[1].innerHTML = (c + 1);
        this.rows[c].row_num = (c + 1);
        this.rows[c].childNodes[1].row_num = (c + 1);
    }
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

    this.height = '64px';
    this.width = '100%';
    this.panel.updateSize(this.height, this.width);
    
    //temporary fix. will be changed when I implement automatic resizing of the panels.
    this.panel.element.style.top = 'calc(100% - 64px)';

    this.add = document.createElement('button');
    this.add.className = 'btn-add';
    this.add.parent_view = this;
    this.add.onclick = function(e){e.target.parent_view.add_segment();};
    this.content_pane.appendChild(this.add);
    this.remove = document.createElement('button');
    this.remove.className = 'btn-delete';
    this.remove.style.left = '52px';
    this.remove.parent_view = this;
    this.remove.onclick = function(e){e.target.parent_view.delete_segment();};
    this.content_pane.appendChild(this.remove);
    this.save = document.createElement('button');
    this.save.className = 'btn-save';
    this.save.style.left = '104px';
    this.save.parent_view = this;
    this.save.onclick = function(e){e.target.parent_view.save_experiment();};
    this.content_pane.appendChild(this.save);
    this.back = document.createElement('button');
    this.back.className = 'btn-back';
    this.back.style.right = '0px';
    this.back.parent_view = this;
    this.back.onclick = function(e){e.target.parent_view.go_back();};
    this.content_pane.appendChild(this.back);

}

WaveformButtons.prototype.add_segment = function(){
    var add_message = '';
    add_message += 'start_value=0&end_value=0&rate=0&duration=10&repeat_value=1&position='
    var position = this.panel.gui.panels['ML'].view.row_count;
    add_message += position;
    var self = this;
    this.add_callback = function(data){
        self.panel.gui.panels['ML'].view.addRow(position, [0,0,0,10,1]);
        self.panel.gui.panels['TL'].view.updateChart(data);
    }
    $.post('add_segment',add_message,this.add_callback);
}

WaveformButtons.prototype.delete_segment = function(){
    var table = this.panel.gui.panels['ML'].view;
    positions = table.getSelected().reverse();  //reverse order so array indices don't get mixed up
    if (positions.length == table.rows.length){
        positions = positions.splice(0, (positions.length - 1));
    }
    else if (positions.length == 0){
        positions.push(table.rows.length - 1);
    }
    var csv = '';
    for (var n = 0; n < positions.length; n++){
        csv += positions[n].toString() + ',';
        table.input_table.removeChild(table.input_table.childNodes[positions[n]]);     //remove the element
        table.rows.splice(positions[n], 1);                               //remove from row list
        table.row_count --;
    }
    table.updatePositions();
    csv = csv.substring(0,csv.length - 1);
    var self = this;
    this.delete_callback = function(data){
        self.panel.gui.panels['TL'].view.updateChart(data);
    }
    $.post('delete_segment',csv,this.delete_callback); //post to server to delete segment
}

WaveformButtons.prototype.save_experiment = function(){
    alert('save');
}

WaveformButtons.prototype.go_back = function(){
    alert('back');
}

//-----------------------------//
