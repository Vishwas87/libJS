/**
 * Created with JetBrains WebStorm.
 * User: vincenzo
 * Date: 12/02/14
 * Time: 11:45
 * To change this template use File | Settings | File Templates.
 */

Ext.define('Cloud.Desktop.Abstract.Override.Controller',{
    override:'Ext.app.Controller',




    ref: function(refs) {
        var me = this;
        var key = me._key || me.application._key|| null;

        if(Ext.isArray(refs) &&  key){

            var obj = {};

            var newRefs = [];
            Ext.Array.each(refs,function(ref){

                obj.ref = ref.ref;
                obj.selector = ref.selector +"[cls~="+key+"]";

                newRefs.push(obj);
            },this);

            delete refs;
            this.callParent([newRefs]);
        }
        else this.callParent(arguments);

    },
    getRef: function(ref, info, config) {
        var me = this,
            refCache = me.refCache || (me.refCache = {}),
            cached = refCache[ref];

        info = info || {};
        config = config || {};
        var key = this._key || this.application._key||null;
        key = (key)?"_"+key:"";
        Ext.apply(info, config);

        var tmp ={};

        if (info.forceCreate) {
            return Ext.ComponentManager.create(info, 'component');
        }
        if (!cached) {

            if (info.selector) {
                tmp = ref + key;
                refCache[ref] = cached = Ext.ComponentQuery.query(info.selector)[0];

            }

            if (!cached && info.autoCreate) {


                refCache[ref] = cached = Ext.ComponentManager.create(info, 'component');
            }

            if (cached) {
                cached.on('beforedestroy', function() {
                    refCache[ref] = null;
                });
            }
        }

        return cached;
    },
    control : function(actions){
        var me = this;

        var key = me._key || me.application._key|| null;

        if(Ext.isObject(actions) && key){
            var obj = {};
            Ext.Object.each(actions,function(selector){
                //var s = "#"+me.parent.id+" "+selector;
                                //Ex. application_viewport[cls*=key]
                var s = selector+"[cls~="+key+"]";
                obj[s] = actions[selector];
            },this);
            delete actions;

            if (!me.selectors){
                me.selectors = [];
            }
            me.selectors.push(obj);

            this.callParent([obj]);
            ////console.log(this);
        }
        else{
            this.callParent(arguments);
        }
    },
    getController: function(id) {


        var me = this,
            app = me.application;
		
		
        var key = me._key || null;
        if(!key) key = (app && app._key)? app._key:null;
        var lkey = (key)? "_"+key:"";
        var tmp = id + lkey;

        if (tmp === me.id) {
            return me;
        }

        return app && app.getController(id);
    },
    getStore: function(name) {
        var storeId, store;
        var me = this;
		var app = me.application;

        var key = me._key || null;
        if(!key) key = (app && app._key)? app._key:null;
        var tmp = (key)? name+"_"+key : name;

        storeId = (tmp.indexOf('@') == -1) ? tmp  : tmp.split('@')[0];

        store   = Ext.StoreManager.get(storeId);
        ////console.log(store);
        if (!store) {
            name = Ext.app.Controller.getFullName(name, 'store', this.$namespace);

            if (name) {

                store = Ext.create(name.absoluteName, {
                    storeId: storeId
                });

                ////console.log("Sto Creando");
                ////console.log(store);
            }
        }

        return store;
    },
    constructor:function(config){


        this._applyPlugins = function(config,className,controllerName){

                var me = this;
                var currentPlg;
                var methodInit = "configure_"+className+"_"+controllerName; // Metodo di init per il controller specifico
                var methodGetAdd = "getMethodsListToAdd"; //Metodo che ritorna l'elenco di metodi da aggiungere
                var methodGetOverridden = "getOverriddenMethodsList"; //Metodo ch ritorna l'elenco di metodi da sovrascrivere

                config = config ||{};

                config.plugins_app = (Ext.isArray(config.plugins_app))?config.plugins_app : [];

                //console.log(config.plugins_app );
                for(var index in config.plugins_app){

                    currentPlg = config.plugins_app[index];

                    var currentPlgMainControllerName = currentPlg.pluginName + ".controller.mainController";


                    if(currentPlg.pluginName && typeof Ext.ClassManager.classes[currentPlgMainControllerName]!= 'undefined'){

                        var Plg = Ext.ClassManager.classes[currentPlgMainControllerName];

                        //Metodi da aggiungere
                        if(typeof Plg[methodGetAdd] != 'undefined'){
                            var listMethodToAddToController = Plg[methodGetAdd](className,controllerName);
                            //console.log(listMethodToAddToController);
                            //Aggiungiamo i metodi
                            for(var cr in listMethodToAddToController){
                                mtd = listMethodToAddToController[cr];

                                if(typeof Plg[mtd] != 'undefined' && //Il plugin implementa il metodo
                                    typeof me[mtd] === 'undefined' //Il controller non espone già il metodo (altrimenti si deve fare l'override)
                                    ){

                                    me[mtd] = Ext.Function.pass(Plg[mtd], [],me);
                                     }

                            }
                        }

                        //Metodi da sovrascrivere
                        if(typeof Plg[methodGetOverridden] != 'undefined'){

                            listMethodToOverrideInController = Plg[methodGetOverridden](className,controllerName);
                            controllerOverridableMethodsList = (typeof me.getOverridableMethodsList !=='undefined')?me.getOverridableMethodsList():[];
                            if(listMethodToOverrideInController.length > 0 ){
                                //Ci sono metodi che si vogliono sovrascrivere
                                // I metodi da sovrascrivere devono essere in accordo con quelli dichiarati dal controller
                                // nel metodo getOverridableMethodsList
                                if(controllerOverridableMethodsList.length == 0){
                                    //Non ci sono metodi sovrascrivibili ma il plugin sta provando a sovrascriverne alcuni
                                    //GENERA ERRORE
                                    me.generateErrorObject.apply(me,["INVALID PLUGIN ERROR","Current Plugin"+ Plg.name + "is not a valid Plugin!"]);
                                    return false;
                                }
                                else{

                                    //Sovrascrivi tutti i metodi facendone il binding corretto
                                    for(var i in listMethodToOverrideInController){

                                        mtd = listMethodToOverrideInController[i];

                                        if(Ext.Array.indexOf(controllerOverridableMethodsList,mtd)>-1)
                                        {

                                            me['parent_'+mtd] = me[mtd];
                                            me[mtd] = Plg[mtd].bind(me);

                                        }
                                        else
                                        {
                                            me.generateErrorObject.apply(me,["INVALID PLUGIN ERROR","Current Plugin"+ Plg + "is not a valid Plugin!"]);
                                            return false;
                                        }

                                }
                            }
                            /*else{

                            }*/

                        }
                    }

                        //Init per il plugin applicato ad un particolare
                        if(typeof Plg[methodInit] != 'undefined'){
                            //Esegui il metodo init nello scope del modulo
                            Plg[methodInit].apply(me,[config]);

                        }
                     }

            }


    };

        config = config || this.config || {};

        this.errorQueue = config.errorQueue || new Ext.util.Observable();
        this.generateErrorObject = function(errorName,errorMessage){
            var me = this;
            if(me.errorQueue){

                me.errorQueue.fireEvent(me.$className + '_error',{
                    name : errorName,
                    message : errorMessage
                });
            }

        };

        this.desktopQueue = config.desktopQueue || new Ext.util.Observable();
        this.errorHandler =    function(msg){
            //Gestisce e blocca il flusso in caso di errore
            //console.log(msg);
            if(this instanceof Ext.app.Application &&    //Sono l'APPLICATION
                typeof this._removeApp != 'undefined'){

                       this._removeApp(msg);
            }





        };

        this.errorQueue.on(this.$className + '_error',this.errorHandler);
        this.callParent(arguments);

        //se non è di tipo Application-> aggiungi i plugin
        if(!(this instanceof Ext.app.Application))
        {
            var arr = (this.$className)? this.$className.split('.'):null;
            var className = (arr && arr.length > 0)? arr[0]:null;
            var controllerName = (arr && arr.length > 0)? arr[arr.length -1 ]:null;
            if(config.plugins_app && config.plugins_app.length >0) config.plugins_app = config.plugins_app;
            else
            {
                if(this.application && this.application.plugins_app && this.application.plugins_app.length > 0){
                    config.plugins_app =   this.application.plugins_app;
                }
                else config.plugins_app =[];

            }

            if(className && controllerName) this._applyPlugins(config,className,controllerName);
        }
    },
    registerTo:function(queue,eventName,fn){

        if(queue && eventName &&
            eventName.length>0 && (typeof fn =='function'))
        {
            queue.on(eventName,fn);
        }

    }
});
