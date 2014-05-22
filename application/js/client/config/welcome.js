/*

Defines the Welcome configuration

Defines OpenExperiment, CreateExperiment, and 
InstrumentStatus view classes.

*/


// Welcome class --------------//

Welcome.prototype = new Config();
Welcome.prototype.constructor = Welcome;
function Welcome(gui){
    this.initialize(gui);

    //object holding addresses to each of the views
    this.views = {
        OpenExperiment: "TL",
        CreateExperiment: "TR",
        InstrumentStatus: "ML"
    };

    this.open = new OpenExperiment(this.gui.panels[this.views["OpenExperiment"]]);
    this.create = new CreateExperiment(this.gui.panels[this.views["CreateExperiment"]]);
    this.inst_status = new InstrumentStatus(this.gui.panels[this.views["InstrumentStatus"]]);

    // add view objects in animation order
    this.view_objects.push(this.create);
    this.view_objects.push(this.open);
    this.view_objects.push(this.inst_status);

}

//prepare the config before entry
Welcome.prototype.prepare = function(args){
    this.updatePositions();

    //add the elements
    this.gui.panels[this.views["OpenExperiment"]].addView(this.open);
    this.gui.panels[this.views["CreateExperiment"]].addView(this.create);
    this.gui.panels[this.views["InstrumentStatus"]].addView(this.inst_status);

    //OPEN EXPERIMENT reset//

    //clear table rows
    for (row in this.open.rows){
        this.open.open_table.removeChild(this.open.rows[row]);          //remove the element
    }
    this.open.rows = [];
    this.open.row_count = 0;
    this.open.selected_row = -1;

    //clear uploader
    this.open.dots_upload.value = "";

    //CREATE EXPERIMENT reset//

    //clear table rows
    for (row in this.create.rows){
        this.create.create_table.removeChild(this.create.rows[row]);          //remove the element
    }
    this.create.rows = [];
    this.create.row_count = 0;
    this.create.selected_row = -1;

    //add available techniques
    this.create.addRow("Cyclic Voltametry");
    this.create.addRow("Square Wave Voltametry");
    
    //clear input
    this.create.create_input.value = "";

    //enable signals applying to this config
    //disable all
    for (signal in httpcomm.signals){
        httpcomm.signals[signal].enabled = false;
    }
    //enable the ones needed
    httpcomm.signals["load_experiments"].enabled = true;
    httpcomm.signals["upload_success"].enabled = true;

    //send signal to load experiments
    httpcomm.eihttp.get_experiments();
}

//-----------------------------//



// OpenExperiment class -------//

function OpenExperiment(panel){

    //attributes that all views have:
    this.panel = panel;
    this.element = document.createElement("div");
    this.element.className = "app-cubby";
    this.content_pane = document.createElement("div");
    this.content_pane.className = "app-content";
    this.element.appendChild(this.content_pane);
    //-----------------------------//

    //set size
    this.height = "55%";
    this.width = "50%"
    this.x = "0px";
    this.y = "0px";

    this.label_text = "Open Experiment";

    //add components
    //label
    this.label = document.createElement("div");
    this.label.className = "label";
    this.label.innerHTML = this.label_text;
    this.content_pane.appendChild(this.label);

    //table
    this.open_table = document.createElement("div");
    this.open_table.className = "open-table";
    this.content_pane.appendChild(this.open_table);

    //buttons
    this.del = document.createElement("div");
    this.del.className = "btn";
    this.del.style.right = "52px";
    this.del.style.bottom = "0px";
    this.del.parent_view = this;
    this.del_symbol = document.createElement("img");
    this.del_symbol.title = "Delete experiment";
    this.del_symbol.className = "trash-btn";
    this.del_symbol.parent_view = this;
    this.del_symbol.onclick = function(e){e.target.parent_view.deleteFile()};
    this.del_symbol.tabIndex = 0;
    this.del_symbol.onkeypress = function(e){if(e.keyCode == 13){e.target.parent_view.deleteFile()}};
    this.del.appendChild(this.del_symbol);
    this.content_pane.appendChild(this.del);

    this.open = document.createElement("div");
    this.open.className = "btn";
    this.open.style.right = "0px";
    this.open.style.bottom = "0px";
    this.open.parent_view = this;
    this.open_symbol = document.createElement("img");
    this.open_symbol.title = "Open experiment";
    this.open_symbol.className = "open-btn";
    this.open_symbol.parent_view = this;
    this.open_symbol.onclick = function(e){e.target.parent_view.openFile()};
    this.open_symbol.tabIndex = 0;
    this.open_symbol.onkeypress = function(e){if(e.keyCode == 13){e.target.parent_view.openFile()}};
    this.open.appendChild(this.open_symbol);
    this.content_pane.appendChild(this.open);

    this.dots = document.createElement("div");
    this.dots.className = "btn";
    this.dots.style.left = "0px";
    this.dots.style.bottom = "0px";
    this.dots.parent_view = this;
    this.dots_symbol = document.createElement("img");
    this.dots_symbol.title = "Upload experiment";
    this.dots_symbol.className = "upload-btn";
    this.dots_upload = document.createElement("input");
    this.dots_upload.type = "file";
    this.dots_upload.className = "upload";
    this.dots_upload.parent_view = this;
    this.dots_upload.tabIndex = 0;
    this.dots_upload.onchange = function(e){e.target.parent_view.uploadFile(e.target.files)};
    this.dots_symbol.appendChild(this.dots_upload);
    this.dots.appendChild(this.dots_symbol);
    this.content_pane.appendChild(this.dots);

    //container for rows
    this.rows = [];
    this.row_count = 0;
    this.selected_row = -1;

}

