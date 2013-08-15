//global variables
var chart;

$(document).ready(function(){ //function is called when the page is loaded and ready

    //create client and httpcomm
    client = new Client();
    httpcomm = new HTTPcomm();

    //create the configs
    welcome = new Welcome(client.gui);
    editor = new WaveformEditor(client.gui);

    //login
    login_protocol = function(){
        client.gui.login.show(function(){
            if (client.key == 9999){
                //add welcome config
                client.gui.newConfig(welcome, []);
            }
            else{
                client.gui.message.setMessage('Invalid key.');
                client.gui.message.show(login_protocol);
            }
        });
    }
    login_protocol()

    //run the polling
    httpcomm.run();

});
