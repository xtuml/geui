/*

Definition of Client, Gui, and Panel classes

Gui and Panel have methods for adding deleting and moving views.

*/

// Client class ---------------//

function Client(){
    this.gui = null;
}

//-----------------------------//



// Gui class ------------------//

function Gui(client){
    this.client = client;
    this.config = null;
    this.panels = {
        'TL': new Panel('TL',this),
        'TR': new Panel('TR',this),
        'ML': new Panel('ML',this),
        'MR': new Panel('MR',this),
        'BL': new Panel('BL',this),
        'BR': new Panel('BR',this)
    };
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
    this.element.removeChild(this.view);
    this.view = null;
}

Panel.prototype.updateSize = function(height, width){
    this.element.style.height = height;
    this.element.style.width = width;
}

//-----------------------------//
