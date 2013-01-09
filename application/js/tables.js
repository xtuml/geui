var highlighted_row = 0;

function init_table(){    

    openFile();

}

function addSegmentClicked(){
    var table = document.getElementById("tbody");
    addRow(
        document.getElementById('end_value'+(table.rows.length-1)).value,
        document.getElementById('start_value'+(table.rows.length-1)).value,
        document.getElementById('rate'+(table.rows.length-1)).value*-1,
        document.getElementById('duration'+(table.rows.length-1)).value,
        document.getElementById('repeat_value'+(table.rows.length-1)).value,
        true
    );
}

function addRow(start_value, end_value, rate, duration, repeat_value, updateIt){

    var table = document.getElementById("tbody");

    var rowCount = table.rows.length;
    var row = table.insertRow(rowCount);
    row.id = 'row'+rowCount;
                              
    var check_cell  = row.insertCell(0);
    check_cell.setAttribute("style","text-align: center; vertical-align: middle");
    var check_element  = document.createElement("input");
    check_element.type = "checkbox";
    check_element.setAttribute("style", "margin-left: auto; margin-right: auto; margin-top: auto; margin-bottom: auto");
    check_element.id = "check"+rowCount;
    check_element.row_number = rowCount;
    check_cell.appendChild(check_element);

    var number_cell = row.insertCell(1);
    number_cell.setAttribute("style","text-align: center; vertical-align: middle");
    var number_element = document.createElement('b');
    number_element.innerHTML = rowCount+1;
    number_cell.appendChild(number_element);

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
    start_element.value = cleanUp(start_value);
    start_element.autocomplete = "off";
    start_element.onkeypress = function (e){
        if (e.keyCode == 13){
            start_element.value = cleanUp(start_element.value);
            updateRow(rowCount);
        }
    };
    start_element.onblur = function() {
        if (validateSimple('start_value'+rowCount,'real') == true){
            start_element.value = cleanUp(start_element.value);
        }
    };
    start_div_element.appendChild(start_element);
    //start_cell.appendChild(start_element);

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
    end_element.value = cleanUp(end_value);
    end_element.autocomplete = "off";
    end_element.setAttribute('onkeypress','keyHandler(event, '+rowCount+')');
    end_element.onkeypress = function (e){
        if (e.keyCode == 13){
            end_element.value = cleanUp(end_element.value);
            updateRow(rowCount);
        }
    };
    end_element.onblur = function() {
        if (validateSimple('end_value'+rowCount,'real') == true){
            end_element.value = cleanUp(end_element.value);
        }
    };
    end_div_element.appendChild(end_element);

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
    rate_element.value = cleanUp(rate);
    rate_element.autocomplete = "off";
    rate_element.setAttribute('onkeypress','keyHandler(event, '+rowCount+')');
    rate_element.onkeypress = function (e){
        if (e.keyCode == 13){
            rate_element.value = cleanUp(rate_element.value);
            updateRow(rowCount);
        }
    };
    rate_element.onblur = function() {
        if (validateSimple('rate'+rowCount,'real') == true){
            rate_element.value = cleanUp(rate_element.value);
        }
    };
    rate_div_element.appendChild(rate_element);

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
    duration_element.value = cleanUp(duration);
    duration_element.autocomplete = "off";
    duration_element.setAttribute('onkeypress','keyHandler(event, '+rowCount+')');
    duration_element.onkeypress = function (e){
        if (e.keyCode == 13){
            duration_element.value = cleanUp(duration_element.value);
            updateRow(rowCount);
        }
    };
    duration_element.onblur = function() {
        if (validateSimple('duration'+rowCount,'positive_real') == true){
            duration_element.value = cleanUp(duration_element.value);
        }
    };
    duration_div_element.appendChild(duration_element);

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
            repeat_element.value = cleanUp(repeat_element.value);
            updateRow(rowCount);
        }
    };
    repeat_element.onblur = function() {
        validateSimple('repeat_value'+rowCount,'integer');
    };
    repeat_div_element.appendChild(repeat_element);
    
    var button_cell = row.insertCell(7);
    button_cell.setAttribute("style","text-align: center; vertical-align: middle");
    var button_element = document.createElement("button");
    button_element.type = "button";
    button_element.setAttribute('class', "btn");
    button_element.id = "btn"+rowCount;
    button_element.name = button_element.id;
    button_element.innerHTML = "Update";
    button_element.onclick = function() {updateRow(rowCount)};
    button_cell.appendChild(button_element);

    if (updateIt == true){
        if (addSegment(rowCount) == false){
            table.deleteRow(rowCount);
        }
    }
}

//deleteRows will be used in the final product. deleteRow only deletes the last segment. will be used for now
function deleteRows(){
    try {
        var table = document.getElementById('tbody');
        var rowCount = table.rows.length;
        document.getElementById('table_check').checked = false;
                               
        for(var i=0; i<rowCount; i++) {
            var row = table.rows[i];
            var chkbox = row.cells[0].childNodes[0];
            if(null != chkbox && true == chkbox.checked) {
                table.deleteRow(i);
                rowCount--;
                i--;
            }
        }

    }catch(e) {
        alert(e);
    }
}

function openFile(){
    $.post('open',function(data){
        if (data == ''){
            addRow(0,0,0,10,1,true);
        }
        else{
            updateChart(data);
            $.post('open_table',function(data){
                var lines = data.split('\n');
                for (line in lines){
                    var items = lines[line].split(',');

                    //populate array
                    var param_set  = [];

                    for (item in items){
                        param_set.push(parseFloat(items[item]));
                    }
                    addRow(param_set[0],param_set[1],param_set[2],param_set[3],1,false);
                }
            });
        }
    });
}
//end temp functions

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

function keyHandler(e, position){
    if (e.keyCode == 13){
        updateRow(position);
    }
}

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
