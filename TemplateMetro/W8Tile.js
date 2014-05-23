/*
    This mixin configures a view (container) to have a controller so that, for each instance of the view,
    a new instance of controller "controller" would be created and associated to the view 
*/

Ext.define("CloudCommonComponent.view.ViewController",{
    controller:undefined, // the controller class
    configure:function()
    {	
        
        if(this.controller && (Ext.ClassManager.classes[this.controller] !== "undefined") && this.suspendEvents)
        {
            this.suspendEvents(true);
            if(this.hide) this.hide();

            var me = this;
            Ext.require(me.controller,function(){
                me.controller = Ext.create(me.controller,{
                    id:me.id + "_controller",
                    getMyContainer: function(){
                        
                        return me;
                    }
                });
                me.show();
                me.resumeEvents();
                me.controller.updatePresence();
                
            });
            
        }
    }
    
});

