function addSegment(position){
    if (
        validateSimple('start_value'+position,'real') &&
        validateSimple('end_value'+position,'real') &&
        validateSimple('rate'+position,'real') &&
        validateSimple('duration'+position,'positive_real') &&
        validateComplex(position)
    ){
        var row  = document.getElementById('tbody').rows[position];
        $.post('add_segment',$('#row'+(position)+' :input').serialize()+'&position='+(position),function(data){updateChart(data)});
    }
    else{
        var table = document.getElementById('tbody');
        table.deleteRow(table.rows.length);
    }
}

function deleteSegments(positions){
    var csv = '';
    for (var n = 0; n < positions.length; n++){
        csv += positions[n].toString() + ',';
    }
    csv = csv.substring(0,csv.length - 1);
    $.post('delete_segment',csv,function(data){updateChart(data);}); //post to server to delete segment
}

function updateRow(position){ //needs to be optimized
    if (
        validateSimple('start_value'+position,'real') &&
        validateSimple('end_value'+position,'real') &&
        validateSimple('rate'+position,'real') &&
        validateSimple('duration'+position,'positive_real') &&
        validateComplex(position)
    ){
        $.post('update_segment',$('#row'+(position)+' :input').serialize()+'&position='+(position),function(data){updateChart(data);});
    }
}

function switchRow(up){
    var table = document.getElementById('tbody');
    var checked = -1
    for (var row = 0; row < table.rows.length; row++){
        if (table.rows[row].cells[0].childNodes[0].checked == true){
            checked = row;
        }
    }
    if (checked != -1){
        var offset = 0;
        if (up == true){
            offset = -1;
            $.post('switch_segment',(checked-1) + ',' + checked,function(data){updateChart(data);});
        }
        else{
            offset = 1;
            $.post('switch_segment',checked + ',' + (checked+1),function(data){updateChart(data);});
        }
        
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

        table.rows[checked].cells[0].childNodes[0].checked = false;
        table.rows[checked+offset].cells[0].childNodes[0].checked = true;

        checkClicked(checked+offset);
    }
}

function pyusb_test(){ //temporary function to test if we can send data down to the board and get a reply
    var request = 'hello world'
    $.post('pyusb',request,function(data){alert(data);});
}
