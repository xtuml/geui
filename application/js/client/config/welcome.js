/*

Defines the Welcome configuration

Defines OpenExperiment, CreateExperiment, and 
InstrumentStatus view classes.

*/


// Welcome class --------------//

function Welcome(gui){
    //attibutes every config has
    this.gui = gui;

    this.enter_time = 1.3; //time it takes to enter in seconds
    this.exit_time = 0.8;  //time it takes to exit in seconds

    //object holding addresses to each of the views
    this.views = {
        OpenExperiment: 'TL',
        CreateExperiment: 'TR',
        InstrumentStatus: 'ML'
    };

    //create the views
    this.open = new OpenExperiment(this.gui.panels[this.views['OpenExperiment']]);
    this.create = new CreateExperiment(this.gui.panels[this.views['CreateExperiment']]);
    this.inst_status = new InstrumentStatus(this.gui.panels[this.views['InstrumentStatus']]);

    //setup the animation
    this.open.element.style.left = 'calc(-100% - 10px)';
    this.open.element.style.left = '-webkit-calc(-100% - 10px)';
    this.create.element.style.left = 'calc(-200% - 10px)';
    this.create.element.style.left = '-webkit-calc(-200% - 10px)';
    this.inst_status.element.style.left = 'calc(-100% - 10px)';
    this.inst_status.element.style.left = '-webkit-calc(-100% - 10px)';

}

//prepare the config before entry
Welcome.prototype.prepare = function(args){
    //remove the old elements
    this.gui.clearPanels();

    //add the elements
    this.gui.panels[this.views['OpenExperiment']].addView(this.open);
    this.gui.panels[this.views['CreateExperiment']].addView(this.create);
    this.gui.panels[this.views['InstrumentStatus']].addView(this.inst_status);

    //update size and position
    this.open.panel.updateSize(this.open.height, this.open.width);
    this.open.panel.updatePosition(this.open.x, this.open.y);
    this.create.panel.updateSize(this.create.height, this.create.width);
    this.create.panel.updatePosition(this.create.x, this.create.y);
    this.inst_status.panel.updateSize(this.inst_status.height, this.inst_status.width);
    this.inst_status.panel.updatePosition(this.inst_status.x, this.inst_status.y);

    //OPEN EXPERIMENT reset//

    //clear table rows
    for (row in this.open.rows){
        this.open.open_table.removeChild(this.open.rows[row]);          //remove the element
    }
    this.open.rows = [];
    this.open.row_count = 0;
    this.open.selected_row = -1;

    //clear uploader
    this.open.dots_upload.value = '';

    //CREATE EXPERIMENT reset//

    //clear table rows
    for (row in this.create.rows){
        this.create.create_table.removeChild(this.create.rows[row]);          //remove the element
    }
    this.create.rows = [];
    this.create.row_count = 0;
    this.create.selected_row = -1;

    //add available techniques
    this.create.addRow('Cyclic Voltametry');
    this.create.addRow('Square Wave Voltametry');
    
    //clear input
    this.create.create_input.value = '';

    //enable signals applying to this config
    //disable all
    for (signal in httpcomm.signals){
        httpcomm.signals[signal].enabled = false;
    }
    //enable the ones needed
    httpcomm.signals['load_experiments'].enabled = true;
    httpcomm.signals['upload_success'].enabled = true;

    //send signal to load experiments
    httpcomm.eihttp.get_experiments();
}

//animation of flying in
Welcome.prototype.enter = function(delay){

    //run animation
    this.create.element.className = 'app-cubby fly';
    $(this.create.element).css('transition-delay', (delay + 0.5) + 's');
    $(this.create.element).css('-webkit-transition-delay', (delay + 0.5) + 's');
    this.create.element.style.left = '5px';

    this.open.element.className = 'app-cubby fly';
    $(this.open.element).css('transition-delay', (delay + 0.65) + 's');
    $(this.open.element).css('-webkit-transition-delay', (delay + 0.65) + 's');
    this.open.element.style.left = '5px';

    this.inst_status.element.className = 'app-cubby fly';
    $(this.inst_status.element).css('transition-delay', (delay + 0.8) + 's');
    $(this.inst_status.element).css('-webkit-transition-delay', (delay + 0.8) + 's');
    this.inst_status.element.style.left = '5px';

}

