/*

Defines the Login configuration

*/


// LoginConfig class -------//

function LoginConfig(gui){
    //attibutes every config has
    this.gui = gui;

    this.enter_time = 0; //time it takes to enter in seconds
    this.exit_time = 0;  //time it takes to exit in seconds

}

//show current session
LoginConfig.prototype.loadSession = function(name, start_time, increment){
    client.gui.confirmation.setMessage('<b>Current Session:</b><br>' + '<b>User:</b> ' + name + '<br><b>Started:</b> ' + start_time);
    client.gui.confirmation.setButtonText('New Session', 'Exit');
    client.gui.confirmation.show(this.newSession);
    client.gui.confirmation.yesbtn.focus();
}

//callback: either post or exit
LoginConfig.prototype.newSession = function(confirmed){
    if (confirmed){
        client.gui.login.show(login.postLogin);
    }
    else{
        window.open('', '_self', ''); //bug fix
        window.close();
    }
}

//post the name and key
LoginConfig.prototype.postLogin = function(){
    httpcomm.eihttp.start_session(client.name, client.get_hash(client.key));
}

//successful login. update session and add welcome config
LoginConfig.prototype.updateSession = function(name, start_time, increment){
    client.session.name = name;
    client.session.start_time = start_time;
    client.session.increment = increment;
    client.gui.newConfig(welcome, []);
}

//prepare the config before entry
LoginConfig.prototype.prepare = function(args){
    //remove the old elements
    this.gui.clearPanels();
    
    //enable signals applying to this config
    //disable all
    for (signal in httpcomm.signals){
        httpcomm.signals[signal].enabled = false;
    }
    //enable the ones needed
    httpcomm.signals['session_increment'].enabled = true;
    httpcomm.signals['session'].enabled = true;

}

//fly in animation
LoginConfig.prototype.enter = function(delay){

    //no animation on this config

    //request session information
    httpcomm.eihttp.get_session();

}

//fly out animation
LoginConfig.prototype.exit = function(delay){

    //no animation on this config

}

//-----------------------------//