OpenExperiment.prototype.addRow = function(text){

    var row = document.createElement("div");
    row.className = "open-row row-ease open-row-hover";
    row.style.top = (this.row_count * 34 + 4) + "px";
    row.innerHTML = text;
    row.parent_view = this;
    row.row_num = this.row_count;
    row.selected = false;
    row.tabIndex = 0;
    row.onclick = function(e){e.target.parent_view.select(e.target.row_num)}
    row.onkeypress = function(e){if(e.keyCode == 13){e.target.parent_view.select(e.target.row_num)}}

    this.open_table.appendChild(row);
    this.row_count ++;
    this.rows.push(row);

}

OpenExperiment.prototype.select = function(row_num){

    var row = this.rows[row_num];
    if (row.selected == false){
        row.className = "open-row row-ease selected-row";                                //highlight as selected
        row.selected = true;
        if (this.selected_row != -1){
            this.rows[this.selected_row].className = "open-row row-ease open-row-hover"  //change selected to normal (only one selected at a time)
            this.rows[this.selected_row].selected = false;
        }
        this.selected_row = row_num;
    }
    else{
        row.className = "open-row row-ease open-row-hover";                              //back to normal
        row.selected = false;
        this.selected_row = -1;
    }

}

//open a file in the waveform editor config
OpenExperiment.prototype.openFile = function(name){
    if (name != undefined){
        //open file based on name argument
        cv = new CyclicVoltammetry(client.gui);
        this.panel.gui.newConfig(cv, [name, "open"]);
    }
    else{
        if (this.selected_row != -1){
            //open file based on selected row
            cv = new CyclicVoltammetry(client.gui);
            this.panel.gui.newConfig(cv, [this.rows[this.selected_row].innerHTML, "open"]);
        }
    }
}

//delete a file
OpenExperiment.prototype.deleteFile = function(){
    if (this.selected_row != -1){
        //send delete request
        httpcomm.eihttp.delete_experiment(this.rows[this.selected_row].innerHTML);

        //remove table row
        this.open_table.removeChild(this.rows[this.selected_row]);          //remove the element
        this.rows.splice(this.selected_row, 1);
        for (var row = this.selected_row; row < this.rows.length; row++){
            this.rows[row].style.top = (row * 34 + 4) + "px";
            this.rows[row].row_num = row;
        }
        this.selected_row = -1;
    }
}

//allows users to upload their own files
OpenExperiment.prototype.uploadFile = function(files){
    if (files.length == 1){
        var file = files[0];
        var contents;
        var name
        console.log(file.name);
        name = file.name.substring(0, file.name.length - 4);
        var r = new FileReader();
        r.onload = function(evt){
            contents = evt.target.result;
            if (file.type == "text/xml"){
                httpcomm.eihttp.upload_file(name, contents);
            }
            else{
                alert("Filetype must be .xml");
            }
        }
        r.readAsText(file);
    }
}

//-----------------------------//



// CreateExperiment class -------//

