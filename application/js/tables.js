//called at the very beginning of the program
function init_table(){

    //openFile();

}

//called when the "Add Segment" button is clicked
function addSegmentClicked(){
    var table = document.getElementById("tbody");
    addRow(
        document.getElementById('end_value'+(table.rows.length-1)).value,
        document.getElementById('start_value'+(table.rows.length-1)).value,
        document.getElementById('rate'+(table.rows.length-1)).value*-1,
        document.getElementById('duration'+(table.rows.length-1)).value,
        document.getElementById('repeat_value'+(table.rows.length-1)).value
    );
    addSegment(table.rows.length - 1);
}

//dynamically add a row to the table
function addRow(start_value, end_value, rate, duration, repeat_value){

    var table = document.getElementById("tbody");

    var rowCount = table.rows.length;
    var row = table.insertRow(rowCount);
    row.id = 'row'+rowCount;
                              
    //checkbox
    var check_cell  = row.insertCell(0);
    check_cell.setAttribute("style","text-align: center; vertical-align: middle");
    var check_element  = document.createElement("input");
    check_element.type = "checkbox";
    check_element.setAttribute("style", "margin-left: auto; margin-right: auto; margin-top: auto; margin-bottom: auto");
    check_element.id = "check"+rowCount;
    check_element.row_number = rowCount;
    check_element.onclick = function(){checkClicked(check_element.row_number)};
    check_cell.appendChild(check_element);

    //row number
    var number_cell = row.insertCell(1);
    number_cell.setAttribute("style","text-align: center; vertical-align: middle");
    var number_element = document.createElement('b');
    number_element.innerHTML = rowCount+1;
    number_cell.appendChild(number_element);

    //start_value
    var start_cell = row.insertCell(2);
    start_cell.setAttribute("style","text-align: center; vertical-align: middle");
    var start_div_element = document.createElement("div");
    start_div_element.setAttribute("class", "control-group");
    start_div_element.setAttribute("style", "margin-left: auto; margin-right: auto; margin-top: auto; margin-bottom: auto");
    start_cell.appendChild(start_div_element);

    var start_element = document.createElement("input");
    start_element.type = "text";
    start_element.setAttribute("style", "margin-left: auto; margin-right: auto; margin-top: auto; margin-bottom: auto");
    start_element.id = "start_value"+rowCount;
    start_element.name = "start_value";
    start_element.row_number = rowCount;
    start_element.default_placeholder = "Start value";
    start_element.placeholder = start_element.default_placeholder;
    start_element.value = cleanUp(3, start_value);
    start_element.autocomplete = "off";
    start_element.onkeypress = function (e){
        if (e.keyCode == 13){
            start_element.value = cleanUp(3, start_element.value);
            updateRow(start_element.row_number);
        }
    };
    start_element.onblur = function() {
        if (validateSimple('start_value'+start_element.row_number,'real') == true){
            start_element.value = cleanUp(3, start_element.value);
        }
    };
    start_div_element.appendChild(start_element);

    //end_value
    var end_cell = row.insertCell(3);
    end_cell.setAttribute("style","text-align: center; vertical-align: middle");
    var end_div_element = document.createElement("div");
    end_div_element.setAttribute("class", "control-group");
    end_div_element.setAttribute("style", "margin-left: auto; margin-right: auto; margin-top: auto; margin-bottom: auto");
    end_cell.appendChild(end_div_element);

    var end_element = document.createElement("input");
    end_element.type = "text";
    end_element.setAttribute("style", "margin-left: auto; margin-right: auto; margin-top: auto; margin-bottom: auto");
    end_element.id = "end_value"+rowCount;
    end_element.name = "end_value";
    end_element.row_number = rowCount;
    end_element.default_placeholder = "End value";
    end_element.placeholder = end_element.default_placeholder;
    end_element.value = cleanUp(3, end_value);
    end_element.autocomplete = "off";
    end_element.setAttribute('onkeypress','keyHandler(event, '+rowCount+')');
    end_element.onkeypress = function (e){
        if (e.keyCode == 13){
            end_element.value = cleanUp(3, end_element.value);
            updateRow(end_element.row_number);
        }
    };
    end_element.onblur = function() {
        if (validateSimple('end_value'+ end_element.row_number,'real') == true){
            end_element.value = cleanUp(3, end_element.value);
        }
    };
    end_div_element.appendChild(end_element);

    //rate
    var rate_cell = row.insertCell(4);
    rate_cell.setAttribute("style","text-align: center; vertical-align: middle");
    var rate_div_element = document.createElement("div");
    rate_div_element.setAttribute("class", "control-group");
    rate_div_element.setAttribute("style", "margin-left: auto; margin-right: auto; margin-top: auto; margin-bottom: auto");
    rate_cell.appendChild(rate_div_element);

    var rate_element = document.createElement("input");
    rate_element.type = "text";
    rate_element.setAttribute("style", "margin-left: auto; margin-right: auto; margin-top: auto; margin-bottom: auto");
    rate_element.id = "rate"+rowCount;
    rate_element.name = "rate";
    rate_element.row_number = rowCount;
    rate_element.default_placeholder = "Rate";
    rate_element.placeholder = rate_element.default_placeholder;
    rate_element.value = cleanUp(3, rate);
    rate_element.autocomplete = "off";
    rate_element.setAttribute('onkeypress','keyHandler(event, '+rowCount+')');
    rate_element.onkeypress = function (e){
        if (e.keyCode == 13){
            rate_element.value = cleanUp(3, rate_element.value);
            updateRow(rate_element.row_number);
        }
    };
    rate_element.onblur = function() {
        if (validateSimple('rate'+ rate_element.row_number,'real') == true){
            rate_element.value = cleanUp(3, rate_element.value);
        }
    };
    rate_div_element.appendChild(rate_element);

    //duration
    var duration_cell = row.insertCell(5);
    duration_cell.setAttribute("style","text-align: center; vertical-align: middle");
    var duration_div_element = document.createElement("div");
    duration_div_element.setAttribute("class", "control-group");
    duration_div_element.setAttribute("style", "margin-left: auto; margin-right: auto; margin-top: auto; margin-bottom: auto");
    duration_cell.appendChild(duration_div_element);

    var duration_element = document.createElement("input");
    duration_element.type = "text";
    duration_element.setAttribute("style", "margin-left: auto; margin-right: auto; margin-top: auto; margin-bottom: auto");
    duration_element.id = "duration"+rowCount;
    duration_element.name = "duration";
    duration_element.row_number = rowCount;
    duration_element.default_placeholder = "Duration";
    duration_element.placeholder = duration_element.default_placeholder;
    duration_element.value = cleanUp(3, duration);
    duration_element.autocomplete = "off";
    duration_element.setAttribute('onkeypress','keyHandler(event, '+rowCount+')');
    duration_element.onkeypress = function (e){
        if (e.keyCode == 13){
            duration_element.value = cleanUp(3, duration_element.value);
            updateRow(duration_element.row_number);
        }
    };
    duration_element.onblur = function() {
        if (validateSimple('duration'+ duration_element.row_number,'positive_real') == true){
            duration_element.value = cleanUp(3, duration_element.value);
        }
    };
    duration_div_element.appendChild(duration_element);

    //repeat_value
    var repeat_cell = row.insertCell(6);
    repeat_cell.setAttribute("style","text-align: center; vertical-align: middle");
    var repeat_div_element = document.createElement("div");
    repeat_div_element.setAttribute("class", "control-group");
    repeat_div_element.setAttribute("style", "margin-left: auto; margin-right: auto; margin-top: auto; margin-bottom: auto");
    repeat_cell.appendChild(repeat_div_element);

    var repeat_element = document.createElement("input");
    repeat_element.type = "text";
    repeat_element.setAttribute("style", "margin-left: auto; margin-right: auto; margin-top: auto; margin-bottom: auto");
    repeat_element.id = "repeat_value"+rowCount;
    repeat_element.name = "repeat";
    repeat_element.row_number = rowCount;
    repeat_element.default_placeholder = "Repeats";
    repeat_element.placeholder = repeat_element.default_placeholder;
    repeat_element.value = repeat_value;
    repeat_element.autocomplete = "off";
    repeat_element.onkeypress = function (e){
        if (e.keyCode == 13){
            repeat_element.value = cleanUp(0, repeat_element.value);
            updateRow(repeat_element.row_number);
        }
    };
    repeat_element.onblur = function() {
        validateSimple('repeat_value'+ repeate_element.row_number,'integer');
    };
    repeat_div_element.appendChild(repeat_element);
    
    var button_cell = row.insertCell(7);
    button_cell.setAttribute("style","text-align: center; vertical-align: middle");
    var button_element = document.createElement("button");
    button_element.type = "button";
    button_element.setAttribute('class', "btn");
    button_element.id = "btn"+rowCount;
    button_element.name = button_element.id;
    button_element.row_number = rowCount
    button_element.innerHTML = "Update";
    button_element.onclick = function() {updateRow(button_element.row_number)};
    button_cell.appendChild(button_element);

    //if there is only one row, disallow deleting rows
    if (table.rows.length > 1){
        document.getElementById('delete_segment').disabled = false;
    }
    else{
        document.getElementById('delete_segment').disabled = true;
    }

}

