//Fixup the bug in Ext.dd.ScrollManager
Ext.override(Ext.dom.Element, { 
    scroll: function (direction, distance, animate) {
        if (direction === 'up' || direction === 't') { 
            distance = -distance; 
        } 
        this.callOverridden([direction, distance, animate]); 
    } 
});





