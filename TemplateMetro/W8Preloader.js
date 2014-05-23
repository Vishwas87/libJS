/*
    Mixin for Preloader windows style
*/
Ext.define("CloudCommonComponent.view.MetroPreloader",{
    config:
    {
        closingTime:500,
        textSize:25,
        textColor:"white",
        fontFamily:"helvetica,arial,verdana,sans-serif",
        bckColor:null,
        preloaderImgSrc:null      
    },
    beforeDismiss : function()
    {
        //Tmp 
    },
    afterDismiss : function()
    {
        //Tmp 
    },   
    beforeRenderEvent: function()
    {
        var component = this;
        
        if(!component.config.closingTime) component.config.closingTime = component._setClosingTime();
        if(!component.config.textSize) component.config.textSize = component._setTextSize();
        if(!component.config.textColor) component.config.textColor = component._setTextColor();
        if(!component.config.fontFamily) component.config.fontFamily = component._setFontFamily();
        if(!component.config.bckColor) component.config.bckColor = component._setBckColor();
        if(!component.config.preloaderImgSrc) component.config.preloaderImgSrc = component._setPreloaderImgSrc();
        
        
        Ext.apply(component,{
            autoShow: false,
            border: false,
            //cls: 'tpl_preloader_win',
            draggable: false,
            height: 250,
            width: 400,
            shadow: false,
            resizable: false,
            //bodyCls: 'tpl_preloader_win_body',
            closable: false,
            frameHeader: false,
            header: false,
            overlapHeader: false,
            maximized: true
        });
        
        component.add(
            {
                xtype: 'image',
                flex: 1,
                height: 20,
                maxHeight: 20,
                maxWidth: 220,
                minHeight: 20,
                minWidth: 220,
                width: 220,
                src: component.config.preloaderImgSrc
            },
            {
                xtype: 'label',
                flex: 1,
                height: 30,
                maxHeight: 30,
                maxWidth: 500,
                minHeight: 30,
                minWidth: 500,
                width: 500,
                shadow: false,
                defaultAlign: 'tm-bl?'
            }
            
        );
    },
    renderEvent:function()
    {
        var component = this;
        
        var elC = component.el;
        var body = component.body;
        var label = (body)? (body.down("label")?body.down("label"):null):null;
        if(elC && label)
        {
            elC.dom.style.cssText += " border-width:0px !important;"; //hide border
            elC.dom.style.cssText += " text-align:center !important;"; //text-align: center
            body.dom.style.cssText += " background: "+component.config.bckColor +";"; //hide
            label.dom.style.cssText += " color:"+component.config.textColor+";";
            label.dom.style.cssText += " font-size:"+component.config.textSize + "px;";
            label.dom.style.cssText += " font-family:"+component.config.fontFamily + ";";
        }
        
        
    },
    updateText: function(text)
    {
        var lbl = this.down("label");
        if(lbl && Ext.isString(text)) lbl.setText(text);
    },
    dismiss: function(beforeDismiss,afterDismiss,scope)
    {
        var component = this;
        
        component.el.animate({
            duration: component.config.closingTime,
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
                    if(typeof beforeDismiss === "function" && scope) beforeDismiss.call(scope);
                    //component.toggleMaximize();
                    //component.center();
                    //component.close();
                    if(typeof afterDismiss === "function" && scope) 
                    {
                        afterDismiss.call(scope);
                    }
                    
                }
            }
        });
        
    },
    _setClosingTime: function()
    {
        return 500;
    },
    _setTextSize: function()
    {
        return 25; 
    },
    _setTextColor: function()
    {
        return "white";
    },
    _setFontFamily: function()
    {
        return "helvetica,arial,verdana,sans-serif";   
    },
    _setBckColor: function()
    {
        return CloudCommon.getColor();  
    },
    _setPreloaderImgSrc: function()
    {
        return "data:image/gif;base64,R0lGODlh3AAUAIAAAP///+7u7iH/C05FVFNDQVBFMi4wAwEAAAAh+QQJBAABACwAAAAA3AAUAAACR4"+
            "yPqcvtD6OctNqLs968+w+G4kiW5omm6sq27gvH8kzX9o3n+s73/g8MCofEovGITCqXzKbzCY1Kp9Sq9YrNarfcrvcLDocKACH5BA"+
            "kEAAQALAAAAADcABQAgvTy9Pz6/PT29Pz+/O7u7gAAAAAAAAAAAANwSLrc/jDKSau9OOvNu/9gKI5kaZ5oqq5s675wLGeAMNwBMO98r"+
            "wK34E3nKxqPF6BQSEQ6n0jbMhiAWq+76RLL7a60Qq94LAIHyeh0JmCuqt/wh1LbjNvhc+Z9HwewcXV8goOEhYaHiImKi4yNjo9xCQAh+QQ"+
            "JBAAEACwAAAAA3AAUAIL08vT8+vz09vT8/vzu7u4AAAAAAAAAAAADcUi63P4wykmrvTjrzbv/YCiOZGmeaKqubOu+cCzPFiAMeADQfO+bAJwQ"+
            "t/sZj8hJcDgsJp/Q340pDESv2BiVme16Udvhd0z+hIXltNoSOFvX8DhjuXXK72p6E89fA9o5dn2DhIWGh4iJiouMjY6PkBYJACH5BAkEAAQALAAAAADcABQAgvTy9Pz6/PT29Pz+/O7u7gAAAAAAAAAAAANwSLrc/jDKSau9OOvNu/9gKI5kaZ5oqq5s675wLM80IAx4ANB875sAnBC3+xmPyElwOCwmn9DfjSkMRK/YGJWZ7XpR2+F3TP6EheW02hI4W9fwOGO5dcrvanoTz18D2jl2fYOEhYaHiImKi4yNjo94CQAh+QQJBAAEACwAAAAA3AAUAIL08vT8+vz09vT8/vzu7u4AAAAAAAAAAAADcUi63P4wykmrvTjrzbv/YCiOZGmeaKqubOu+cCzPNAcIQx4Ade//IkBumOMBj8jkQ0gkGpXQaA3XHAak2Kyr2tR6vyUuEUwuc8RDs3o9CaCv7LicwOQ+5/hy3ZnvmwFuOnd+hIWGh4iJiouMjY6PkC4JACH5BAkEAAQALAAAAADcABQAgvTy9Pz6/PT29Pz+/O7u7gAAAAAAAAAAAANxSLrc/jDKSau9OOvNu/9gKI5kaZ5oqq5s675wLM+0CQhDHgB17/8iQG6Y4wGPyORDSCQaldBoDdccBqTYrKva1Hq/JS4RTC5zxEOzej0JoK/suJzA5D7n+HLdme+bAW46d36EhYaHiImKi4yNjo+QJAkAIfkECQQABAAsAAAAANwAFACC9PL0/Pr89Pb0/P787u7uAAAAAAAAAAAAA5BIutz+MMpJq7046827/2AojmRpnmiqrmzrvnAsK4Aw3AEw7159DzmesAH4GXXD5KRovCGVM2bTCa0ypNOn1WWb4rbWrjcAfnmNZej5l26tb+3kexBfzevCOx4VWJP3M31nf4AlWE1ahS6HR4omjAOJji2QkpMgAIJAlpcrmT9BnaKjpKWmp6ipqqusra6vQgkAIfkECQQABAAsAAAAANwAFACC9PL0/Pr89Pb0/P787u7uAAAAAAAAAAAAA45Iutz+MMpJq7046827/2AojmRpnmiqrmzrvnAsy4Aw3AEwj/U95LugEOAr6oQdYvF2RDpZyiXzmYlKm9QsySbFaS3cbuBLDnWL5cnZl25v1jc3BD6Q2yv0eyOv7zsCa2N+BIBngoODVktYeopGiJCOA4x9kpSQjYU/l5WaQJigoaKjpKWmp6ipqqusrUEJACH5BAkEAAQALAAAAADcABQAgvTy9Pz6/PT29Pz+/O7u7gAAAAAAAAAAAAOOSLrc/jDKSau9OOvNu/9gKI5kaZ5oqq5s675wLM8lIAx4AMQ2Pui0oLDmK+5cgKLvOGw6MUnlshWVDpjPrLZxs/5aXWtgSyZ7fa0zrsx+qgdpdXsufMfP9LwscB6z+F5+eoMsVVJYKYZKiISNJoo4jIlWko6WIgCAP5WJmkCXoKGio6SlpqeoqaqrrK10CQAh+QQJBAAEACwAAAAA3AAUAIL08vT8+vz09vT8/vzu7u4AAAAAAAAAAAADkUi63P4wykmrvTjrzbv/YCiOZGmeaKqubOu+cCzPdAMIQx4A3p0Pu5pwWAP8jryN8ZhLEp9Q1JLZ1Eypzqh228FRdRrvN8Atmy/foyb9O7vfDnZuLYfb3/IBnX3vlwNsZBmAaYJ+h09XTFkWikiIkESOA4wXk5WRmTAAhECYlp1BmqOkpaanqKmqq6ytrq+wFQkAIfkECQQABAAsAAAAANwAFACC9PL0/Pr89Pb0/P787u7uAAAAAAAAAAAAA5JIutz+MMpJq7046827/2AojmRpnmiqrmzrvnAsz/QFCEMeANWdD7uacEh0AH5InuSIzCmL0KiL2XRGqNWndMsd4aq6yBcc6JrPHTAyov6h33BKO8eex+/4xXxQb+f/cAFtZRCCaoSAiVxYTVoNjEmKkluQA45GYJeTmzUAhkCaRp9BnKWmp6ipqqusra6vsLGKCQAh+QQJBAAEACwAAAAA3AAUAIL08vT8+vz09vT8/vzu7u4AAAAAAAAAAAADrUi63P4wykmrvTjrzbv/YCiOZGmeaKqubOu+cEwCwmAHgKyHtD3gld4ttzMBfEhicXk5Im1KiPMZZXqmz0HVymVgqZFvsuupZW/k9MJ8DkTYWbdac0bO03VfJG+7Z/gDfl2Ae3yCF4SHTIkPjIoSAXlyjzuRdZMOlm2UE2I+W5wunlBheaChC56nqCyqnWerrAQAmkCyOrQ+tp21sbe/wMHCw8TFxsfIycrLzEwJACH5BAkEAAQALAAAAADcABQAgvTy9Pz6/PT29Pz+/O7u7gAAAAAAAAAAAAOqSLrc/jDKSau9OOvNu/9gKI5kaZ5oqq5s675wLIuAMNwBMJP1PeSVHk63K4IAviTR2EEmb0uI8xllWoNP5VUzzVYZXep2LLFlceSL+RyIrLPttHxxTs4pdV8kf7vP+QN+EoB7fIJphIcPiYuGilsBeXGPDJF1kw6WbJRXYVqcC54+X6F5pKAxoqePqhOtqFYAmkCwYLOrtj60tby9vr/AwcLDxMXGx8jJcgkAIfkECQQABAAsAAAAANwAFACC9PL0/Pr89Pb0/P787u7uAAAAAAAAAAAAA61Iutz+MMpJq7046827/2AojmRpnmiqrmzrvnAszxUgDHgAyDY+6LVbbkcrGh8An5LoSipxTIjzGT1aec9lM+urMqZZ73W8EnIDLnMWDVE/2eT4iqt00X2RO07OT+kHdnp5gn2FJH+Bd4OKho0gAXdwK5B0kg2UZ46aHWBUW3RiCp1am6UZowOhKKiqolytprEOAJhAMbQ+thO4Q7K+v8DBwsPExcbHyMnKy8wNCQAh+QQJBAAEACwAAAAA3AAUAIL08vT8+vz09vT8/vzu7u4AAAAAAAAAAAADrUi63P4wykmrvTjrzbv/YCiOZGmeaKqubOu+cCzPKSAMeAB8Nj7olV5uRysaRQCfkrhJKnFMiPMZPVqvlOlzULVoqZHvEksuO27b3AadDkTYW7d5Tk4rN3ZfJI+j+618A3h8e4R/hzOBg3mFjIiPLwF5chmSdpQOlm2QnCxiPl1BeaEKn1CdqDVppKJbrKWrqbInAJpAHrU+txO5Q7O/wMHCw8TFxsfIycrLzHMJACH5BAkEAAQALAAAAADcABQAgvTy9Pz6/PT29Pz+/O7u7gAAAAAAAAAAAAOuSLrc/jDKSau9OOvNu/9gKI5kaZ5oqq5s675wLM8zIAx4AFg2PuiVXm5HKxpXAJ+SKEkqcUyI8xk9Wq+d6XNQbWipke8SSy5fbtucBJ0ORNhbt3lOb6SVkrsvosfV/3R9A3l9fIWAiFiChHqGjYmQRgF6chCTd5UOl22RnTV6XQxiPqEKo1CeqTCjpaJpraavqrMuAJtAQbewC7Y+uLTAwcLDxMXGx8jJysvMzSwJACH5BAkEAAQALAAAAADcABQAgvTy9Pz6/PT29Pz+/O7u7gAAAAAAAAAAAAO2SLrc/jDKSau9OOvNu/9gKI5kaZ5oqq5s675wLM80IAx4AFg2PuiVXm5HyxCLyAvAxzxGlkyc8wGNTpORwRXLXVSjWsnX+gT7tt3FL81e3MzryNsckMPj7QYuz77vs36Ad3x6A4RdfoaCcItmh2qKj0iJEpQQlo94kjQBd3URnXCfD6F0m2GbRWNNYndoBKtnm6+pLrG0CrcTurW9qqVAQcC4ucO+x8jJysvMzc7P0NHS09TVGgkAIfkECQQABAAsAAAAANwAFACC9PL0/Pr89Pb0/P787u7uAAAAAAAAAAAAA8ZIutz+MMpJq7046827/2AojmRpnmiqrmzrvnAsS4Aw3AEwk/U95JYeTkcR/oi7pALgayKVHGbz9oRIp1XH1QndbbHdzZcbGfuyCzM1HLNNfQF2xv3+SejvOAQ/1ctbdU1/F4E+EoU3EYgDg4CIjRWLh48QkpAqlpeKlJWcDpmaJgGFfqEOo4Glp6QRqHWqpiJqA2ixs7VLhbi3sSdmuLZ1wLlvw7+9KACuQMhWy8NpzxXKcNDN19jZ2tvc3d7f4OHi4+TlHQkAIfkECQQABAAsAAAAANwAFACC9PL0/Pr89Pb0/P787u7uAAAAAAAAAAAAA8ZIutz+MMpJq7046827/2AojmRpnmiqrmzrvnAsw4Aw3AEg1/eQWzycjhL0DWfIFKDHPLaWzJsTAo1OHdVmclvKWl1ebSTcuy7IUq4"+
            "aZIv2Aq622yeRu+EQexS/7mvmTC6APRKDNxGGA36LGImChoWQEI6MlROULJgPmg2clp8LAYN8K6KApA6mc6gMqnegsAxoA2Yns7UKt2ODuLGLZL0mwERzwcO+yACqPzHKb8Fny9AEzkLI19jZ2tvc3d7f4OHi4+Tl2QkAIfkECQQABAAsAAAAANwAFACC9PL0/Pr89Pb0/P787u7uAAAAAAAAAAAAA8hIutz+MMpJq7046827/2AojmRpnmiqrmzrvnAszxkgDHgAfDY+6JZebkcR/oi0pJIB8DmRmqYTB4VIp1XH9bns0rbYDZgbGfuyCzPVy37dpr7A5g3/SehwOQQ/1bf/KXVOG4I+EoU4EYgDgI0ni4SIh5IQkI6XIpYZmg+cDZ6YoRoBhX4YpIKmDqh1qgyseaKyYoVoRbUSagO2BLq8s8APZr8Tw7dwxMbByxUArEAeznHEac/UvdbM2tvc3d7f4OHi4+Tl5ufnCQAh+QQJBAAEACwAAAAA3AAUAIL08vT8+vz09vT8/vzu7u4AAAAAAAAAAAADxki63P4wykmrvTjrzbv/YCiOZGmeaKqubOu+cCzPIyAMeABYNj7ovFtuR+kNacjkBeBrEiXMJu4ZiUqpD6tTye0ytFeodFsd+7Bf89TLTgrNAcl7HI/MpfXHvZlv+19qPhKBOIOEEYQDf4suiYaBj2qIh4yVKY6TkJmSEJiWnyQBgX0OomqkDaZwEap0oK8iYGQQsmdiamgLtWuwvR61uQ3ARWbBusW+yR0AqkAVzD7ORc3GX9TK2Nna29zd3t/g4eLj5OW9CQAh+QQJBAAEACwAAAAA3AAUAIL08vT8+vz09vT8/vzu7u4AAAAAAAAAAAADyUi63P4wykmrvTjrzbv/YCiOZGmeaKqubOu+cCzPJCAMeABYNj7ovFtu1+kNacikA+BrEiXMJu4ZiUqpGKtTyaVpr1Dptir2YSvfcXfdEpYDErcYHpFL6Rh7E8/uo8pNEoA+goMDGoaHfosmiYWDj4CIhoyVI44RmBCaF5yWnxsBg3wOooCkDaZvGqpzoK8baWZhgGcMslMauAO2sL5kYr23ZcILssW0YL/LaKpAzT7PFADOyBPU0dbM29zd3t/g4eLj5OXm5+iVCQAh+QQJBAAEACwAAAAA3AAUAIL08vT8+vz09vT8/vzu7u4AAAAAAAAAAAADxUi63P4wykmrvTjrzbv/YCiOZGmeaKqubOu+cCzPJSAMeABYNj7ovFtuB+sNacgUwMckSpZMnDMCjU5X1WZyO8pan1EtNey7orxirpojJAck7fA7Eo/OV3Xmfc2/kJkSfz6BggMthYZ9ihWIhIKOf4eFi5SQZJZhmFGSj5WeDQGCew6hf6Ogoi2lbp+tCmhlYH9mDLBSLbYDtK6KsLu1ZL8Lvi/EvK4Aq0AVyT7LFM1HRcrCx9bX2Nna29zd3t/g4eLj5A4JACH5BAkEAAQALAAAAADcABQAgvTy9Pz6/PT29Pz+/O7u7gAAAAAAAAAAAAPCSLrc/jDKSau9OOvNu/9gKI5kaZ5oqq5s675wLM8mIAx4AFg2Pui8W25HC/VwxSQD4GsSJcwm7hmJSqnKjBWZLW6vUKkzLJ52teIzTVgOSNhidwQulasr9MFdVm5K+j5/gHp7FGWFMIOEEIqCgIgTh5AtjRGVjIOTlmmaKwGAdg+ffaEOo22dopypKF9jVYBYDa4+sqmurCq0trNlvEu+uQ5fwikAp0AVxz7JFMtDxcOn0dTV1tfY2drb3N3e3+DhHAkAIfkECQQABAAsAAAAANwAFACC9PL0/Pr89Pb0/P787u7uAAAAAAAAAAAAA61Iutz+MMpJq7046827/2AojmRpnmiqrmzrvnAszycgDHgAWDY+6LxbbkcrGlUAn5IoSSpxzIjzGT1ar5zpc1BtaKnNra+LLZshQnFAkt6uI+3n+0yvL8RKCd6n3w/sgHR+fxGDfXuBiViGhX6HeIqRRgF7cw+UeJYOmGqSnjJfS2F4ZAuhY5+pL6elDKwUr6qyLACcQBW1Prewtq2zv8DBwsPExcbHyMnKy8wwCQAh+QQJBAAEACwAAAAA3AAUAIL08vT8+vz09vT8/vzu7u4AAAAAAAAAAAADq0i63P4wykmrvTjrzbv/YCiOZGmeaKqubOu+cCzPKCAMeABYNj7on15uRysaQwCfkihJKnFMjfMZPVqvk+lzUG1oqZvvEksuN27bnASdDmzYW7d5jk0rJXbfJo+j+498A3h8e4R/hzKBg3mFjIiPLgF5chCSdpQYlm2QnCtiPl0Mn1BheaGdqEhpp6KrHZ+sqbKvmkAVALWxt7mzvb6/wMHCw8TFxsfIycpzCQAh+QQJBAAEACwAAAAA3AAUAIL08vT8+vz09vT8/vzu7u4AAAAAAAAAAAADq0i63P4wykmrvTjrzbv/YCiOZGmeaKqubOu+cCzPKSAMeABYNj7osl5uRysaHQCfkihJKnHMlvMZPVpj0+eg2shSXd7ldQy7aXMS8zngUmvZ5PjqrJTQfa47Ts5H6Qd2enmCfYUjf4F3g4qGjR8Bd3AQkHSSK5RrjpocYT5cDJ1QYHefm6ZNZ6WgqTCdqqewSJhAFQCzryi2PrSxvb6/wMHCw8TFxsfIycqmCQAh+QQJBAAEACwAAAAA3AAUAIL08vT8+vz09vT8/vzu7u4AAAAAAAAAAAADqki63P4wykmrvTjrzbv/YCiOZGmeaKqubOu+cCzPKiAMeABYNj7otFEvtwsaOwCfsihJKnHM48b5jEqvzecyq4ViM1St9UtW3Lo/ybkbKFvW2rZ7jvZJ6rg5BT/Qu/l3eH6BdYNkgBGIhg6Ki0cBdXIQkGiSjguUbJdSYVVcXWOOnVubR6MDoQ2nqaKgpVcAmUAVsT6zrwy1RLi8vb6/wMHCw8TFxsfIyRsJACH5BAkEAAQALAAAAADcABQAgvTy9Pz6/PT29Pz+/O7u7gAAAAAAAAAAAAOSSLrc/jDKSau9OOvNu/9gKI5kaZ5oqq5s675wLM8rIAx4AFg2Pui0oHAYAfiOu4nxiEsSn1DYktmUTKnOqHZbulFzEu83wC2bP9+jJO07u98WNm4th9vvDfmAzsb77QFsZBGBaYN/iGVXTFkOi0iJkVyPA40PlJaSmkIAhT+Zl55Am6SlpqeoqaqrrK2ur7CxHAkAIfkECQQABAAsAAAAANwAFACC9PL0/Pr89Pb0/P787u7uAAAAAAAAAAAAA5BIutz+MMpJq7046827/2AojmRpnmiqrmzrvnAszywgDHgAfDY"+
            "+6LSgcAjwGXecohGHHDqfKuWSuZFOm9Cs9nOb5jZdb2BLLme8xg3aZ267IWucOv6u1+OD+drONwfWYxp" +
            "/aIF9hlBWS1gXiUeHj0+NA4sYkpSQmDEAgz+XlZxAmaKjpKWmp6ipqqusra6vMAkAIfkECQQABAAsAAAAANwAF"+
            "ACC9PL0/Pr89Pb0/P787u7uAAAAAAAAAAAAA41Iutz+MMpJq7046827/2AojmRpnmiqrmzrvnAszy0gDHgAyDY+6L"+
            "SgkATwGXevohGHHDqfF+WS6ZJOm9CslnGb5lxdb2BL3nqNrrOvzH6qcel3ex58D+Jquj4WUI9bfWd/e4QrVktYKodHhY2K"+
            "XomGkI6UKACBP5Eslz5AlZ+goaKjpKWmp6ipqqusUAkAIfkECQQABAAsAAAAANwAFACC9PL0/Pr89Pb0/P787u7uAAAAAAA"+
            "AAAAAA49Iutz+MMpJq7046827/2AojmRpnmiqrmzrvnAszy4gDHgA0KONDzqecAb4GXfDTtGIQyafqSWzCc1Ip86qNnSb5raW"+
            "rjcALnu8RvME/VO7MWzcGxIfzO+SOr6h3/sXAWxkfwSBaIOEe1dMWYpsjYlzi1SRkwOQkZKGQJh+AJtBmaKjpKWmp6ipqqusra6"+
            "lCQAh+QQJBAAEACwAAAAA3AAUAIL08vT8+vz09vT8/vzu7u4AAAAAAAAAAAADcEi63P4wykmrvTjrzbv/YCiOZGmeaKqubOu+cCz"+
            "PLyAMeADQfO+bAJwQt/sZj8hJcDgsJp/Q340pDESv2BiVme16Udvhd0z+hIXltNoSOFvX8DhjuXXK72p6E89fA9o5dn2DhIWGh4iJ"+
            "iouMjY6PhQkAIfkECQQABAAsAAAAANwAFACC9PL0/Pr89Pb0/P787u7uAAAAAAAAAAAAA3FIutz+MMpJq7046827/2AojmRpnmiqrmz"+
            "rvnAsz3QDCEMeAHXv/yJAbpjjAY/I5ENIJBqV0GgN1xwGpNisq9rUer8lLhFMLnPEQ7N6PQmgr+y4nMDkPuf4ct2Z75sBbjp3foSFhoeI"+
            "iYqLjI2Oj5BKCQAh+QQJBAAEACwAAAAA3AAUAIL08vT8+vz09vT8/vzu7u4AAAAAAAAAAAADcUi63P4wykmrvTjrzbv/YCiOZGmeaKqub"+
            "Ou+cCzPdAgIQx4Ade//IkBumOMBj8jkQ0gkGpXQaA3XHAak2Kyr2tR6vyUuEUwuc8RDs3o9CaCv7LicwOQ+5/hy3ZnvmwFuOnd+hIWGh4iJiouMjY6PkCkJACH5BAkEAAQALAAAAADcABQAgvTy9Pz6/PT29Pz+/O7u7gAAAAAAAAAAAANxSLrc/jDKSau9OOvNu/9gKI5kaZ5oqq5s675wLM90LQHCoAeA7f9AD0BH1PWCyKRyMSwWj8uoVJZzEgPTrHZldW6/YFG3GC6bM2Piec2GBNLYtrzd7ELn+HL9me+bAW87d36EhYaHiImKi4yNjo+QCwkAIfkECQQABAAsAAAAANwAFACC9PL0/Pr89Pb0/P787u7uAAAAAAAAAAAAA3BIutz+MMpJq7046827/2AojmRpnmiqrmzrvnAsz3RtM4Aw7AFw/8CgBrAr7nzCpFJJNBqRy6hUpnMWA9OsdmV1br9gUdcYLpsz4+J5zYYE0ti2vN3sQuf4cv2Z75sBbzx3foSFhoeIiYqLjI2Oj0IJADs=";     
    }
});