//delete rows from the table then delete the segments
function deleteRows(){
    try {
        //setup
        var table = document.getElementById('tbody');
        var rowCount = table.rows.length;
        document.getElementById('table_check').checked = false;
                               
        //collect the rows that need to be delete
        var to_delete = [];
        for(var i=0; i<rowCount; i++) {
            var row = table.rows[i];
            var chkbox = row.cells[0].childNodes[0];
            if(null != chkbox && true == chkbox.checked) {
                to_delete.push(parseInt(i))
            }
        }
        to_delete.reverse();
        
        //if all are selected, force the first one to deselect
        if (to_delete.length == rowCount){ //if all are selected, force the first one to deselect
            to_delete.splice(to_delete.length - 1, 1);
            table.rows[0].cells[0].childNodes[0].checked = false;
        }
        //if none are selected, delete the last segment
        else if (to_delete.length == 0){ //if none are selected, delete the last segment
            to_delete.push(rowCount - 1);
        }
        //delete rows
        for (var m=0; m<to_delete.length; m++){
            table.deleteRow(to_delete[m]);
        }
        //delete segments (see submission.js)
        deleteSegments(to_delete);

        //update row numbers
        renumberRows(to_delete[to_delete.length - 1]);

        //if there is only one row, disallow deleting rows
        if (table.rows.length > 1){
            document.getElementById('delete_segment').disabled = false;
        }
        else{
            document.getElementById('delete_segment').disabled = true;
        }


    }catch(e) {
        alert(e);
    }
}

