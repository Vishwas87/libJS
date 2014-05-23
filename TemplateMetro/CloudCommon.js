if(!CloudCommon ) 
    var CloudCommon = 
        {

            //Load a widget
            loadWidget:function(appName,appFolder,config,successCallback,failureCallback,scope)
            {
                //This method provides a way to load a Widget Controller 
                /*
                    Params:
                        -appName
                        -appFolder/Path
                        -config: configuration
                                {
                                    -id: Controller's id (usefull for multiinstance widget)[optional]
                                    -size: [sml_wdg,mdm_wdg,big_wdg]
                                    -parent: Parent's id
                                }
                */
                
                if(!Ext.isString(appName) || !Ext.isString(appFolder) || !config || !config.size || !config.parent) 
                {
                    if(typeof failureCallback === "function")
                    {
                        failureCallback.call(scope,"[loadWidget] Missing Parameters! Please check docs!");   
                    }
                }
                else
                {
                    //Check if file exists
                    var url = appFolder + "/controller/wdg_main_controller.js";
                    Ext.Ajax.request({
                        url: url,
                        method:"HEAD",
                        timeout:3000,
                        success: function(response){
                            //File Found
                            
                            Ext.Loader.setPath(appName,appFolder);
                            var controller_class = appName+ ".controller.wdg_main_controller"; //TODO Cercare una soluzione più elegante
                            Ext.require(controller_class,function(){
                                var stdConfig = 
                                    {
                                        id:config.controller_id,
                                        size:config.size,
                                        parent:config.parent
                                    };
                                console.log(stdConfig);
                                var cnt = Ext.create(controller_class,stdConfig);
                                var namespace = CloudCommon.getNamespaceFromClass(cnt.$className);
                                var eventError = namespace + "_widget_error";
                                var loadSuccess = namespace + "_widget_load";
                                cnt.on(eventError,function(msg){
                                    if(typeof failureCallback === "function")
                                    {
                                        console.log(msg);
                                        failureCallback.call(scope,msg);   
                                    }
                                    
                                });
                                cnt.on(loadSuccess,function(status){
                                    if(typeof successCallback === "function")
                                    {
                                        successCallback.call(scope,this);   
                                    }
                                    
                                });
                                if(typeof cnt.onLaunch === "function")cnt.onLaunch();
                            });
                            
                        },
                        failure: function(response)
                        {
                            //File/Route not found
                            if(typeof failureCallback === "function")
                            {
                                console.log("Wrong");

                                failureCallback.call(scope,"[loadWidget] Wrong url or missing route for "+ url);   
                            } 
                        }
                    });
                    
                }
                
                
                
            },
            
            //Random Number among min and max
            randomIntFromInterval:function (min,max)
            {
                if(!Ext.isNumeric(min) || !Ext.isNumeric(max)) return 0;
                return Math.floor(Math.random()*(max-min+1)+min);
            },
            hasClass:function (element, cls) {
                //Check if element has cls has class
                if(!element || !element.className || !Ext.isString(cls)) return false;
                return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
            },
            hasPreloader:function (element)
            {
                //Check if element has a preloader
                if(!element) return false;
                return (Ext.fly(element).query("img.preloader_wdg") && Ext.fly(element).query("img.preloader_wdg").length > 0 ?true:false);
            },
            getNamespaceFromClass:function (className)
            {
                //Return the Namespace of a class
                if(Ext && Ext.isString(className) && typeof Ext.ClassManager.classes[className] !=="undefined") 
                {
                    className = className.split(".");
                    className = (className.length>0)?className[0]: null;
                    return className;
                }
                return null;
            },
            getAppRef:function (className)
            {
                //Return The reference to the AppObject for a class Name
                
                var ns = CloudCommon.getNamespaceFromClass(className);
                if(ns && typeof window[ns] !== 'undefined') return window[ns];
                return null;     
            },
            getColorList:function ()
            {
                //Return the array list of color Windows 8 style
                return [
                    "#FF0097",
                    "#A200FF",
                    "#E671B8",
                    "#F09609",
                    "#00ABA0",
                    "#8CBF26",
                    "#A05000",
                    "#1ba1e2",
                    "#a05000",
                    "#0050ef",
                    "#a20025",
                    "#1ba0e1",
                    "#008a00",
                    "#339933",
                    "#6a00ff",
                    "#a2c139",
                    "#d80073",
                    "#f09609",
                    "#765f89",
                    "#6d8764",
                    "#fa6801",
                    "#e671b8",
                    "#a200ff",
                    "#a200ff",
                    "#a200ff",
                    "#e51400",
                    "#7b3a3e",
                    "#657688",
                    "#00aba9",
                    "#d8c101",
                    "#000000",
                    "#f1a30b"
                ];
            },            
            getColor:function (index)
            {
                //Return the color at index "index". If no index ( or wrong index) is passed then a random color is generated
                var color = CloudCommon.getColorList();
                if(index && index >=0 && index<color.length) return color[index];
                //no index / wrong index ---> return random color
                return color[CloudCommon.randomIntFromInterval(0,color.length-1)];
            }, 
            getTranslationFor:function (appName,label)
            {	//Return the translation for label (string) of application appName
                
                if(!Ext || !Ext.isString(appName) || !Ext.isString(label)) return "undefined";
                
                var trn = appName+"_Translation";//Ex. TemplateWithSideBar_Translation
                trn = window[trn]? window[trn]:{};
                return trn[label] || "undefined";
            },
            
            jsRequire:function(jsList,onLoad,onError,scope)
            {
                //This Method adds a script to Document for loading scripts js inside jsList
                if(Ext && Ext.isIterable( jsList ))
                {
                    var head = Ext.getHead();
                    Ext.each(jsList,function(script){
                        
                        
                        if(Ext.isString(script))
                        {
                            var t = document.querySelectorAll('script[src*=\''+script+"\']");
                            if(t.length === 0){   
                                //Hasn't already loaded
                                var jsEl = document.createElement('script');
                                Ext.apply(jsEl,{
                                    
                                    src:script,
                                    ref:1,
                                    type:'text/javascript',
                                    
                                    
                                    onload:Ext.Function.createDelayed(onLoad,1000,scope,[jsEl]),
                                    
                                    onerror:function(){
                                        if(typeof onError === "function") onError.call(scope,script);
                                    }
                                });
                                
                                head.appendChild(jsEl);
                            }
                            else
                            {
                                if(Ext.isObject(scope) && typeof onLoad === "function")
                                {
                                    var current = t[0];
                                    t.ref = (t.ref)?t.ref+1:1; //How many references this script has
                                    onLoad.call(scope,current);
                                }
                            }
                        }
                        
                    });
                }
                
            },
            cssRequire:function(cssList,onLoad,onError,scope)
            {
                //This Method adds a href to Document for loading css inside CssList
                if(Ext && Ext.isIterable(cssList))
                {
                    var head = Ext.getHead();
                    Ext.each(cssList,function(href){
                        
                        if(Ext.isString(href))
                        {
                            var t = document.querySelectorAll('link[href*=\''+css+"\']");
                            if(t.length === 0)
                            {
                                //No script hasn't already loaded
                                var cssEl = document.createElement('link');
                                Ext.apply(cssEl,{
                                    href:href,
                                    rel:'stylesheet',
                                    type:'text/css',
                                    ref: 1,
                                    onload:Ext.Function.createDelayed(onLoad,1000,scope,[cssEl]),
                                    onerror:function(){
                                        if(typeof onError === "function") onError.call(scope,href);
                                    }
                                });
                                docHead.appendChild(cssEl);
                                t = null;
                                t = cssEl;
                            }
                            else
                            {
                                t = t[0];
                                t.ref = (t.ref)? t.ref+1:1;
                                
                            }
                        }
                        
                    });
                }
                
            },
            checkDependencies : function(dependenciesList,errorsList,index,successCallback,failureCallback,scope)
            {
                if(!Ext.isNumber(index)) Ext.Error.raise("[checkDependencies] No Numeric Index passed!");
                if(!Ext.isArray(errorsList)) Ext.Error.raise("[checkDependencies] No Array errorsList passed!");
                if(!Ext.isIterable(dependenciesList)) Ext.Error.raise("[checkDependencies] No Iterable Dependecies passed!");
                //Check if deps Inside dependenciesList is reachables
                
                if(!dependenciesList || dependenciesList.length === 0 || index === dependenciesList.length)
                {
                    if(Ext.isObject(scope) && typeof successCallback === "function" && errorsList.length === 0)
                    {
                        successCallback.call(scope);
                    }
                    else if(Ext.isObject(scope) && typeof failureCallback === "function" && errorsList.length > 0)
                    {
                        failureCallback.call(scope,errorsList);
                    }
                }
                else
                {
                    var retScope = CloudCommon;
                    var currentDependecy = dependenciesList[index];
                    //Effettuiamo solo il controllo sull'esistenza
                    Ext.Ajax.request({
                        url: currentDependecy,
                        method: 'HEAD',
                        timeout: 5000, //TODO SOSTITUIRE CON UNA COSTANTE
                        success: function(response){
                            retScope.checkDependencies(dependenciesList,errorsList,index+1,successCallback,failureCallback,scope);
                        },
                        failure: function(response){
                            
                            errorsList.push(response);
                            retScope.checkDependencies(dependenciesList,errorsList,index+1,successCallback,failureCallback,scope);
                        }
                    });
                }
            },
            loadResources:function(js,css,missingFile,scope)
            {
                /*
                [loadResources]
                Parameters:
                    -js: object for javascript request 
                         Field:
                               -list: array of url
                               -onError: function(err) function for error on Loading
                               -onLoad: function() function for success Loading
                    
                    -css: object for css request 
                         Field:
                               -list: array of url
                               -onError: function(err) function for error on Loading
                               -onLoad: function() function for success Loading
                    
                    -missingFile: function(errs) Function for handle unreachable files
              
                Usage example:
                var js = 
                    {
                        list: ["../Application.js"],
                        onError: function(err)
                        {
                            console.log(err);
                        },
                        onLoad: function()
                        {
                            console.log("Happy");
                        }
                    };
                var css = 
                    {
                        list: ["../Application.css"],
                        onError: function(err)
                        {
                            console.log(err);
                        },
                        onLoad: function()
                        {
                            console.log("Happy");
                        }
                    };
                var missingFile = function(errs)
                {
                    console.log(errs);
                };
                CloudCommon.loadResources(js,css,missingFile,this);
              */  
                if(!Ext) Ext.Error.raise("[loadResources] No Ext libraries found! Please import them!");
                if(!Ext.isObject(js) || !js.list || 
                   !Ext.isArray(js.list) || typeof js.onError !== "function" || typeof js.onLoad !== "function") 
                    Ext.Error.raise("[loadResources] Wrong or missing parameters for object JS! Please check docs!");
                
                if(!Ext.isObject(css) || !css.list || 
                   !Ext.isArray(css.list) || typeof css.onError !== "function" || typeof css.onLoad !== "function") 
                    Ext.Error.raise("[loadResources] Wrong or missing parameters for object CSS! Please check docs!");
                
                if(!Ext.isObject(scope))
                    Ext.Error.raise("[loadResources] Wrong or missing scope ! Please check docs!");
                
                if(typeof missingFile !== "function")
                    Ext.Error.raise("[loadResources] Wrong \"missingFile\" function! Please check docs!");
                
                var deps = css.list.concat(js.list);
                var successCallback = function()
                {
                    //All requested files are available
                    CloudCommon.cssRequire(css.list,css.onLoad,css.onError,scope);
                    CloudCommon.jsRequire(js.list,js.onLoad,js.onError,scope);
                    
                };
                var failCallback = function(errors)
                {
                    //Some requested files are not available
                    missingFile.call(scope,errors);
                };
                CloudCommon.checkDependencies(deps,[],0,successCallback,failCallback,scope);   
            }
        };