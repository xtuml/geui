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

    //add the elements
    this.gui.panels[this.views['OpenExperiment']].addView(this.open);
    this.gui.panels[this.views['CreateExperiment']].addView(this.create);
    this.gui.panels[this.views['InstrumentStatus']].addView(this.inst_status);

}

//prepare the config before entry
Welcome.prototype.prepare = function(args){
    //update size and position
    this.open.panel.updateSize(this.open.height, this.open.width);
    this.open.panel.updatePosition(this.open.x, this.open.y);
    this.create.panel.updateSize(this.create.height, this.create.width);
    this.create.panel.updatePosition(this.create.x, this.create.y);
    this.inst_status.panel.updateSize(this.inst_status.height, this.inst_status.width);
    this.inst_status.panel.updatePosition(this.inst_status.x, this.inst_status.y);
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
    this.dots_symbol.parent_view = this;
    this.dots_symbol.onclick = function(e){alert('open dialog')};
    this.dots_symbol.tabIndex = 0;
    this.dots_symbol.onkeypress = function(e){if(e.keyCode == 13){alert('open dialog')}};
    this.dots.appendChild(this.dots_symbol);
    this.content_pane.appendChild(this.dots);

    //container for rows
    this.rows = [];
    this.row_count = 0;
    this.selected_row = -1;

    this.addRow('Levi');
    this.addRow('test');
    this.addRow('test2');
    this.addRow('mygraph');

}

OpenExperiment.prototype.addRow = function(text){

    var row = document.createElement('div');
    row.className = 'open-row open-row-hover';
    row.style.top = (this.row_count * 34 + 4) + 'px';
    row.innerHTML = text;
    row.parent_view = this;
    row.row_num = this.row_count;
    row.selected = false;
    row.onclick = function(e){e.target.parent_view.select(e.target.row_num)}

    this.open_table.appendChild(row);
    this.row_count ++;
    this.rows.push(row);

}

OpenExperiment.prototype.select = function(row_num){

    var row = this.rows[row_num];
    if (row.selected == false){
        row.className = 'open-row selected-row';
        if (this.selected_row != -1){
            this.rows[this.selected_row].className = 'open-row open-row-hover'
        }
        this.selected_row = row_num;
    }
    else{
        row.className = 'open-row open-row-hover';
        this.selected_row = -1;
    }

}

OpenExperiment.prototype.openFile = function(){
    if (this.selected_row != -1){
        //alert(this.rows[this.selected_row].innerHTML);
        this.panel.gui.newConfig(editor, [this.rows[this.selected_row].innerHTML]);
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

    this.height = '55%';
    this.width = '50%'
    this.x = '50%';
    this.y = '0px';

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