//animation of flying out
Welcome.prototype.exit = function(delay){

    //run animation
    this.open.element.className = 'app-cubby fly';
    $(this.open.element).css('transition-delay', delay + 's');
    $(this.open.element).css('-webkit-transition-delay', delay + 's');
    this.open.element.style.left = 'calc(-100% - 10px)';
    this.open.element.style.left = '-webkit-calc(-100% - 10px)';

    this.create.element.className = 'app-cubby fly';
    $(this.create.element).css('transition-delay', (delay + 0.15) + 's');
    $(this.create.element).css('-webkit-transition-delay', (delay + 0.15) + 's');
    this.create.element.style.left = 'calc(-200% - 10px)';
    this.create.element.style.left = '-webkit-calc(-200% - 10px)';

    this.inst_status.element.className = 'app-cubby fly';
    $(this.inst_status.element).css('transition-delay', (delay + 0.3) + 's');
    $(this.inst_status.element).css('-webkit-transition-delay', (delay + 0.3) + 's');
    this.inst_status.element.style.left = 'calc(-100% - 10px)';
    this.inst_status.element.style.left = '-webkit-calc(-100% - 10px)';

}

//-----------------------------//



// OpenExperiment class -------//

function OpenExperiment(panel){

    //attributes that all views have:
    this.panel = panel;
    this.element = document.createElement('div');
    this.element.className = 'app-cubby';
    this.content_pane = document.createElement('div');
    this.content_pane.className = 'app-content';
    this.element.appendChild(this.content_pane);
    //-----------------------------//

    //set size
    this.height = '55%';
    this.width = '50%'
    this.x = '0px';
    this.y = '0px';

    this.label_text = 'Open Experiment';

    //add components
    //label
    this.label = document.createElement('div');
    this.label.className = 'label';
    this.label.innerHTML = this.label_text;
    this.content_pane.appendChild(this.label);

    //table
    this.open_table = document.createElement('div');
    this.open_table.className = 'open-table';
    this.content_pane.appendChild(this.open_table);

    //buttons
    this.del = document.createElement('div');
    this.del.className = 'btn';
    this.del.style.right = '52px';
    this.del.style.bottom = '0px';
    this.del.parent_view = this;
    this.del_symbol = document.createElement('div');
    this.del_symbol.className = 'delete-btn';
    this.del_symbol.parent_view = this;
    this.del_symbol.onclick = function(e){e.target.parent_view.deleteFile()};
    this.del_symbol.tabIndex = 0;
    this.del_symbol.onkeypress = function(e){if(e.keyCode == 13){e.target.parent_view.deleteFile()}};
    this.del.appendChild(this.del_symbol);
    this.content_pane.appendChild(this.del);

    this.open = document.createElement('div');
    this.open.className = 'btn';
    this.open.style.right = '0px';
    this.open.style.bottom = '0px';
    this.open.parent_view = this;
    this.open_symbol = document.createElement('div');
    this.open_symbol.className = 'open-btn';
    this.open_symbol.parent_view = this;
    this.open_symbol.onclick = function(e){e.target.parent_view.openFile()};
    this.open_symbol.tabIndex = 0;
    this.open_symbol.onkeypress = function(e){if(e.keyCode == 13){e.target.parent_view.openFile()}};
    this.open.appendChild(this.open_symbol);
    this.content_pane.appendChild(this.open);

    this.dots = document.createElement('div');
    this.dots.className = 'btn';
    this.dots.style.left = '0px';
    this.dots.style.bottom = '0px';
    this.dots.parent_view = this;
    this.dots_symbol = document.createElement('div');
    this.dots_symbol.className = 'dots-btn';
    this.dots_upload = document.createElement('input');
    this.dots_upload.type = 'file';
    this.dots_upload.className = 'upload';
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

    var row = document.createElement('div');
    row.className = 'open-row row-ease open-row-hover';
    row.style.top = (this.row_count * 34 + 4) + 'px';
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
        row.className = 'open-row row-ease selected-row';                                //highlight as selected
        row.selected = true;
        if (this.selected_row != -1){
            this.rows[this.selected_row].className = 'open-row row-ease open-row-hover'  //change selected to normal (only one selected at a time)
            this.rows[this.selected_row].selected = false;
        }
        this.selected_row = row_num;
    }
    else{
        row.className = 'open-row row-ease open-row-hover';                              //back to normal
        row.selected = false;
        this.selected_row = -1;
    }

}

