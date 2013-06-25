//global variables
var chart;

$(document).ready(function(){ //function is called when the page is loaded and ready

    client = new Client();
    gui = new Gui(client);

    welcome = new Welcome(gui);
    editor = new WaveformEditor(gui);

    gui.newConfig(welcome, []);

});
