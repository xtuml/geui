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

    this.eihttp.update_graph = function(del, add, update){
        client.gui.panels[client.gui.config.views['WaveformChart']].view.updateChart(del, add, update);
    }

    this.eihttp.load_table = function(rows){
        client.gui.panels[client.gui.config.views['WaveformTable']].view.loadTable(rows);

    }

    this.eihttp.version = function(version){
        alert('Version: ' + version);
    }

    //-------------------------//

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
}

//add to config stack

Gui.prototype.newConfig = function(new_config, args){

    //set timeout
    var timeout = 0;
    if (this.config != null){
        timeout = this.config.exit_time;
        this.config.exit(0);
    }

    var self = this;
    setTimeout(function(){
        //prepare new config
        new_config.prepare(args);

        //enter the new config
        new_config.enter(0);

        //adjust stack
        self.configs.push(self.config);
        self.config = new_config;
    },(timeout * 1000));

}

//pop from config stack
Gui.prototype.popConfig = function(args){

    var timeout = this.config.exit_time;
    this.config.exit(0);

    var new_config = this.configs.pop();
    var self = this;
    setTimeout(function(){
        if (new_config != null){
            //prepare new config
            new_config.prepare(args);

            //enter new config
            new_config.enter(0);
        }

        //adjust stack
        this.config = new_config;
    }, (timeout * 1000));

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
    this.element.removeChild(this.view.element);
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
