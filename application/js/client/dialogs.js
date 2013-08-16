/*

Definition of Message, Confirmation, and Login dialog classes

*/

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

Message.prototype.setButtonText = function(text){
    this.okbtn.innerHTML = text;
}

Message.prototype.show = function(callback){
    var msg = this;
    this.container.style.display = 'block';
    this.dialog.style.display = 'block';
    this.okbtn.onclick = function(){
        msg.hide();
        if (callback != null){
            callback();
        }
    }
    this.okbtn.onkeypress = function(e){
        if(e.keyCode == 13){
            msg.hide();
            if (callback != null){
                callback();
            }
        }
    }
    this.okbtn.focus();
}

Message.prototype.hide = function(){
    this.container.style.display = 'none';
    this.dialog.style.display = 'none';
    this.okbtn.innerHTML = this.button_label;
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

Confirmation.prototype.setButtonText = function(text1, text2){
    this.yesbtn.innerHTML = text1;
    this.nobtn.innerHTML = text2;
}

Confirmation.prototype.show = function(callback){
    var msg = this;
    this.container.style.display = 'block';
    this.dialog.style.display = 'block';
    this.yesbtn.onclick = function(){
        msg.hide();
        if (callback != null){
            callback(true);
        }
    };
    this.yesbtn.onkeypress = function(e){
        if(e.keyCode == 13){
            msg.hide()
            if (callback != null){
                callback(true);
            }
        }
    };
    this.nobtn.onclick = function(){
        msg.hide();
        if (callback != null){
            callback(false);
        }
    };
    this.nobtn.onkeypress = function(e){
        if(e.keyCode == 13){
            msg.hide()
            if (callback != null){
                callback(false);
            }
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
        if (callback != null){
            callback();
        }
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