//switch the values in two adjacent rows
function switchRow(up){
    //setup
    var table = document.getElementById('tbody');
    var checked = -1

    //select row to switch
    for (var row = 0; row < table.rows.length; row++){
        if (table.rows[row].cells[0].childNodes[0].checked == true){
            checked = row;
        }
    }
    
    //if a row is selected
    if (checked != -1){
        var offset = 0;
        var msg = ''

        //if it's switching with the one above
        if (up == true){
            offset = -1;
            msg = (checked-1) + ',' + checked;
            
        }
        //if it's switching with the one below
        else{
            offset = 1;
            msg = checked + ',' + (checked+1);
        }

        //switch segments
        switchSegment(msg);
        
        //switch table values
        var temp = [
            document.getElementById('start_value'+checked).value,
            document.getElementById('end_value'+checked).value,
            document.getElementById('rate'+checked).value,
            document.getElementById('duration'+checked).value,
            document.getElementById('repeat_value'+checked).value
        ];

        document.getElementById('start_value'+checked).value = document.getElementById('start_value'+(checked+offset)).value;
        document.getElementById('end_value'+checked).value = document.getElementById('end_value'+(checked+offset)).value;
        document.getElementById('rate'+checked).value = document.getElementById('rate'+(checked+offset)).value;
        document.getElementById('duration'+checked).value = document.getElementById('duration'+(checked+offset)).value;
        document.getElementById('repeat_value'+checked).value = document.getElementById('repeat_value'+(checked+offset)).value;

        document.getElementById('start_value'+(checked+offset)).value = temp[0];
        document.getElementById('end_value'+(checked+offset)).value = temp[1];
        document.getElementById('rate'+(checked+offset)).value = temp[2];
        document.getElementById('duration'+(checked+offset)).value = temp[3];
        document.getElementById('repeat_value'+(checked+offset)).value = temp[4];

        //switch checkbox values
        table.rows[checked].cells[0].childNodes[0].checked = false;
        table.rows[checked+offset].cells[0].childNodes[0].checked = true;

        checkClicked(checked+offset);
    }
}

