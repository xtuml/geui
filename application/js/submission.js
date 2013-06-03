//contains methods that talk to the server

//validate inputes and then add a segment
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

//deletes segment, creates a csv with the indices of segments to delete.
function deleteSegments(positions){
    var csv = '';
    for (var n = 0; n < positions.length; n++){
        csv += positions[n].toString() + ',';
    }
    csv = csv.substring(0,csv.length - 1);
    $.post('delete_segment',csv,function(data){updateChart(data);}); //post to server to delete segment
}

//validates inputs and then updates a row
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

//switches a segment with the segment before or after (see tables.switchRow for call)
function switchSegment(msg){
    $.post('switch_segment',msg,function(data){updateChart(data);});
}
