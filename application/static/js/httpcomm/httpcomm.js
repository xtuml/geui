/*

HTTPcomm class

defines incoming side of the eihttp interface

*/

// HTTPcomm class -------------//

function HTTPcomm(){

    this.running = false;
    this.receiving_data = false;

    this.points_received = 0;

    this.signals = {
        "version": new version(),
        "data": new data(),
        "update_graph": new update_graph(),
        "load_table": new load_table(),
        "load_experiments": new load_experiments(),
        "upload_success": new upload_success()
    }

    // eihttp class -----------//
    // interfaces with agent
    // outgoing signals
    this.eihttp = function(){
        //interface definition
    }

    this.eihttp.exit = function(){
        $.ajax({
            type: "GET",
            url: "/exit/",
            data: null,
            success: function(){},
            async:true
        });
        httpcomm.running = false;
    }
    
    this.eihttp.run_experiment = function(){
        $.ajax({
            type: "GET",
            url: "/run_experiment/",
            data: null,
            success: function(){},
            async:true
        });
    }

    this.eihttp.save_experiment = function(){
        $.ajax({
            type: "POST",
            url: "/save/",
            data: name,
            success: null,
            async:true
        });
    }

    this.eihttp.get_experiments = function(){
        $.ajax({
            type: "GET",
            url: "/get_experiments/",
            data: null,
            success: null,
            async:true
        });
    }

    this.eihttp.request_table = function(table_id, position){
        obj = {
            table_id: table_id,
            position: position
        }
        $.ajax({
            type: "POST",
            url: "/table/",
            data: obj,
            success: null,
            async:true
        });
    }

    this.eihttp.open_experiment = function(name){
        obj = {
            name: name
        }
        $.ajax({
            type: "POST",
            url: "/open/",
            data: obj,
            success: null,
            async:true
        });
    }

    this.eihttp.create_experiment = function(name){
        obj = {
            name: name
        }
        $.ajax({
            type: "POST",
            url: "/create/",
            data: obj,
            success: null,
            async:true
        });
    }

    this.eihttp.delete_experiment = function(name){
        obj = {
            name: name
        }
        $.ajax({
            type: "POST",
            url: "/delete/",
            data: obj,
            success: null,
            async:true
        });
    }

    this.eihttp.upload_file = function(name, contents){
        obj = {
            name: name,
            contents: contents
        }
        $.ajax({
            type: "POST",
            url: "/upload/",
            data: obj,
            success: null,
            async: true
        });
    }

    this.eihttp.add_pattern = function(start_value, end_value, rate, duration, repeat_value){
        obj = {
            start_value: start_value,
            end_value: end_value,
            rate: rate,
            duration: duration,
            repeat_value: repeat_value
        }
        $.ajax({
            type: "POST",
            url: "/add_pattern/",
            data: obj,
            success: null,
            async:true
        });
    }

    this.eihttp.delete_pattern = function(positions){
        obj = {
            positions: positions
        }
        $.ajax({
            type: "POST",
            url: "/delete_pattern/",
            data: obj,
            success: null,
            async:true
        });
    }

    this.eihttp.move_pattern = function(position, destination){
        obj = {
            position: position,
            destination: destination
        }
        $.ajax({
            type: "POST",
            url: "/move_pattern/",
            data: obj,
            success: null,
            async:true
        });
    }

    this.eihttp.update_pattern = function(repeat_value, position){
        obj = {
            repeat_value: repeat_value,
            position: position
        }
        $.ajax({
            type: "POST",
            url: "/update_pattern/",
            data: obj,
            success: null,
            async:true
        });
    }

    this.eihttp.add_segment = function(start_value, end_value, rate, duration, pattern){
        obj = {
            start_value: start_value,
            end_value: end_value,
            rate: rate,
            duration: duration,
            pattern: pattern
        }
        $.ajax({
            type: "POST",
            url: "/add_segment/",
            data: obj,
            success: null,
            async:true
        });
    }

    this.eihttp.delete_segment = function(positions, pattern){
        obj = {
            positions: positions,
            pattern: pattern
        }
        $.ajax({
            type: "POST",
            url: "/delete_segment/",
            data: obj,
            success: null,
            async:true
        });
    }

    this.eihttp.move_segment = function(position, destination, pattern){
        obj = {
            position: position,
            destination: destination,
            pattern: pattern
        }
        $.ajax({
            type: "POST",
            url: "/move_segment/",
            data: obj,
            success: null,
            async:true
        });
    }

    this.eihttp.update_segment = function(start_value, end_value, rate, duration, position, pattern){
        obj = {
            start_value: start_value,
            end_value: end_value,
            rate: rate,
            duration: duration,
            position: position,
            pattern: pattern
        }
        $.ajax({
            type: "POST",
            url: "/update_segment/",
            data: obj,
            success: null,
            async:true
        });
    }

    //-------------------------//

}

//polling for async communication
HTTPcomm.prototype.run = function(){
    this.running = true;
    id = setInterval(function(){
        //poll server
        console.log("polling");
        var data = null
        $.ajax({
            type: "GET",
            url: "/command/",
            data: null,
            dataType: "json",
            success: function(d){data = d},
            async:false
        });
        //if we received data, execute the command
        if (data != "None" && data != null){
            console.log(data);
            httpcomm.unpack(data);
        }
        //check if still running
        if (httpcomm.running == false){
            clearInterval(id);
        }
    }, 250);
}

//polling for data packets
HTTPcomm.prototype.receive_data = function(){
    this.receiving_data = true;

    //start the updating
    client.gui.panels[client.gui.config.views["DataChart"]].view.updateChart();

    id = setInterval(function(){
        //poll server
        //console.log("getting data...");
        var data = null
        $.ajax({
            type: "GET",
            url: "/data/",
            data: null,
            dataType: "json",
            success: function(d){data = d},
            async: false
        });
        //if we received data, execute the command
        if (data != "None" && data != null){
            httpcomm.unpack(data);
        }
        //check if still running
        if (httpcomm.receiving_data == false){
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

data = function(){
    this.enabled = false;
    this.unpack = function(data){
        httpcomm.points_received += data.points.length;
        client.eihttp.data(data.points, data.action);
    }
}

update_graph = function(){
    this.enabled = false;
    this.unpack = function(data){
        if (this.enabled == true){
            client.eihttp.update_graph(data.points);
        }
    }
}

load_table = function(){
    this.enabled = false;
    this.unpack = function(data){
        if (this.enabled == true){
            client.eihttp.load_table(data.rows, data.table);
        }
    }
}

load_experiments = function(){
    this.enabled = false;
    this.unpack = function(data){
        if (this.enabled == true){
            client.eihttp.load_experiments(data.experiments);
        }
    }
}

upload_success = function(){
    this.enabled = false;
    this.unpack = function(data){
        if (this.enabled == true){
            client.eihttp.upload_success(data.name);
        }
    }
}