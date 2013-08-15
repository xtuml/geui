/*

Definition of Client, Gui, and Panel classes

Gui and Panel have methods for adding deleting and moving views.

*/

// Client class ---------------//

function Client(){

    //client information
    this.name = '';
    this.key = null;

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

Client.prototype.get_hash = function(value){
    return value + 1;
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

Message.prototype.show = function(callback){
    var msg = this;
    this.container.style.display = 'block';
    this.dialog.style.display = 'block';
    this.okbtn.onclick = function(){
        msg.hide();
        callback();
    }
    this.okbtn.onkeypress = function(e){
        if(e.keyCode == 13){
            msg.hide();
            callback();
        }
    }
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
        msg.hide();
        callback(true);
    };
    this.yesbtn.onkeypress = function(e){
        if(e.keyCode == 13){
            msg.hide()
            callback(true);
        }
    };
    this.nobtn.onclick = function(){
        msg.hide();
        callback(false);
    };
    this.nobtn.onkeypress = function(e){
        if(e.keyCode == 13){
            msg.hide()
            callback(false);
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



// Login class --------------//

function Login(gui){
    this.gui = gui;
    this.container = document.getElementById('dialog_container');
    this.container.style.display = 'none';

    this.header = 'LOG IN:';
    this.button_label = 'Log In';
    this.name_placeholder = 'Name';
    this.key_placeholder = 'Key';

    //add dialog
    this.dialog = document.createElement('div');
    this.dialog.className = 'dialog';
    this.dialog.style.display = 'none';

    //add input container
    this.box = document.createElement('div');
    this.box.className = 'input-box';
    this.dialog.appendChild(this.box);

    //add label text
    this.label = document.createElement('div');
    this.label.className = 'login-label';
    this.label.innerHTML = this.header;
    this.box.appendChild(this.label);

    //add inputs
    this.name = document.createElement('input');
    this.name.className = 'login-input';
    this.name.placeholder = this.name_placeholder;
    this.name.style.top = 'calc((100% - 82px) / 2)';
    this.name.style.top = '-webkit-calc((100% - 82px) / 2)';

    this.key = document.createElement('input');
    this.key.className = 'login-input';
    this.key.placeholder = this.key_placeholder;
    this.key.style.top = 'calc(((100% - 82px) / 2) + 46px)';
    this.key.style.top = '-webkit-calc(((100% - 82px) / 2) + 46px)';
    
    this.box.appendChild(this.name);
    this.box.appendChild(this.key);

    //add login button
    this.loginbtn = document.createElement('div');
    this.loginbtn.className = 'btn ok-btn';
    this.loginbtn.innerHTML = this.button_label;
    this.loginbtn.tabIndex = 0;
    this.dialog.appendChild(this.loginbtn);

    this.container.appendChild(this.dialog);
}

Login.prototype.login = function(callback){
    if (this.name.value != '' && this.key.value != ''){
        client.name = this.name.value;
        client.key = parseInt(this.key.value);
        this.hide();
        callback();
    }
}

Login.prototype.show = function(callback){
    var l = this;
    this.container.style.display = 'block';
    this.dialog.style.display = 'block';
    this.loginbtn.onclick = function(){l.login(callback)};
    this.loginbtn.onkeypress = function(e){if(e.keyCode == 13){l.login(callback)}};
    this.name.onkeypress = function(e){if(e.keyCode == 13){l.login(callback)}};
    this.key.onkeypress = function(e){if(e.keyCode == 13){l.login(callback)}};
    this.name.focus();
}

Login.prototype.hide = function(){
    this.name.value = '';
    this.key.value = '';
    this.container.style.display = 'none';
    this.dialog.style.display = 'none';
    this.loginbtn.onclick = null;
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
