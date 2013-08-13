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
    this.loader = new Loader(this);
    this.message = new Message(this);
    this.confirmation = new Confirmation(this);
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



// Message class --------------//

function Message(gui){
    this.gui = gui;
    this.container = document.getElementById('dialog_container');
    this.container.style.display = 'none';

    this.message = 'This is a test message.';
    this.button_label = 'OK';

    //add dialog
    this.dialog = document.createElement('div');
    this.dialog.className = 'dialog';
    this.dialog.style.display = 'none';

    //add text
    this.text_background = document.createElement('div');
    this.text_background.className = 'text-background';
    this.text_box = document.createElement('div');
    this.text_box.className = 'text-box';
    this.text_box.innerHTML = this.message;
    this.text_background.appendChild(this.text_box);
    this.dialog.appendChild(this.text_background);

    //add ok button
    this.okbtn = document.createElement('div');
    this.okbtn.className = 'btn ok-btn';
    this.okbtn.innerHTML = this.button_label;
    this.okbtn.tabIndex = 0;
    this.dialog.appendChild(this.okbtn);

    this.container.appendChild(this.dialog);
}

Message.prototype.setMessage = function(text){
    this.message = text;
    this.text_box.innerHTML = this.message;
}

Message.prototype.show = function(){
    var msg = this;
    this.container.style.display = 'block';
    this.dialog.style.display = 'block';
    this.okbtn.onclick = function(){msg.hide()};
    this.okbtn.onkeypress = function(e){if(e.keyCode == 13){msg.hide()}};
    this.okbtn.focus();
}

Message.prototype.hide = function(){
    this.container.style.display = 'none';
    this.dialog.style.display = 'none';
    this.okbtn.onclick = null;
}

//-----------------------------//



// Confirmation class ---------//

function Confirmation(gui){
    this.gui = gui;
    this.container = document.getElementById('dialog_container');
    this.container.style.display = 'none';

    this.message = 'This is a test message.';
    this.yes_label = 'YES';
    this.no_label = 'NO';

    //add dialog
    this.dialog = document.createElement('div');
    this.dialog.className = 'dialog';
    this.dialog.style.display = 'none';

    //add text
    this.text_background = document.createElement('div');
    this.text_background.className = 'text-background';
    this.text_box = document.createElement('div');
    this.text_box.className = 'text-box';
    this.text_box.innerHTML = this.message;
    this.text_background.appendChild(this.text_box);
    this.dialog.appendChild(this.text_background);

    //add yes button
    this.yesbtn = document.createElement('div');
    this.yesbtn.className = 'btn yes-btn';
    this.yesbtn.innerHTML = this.yes_label;
    this.yesbtn.tabIndex = 0;
    this.dialog.appendChild(this.yesbtn);

    //add no button
    this.nobtn = document.createElement('div');
    this.nobtn.className = 'btn no-btn';
    this.nobtn.innerHTML = this.no_label;
    this.nobtn.tabIndex = 0;
    this.dialog.appendChild(this.nobtn);

    this.container.appendChild(this.dialog);
}

Confirmation.prototype.setMessage = function(text){
    this.message = text;
    this.text_box.innerHTML = this.message;
}

Confirmation.prototype.show = function(callback){
    var msg = this;
    this.container.style.display = 'block';
    this.dialog.style.display = 'block';
    this.yesbtn.onclick = function(){
        callback(true);
        msg.hide();
    };
    this.yesbtn.onkeypress = function(e){
        if(e.keyCode == 13){
            callback(true);
            msg.hide()
        }
    };
    this.nobtn.onclick = function(){
        callback(false);
        msg.hide();
    };
    this.nobtn.onkeypress = function(e){
        if(e.keyCode == 13){
            callback(false);
            msg.hide()
        }
    };
    this.nobtn.focus();
}

Confirmation.prototype.hide = function(){
    this.container.style.display = 'none';
    this.dialog.style.display = 'none';
    this.yesbtn.onclick = null;
    this.nobtn.onclick = null;
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
