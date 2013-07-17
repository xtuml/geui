/*

Definition of Client, Gui, and Panel classes

Gui and Panel have methods for adding deleting and moving views.

*/

// Client class ---------------//

function Client(){
    this.gui = new Gui();
    this.eihttp = new eihttp();
    this.running = false;
}

Client.prototype.run = function(){
    this.running = true;
    setInterval(function(){
        console.log('polling');
        var data = null
        $.ajax({
            type: 'GET',
            url: 'command',
            data: name,
            success: function(d){data = d},
            async:false
        });
        console.log(data);
        if (this.running == false){
            clearInterval();
        }
    }, 1000);
}

//-----------------------------//



// eihttp class ---------------//
// interfaces with agent

function eihttp(){
}

eihttp.prototype.save_experiment = function(){
    var return_data = false;
    $.ajax({
        type: 'POST',
        url: 'save',
        data: name,
        success: function(){return_data = true},
        async:false
    });
    return return_data;
}

eihttp.prototype.get_experiments = function(){
}

eihttp.prototype.open_experiment = function(name){
    var return_data = '';
    $.ajax({
        type: 'POST',
        url: 'open',
        data: name,
        success: function(data){return_data = data},
        async:false
    });
    return return_data;
}

eihttp.prototype.create_experiment = function(name){
    var return_data = false;
    $.ajax({
        type: 'POST',
        url: 'create',
        data: name,
        success: function(){return_data = true},
        async:false
    });
    return return_data;
}

eihttp.prototype.add_segment = function(start_value, end_value, rate, duration, repeat_value, position){
    var add_message = 
        'start_value=' + start_value + '&' +
        'end_value=' + end_value + '&' +
        'rate=' + rate + '&' +
        'duration=' + duration + '&' +
        'repeat_value=' + repeat_value + '&' +
        'position=' + position;
                        
    var return_data = '';
    $.ajax({
        type: 'POST',
        url: 'add_segment',
        data: add_message,
        success: function(data){return_data = data},
        async:false
    });

    return return_data;
}

eihttp.prototype.delete_segment = function(positions){
    //create string of segments to delete
    var csv = '';
    for (var n = 0; n < positions.length; n++){
        csv += positions[n].toString() + ',';
    }
    csv = csv.substring(0,csv.length - 1);
    
    var return_data = '';
    $.ajax({
        type: 'POST',
        url: 'delete_segment',
        data: csv,
        success: function(data){return_data = data},
        async:false
    });
    return return_data;
}

eihttp.prototype.update_segment = function(start_value, end_value, rate, duration, repeat_value, position){
    var update_message = 
        'start_value=' + start_value + '&' +
        'end_value=' + end_value + '&' +
        'rate=' + rate + '&' +
        'duration=' + duration + '&' +
        'repeat_value=' + repeat_value + '&' +
        'position=' + position;

    var return_data = '';
    $.ajax({
        type: 'POST',
        url: 'update_segment',
        data: update_message,
        success: function(data){return_data = data},
        async:false
    });
    return return_data;
}

eihttp.prototype.move_segment = function(position, destination){
    var move_message = position + ',' + destination;

    var return_data = '';
    $.ajax({
        type: 'POST',
        url: 'move_segment',
        data: move_message,
        success: function(data){return_data = data},
        async:false
    });
    return return_data;
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