function CreateExperiment(panel){

    //attributes that all views have:
    this.panel = panel;
    this.element = document.createElement("div");
    this.element.className = "app-cubby";
    this.content_pane = document.createElement("div");
    this.content_pane.className = "app-content";
    this.element.appendChild(this.content_pane);
    //-----------------------------//

    //set size
    this.height = "55%";
    this.width = "50%"
    this.x = "50%";
    this.y = "0px";

    this.label_text = "Create Experiment";
    this.input_placeholder = "Experiment name";

    //add components
    //label
    this.label = document.createElement("div");
    this.label.className = "label";
    this.label.innerHTML = this.label_text;
    this.content_pane.appendChild(this.label);

    //table
    this.create_table = document.createElement("div");
    this.create_table.className = "open-table";
    this.content_pane.appendChild(this.create_table);

    //input
    this.create_input = document.createElement("input");
    this.create_input.className = "create-input";
    this.create_input.placeholder = this.input_placeholder;
    this.create_input.parent_view = this;
    this.create_input.onkeypress = function(e){if(e.keyCode == 13){e.target.parent_view.createFile(e.target.value)}};
    this.content_pane.appendChild(this.create_input);

    //buttons
    this.create = document.createElement("div");
    this.create.className = "btn";
    this.create.style.right = "0px";
    this.create.style.bottom = "0px";
    this.create.parent_view = this;
    this.create_symbol = document.createElement("img");
    this.create_symbol.title = "Create experiment";
    this.create_symbol.className = "new-btn";
    this.create_symbol.parent_view = this;
    this.create_symbol.onclick = function(e){e.target.parent_view.createFile(e.target.parent_view.create_input.value)};
    this.create_symbol.tabIndex = 0;
    this.create_symbol.onkeypress = function(e){if(e.keyCode == 13){e.target.parent_view.createFile(e.target.parent_view.create_input.value)}};
    this.create.appendChild(this.create_symbol);
    this.content_pane.appendChild(this.create);

    //container for rows
    this.rows = [];
    this.row_count = 0;
    this.selected_row = -1;

}

CreateExperiment.prototype.addRow = function(text){

    var row = document.createElement("div");
    row.className = "open-row open-row-hover";
    row.style.top = (this.row_count * 34 + 4) + "px";
    row.innerHTML = text;
    row.parent_view = this;
    row.row_num = this.row_count;
    row.selected = false;
    row.tabIndex = 0;
    row.onclick = function(e){e.target.parent_view.select(e.target.row_num)}
    row.onkeypress = function(e){if(e.keyCode == 13){e.target.parent_view.select(e.target.row_num)}}

    this.create_table.appendChild(row);
    this.row_count ++;
    this.rows.push(row);

}

CreateExperiment.prototype.select = function(row_num){

    var row = this.rows[row_num];
    if (row.selected == false){
        row.className = "open-row selected-row";                                //highlight as selected
        row.selected = true;
        if (this.selected_row != -1){
            this.rows[this.selected_row].className = "open-row open-row-hover"  //change selected to normal (only one selected at a time)
            this.rows[this.selected_row].selected = false;
        }
        this.selected_row = row_num;
    }
    else{
        row.className = "open-row open-row-hover";                              //back to normal
        row.selected = false;
        this.selected_row = -1;
    }

}

CreateExperiment.prototype.createFile = function(name){
    if (this.selected_row != -1){
        var rows = this.panel.gui.panels[this.panel.gui.config.views["OpenExperiment"]].view.rows;
        var duplicate = false;
        for (row in rows){
            if (rows[row].innerHTML == name){
                duplicate = true;
                alert("Duplicate name.");
                break;
            }
        }
        if (!duplicate && name != ""){
            //create technique based on selected row
            cv = new CyclicVoltammetry(client.gui);
            this.panel.gui.newConfig(cv, [name, "create"]);
        }
    }
}

//-----------------------------//



// InstrumentStatus class -------//

function InstrumentStatus(panel){

    //attributes that all views have:
    this.panel = panel;
    this.element = document.createElement("div");
    this.element.className = "app-cubby";
    this.content_pane = document.createElement("div");
    this.content_pane.className = "app-content";
    this.element.appendChild(this.content_pane);
    //-----------------------------//

    this.height = "45%";
    this.width = "100%"
    this.x = "0px";
    this.y = "55%";

}

//-----------------------------//
