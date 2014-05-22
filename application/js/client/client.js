/*

Definition of Client, Gui, and Panel classes

Gui and Panel have methods for adding deleting and moving views.

*/

// Client class ---------------//

function Client(){
    this.gui = new Gui();

    // eihttp class -----------//
    // interfaces with agent
    // incoming signals
    this.eihttp = function(){
        //interface definition
    }

    this.eihttp.version = function(version){
        alert("Version: " + version);
    }

    this.eihttp.data = function(points, action){
        client.gui.panels[client.gui.config.views["DataChart"]].view.pending_points.push(points);
        if (action == "start"){
            //start the data polling
            httpcomm.receive_data();
        }
        else if (action == "stop"){
            //stop data polling
            httpcomm.receiving_data = false;
            client.gui.panels[client.gui.config.views["DataChart"]].view.pending_points.push(action);
        }
        else if (action == "onepacket"){
            client.gui.panels[client.gui.config.views["DataChart"]].view.updateChart();
            client.gui.panels[client.gui.config.views["DataChart"]].view.pending_points.push("stop");
        }
        else{
        }
    }

    this.eihttp.update_graph = function(points){
        client.gui.panels[client.gui.config.views["WaveformChart"]].view.updateChart(points);
    }

    this.eihttp.load_table = function(rows, table_id){
        client.gui.config.loadTable(rows, table_id);
    }

    this.eihttp.load_experiments = function(experiments){
        for (exp in experiments){
            client.gui.panels[client.gui.config.views["OpenExperiment"]].view.addRow(experiments[exp]);
        }
    }

    this.eihttp.upload_success = function(name){
        client.gui.panels[client.gui.config.views["OpenExperiment"]].view.openFile(name);
    }

    //-------------------------//

}

//-----------------------------//



// Gui class ------------------//

function Gui(){
    this.header = document.getElementById("header");    // header banner
    this.header_element = null;

    this.config = null;         //current config or perspective
    this.configs = [];          //stack of configs or perspectives
    this.panels = {
        "TL": new Panel("TL",this),
        "TR": new Panel("TR",this),
        "ML": new Panel("ML",this),
        "MR": new Panel("MR",this),
        "BL": new Panel("BL",this),
        "BR": new Panel("BR",this)
    };

    // spinner object
    this.loader = document.getElementById("spinner_container");
    this.loader.style.display = "none";

    // GUI settings
    this.settings = new Settings();
}

// add header object
Gui.prototype.addHeader = function(header){
    this.header.appendChild(header);
    this.header_element = header;
}

//update panel positions
Gui.prototype.clearPanels = function(){
    // remove header
    if (this.header_element != null) {
        this.header.removeChild(this.header_element);
        this.header_element = null;
    }

    // remove views
    for (panel in this.panels){
        this.panels[panel].removeView();
        this.panels[panel].updateSize(0, 0);
        this.panels[panel].updatePosition(0, 0);
    }
}

//add to config stack
Gui.prototype.newConfig = function(new_config, args){

    //set timeout
    var timeout = 0;
    if (this.config != null){
        timeout = this.config.getDelay();        //timeout is in seconds
        this.config.exit();
    }

    //adjust stack
    this.configs.push(this.config);
    this.config = new_config;

    setTimeout(function(){

        //prepare new config
        new_config.prepare(args);

        setTimeout(function(){

            //enter the new config
            new_config.enter();

        }, 10);        //10 milliseconds to allow prepare

    },(timeout * 1000));

}

//pop from config stack
Gui.prototype.popConfig = function(args){

    var timeout = this.config.getDelay();
    this.config.exit();

    var new_config = this.configs.pop();

    //adjust stack
    this.config = new_config;

    if (new_config != null){
        setTimeout(function(){

            //prepare new config
            new_config.prepare(args);

            setTimeout(function(){

                //enter new config
                new_config.enter();

            }, 10);        //10 milliseconds to allow prepare

        }, (timeout * 1000));
    }

}

//-----------------------------//



// Settings class -------------//

function Settings() {
    this.animations = false;
}

//-----------------------------//



// Panel class ----------------//

function Panel(position, gui){
    this.position = position;
    this.gui = gui;
    this.element = document.getElementById(position);
    this.view = null;
}

Panel.prototype.addView = function(view){
    this.view = view;
    this.element.appendChild(view.element);
}

Panel.prototype.removeView = function(){
    if (this.view != null){
        this.element.removeChild(this.view.element);
    }
    this.view = null;
}

Panel.prototype.updateSize = function(height, width){
    this.element.style.height = height;
    this.element.style.width = width;
}

Panel.prototype.updatePosition = function(x, y){
    this.element.style.left = x;
    this.element.style.top = y;
}

//-----------------------------//
