//global variables
var chart;

$(document).ready(function(){ //function is called when the page is loaded and ready

    //create client, interface, and gui
    client = new Client();

    //create the configs
    welcome = new Welcome(client.gui);
    editor = new WaveformEditor(client.gui);

    //add the first config
    client.gui.newConfig(welcome, []);

});
