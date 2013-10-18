//global variables
var chart;

$(document).ready(function(){ //function is called when the page is loaded and ready

    //create client and httpcomm
    client = new Client();
    httpcomm = new HTTPcomm();

    //create the configs
    welcome = new Welcome(client.gui);
    editor = new WaveformEditor(client.gui);
    run_exp = new RunExperiment(client.gui);

    //add the first config
    client.gui.newConfig(welcome, []);
    //client.gui.newConfig(run_exp, []);

    //run the polling
    httpcomm.run();

});
