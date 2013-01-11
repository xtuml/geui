function addSegment(position){
    if (
        validateSimple('start_value'+position,'real') &&
        validateSimple('end_value'+position,'real') &&
        validateSimple('rate'+position,'real') &&
        validateSimple('duration'+position,'positive_real') &&
        validateComplex(position)
    ){
        $.post('add_segment',$('#row'+(position)+' :input').serialize()+'&position='+(position),function(data){updateChart(data)});
        return true;
    }
    else{
        return false;
    }
}

function deleteSegment(){
    try {
        var table = document.getElementById('tbody');
        var rowCount = table.rows.length;

        if (rowCount > 1){
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

function updateRow(position){ //needs to be optimized
    if (
        validateSimple('start_value'+position,'real') &&
        validateSimple('end_value'+position,'real') &&
        validateSimple('rate'+position,'real') &&
        validateSimple('duration'+position,'positive_real') &&
        validateComplex(position)
    ){
        $.post('delete_segment',position.toString(),function(data){
            deletePoints(data)
            $.post('add_segment',$('#row'+(position)+' :input').serialize()+'&position='+(position),function(data){updateChart(data)});
        });
    }
}
