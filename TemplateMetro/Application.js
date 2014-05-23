/**
 * Created with JetBrains WebStorm.
 * User: vincenzo
 * Date: 12/02/14
 * Time: 12:37
 * To change this template use File | Settings | File Templates.
 */

Ext.onReady(function() {


    //console.log(Ext);

    Ext.require = (function(){
        var original = Ext.require;

        return function()
        {
            // //console.log(arguments);
            return original.apply(Ext,arguments);

        };


    })();


    Ext.create = (function(){

        var original = Ext.create;
        return function() {



            a = original.apply(Ext, arguments);
			
            //TODO Vedere con fabio

            if(a instanceof Ext.app.Application) return a;
			var npc = (a.$className) ? a.$className:null;
			if(!npc) return a;
			npc = npc.split(".")[0];
			if(npc === 'Ext' || npc ==="") return a;	
			else 
			{
				var application = window[npc];
				if(application && application.app)
				{
					if(application.app.objectCreated) application.app.objectCreated.push(a);
				}
			}
			
			return a;	
            var namespace = (arguments && arguments[0] && arguments[0].split(".").length >0)?  arguments[0].split(".")[0]:"";
            //console.log(namespace);
            if(namespace === 'Ext' || namespace ==="") return a;
			console.log("ccii");
			
            if(a instanceof Ext.Component) {

                //console.log(a);
                //if(typeof app.getApplication != 'undefined' && a.el) a.el.addCls(app.getApplication().key);
				
				console.log(a);
				return a;
                var rifApp = (arguments[2])? arguments[2]:null;

                if(rifApp)
                {
                    if(rifApp.multiRunning && rifApp._key){
                        a.el.addCls(rifApp._key);
                    }
                    return a;
                }
                else
                {
                    //Non è stato passato l'oggetto APP -> Genera errore
                    return false;
                }

            }

            return a;

        };
    })();





});


