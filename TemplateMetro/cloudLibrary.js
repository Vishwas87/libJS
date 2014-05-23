/*****************  LOCALSTORAGE MODEL *****************/ 
/*
	This model adds a new method to another model;
	the method pSetWithSync allows the developer to update the record in memory
	and immediately write the changes to the persistent db (through the store, in which 
	the record is, sync)
	
	Input:
		-field : the field of the model
		-value : the new value
		-successCallback
		-failureCallback
		-scope : scope for the Callbacks
*/
Ext.define('cloudLibrary.model.Override',{
	override: 'Ext.data.Model',
	
get:function(field)
{
    var v = this.callParent(arguments);
    if(typeof v!=='undefined')
    {	
     if (Ext.isObject(v)  )
     {
         var c = {};
         Ext.each(Object.keys(v),function(e){
             c[e] = v[e];
         });
         return c;
     }	
     else return v;
    }
    return null;
    
}
});


Ext.define('cloudLibrary.model.Persistent', 
           {
               extend: 'Ext.data.Model',
			   configureModel: function(config)
			   {
					var model = Ext.ClassManager.get(this.modelName);
					////console.log(model.getFields()); 
					
					
					/*this.save = function()
					{
					  //Method save can't be call on record
					  if(typeof //console !=='undefined')
					  {
						  //console.log("WARNING:You can't use Method save on a record. Please use the store's method!");
					  }
					};*/

			   },
			   getValue:function(field)
			   {
					if(typeof this.get(field)!=='undefined')
					{	var v = this.get(field);
						if (Ext.isObject(v)  )
						{
							var c = {};
							Ext.each(Object.keys(v),function(e){
								c[e] = v[e];
							});
							return c;
						}	
						else return v;
					}
			   },
               getAttachmentsList:function(successCallBack,failureCallback,scope)
               {
                   var att = this.get('_attachments');
                   if(att && Ext.isObject(att))
				   {
					   var keys = Object.keys(att);
					   //att = null;
					   this.recursiveGetAttachments(this.getId(),keys,[],successCallBack,failureCallback,scope);
				   }
				   else
				   {
						if(typeof successCallBack ==='function')
						{
							successCallBack.call(scope,[]);
						}
				   }
		
               },
               recursiveGetAttachments:function(docId,listAttachments,res,successCallBack,failureCallback,scope)
               {
					var me = this;
                   if(typeof successCallBack ==  'function' && 
                      typeof failureCallback ==  'function'
                     )
                   {

                       if(listAttachments.length === 0)
                       {
                           successCallBack.call(scope, res);
                       }
                       else
                       {
                           var current = listAttachments[0];
						   if(!me.store)//console.log(me);
						   
                           if(me.store) me.store.getAttachmentById(docId,current,function(ris){
                               res.push(ris);
							   listAttachments.shift();
							   
							   
                               me.recursiveGetAttachments(docId,listAttachments,res,successCallBack,failureCallback,scope);
                           },failureCallback,scope);
							
                       }
                       
                   }
               },
               pSetWithSync: function(obj,successCallback,failureCallback,scope) 
               {	
						   /*
					This method set the value for field (if exists) and then (for each method call) syncs the change
				*/
				var me = this;
				var store = me.store;
				var mod = false; //has the record been modified?
				
				if(Ext.isObject(obj))
				{	
					var key = Object.keys(obj);
					Ext.each(key,function(field){
						if(typeof me.get(field) !== 'undefined' /*&& obj[field] !== me.get(field)*/)
						{
							mod = true;
							//Check if "field" is a field of model 
							me.set(field,obj[field]);
						}
					});
					//console.log(me);
					store.sync({
						callback:function(batch,options)
						{
							//console.log(batch);
							if(batch && batch.hasException)
							{
								var ret = [];
								if(typeof failureCallback === 'function')
								{
									Ext.each(batch.exception,function(obj){
										var tmp = 
											{	
												action:obj.action,
												error: obj.error,
												record: obj.record
											}; 
										ret.push(tmp);
										
									});
									failureCallback.call(scope,ret);
								}
							}
							else
							{

								if(typeof successCallback === 'function')
								{

									var op = (batch.operations)?batch.operations:[];
									
									var ris = [];
									if(op.length > 0)
									{
										//Take the first one
										op = op[0];
										if(op.result) ris = op.result;
									}
									me.commit();
									successCallback.call(scope,ris); 
								}
							}
						}
					});	
				}
				
				
    }
});

