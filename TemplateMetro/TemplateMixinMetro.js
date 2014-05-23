/*
    Mixin for the MainCnt Controller of template TemplateMetro
    It adds some common methods
*/
Ext.define("MetroMixin.controller.MainCnt",{

    MainCnt_getMainViewRef:function()
    {
        //Method to get a reference to the main View (the AppWindow_tpl)
        /*var appRef = CommonCloud.getAppRef(this.$className);
        appRef = (appRef.app)?appRef.app:null;
        var tpl_cnt = appRef.getTemplateCnt_tplController();
        if(appRef && tpl_cnt && tpl_cnt.getMainView) return tpl_cnt.getMainView();*/
        
        if(!this._mainViewRef) this._mainViewRef = Ext.createByAlias("widget.appwindowTpl");
        return this._mainViewRef;
    }
    
});


/*
    Mixin for the TemplateCnt_tpl of template TemplateMetro
*/
Ext.define("MetroMixin.controller.TemplateCnt_tpl",{
    
    TemplateCnt_tpl_getPreloader: function()
    {
      
        if(!this._preloader) this._preloader = Ext.createByAlias("widget.metropreloader");
        return this._preloader;
        
    },
    TemplateCnt_tpl_LoadWidget: function(applicationParams,successCallback,failureCallback,scope)
    {
        var parent = applicationParams.parent_id;
        var appName = (applicationParams.application_config.name)?applicationParams.application_config.name:null;
        var appFolder = (applicationParams.application_config.appFolder)?applicationParams.application_config.appFolder:null;
        var instanceId = applicationParams.instanceId;
        var config = 
            {
                size:   applicationParams.cls,
                parent: applicationParams.parent_id,
                controller_id:Ext.id(), //To have different instanceof
                instanceId:instanceId //Instance/record reference Id
            };
        var me = this;
        var mainView = me.getMainView();
        var tile = applicationParams.fatherId;

        var successLoaded = function(cnt)
        {
            if(!me.loadedCnt) me.loadedCnt = [];
            if(cnt instanceof Ext.app.Controller) 
            {
                me.loadedCnt[instanceId]= cnt;
            }
            console.log(me.loadedCnt);
            var el = Ext.fly(tile);
            el = (el.dom)?el.dom:null;
            if(el)
            {
                mainView.AppWindow_tpl_showTilePreloader(false,el);
                mainView.AppWindow_tpl_showTileBody(true,el);
            }
            
        };
        var failureLoad = function(err)
        {
                //TODO IMPLEMENTARE
                console.log("KOKO");
        };
        appFolder = "../"+appFolder;
        CloudCommon.loadWidget(appName,appFolder,config,successLoaded,failureLoad,scope);

    },
    TemplateCnt_tpl_UnloadWidget: function(record,successCallback,failureCallback,scope)
    {
        var me = this;
        var instanceId = record.getId();
        var cnt_instance = (me.loadedCnt && me.loadedCnt[instanceId]) ?me.loadedCnt[instanceId]:null;
        if(cnt_instance)
        {
            //TODO Cercare una soluzione migliore!
            cnt_instance.destroy();
            delete me.loadedCnt[instanceId];

        }
    },
    
    //Return an associative array of running widget
    TemplateCnt_tpl_getRunningWdgList:function()
    {
        var store = this.getTemplateStr_RunningWidgetStore();
        if(!store) return [];
        var records = store.getRange(0,store.getCount());
        var ret = {};
        Ext.each(records,function(r){
            var app_name = r.get("app_id");
            var app_instance_id = r.getId();
            ret[app_instance_id] = r.data;
        });
        return ret;
    },
    //Return the saved list of running widget (usefull to restore a previous configuration)
    TemplateCnt_tpl_getSidebarWdgList: function()
    {
        var store = this.getTemplateStr_AppPreferencesStore();
        if(!store) return [];
        if(store && store.getCount()>0 )
        {
            var rec = store.getAt(0);
            var prefs = rec.get("preferences");
            return prefs.sidebar;
        }
        return [];
    },    
    //Save the "config" configuration of the sidebar
    //If config === null -> current configuration is stored
    TemplateCnt_tpl_saveSidebarConfiguration: function(config)
    {
        console.log("Save");
        var store = this.getTemplateStr_AppPreferencesStore();
        var list = config || this.TemplateCnt_tpl_getRunningWdgList()||[];
        console.log(store);
        console.log(list);
        
        if(store && store.getCount()>0  && list)
        {       
            var rec = store.getAt(0);
            var prefs = rec.get("preferences");
            if(prefs)
            {
                prefs.sidebar = list;
                rec.pSetWithSync({
                    preferences: prefs
                },function(res){console.log(res);},function(err){console.log(err);},this);
            }
        }
    },
    //Return the reference (optionally creates it too) to the main view
    getMainView:function()
    {
        if(!this.mainView) this.mainView = Ext.create("widget.appwindowTpl");
        return this.mainView;    
    },
    //Return a preloader. If no preoloader has been passed as arguments to the application
    //then it will create one
    getPreloader:function()
    {
        var appRef = CommonCloud.getAppRef(this.$className);
        if(appRef)
        {
            if(!appRef.preloader)
            {
                //Create a Preloader 
                var preloader = CommonCloud.createPreloader();
                appRef.preloader = preloader; //Save refs in the application object 
            }
            return appRef.preloader;
        }
        return null;
    }
    
});



