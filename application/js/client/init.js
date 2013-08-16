//global variables
var chart;

$(document).ready(function(){ //function is called when the page is loaded and ready

    //create client and httpcomm
    client = new Client();
    httpcomm = new HTTPcomm();

    //create the configs
    welcome = new Welcome(client.gui);
    editor = new WaveformEditor(client.gui);
    login = new LoginConfig(client.gui);

    //add the login config
    client.gui.newConfig(login, []);

    //run the polling
    httpcomm.run();

});