Ext.define('Cloud.Desktop.Abstract.Override.Application',{

    override:'Ext.app.Application',



    jsRequire:function(jsList){

        var me = this;
        var head = Ext.getHead();
        Ext.each(jsList,function(js){


            if(document.querySelectorAll('script[src*=\''+js+"\']").length == 0){
                //Lo script non è già stato aggiunto
                var jsEl = document.createElement('script');

                Ext.apply(jsEl,{

                    src:js,
                    ref:1,
                    type:'text/javascript',


                    onload:Ext.Function.createDelayed(me.handleLoadedResources,1000,me,[jsEl]),

                    onerror:function(){
                        me.errorQueue.fireEvent(me.$className + '_error',{
                            name : "NOT FOUND JS",
                            message : "NOT FOUND JS Message"
                        },me);
                    }
                });

                head.appendChild(jsEl);
            }
            else
            {
               var c = document.querySelectorAll('script[src*=\''+js+"\']")[0];

                c.ref=(c.ref)? c.ref+1:1;
                me.handleLoadedResources(c);
            }


        });
    },


    cssRequire: function(cssList){
        var me = this,
            docHead = Ext.getHead();


            Ext.each(cssList,function(css){

                    //Lo script non è già stato aggiunto

                  if(document.querySelectorAll('link[href*=\''+css+"\']").length == 0){
                      var cssEl = document.createElement('link');
                      Ext.apply(cssEl,{

                          href:css,
                          rel:'stylesheet',
                          type:'text/css',
                          ref: 1,
                          onerror:function(){
                              //console.log(me);
                              me.errorQueue.fireEvent(me.$className + '_error',{
                                  name : "NOT FOUND CSS",
                                  message : "NOT FOUND CSS Message"
                              },me);
                          }
                      });
                      docHead.appendChild(cssEl);
                      me.cssRequired.push(cssEl);
                  }
                  else
                  {
                      var c =document.querySelectorAll('link[href*=\''+css+"\']")[0];
                      c.ref = (c.ref)? c.ref+1:1;
                  }


            });


    },
    handleLoadedResources:function(script){
        var me = this;
        script.onload= null;
        script.onerror = null;
        me.jsRequired.push(script);
        //console.log('Aiuto');
        me.checkDependenciesState.apply(me,[]);

    },

    checkDependenciesState : function(){
        var me = this;

        if(me &&//L'if me serve a controllare se non è stata generata un'eccezione che ha cancellato il controller
            me.dependencies.js.length == me.jsRequired.length)
        {
            //Caricate tutte le dipendenze
            //Riprendiamo il flusso di lavoro
            //this.configureSetLoader(config,me);
            //Caricamento dei Plugins
            //this.loadPlugins(config);
            //
            //
           // me.configure.apply(me,[config]);

            me._doInit(me);
            me._applyPlugins.apply(me,[me.config,me.name,"Application"]); //TODO SOstituire la stringa costante

            me._initNamespace();
            me._initControllers();
            me._onBeforeLaunch();
            me._finishInitControllers();
        }
    },
    initNamespace: function() {

        var me = this,
            appProperty = me.appProperty,
            ns;

        var lkey = (me._key)? "_"+me._key :"";

        var m = me.name +lkey;
        ns = Ext.namespace(m);
	    if (ns) {
            ns.getApplication = function() {
                return me;
            };

            if (appProperty) {
                if (!ns[appProperty]) {
                    ns[appProperty] = me;
                }
                //<debug>
                else if (ns[appProperty] !== me) {
                    Ext.log.warn('An existing reference is being overwritten for ' + name + '.' + appProperty +
                        '. See the appProperty config.'
                    );
                }
                //</debug>
            }
        }
    },
    constructor:function(config){

        /*Impostiamo a void function tutti i metodi che vengono chiamati
          nel costruttore, in modo da poter chiamare tranquillamente il
          this.callParent(arguments)
        */


        config = config || {};

        //config.plugins_app = (config.plugins_app && config.plugins_app.length > 0)? config.plugins_app : (this.plugins_app || []);

        if(config.plugins_app &&
           config.plugins_app.length>0
            )
        {
            config.plugins_app = config.plugins_app;
        }
        else
        {

            if(this.plugins_app && this.plugins_app.length > 0)
            {

                config.plugins_app = this.plugins_app;
            }
            else{

                config.plugins_app = [];
            }

        }


        console.log(config);
        var me = this;
        if (Ext.isEmpty(me.name)) {
            Ext.Error.raise("[Ext.app.Application] Name property is required");
        }

        Ext.apply(this,{

            config:config

        });
        this.objectCreated = [];
        this.cssRequired = [];
        this.jsRequired = [];
        this.dependencies = (config && config.dependencies)?config.dependencies:{css:[] , js:[]};


        me._doInit = me.doInit;
        me.doInit = function(){};
        me._initNamespace = me.initNamespace;
        me.initNamespace = function(){};
        me._initControllers = me.initControllers;
        me.initControllers = function(){};
        me._onBeforeLaunch = me.onBeforeLaunch;
        me.onBeforeLaunch = function(){};
        me._finishInitControllers = me.finishInitControllers;;
        me.finishInitControllers = function(){};

        me.callParent(arguments);




        var classToRequire = [];
        Ext.Array.each(this.controllers,function(obj){

           classToRequire.push(this.name + ".controller." + obj);

        },this);
        Ext.Array.each(this.models,function(obj){

            classToRequire.push(this.name + ".model." + obj);

        },this);
        Ext.Array.each(this.stores,function(obj){

            classToRequire.push(this.name + ".store." + obj);

        },this);
        Ext.Array.each(this.views,function(obj){

            classToRequire.push(this.name + ".view." + obj);

        },this);

        Ext.Array.each(config.plugins_app,function(plg){
            //1)SETTING PATH
            //2)Adding to require
            Ext.Loader.setPath(plg.pluginName,plg.pluginPath);
            classToRequire.push(plg.pluginName + ".controller.mainController");

        });

         //console.log(classToRequire);
         me.continueConstructor.apply(me,[classToRequire]);




    },
    continueConstructor:function(classToRequire){
        //Metodo chiamato dopo che il require delle view/store/model/controller
        //è ritornato
        var me = this;
        me.appFolder = me.config.appFolder || me.appFolder;

        Ext.Loader.setPath(me.name,me.appFolder);

        Ext.require(classToRequire,function(){

            ///Modifichiamo la chiamata NomeApp -> ottenendo un oggetto specifico per il namespace (istanza)
            var t = window[me.name];
            window[me.name] = function(){

                if(me._key){

                    var path = me.name + "_"+ me._key;
                    window[path] = window[path] || {};
                    //Ext.apply(window[me.name + "_"+ me.key],t);


                    return window[path];
                }

                return t;
            }();

            me.checkDependencies(me.dependencies.css.concat(me.dependencies.js),0,function(){


                if(me.dependencies.css.length > 0) me.cssRequire(me.dependencies.css);
                if(me.dependencies.js.length > 0)  me.jsRequire(me.dependencies.js);
                else
                {
                    //Non ci sono js da caricare
                    me._doInit(me);
                    //console.log("Entrato");
                    //console.log(me.config);
                    me._applyPlugins.apply(me,[me.config,me.name,"Application"]);
                    me._initNamespace();
                    me._initControllers();
                    me._onBeforeLaunch();
                    me._finishInitControllers();
                }

            });
        });


    },
    getController: function(name) {



        var me          = this,
            controllers = me.controllers,
            className, controller;

        // Permette l'esecuzione multipa dell'application (per ogni istanza
        // controller diversi)


        var key = (this._key)? "_" +this._key : "";
        var controller_id = name + key;

        controller = controllers.get(controller_id);

        var config = this.config || {};
        if (!controller) {
            className  = me.getModuleClassName(name, 'controller');

            controller = Ext.create(className, {
                application: me,
                id:          controller_id,
                config:      config //Può essere undefined
            });
            controllers.add(controller);

            if (me._initialized) {
                controller.doInit(me);
            }
        }

        return controller;
    },
    checkDependencies : function(config,index,successCallBack){

        if(!config || index == config.length){
            //O non ci sono dipendenze oppure ho finito di scorrere l'array delle dipendenze

            successCallBack(config);
        }
        else{
            var list = config
            var scope = this;
            var currentDependecy = list[index];
            //Effettuiamo solo il controllo sull'esistenza
            Ext.Ajax.request({

                url: currentDependecy,
                method: 'HEAD',
                timeout: 5000, //TODO SOSTITUIRE CON UNA COSTANTE
                success: function(response){
                    scope.checkDependencies(config,index+1,successCallBack);
                },
                failure: function(response){
                    scope.errorQueue.fireEvent(scope.$className + '_error',{
                        name : "Not Found Error",
                        message : "File Not Found Message"
                    },scope);

                }
            });
        }
    },
    
    removeApplication	:	function()
    {
    	
    }
    



     /*
     *
     * */


});