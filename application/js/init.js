//global variables
var chart;

$(document).ready(function(){ //function is called when the page is loaded and ready

    new_client = new Client();
    new_gui = new Gui(new_client);

    new_gui.panels['TL'].addView(new WaveformChart(new_gui.panels['TL']));
    new_gui.panels['TL'].view.initiateChart();
    
    new_gui.panels['ML'].addView(new WaveformTable(new_gui.panels['ML']));

    new_gui.panels['BL'].addView(new WaveformButtons(new_gui.panels['BL']));



    $.post('open','test',function(data){
        //if there is no file, go back to open dialog
        if (data != 'NoFile'){
            new_gui.panels['TL'].view.updateChart(data);
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
                new_gui.panels['ML'].view.addRow(new_gui.panels['ML'].view.row_count, [param_set[0],param_set[1],param_set[2],param_set[3],1]);
            }
        }
    });

});