//open a file in the waveform editor config
OpenExperiment.prototype.openFile = function(name){
    if (name != undefined){
        //open file based on name argument
        this.panel.gui.newConfig(editor, [name, 'open']);
    }
    else{
        if (this.selected_row != -1){
            //open file based on selected row
            this.panel.gui.newConfig(editor, [this.rows[this.selected_row].innerHTML, 'open']);
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
            this.rows[row].style.top = (row * 34 + 4) + 'px';
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
            if (file.type == 'text/xml'){
                httpcomm.eihttp.upload_file(name, contents);
            }
            else{
                alert('Filetype must be .xml');
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
    this.element = document.createElement('div');
    this.element.className = 'app-cubby';
    this.content_pane = document.createElement('div');
    this.content_pane.className = 'app-content';
    this.element.appendChild(this.content_pane);
    //-----------------------------//

    //set size
    this.height = '55%';
    this.width = '50%'
    this.x = '50%';
    this.y = '0px';

    this.label_text = 'Create Experiment';
    this.input_placeholder = 'Experiment name';

    //add components
    //label
    this.label = document.createElement('div');
    this.label.className = 'label';
    this.label.innerHTML = this.label_text;
    this.content_pane.appendChild(this.label);

    //table
    this.create_table = document.createElement('div');
    this.create_table.className = 'open-table';
    this.content_pane.appendChild(this.create_table);

    //input
    this.create_input = document.createElement('input');
    this.create_input.className = 'create-input';
    this.create_input.placeholder = this.input_placeholder;
    this.create_input.parent_view = this;
    this.create_input.onkeypress = function(e){if(e.keyCode == 13){e.target.parent_view.createFile(e.target.value)}};
    this.content_pane.appendChild(this.create_input);

    //buttons
    this.create = document.createElement('div');
    this.create.className = 'btn';
    this.create.style.right = '0px';
    this.create.style.bottom = '0px';
    this.create.parent_view = this;
    this.create_symbol = document.createElement('div');
    this.create_symbol.className = 'new-btn';
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

    var row = document.createElement('div');
    row.className = 'open-row open-row-hover';
    row.style.top = (this.row_count * 34 + 4) + 'px';
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
        row.className = 'open-row selected-row';                                //highlight as selected
        row.selected = true;
        if (this.selected_row != -1){
            this.rows[this.selected_row].className = 'open-row open-row-hover'  //change selected to normal (only one selected at a time)
            this.rows[this.selected_row].selected = false;
        }
        this.selected_row = row_num;
    }
    else{
        row.className = 'open-row open-row-hover';                              //back to normal
        row.selected = false;
        this.selected_row = -1;
    }

}

CreateExperiment.prototype.createFile = function(name){
    if (this.selected_row != -1){
        var rows = this.panel.gui.panels[this.panel.gui.config.views['OpenExperiment']].view.rows;
        var duplicate = false;
        for (row in rows){
            if (rows[row].innerHTML == name){
                duplicate = true;
                alert('Duplicate name.');
                break;
            }
        }
        if (!duplicate){
            //create technique based on selected row
            this.panel.gui.newConfig(editor, [name, 'create']);
        }
    }
}

//-----------------------------//



// InstrumentStatus class -------//

function InstrumentStatus(panel){

    //attributes that all views have:
    this.panel = panel;
    this.element = document.createElement('div');
    this.element.className = 'app-cubby';
    this.content_pane = document.createElement('div');
    this.content_pane.className = 'app-content';
    this.element.appendChild(this.content_pane);
    //-----------------------------//

    this.height = '45%';
    this.width = '100%'
    this.x = '0px';
    this.y = '55%';

}

//-----------------------------//
