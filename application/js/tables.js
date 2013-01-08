var highlighted_row = 0;

function init_table(){    

    addRow();

}

function addRow(){

    var table = document.getElementById("user_table");

    var rowCount = table.rows.length;
    var row = table.insertRow(rowCount);
    row.id = 'row'+rowCount;
                              
    var check_cell  = row.insertCell(0);
    var check_element  = document.createElement("input");
    check_element.type = "checkbox";
    check_element.id = "check"+rowCount;
    check_element.row_number = rowCount;
    check_cell.appendChild(check_element);

    var start_cell = row.insertCell(1);
    var start_element = document.createElement("input");
    start_element.type = "text";
    start_element.class = "input input-xlarge error";
    start_element.id = "start_value"+rowCount;
    start_element.name = "start_value";
    start_element.row_number = rowCount;
    start_element.default_placeholder = "Start value";
    start_element.placeholder = start_element.default_placeholder;
    start_element.onblur = function() {
        validateSimple('start_value'+rowCount,'real');
    };
    start_element.onfocus = function() {
        onFocus(rowCount);
    };
    start_cell.appendChild(start_element);

    var end_cell = row.insertCell(2);
    var end_element = document.createElement("input");
    end_element.type = "text";
    end_element.class = "input input-xlarge";
    end_element.id = "end_value"+rowCount;
    end_element.name = "end_value";
    end_element.row_number = rowCount;
    end_element.default_placeholder = "End value";
    end_element.placeholder = end_element.default_placeholder;
    end_element.onblur = function() {validateSimple('end_value'+rowCount,'real')};
    end_element.onblur = function() {
        validateSimple('end_value'+rowCount,'real');
    };
    end_element.onfocus = function() {
        onFocus(rowCount);
    };
    end_cell.appendChild(end_element);

    var rate_cell = row.insertCell(3);
    var rate_element = document.createElement("input");
    rate_element.type = "text";
    rate_element.class = "input input-xlarge";
    rate_element.id = "rate"+rowCount;
    rate_element.name = "rate";
    rate_element.row_number = rowCount;
    rate_element.default_placeholder = "Rate";
    rate_element.placeholder = rate_element.default_placeholder;
    rate_element.onblur = function() {validateSimple('rate'+rowCount,'real')};
    rate_element.onblur = function() {
        validateSimple('rate'+rowCount,'real');
    };
    rate_element.onfocus = function() {
        onFocus(rowCount);
    };
    rate_cell.appendChild(rate_element);

    var duration_cell = row.insertCell(4);
    var duration_element = document.createElement("input");
    duration_element.type = "text";
    duration_element.class = "input input-xlarge";
    duration_element.id = "duration"+rowCount;
    duration_element.name = "duration";
    duration_element.row_number = rowCount;
    duration_element.default_placeholder = "Duration";
    duration_element.placeholder = duration_element.default_placeholder;
    duration_element.onblur = function() {validateSimple('duration'+rowCount,'positive_real')};
    duration_element.onblur = function() {
        validateSimple('duration'+rowCount,'positive_real');
    };
    duration_element.onfocus = function() {
        onFocus(rowCount);
    };
    duration_cell.appendChild(duration_element);

    var repeat_cell = row.insertCell(5);
    var repeat_element = document.createElement("input");
    repeat_element.type = "text";
    repeat_element.class = "input input-xlarge";
    repeat_element.id = "repeat_value"+rowCount;
    repeat_element.name = "repeat";
    repeat_element.row_number = rowCount;
    repeat_element.default_placeholder = "Repeats";
    repeat_element.placeholder = repeat_element.default_placeholder;
    repeat_element.onblur = function() {
        validateSimple('repeat_value'+rowCount,'integer');
    };
    repeat_element.onfocus = function() {
        onFocus(rowCount);
    };
    repeat_cell.appendChild(repeat_element);
    
    var button_cell = row.insertCell(6);
    var button_element = document.createElement("button");
    button_element.type = "button";
    button_element.class = "btn";
    button_element.id = "btn"+rowCount;
    button_element.name = button_element.id;
    button_element.onclick = function() {submitIt(rowCount)};
    button_cell.appendChild(button_element);
}

//deleteRows will be used in the final product. deleteRow only deletes the last segment. will be used for now
function deleteRows(){
    try {
        var table = document.getElementById('user_table');
        var rowCount = table.rows.length;
        document.getElementById('table_check').checked = false;
                               
        for(var i=1; i<rowCount; i++) {
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

function deleteRow(){
    try {
        var table = document.getElementById('user_table');
        var rowCount = table.rows.length;

        if (rowCount > 2){
            table.deleteRow(rowCount-1);
            $.post('delete_segment',function(data){deletePoints(data)}); //post to server to delete segment
        }
        else{
        }
    }
    catch(e){
        alert(e);
    }
}


function submitIt(rowCount){
    $.post('add_segment',$('#row'+(rowCount)+' :input').serialize()+'&position='+(rowCount),function(data){updateChart(data)});
}

function onFocus(position){
    if (highlighted_row != position){
        var table = document.getElementById('user_table');
        table.rows[position].style.backgroundColor = '#848484';
        table.rows[highlighted_row].style.backgroundColor = 'white';
        highlighted_row = position;
    }
}

function selectAll(){
    var table = document.getElementById('user_table');
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
