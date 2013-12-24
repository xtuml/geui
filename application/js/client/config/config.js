/*

Defines the basic shape of a configuration
for inheritance

*/


// Config class ---------------//

function Config(gui){
}

Config.prototype.initialize = function(gui) {
    // gui reference
    this.gui = gui;

    // create the view container
    this.view_objects = [];
}

Config.prototype.getDelay = function() {
    if (this.gui.settings.animations) {
        return (this.view_objects.length * 0.15) + 0.5;
    }
    else {
        return 0;
    }
}

Config.prototype.go_back = function(){
    client.gui.popConfig([]);
}

//prepare the config before entry
Config.prototype.prepare = function(args){
}

Config.prototype.updatePositions = function() {
    //remove the old elements
    this.gui.clearPanels();

    for (var i = 0; i < this.view_objects.length; i++) {
        //update size and position
        this.view_objects[i].panel.updateSize(this.view_objects[i].height, this.view_objects[i].width);
        this.view_objects[i].panel.updatePosition(this.view_objects[i].x, this.view_objects[i].y);

        if (this.gui.settings.animations) {
            //setup the animation
            this.view_objects[i].element.style.left = "-" + window.innerWidth + "px";
        }
    }
}

//fly in animation
Config.prototype.enter = function(){

    if (this.gui.settings.animations) {
        //run animation
        for (var i = 0; i < this.view_objects.length; i++) {
            this.view_objects[i].element.className = "app-cubby fly";
            $(this.view_objects[i].element).css("transition-delay", (i * 0.15) + "s");
            $(this.view_objects[i].element).css("-webkit-transition-delay", (i * 0.15) + "s");
            this.view_objects[i].element.style.left = "5px";
        }
    }

}

//fly out animation
Config.prototype.exit = function(){

    if (this.gui.settings.animations) {
        //run animation
        for (var i = 0; i < this.view_objects.length; i++) {
            this.view_objects[this.view_objects.length - i - 1].element.className = "app-cubby fly";
            $(this.view_objects[this.view_objects.length - i - 1].element).css("transition-delay", (0.15 * i) + "s");
            $(this.view_objects[this.view_objects.length - i - 1].element).css("-webkit-transition-delay", (0.15 * i) + "s");
            this.view_objects[this.view_objects.length - i - 1].element.style.left = "-" + window.innerWidth + "px";
        }
    }

}

//-----------------------------//