/*
    Mixin for main view (AppWindow_tpl)
*/
Ext.define("MetroMixin.view.AppWindow_tpl",{
    
    
    AppWindow_tpl_addNewTile: function(record)    
    {
        //This method adds new tile inside the sidebar
        // this ---> window
        // me ---> sidebar
        //scope: this
        var appRef = CloudCommon.getAppRef(this.$className);
        var component = this.down("dataview[role=sidebar]");
        var me = this;
        if(component)
        {
            var successCB = function(status)
            {
            };
            
            var failCB = function(err)
            {
            };
            
            if(appRef)
            {
                var controller = appRef.app.getTemplateCnt_tplController();
                var rnWidStore = controller.getTemplateStr_RunningWidgetStore();
                var appListStore = controller.getTemplateStr_AppsStore();
                
                var f = function(store, records, index, eOpts)
                {
                    appListStore.TemplateStr_Apps_CustomFilter(rnWidStore.TemplateStr_RunningWidget_isNotRunning,"app_id",rnWidStore);
                    Ext.each(records,function(rec){
                        console.log("Il record inserito è");
                        console.log(rec);
                        var idx = store.indexOf(rec);
                        var node = component.getNodes(idx,idx);
                        console.log("Il nodo è");
                        console.log(node);
                        if(node.length > 0)
                        {
                            node = node[0];
                            node.style.background = CloudCommon.getColor();
                            me.AppWindow_tpl_configureTilePreloader(node);
                            me.AppWindow_tpl_configureTileBody(node);
                            var data = {};
                            Ext.apply(data,rec.data);
                            
                            Ext.apply(data,{
                                parent_id:me.AppWindow_tpl_returnTileBody(node).id,
                                fatherId:node.id,
                                instanceId: rec.getId()
                            });
                            controller.TemplateCnt_tpl_LoadWidget(data,successCB,failCB,me);     
                        }
                    });
                    rnWidStore.un("add",f);
                    controller.TemplateCnt_tpl_saveSidebarConfiguration();    
                };
                rnWidStore.on("add",f);
                
                
                var recs = [];
                
                Ext.each(record,function(r){
                    console.log(r);
                    var cp = {};
                    var v = r.data || r ;
                    Ext.apply(cp,v);
                    cp._id = cp.app_id + "_" + Ext.id();
                    recs.push(cp);
                });
                rnWidStore.add(recs);
                //me.Tpl_Sidebar_vw_updateHandlerBar();
            }
            
        }
    },
    AppWindow_tpl_removeTile: function(record,item)
    {
        var appRef = CloudCommon.getAppRef(this.$className);
        var component = this.down("dataview[role=sidebar]");
        var me = this;
        if(component)
        {
            /*
            Removing element:
                    1) Use animation to change widget  opacity and zoom
                    2) Remove app from RunningStore
                    3) Unset The application
            */
            
            if(appRef)
            {
                
                var controller = appRef.app.getTemplateCnt_tplController();
                var rnWidStore = controller.getTemplateStr_RunningWidgetStore();
                var appListStore = controller.getTemplateStr_AppsStore();
                
                var successCB = function(status)
                {
                    
                };
                var failCB = function(err)
                {
                    
                };
                var fnRemove = function( store, record, index, isMove, eOpts)
                {
                    console.log("Removed");
                    appListStore.TemplateStr_Apps_CustomFilter(rnWidStore.TemplateStr_RunningWidget_isNotRunning,"app_id",rnWidStore);
                    rnWidStore.un("remove",fnRemove);
                    //Close App too
                    controller.TemplateCnt_tpl_UnloadWidget(record,successCB,failCB,component);
                    controller.TemplateCnt_tpl_saveSidebarConfiguration();
                 
                };
                rnWidStore.on("remove",fnRemove);
                
                var itm = Ext.fly(item);
                itm.animate({
                    duration: 200,
                    from: {
                        opacity: 1
                        
                    },
                    to: {
                        opacity: 0,
                        zoom:0.5
                    },
                    listeners: {
                        lastframe:function( frame, startTime, eOpts )
                        {
                            rnWidStore.remove(record);
                            // me.Tpl_Sidebar_vw_updateHandlerBar();
                        }
                    }
                });
                
            }
            
        }
    },    
    
    AppWindow_tpl_setSidebarWidthOnRearrange: function()
    {
        //This method provides a way to show/hide scrollbar for the sidebar 
        
        // this ---> window
        // me ---> sidebar
        //scope: this
        
        var me = this.down("dataview[role=sidebar]");
        me.el.dom.style.overflowX = 'hidden';
        var nodes = me.getNodes();
        if(nodes.length > 0 )
        {
            //me.el.dom.style.overflowY = 'auto';
            var last = nodes[nodes.length -1];
            var height = last.offsetTop + last.clientHeight;
            if(height <= this.el.dom.clientHeight){
                me.setWidth(me.minWidth);
            }
            else {
                me.setWidth(me.maxWidth);
            }
        } 
    },
    AppWindow_tpl_returnTilePreloader: function(element)
    {
        //Return the Preloader for Tile element
        if(!Ext) return null;
        var els = Ext.fly(element).query("img.metro_appWindow_preloader_wdg");
        els = (els && els.length > 0) ? els[0]:null;
        return els;
    },
    AppWindow_tpl_configureTilePreloader:function(element)
    {
        //Configure the preloader for element
        var component = this;
        var tblSide = component.down("dataview[role=sidebar]");
        var prel = component.AppWindow_tpl_returnTilePreloader(element);
        if(prel && tblSide)
        {
            var margin_left = (element.clientWidth - tblSide.preloaderSize.width)/2 + "px";
            var margin_top = (element.clientHeight - tblSide.preloaderSize.height)/2 + "px";
            prel.style.marginTop = margin_top;
            prel.style.marginLeft = margin_left;
            prel.style.width = tblSide.preloaderSize.width  + "px";
            prel.style.height = tblSide.preloaderSize.height + "px";
        }
    },
    AppWindow_tpl_showTilePreloader: function(show,element)
    {
        //Show / Hide the preloader for an element
        var preloader = this.AppWindow_tpl_returnTilePreloader(element);
        if(preloader)
        {
            if(show) preloader.style.display	= "";
            else preloader.style.display	= "none";
        }
    },
    //Widget Body Method
    AppWindow_tpl_configureTileBody:function(element)
    {
        //Configure the body of a Tile
        var component = this;
        var tblSide = component.down("dataview[role=sidebar]");
        var prel = component.AppWindow_tpl_returnTileBody(element);
        if(prel && tblSide)
        {
            var clientWidth = element.clientWidth + "px";
            var clientHeight = element.clientHeight + "px";
            prel.style.width = clientWidth;
            prel.style.height = clientHeight;
        }
    },
    AppWindow_tpl_returnTileBody: function(element)
    {
        //Return the body for a Tile element
        if(!Ext) return null;
        var els = Ext.fly(element).query(".metro_appWindowTpl_sidebar_body_wdg");
        els = (els && els.length > 0) ? els[0]:null;
        return els;
    },
    AppWindow_tpl_showTileBody: function(show,element)
    {
        //Show/Hide the tile's body
        var body = this.AppWindow_tpl_returnTileBody(element);
        if(body)
        {
            if(show) body.style.display	= "";
            else body.style.display	= "none";
        }
    }
    
    
});