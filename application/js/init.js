//global variables
var chart;

$(document).ready(function(){
    
    document.getElementById('move_up').onclick = function(){switchRow(true);};
    document.getElementById('move_down').onclick = function(){switchRow(false);};

    initiateGraph();
    init_table();

});