/*------------- JSON POUCHDB READER -------------*/
/*
	Reader for the PouchDB output format
*/
Ext.define('cloudLibrary.data.Reader', {
    extend: 'Ext.data.reader.Json',
    alias: 'reader.pouchdb',
    root: 'rows',
    record: 'doc',
    idProperty: "_id",
    successProperty: 'ok',
    totalProperty: 'total_rows',
    readRecords: function(data) {
        
        //handle single document queries
        if (!Ext.isDefined(data.rows)) {
            var wrappedData = {
                rows: [{ doc: data }]
            };
            return this.callParent([wrappedData]);
        } else {
            return this.callParent([data]);
        }
    }
});


/*------------- JSON POUCHDB PROXY -------------*/
/*
	Extjs Proxy. It allows to a normal store to write and read to/from  a PouchDB DB
	It overwrites the REST API (crud) with local methods for interacting with the db  
*/
Ext.define('cloudLibrary.proxy.PouchProxy', {
    extend: 'Ext.data.proxy.Client',
    
    /**
     * @cfg {String} version
     * database version. If different than current, use updatedb event to update database
     */
    dbVersion	:	'1.0',
    
    /**
     * @cfg {String} dbName
     * Name of database
     */
    dbName              : undefined,
    
    /**
     * @cfg {Boolean} autoIncrement
     * Set true if keyPath is to autoIncrement. Defaults to IndexedDB default specification (false)
   
    autoIncrement       : true,
	*/
    /**
     * @private
     * PouchDB object
     */
    db                  : undefined,
    
    /**
     * @private
     * PouchDB remote configuration
     */
    remote: false,
    /**
     * @private
     * PouchDB index db 
       Name convention: dbname_index
     */    
    index: undefined,
    
    
    constructor: function(cfg) {
        this.callParent(arguments);
        
        this.checkDependencies();
        //TODO IMPLEMENTARE UNA GESTIONE MEDIANTE GLI EVENTI
        //this.addEvents('dbopen', 'updatedb','exception', 'cleardb', 'initialDataInserted', 'noIdb');
        
        Ext.apply(cfg,{
            url	:	'',
            api	:	{
                
                create	:	this.dbName,
                read	:	this.dbName,
                update	:	this.dbName,
                destroy	:	this.dbName
                
            },
            appendId: true,
            filterParam: undefined,
            groupParam: undefined,
            limitParam: undefined,
            pageParam: undefined,
            sortParam: undefined,
            startParam: undefined,
            //TODO Aggiungi writer e reader   
            reader:{
                type:'pouchdb'     
            }
        });
        
        
        this.initialize();
    },
    
    
    checkDependencies:function()
    {
        var me = this;
        if(typeof window.PouchDB ==='undefined')
        {
            Ext.Error.raise("PouchDB is required! Please import");
            return false;
        }
        
        if(!Ext.isString(me.dbName)) Ext.Error.raise("Please specify a valid Database Name!");
    },
    
    syncError:function(err){
        //console.log(err);
    },
    initialize: function(){
        var me = this;
        me.db = new PouchDB(me.dbName);
        if(me.useIndex) me.index = new PouchDB(me.dbName + "_" + "index");
        
        
        if(typeof me.db === 'undefined') Ext.Error.raise("Something has gone wrong!"); //Can't create a db 
    },
    /*------------- CREATE -------------*/
    create:function(operation,callback,scope)
    {
        var me = this;
        var records	=	operation.records,
            length	=	records.length;
        operation.setStarted();
        if(length	>	1)
        {
            //BULK Insert
            
            this.bulkInsert(operation,callback,scope);
        }      
        else if (length	===	1)
        {
            //Single inserting
            
            var record	=	records[0];
            this.setRecord(operation,record,callback,scope);
            
        }
        
    },
    sync:function()
    {
    //console.log("sync");
        var me = this;
        var fnComplete = null;
        var fnSync = null;
        
        if(me.pmComplete)
        {
            fnComplete = function(){
                me.pmComplete.call(me.pmScope,[]);
            };
        }
        if(me.pmOnComplete)
        {
            fnSync = function(){
                me.pmOnComplete.call(me.pmScope,[]);
            };
        }
        me.db.info(function(err, info) {
            me.db.changes({
                since: info.update_seq,
                live: me.pmLive,
                onChange: fnSync,
                complete: fnComplete
            });
        });
        var opts = {live: me.pmLive, complete:fnComplete};
        if(me.pmTarget)
        {
            me.db.replicate.to(me.pmTarget, opts);
        }
        if(me.pmSource){
            me.db.replicate.from(me.pmSource, opts); 
        } 
    },
    
    bulkInsert:function(operation,callback,scope)
    {
        var me = this;
        var i = 0;
        var tmp = [];
        //TODO SOSTITUIRE CON EXT.EACH
        for(;i<operation.records.length;i++)
        {
            var current = operation.records[i];
            var idCurrent = (current.raw.id)?current.raw.id:null;
            if(idCurrent) Ext.apply(current.data,{
                _id: ""+idCurrent //Stringfy
            });
            tmp.push(current.data);
        }
        me.db.bulkDocs({docs: tmp}, function(err, response) { 
            var msg = "Something has gone wrong! Record will be not saved! Please retry!";
            if(err)
            {	
                operation.setException(me.formatException(msg,[err],-1));
            }
            else
            {
                operation.setSuccessful();
                operation.result = response;
            } 
            operation.setCompleted();
            if(typeof callback ==='function')
            {
                callback.call(scope || this, operation);
            }         
        });
    },
    
    
    setRecord:function(operation,record,callback,scope)
    {
	    //console.log("Set Record");
        var me = this;
        var field,id ;
        //Get the optional (not for update) id and rev
        if(operation.action	==	"create")
        {	//console.log(record);
            id = (record.raw.id)?record.raw.id:null;
            if(id)
            {
                //StringFy id
                id = ""+ id; 
                me.db.put(record.data,id,{},function(err,response){
                    var msg = "Something has gone wrong! Record will be not saved! Please retry!";
                    if(err)
                    {	
                        operation.setException(me.formatException(msg,[err],-1));
                    }
                    else
                    {
                        operation.setSuccessful();
                        operation.result = response;
                    } 
                    operation.setCompleted();
                    if(typeof callback ==='function')
                    {
                        callback.call(scope || this, operation);
                    }                    
                });  
            }
            else
            {
                //No id set ---> use post
                me.db.post(record.data, function (err, response) { 
                    var msg = "Something has gone wrong! Record will be not saved! Please retry!";
                    if(err)
                    {	
                        operation.setException(me.formatException(msg,[err],-1));
                    }
                    else
                    {
                        operation.setSuccessful();
                        operation.result = response;
                    } 
                    operation.setCompleted();
                    if(typeof callback ==='function')
                    {
                        callback.call(scope || this, operation);
                    }                   
                    
                });
            }
        }
        else
        {
        //console.log("update");
            if(operation.action	==	"update")
            {
                
                //Check if _id properties is set
                //id = record.getId()|| null;
                id = record.getId() || null;

                if(id)
                {
                    //StringFy id
                    id = ""+ id; 
                    
                    me.db.get(id,function(err,response){
                        if(err)
                        {
                            var msg = "Something has gone wrong! Record will be not update! Please retry!";
                            operation.setException(me.formatException(msg,[err],-2));
                            if(typeof callback ==='function')
                            {
                                callback.call(scope || this, operation);
                            } 
                        }
                        else
                        {
                            
                            var modifiedFields = Object.keys(record.modified);
                            for(var i=0;i<modifiedFields.length;i++){
                                var field = modifiedFields[i];
                                response[field] = record.get(field);
                            }
                            //console.log("HAPPY");
                            //console.log(response);
                            me.db.put(response, response._id, response._rev, function(err, response) {
                                if(err)
                                {
                                    var msg = "Something has gone wrong! Record will be not update! Please retry!";
                                    operation.setException(me.formatException(msg,[err],-2));
                                    
                                }
                                else
                                {
                                    record.commit(); //Commit the change to the model
                                    operation.setSuccessful();
                                    operation.result = response;
                                }
                                operation.setCompleted();
                                if(typeof callback ==='function')
                                {
                                    callback.call(scope || this, operation);
                                }    
                                
                            });
                        }
                        
                    });
                }
                else
                {
                    var msg = "No record id has been found! Record will be not update Please retry!";
                    var err = "[PouchUpdate] The record hasn't the id property! Please check it!;
                    operation.setException(me.formatException(msg,[err],-2));
                    if(typeof callback ==='function')
                    {
                        callback.call(scope || this, operation);
                    }
                }
                
                
                
            }
            
        }
    },
    
    
    formatException:function(message,info,code)
    {
        
        return {
            code:(code)?code:-1,
            message:(message)?message:"Generic Exception",
            info:(info)?info:[]
        };
    },
    /*------------- UPDATE -------------*/
    
    update:function(operation,callback,scope)
    {
        //this.updateElements(operation,callback,scope,0);
        
        var me = this;
        var records	=	operation.records,
            length	=	records.length;
        operation.setStarted();
        if(length	>	0)
        {
            var record	=	records[0];
            //console.log("Cioa");
            //console.log(record);
         this.setRecord(operation,record,callback,scope);
        }      
    },
    /*------------- READ -------------*/
    read:function(operation,callback,scope)
    {
        //console.log("Reading");
        var me = this;
        
        var finishReading = function(record,request,event){
            
            me.readCallback(operation,record);
            operation.setSuccessful();
            if(typeof callback ==='function')
            {
                callback.call(scope || this, operation);
            }  
        };
        if(operation.id)
        {
            //Single record/doc search/read
            this.getRecord(operation.id,finishReading,me);
        }
        else
        {
            //List request
            this.getRecordsList(finishReading,me);
        }
        
    },
    readCallback:function(operation,records){
        //Turn, if needed, result in an array
        var rec = (Ext.isArray(records))?records:[records];
        operation.setSuccessful();
        operation.setCompleted();
        operation.resultSet = Ext.create('Ext.data.ResultSet',{
            
            records	:	rec,
            total	:	rec.length,
            loaded	:	true
            
        });
        
    },
    getRecord:function(id,callback,scope)
    {
        var me = this;
        //Use db.get() to get the doc
        if(!me.db) Ext.Error.raise("Something has gone wrong! Can\'t read the record with id"+ id + " ! Please retry!");
        me.db.get(id, function(err, doc) {
            if(err) Ext.Error.raise("Something has gone wrong! Can\'t read the record with id"+ id + " ! Please retry!");
            if(typeof callback ==='function')
            {
                callback.call(scope || this, doc);
            }   
        });
    },
    getRecordsList:function(callback,scope)
    {
        //console.log(this);
        //console.log(scope);
        //console.log("Chiamata");
        var me = this;
        //Use db.get() to get the doc
        //TODO Add suppoort for parameters EX. LIMIT AND START
        me.db.allDocs({
            include_docs: true
            
        }, function(err,response){
            if(err) Ext.Error.raise("Something has gone wrong! Can\'t read the records list ! Please retry!");
            
            var rec = [];
            for(var i = 0;i<response.rows.length ;i++){
                var current = response.rows[i]; 
                
                rec.push(Ext.create(me.model.modelName,current.doc));
            }
            
            
            if(typeof callback ==='function')
            {
                callback.call(scope || this, rec);
            } 
            
        });
        
    },
    
    /*------------- DELETE -------------*/
    /*
        
        ATTENZIONE!!!!! RICONTROLLARE IL METODO DELETE 
        DOPO OGNI CANCELLAZIONE I DATI VENGONO SOLO MARCATI "DELETED"
     */
    
    destroy:function(operation,callback,scope)
    {
        this.deleteElements(operation,callback,scope); //Recursive function
    },
    deleteElements:function(operation,callback,scope)
    {
        
        var me = this;
        if(operation.records)
        {
            if(operation.records.length === 0)
            {
                operation.setSuccessful();
                operation.setCompleted();
                
                if(typeof callback ==='function')
                {
                    callback.call(scope || this, operation);
                } 
            }
            else
            {
                var current = operation.records[0]; //Take always the first one
                var id = current.getId();
                id = (id)?id:null;
                if(id)
                {
                    me.db.get(id, function(err, doc) {
                        if(err)
                        {
                            var msg = "No Record Found For id!" + id;
                            operation.setException(me.formatException(msg,[err],-3));
                            operation.setCompleted();
                            if(typeof callback ==='function')
                            {
                                callback.call(scope || this, operation);
                            }    
                        }
                        else
                        {
                            me.db.remove(doc, function(err, response) {
                                current.commit();
                                operation.records.shift(); //Update the next element
                                me.deleteElements(operation,callback,scope);
                            });
                        }
                    });
                }
                else
                {
                    //Interrompere tutta l'operazione???
                    var msg = "No ID! Elements can't be deleted without an id!";
                    operation.setException(me.formatException(msg,[err],-3));
                    operation.setCompleted();
                    if(typeof callback ==='function')
                    {
                        callback.call(scope || this, operation);
                    }    
                }
                
            }
        }
    }
    
});
/*------------- EXTJS LOCALSTORAGE FOR POUCHDB -------------*/
/*
	EXTJS STORE IT ADDS SOME FUNCTIONS TO INTERACT WITH THE POUCHDB
*/
Ext.define('cloudLibrary.store.LocalStore', {
    extend: 'Ext.data.Store',
    
    constructor: function(cfg) {
        var me = this;
        cfg = cfg || {};
    },
    
    
    configure:function(config)
    {
        if(Ext.isObject(config.configuration) && config.configuration.localDB)
        {
            var remote = null;
            var source = null;
            var target = null;
            var completeFN = null;
            var onChangeFN = null;
            var scope = window;
            var errorFN = null;
            var newConfig = {};
            var autoLoad = false;
            var autoSync = false;
            var useIndex = false;
            var live = false;
            
            var configuration = config.configuration;
            
            remote = (configuration.remote)?configuration.remote:false;
            source = (configuration.source)?configuration.source:null;
            target = (configuration.target)?configuration.target:null;
            errorFN = (configuration.error)?configuration.error:null;
            completeFN = (configuration.complete)?configuration.complete:null;
            onChangeFN = (configuration.onChange)?configuration.onChange:null;
            scope = (configuration.scope)?configuration.scope:scope;
            autoLoad = (config.autoLoad)?config.autoLoad:autoLoad;
            // autoSync = (config.autoSync)?config.autoSync:autoSync;
            useIndex = (configuration.useIndex)?configuration.useIndex:false;
            live = (configuration.live)?configuration.live:false;
            newConfig.proxy = Ext.create('cloudLibrary.proxy.PouchProxy',{
                id  : config.storeId + '_persistent_proxy',
                useIndex	:	useIndex,
                dbName:configuration.localDB,
                remote:remote,
                pmComplete:completeFN,
                pmOnComplete:onChangeFN,
                pmOnError:errorFN,
                pmLive:live,
                pmSource:source,
                pmTarget:target,
                pmScope:scope
            });
            if(remote)newConfig.proxy.sync();
            newConfig.autoLoad = autoLoad;
            newConfig.autoSync = autoSync;
            return newConfig;
        }
        Ext.Error.raise("Missing Parameters for configuration!");
    },
    searchById:function(id,callback,failure,scope)
    {
        //Get ONLY ONE RECORD
        //Transform to string 
        id = ""+id; // ""+null -> string "null"
        var me = this;
		//me.removeAll(true); //Remove previous search
		me.remove(me.data.items,true);
        if(this.proxy && this.proxy.db)
        {	
            var db = this.proxy.db;
            db.get(id,function(err,response){
               if(err)
                {
                    if(typeof failure === 'function')
                    {
                        failure.call(scope,err);
                        return;
                    }
                }
                else
                {
                    if(typeof callback === 'function')
                    {
						
                        var record = Ext.create(me.model,response);
                        var a = function (store, records, index, eOpts)
                        {
							store.un("add",a);
							if(records.length > 0) callback.call(scope,records[0]);
                        };
						//me.on("add",a,me,{single:true});
                        me.on("add",a);
                        me.add([record]);
                        return;
                    }
                }
            });
        }
    },
    pRemoveItem:function(records,successCallback,failureCallback,scope)
    {
        /*
          Records is an an array
      */  
        this.remove(records); 
        this.sync({
            callback:function(batch,options)
            {
                if(batch && batch.hasException)
                {
                    var ret = [];
                    if(typeof failureCallback === 'function')
                    {
                        Ext.each(batch.exception,function(obj){
                            var tmp = 
                                {	
                                    action:obj.action,
                                    error: obj.error,
                                    record: obj.record
                                }; 
                            ret.push(tmp);
                            
                        });
                        failureCallback.call(scope,ret);
                    }
                }
                else
                {
                    if(typeof successCallback === 'function')
                    {
                        successCallback.call(scope); 
                    }
                }
            }
        });
    },
    /*    pAddItem:function(obj,successCallback,failureCallback)
    {
        //store.add
        
        if(Ext.isObject(obj))
        {
            this.add(obj);
            this.sync({
                callback:function(batch,options)
                {
                    if(batch && batch.hasException)
                    {
                        var ret = [];
                        if(typeof failureCallback === 'function')
                        {
                            Ext.each(batch.exception,function(obj){
                                var tmp = 
                                    {	
                                        action:obj.action,
                                        error: obj.error,
                                        record: obj.record
                                    }; 
                                ret.push(tmp);
                                
                            });
                            failureCallback.call(scope,ret);
                        }
                    }
                    else
                    {
                        if(typeof successCallback === 'function')
                        {
                            successCallback.call(scope); 
                        }
                    }
                }
            });
        }
        
    },*/
    pInsert:function(obj,successCallback,failureCallback,scope)
    {
        //store.add
        var added = false;
        if(Ext.isObject(obj)){
            added = true;
            this.add(obj);
        }
        else
        {
            //Store.insert
            if(Ext.isIterable(obj)){
                added = true;
                this.insert(0,obj); //TODO Può aver senso mettere un metodo con index????
            } 
        }
        if(added)
        {
            this.sync({
                callback:function(batch,options)
                {
					console.log("BBBB");
					console.log(batch);
                    if(batch && batch.hasException)
                    {
						console.log(batch);
                        var ret = [];
                        if(typeof failureCallback === 'function')
                        {
                            Ext.each(batch.exception,function(obj){
                                var tmp = 
                                    {	
                                        action:obj.action,
                                        error: obj.error,
                                        record: obj.record
                                    }; 
                                ret.push(tmp);
                                
                            });
                            failureCallback.call(scope,ret);
                        }
                    }
                    else
                    {
                        if(typeof successCallback === 'function')
                        {
                            var op = (batch.operations)?batch.operations:[];
                            
                            var ris = [];
                            if(op.length > 0)
                            {
                                //Take the first one
                                op = op[0];
                                if(op.result) ris = op.result;
                            }
                            successCallback.call(scope,ris); 
                        }
                    }
                }
            });
        }
    },
    getAttachmentById:function(docId,attachId,successCallback,failureCallback,scope)
    {
        var db = this.proxy.db;
        db.getAttachment(docId, attachId, {
            attachments: true
        },function(err, res) { 
            
            if(err)
            {
                if(typeof failureCallback === 'function')
                {
                    failureCallback.call(scope,err);
                }
            }
            
            else
            {
                if(typeof successCallback === 'function')
                {
                    var tmp = {
                        name : attachId,
                        blob : res 
                    };
                    successCallback.call(scope,tmp);	
                }
            }

        });
    },
	pSync:function(onChange,complete)
	{	 
		 this.proxy.db.replicate.from(this.proxy.pmSource, {
                                 onChange: onChange,
                                 complete: complete,
                                 live : false
                               });
	}
});