//renumbers all the rows below the one updated
//update the numbers and identifiers of rows after some have been deleted
function renumberRows(pos){ // update the numbers and identifiers of rows after some have been deleted
    var table = document.getElementById('tbody');

    if (pos < table.rows.length){
        table.rows[pos].id = 'row'+pos;
        table.rows[pos].cells[0].childNodes[0].id = 'check'+pos;
        table.rows[pos].cells[0].childNodes[0].row_number = pos;
        table.rows[pos].cells[1].childNodes[0].innerHTML = (pos + 1).toString();
        table.rows[pos].cells[2].childNodes[0].childNodes[0].id = 'start_value'+pos;
        table.rows[pos].cells[2].childNodes[0].childNodes[0].row_number = pos
        table.rows[pos].cells[3].childNodes[0].childNodes[0].id = 'end_value'+pos; 
        table.rows[pos].cells[3].childNodes[0].childNodes[0].row_number = pos; 
        table.rows[pos].cells[4].childNodes[0].childNodes[0].id = 'rate'+pos; 
        table.rows[pos].cells[4].childNodes[0].childNodes[0].row_number = pos; 
        table.rows[pos].cells[5].childNodes[0].childNodes[0].id = 'duration'+pos; 
        table.rows[pos].cells[5].childNodes[0].childNodes[0].row_number = pos; 
        table.rows[pos].cells[6].childNodes[0].childNodes[0].id = 'repeat_value'+pos; 
        table.rows[pos].cells[6].childNodes[0].childNodes[0].row_number = pos; 
        table.rows[pos].cells[7].childNodes[0].row_number = pos;
    }

    if (pos < table.rows.length - 1){
        renumberRows(pos + 1);
    }
    
}

//defines behavior when the select all checkbox is clicked
function selectAll(){
    var table = document.getElementById('tbody');
    var ckbx = document.getElementById('table_check');
    if (ckbx.checked == true){
        for (row in table.rows){
            table.rows[row].cells[0].childNodes[0].checked = true;
        }
    }
    else{
        for (row in table.rows){
            table.rows[row].cells[0].childNodes[0].checked = false;
        }
    }
}

//called when any checkbox is clicked
function checkClicked(row_num){
    var table = document.getElementById('tbody');
    var checked = 0;

    //counts how many are clicked
    for (var row = 0; row < table.rows.length; row++){
        if (table.rows[row].cells[0].childNodes[0].checked == true){
            checked ++;
        }
    }

    //buttons disabled for certain checkbox conditions
    if (checked == 1){
        document.getElementById('move_up').disabled = false;
        document.getElementById('move_down').disabled = false;
    }
    else{
        if (checked == table.rows.length){
            document.getElementById('table_check').checked = true;
        }
        else if (checked == 0){
            document.getElementById('table_check').checked = false;
        }

        document.getElementById('move_up').disabled = true;
        document.getElementById('move_down').disabled = true;
    }
    if (table.rows[0].cells[0].childNodes[0].checked == true){
        document.getElementById('move_up').disabled = true;
    }
    if (table.rows[table.rows.length - 1].cells[0].childNodes[0].checked == true){
        document.getElementById('move_down').disabled = true;
    }
}

//updates row when enter is pressed
function keyHandler(e, position){
    if (e.keyCode == 13){ //Enter
        updateRow(position);
    }
}

//expands/contracts the chart when fullscreen is clicked
function fullscreen(){
    var chart_container = document.getElementById('chart_container');
    var table_container = document.getElementById('table_container');
    if (chart_container.style.height == '325px'){
        chart_container.style.height = '625px';
        table_container.style.height = '25px';
    }
    else{
        chart_container.style.height = '325px';
        table_container.style.height = '325px';
    }
    var new_options = chart.options;
    chart.destroy();
    chart = new Highcharts.Chart(new_options);
}


//temporary place for these methods
function createExperiment(){
    $('#open_dialog').modal('hide');
    $.post('create',document.getElementById('new_experiment_input').value,function(data){
        addRow(0,0,0,10,1);
        addSegment(document.getElementById('tbody').rows.length - 1);
    });
}

function saveExperiment(){
    $.post('save',function(data){
        alert('saved');    
    });
}

function openExperiment(){
    //open an existing file
    $.post('open',document.getElementById('open_experiment_input').value,function(data){
        //if there is no file, go back to open dialog
        if (data != 'NoFile'){
            $('#open_dialog').modal('hide');
            updateChart(data)
            //create table rows from the file
            var data2 = $.deparam(data);
            var lines = data2["table"].split('\n');
            for (line in lines){
                var items = lines[line].split(',');

                //populate array
                var param_set  = [];

                for (item in items){
                    param_set.push(parseFloat(items[item]));
                }
                addRow(param_set[0],param_set[1],param_set[2],param_set[3],1);
            }
        }
    });
}
