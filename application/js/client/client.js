/*

Definition of Client, Gui, and Panel classes
Loader class is a spinning loader visual

Gui and Panel have methods for adding deleting and moving views.

*/

// Client class ---------------//

function Client(){

    //client information
    this.name = ''
    this.key = null;

    //session information
    this.session = new Session();

    this.gui = new Gui();

    // eihttp class -----------//
    // interfaces with agent
    // incoming signals
    this.eihttp = function(){
        //interface definition
    }

    this.eihttp.update_graph = function(points){
        client.gui.panels[client.gui.config.views['WaveformChart']].view.updateChart(points);
    }

    this.eihttp.load_table = function(rows, table_id){
        client.gui.config.loadTable(rows, table_id);
    }

    this.eihttp.version = function(version){
        client.gui.message.setMessage('Version: ' + version);
        client.gui.message.show();
    }

    this.eihttp.load_experiments = function(experiments){
        for (exp in experiments){
            client.gui.panels[client.gui.config.views['OpenExperiment']].view.addRow(experiments[exp]);
        }
    }

    this.eihttp.upload_success = function(name){
        client.gui.panels[client.gui.config.views['OpenExperiment']].view.openFile(name);
    }

    this.eihttp.session_increment = function(name, start_time, increment){
        login.updateSession(name, start_time, increment);
    }

    this.eihttp.session = function(name, start_time, increment){
        client.gui.config.loadSession(name, start_time, increment);
    }

    //-------------------------//

}

Client.prototype.get_hash = function(value){
    return value + 1;
}

//-----------------------------//



// Session class --------------//

function Session(){
    this.name = '';
    this.start_time = '';
    this.increment = 0;
}

//-----------------------------//



// Gui class ------------------//

function Gui(){
    this.config = null;         //current config or perspective
    this.configs = [];          //stack of configs or perspectives
    this.panels = {
        'TL': new Panel('TL',this),
        'TR': new Panel('TR',this),
        'ML': new Panel('ML',this),
        'MR': new Panel('MR',this),
        'BL': new Panel('BL',this),
        'BR': new Panel('BR',this)
    };
    this.loader = new Loader(this);
    this.message = new Message(this);
    this.confirmation = new Confirmation(this);
    this.login = new Login(this);
}

//update panel positions
Gui.prototype.clearPanels = function(){
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
        timeout = this.config.exit_time;        //timeout is in seconds
        this.config.exit(0);
    }

    //adjust stack
    this.configs.push(this.config);
    this.config = new_config;

    setTimeout(function(){

        //prepare new config
        new_config.prepare(args);

        setTimeout(function(){

            //enter the new config
            new_config.enter(0);

        }, 10);        //10 milliseconds to allow prepare

    },(timeout * 1000));

}

//pop from config stack
Gui.prototype.popConfig = function(args){

    var timeout = this.config.exit_time;
    this.config.exit(0);

    var new_config = this.configs.pop();

    //adjust stack
    this.config = new_config;

    if (new_config != null){
        setTimeout(function(){

            //prepare new config
            new_config.prepare(args);

            setTimeout(function(){

                //enter new config
                new_config.enter(0);

            }, 10);        //10 milliseconds to allow prepare

        }, (timeout * 1000));
    }

}

//-----------------------------//



// Loader class ---------------//

function Loader(gui){
    this.gui = gui;
    this.element = document.getElementById('spinner_container');
    this.element.style.display = 'none';
}

Loader.prototype.show = function(){
    this.element.style.display = 'block';
}

Loader.prototype.hide = function(){
    this.element.style.display = 'none';
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
