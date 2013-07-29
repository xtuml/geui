/*

HTTPcomm class

defines incoming side of the eihttp interface

*/

// HTTPcomm class -------------//

function HTTPcomm(){

    this.running = false;

    this.signals = {
        'version': new version(),
        'update_graph': new update_graph(),
        'load_table': new load_table()
    }

    // eihttp class -----------//
    // interfaces with agent
    // outgoing signals
    this.eihttp = function(){
        //interface definition
    }

    this.eihttp.exit = function(){
        $.ajax({
            type: 'GET',
            url: 'exit',
            data: null,
            success: function(){},
            async:true
        });
        httpcomm.running = false;
    }

    this.eihttp.save_experiment = function(){
        $.ajax({
            type: 'POST',
            url: 'save',
            data: name,
            success: null,
            async:true
        });
    }

    this.eihttp.get_experiments = function(){
    }

    this.eihttp.open_experiment = function(name){
        obj = {
            name: name
        }
        data = JSON.stringify(obj);
        $.ajax({
            type: 'POST',
            url: 'open',
            data: data,
            success: null,
            async:true
        });
    }

    this.eihttp.create_experiment = function(name){
        obj = {
            name: name
        }
        data = JSON.stringify(obj);
        $.ajax({
            type: 'POST',
            url: 'create',
            data: data,
            success: null,
            async:true
        });
    }

    this.eihttp.add_segment = function(start_value, end_value, rate, duration, repeat_value, position){
        obj = {
            start_value: start_value,
            end_value: end_value,
            rate: rate,
            duration: duration,
            repeat_value: repeat_value,
            position: position
        }
        data = JSON.stringify(obj);
        $.ajax({
            type: 'POST',
            url: 'add_segment',
            data: data,
            success: null,
            async:true
        });
    }

    this.eihttp.delete_segment = function(positions){
        obj = {
            positions: positions
        }
        data = JSON.stringify(obj);
        $.ajax({
            type: 'POST',
            url: 'delete_segment',
            data: data,
            success: null,
            async:true
        });
    }

    this.eihttp.update_segment = function(start_value, end_value, rate, duration, repeat_value, position){
        obj = {
            start_value: start_value,
            end_value: end_value,
            rate: rate,
            duration: duration,
            repeat_value: repeat_value,
            position: position
        }
        data = JSON.stringify(obj);
        $.ajax({
            type: 'POST',
            url: 'update_segment',
            data: data,
            success: null,
            async:true
        });
    }

    this.eihttp.move_segment = function(position, destination){
        obj = {
            position: position,
            destination: destination
        }
        data = JSON.stringify(obj);
        $.ajax({
            type: 'POST',
            url: 'move_segment',
            data: data,
            success: null,
            async:true
        });
    }

    //-------------------------//

}

HTTPcomm.prototype.run = function(){
    this.running = true;
    id = setInterval(function(){
        //poll server
        console.log('polling');
        var data = null
        $.ajax({
            type: 'GET',
            url: 'command',
            data: name,
            success: function(d){data = d},
            async:false
        });
        //if we received data, execute the command
        if (data != 'None'){
            console.log(data);
            httpcomm.unpack(JSON.parse(data));
        }
        //check if still running
        if (httpcomm.running == false){
            clearInterval(id);
        }
    }, 200);
}

HTTPcomm.prototype.unpack = function(data){
    this.signals[data.signal].unpack(data);
}


// Signals to the GUI
// class definitions for how to handle
// the command

version = function(){
    this.enabled = false;
    this.unpack = function(data){
        client.eihttp.version(data.version);
    }
}

update_graph = function(){
    this.enabled = false;
    this.unpack = function(data){
        if (this.enabled == true){
            client.eihttp.update_graph(data.delete, data.add, data.update);
        }
    }
}

load_table = function(){
    this.enabled = false;
    this.unpack = function(data){
        if (this.enabled == true){
            client.eihttp.load_table(data.rows);
        }
    }
}
