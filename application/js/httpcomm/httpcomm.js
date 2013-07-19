/*

HTTPcomm class

defines incoming side of the eihttp interface

*/

// HTTPcomm class -------------//

function HTTPcomm(){

    this.running = false;

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

    this.eihttp.get_experiments = function(){
    }

    this.eihttp.open_experiment = function(name){
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

    this.eihttp.create_experiment = function(name){
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

    this.eihttp.add_segment = function(start_value, end_value, rate, duration, repeat_value, position){
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

    this.eihttp.delete_segment = function(positions){
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

    this.eihttp.update_segment = function(start_value, end_value, rate, duration, repeat_value, position){
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

    this.eihttp.move_segment = function(position, destination){
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
        console.log(data);
        //check if still running
        if (httpcomm.running == false){
            clearInterval(id);
        }
    }, 1000);
}
