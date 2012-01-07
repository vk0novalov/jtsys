/**
 * JavascriptTemplatingSystem ^___^
 *  (special for http://dailygui.de)
 *
 *  2011 (c) virpool
 */

if (typeof jQuery === "undefined") {
    
    throw "jQuery required";
    
}

(function ( window, $, undefined ) {

    "use strict";

    var Jtsys = function ( options ) {
        // todo: implementation of strict mode, some parameters etc.
        this.defaultOpts = {
            pathToViews : '/views/',
            cacheable : false,
            cacheTimeoutMinutes : 5, 
            isStrictMode: false
        };
        
        $.extend(this.defaultOpts, options);
        
        this.cache = {};
    };

    Jtsys.prototype = {
        
        processView: function ( viewName, collection, callback ) {
            var templateHtml;

            if (typeof viewName !== "string") {
                throw {
                    message: "fail"
                };
            }
            
            if ( collection.constructor != Array ) {
                collection = [collection];
            }
            
            var path = this.defaultOpts.pathToViews + viewName;
            
            if (!this.defaultOpts.cacheable || !!!this.cache[path]) {
                this.getView(path, collection,
                             this.getViewCallback, callback);
            } else {
                
                callback( this.cache[path] );
                
            }
        },

        process: function ( tmpl, collection, filters ) {
            var templateHtml, templateScript;

            if (typeof tmpl !== "string") {
                throw {
                    message: "fail"
                };
            }

            if ( collection.constructor != Array ) {
                collection = [collection];
            }

            templateScript = document.getElementById( tmpl );
            if ( !!!templateScript ) {
                throw {
                    message: "fail"
                };
            }

            templateHtml = this.trim( templateScript.innerHTML );
            
            return this.templateHandle( templateHtml, collection, filters );
        },
        
        templateHandle: function ( templateHtml, collection, filters ) {
            
            var resultHtml = [],
                has = Object.prototype.hasOwnProperty,
                i, j, collectionLength, filterName, path, pathLength,
                _template, object, propValue;
            
            for ( i = 0, collectionLength = collection.length; i < collectionLength; i++ ) {
                _template = templateHtml;
                object = collection[i];

                // apply simple binding

                _template = _template.replace( new RegExp( "#([\\w.]+)#", "gi" ), function (full, goal) {
                    if ( goal ) {
                        path = goal.split('.');
                        propValue = object;
                        for ( j = 0, pathLength = path.length; j < pathLength; j++ ) {
                            propValue = propValue[ path[j] ];
                            if ( propValue === undefined && this.defaultOpts.isStrictMode ) {
                                throw {
                                    message: "fail"
                                };
				continue;
                            }
                        }
                        return propValue;
                    }
                    return full;
                });

                // apply filters: {{filter}}
                if ( !!filters ) {
                    for ( filterName in filters ) {
                        if ( has.call( filters, filterName ) && filterName !== undefined ) {
                            _template = _template.replace( new RegExp( "{{" + filterName + "}}", "gi" ), filters[filterName].call( object ) );
                        }
                    }
                }

                // apply dynamic method bindings: @method@
                _template = _template.replace(new RegExp("@([\\w]+)@", "gi"), function (full, goal) {
                    if ( goal ) {
                        return object[ goal ]();
                    }
                    return full;
                });

                resultHtml.push( _template );
            }

            return resultHtml.join( '' );
            
        },
        
        getViewCallback : function ( tmpl, collection, callback, path ) {
                
            var result = this.templateHandle(this.trim( tmpl ), collection);
            
            if (this.defaultOpts.cacheable) {
                
                this.cache[path] = result;
                
            }
            
            callback( result );
                
        },
        
        getView: function ( path, collection, callback, callbackResult ) {
            
            $.get( path + "?" + Math.random(), $.proxy(function (result) {
                
                callback.call( this, result, collection, callbackResult, path );
                
            }, this ), "text" );
            
        },

        trim: function ( inStr ) {
            return inStr.replace( /(^\s+)|(\s+$)/g, "" );
        }
    };

    window.Jtsys = Jtsys;
    
}) ( window, jQuery );