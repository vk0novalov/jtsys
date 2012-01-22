/**
 * JavascriptTemplatingSystem ^___^
 *
 *  2012 (c) virpool
 */

(function ( window, undefined ) {

    "use strict";
    
    var types = {
        'string' : '[object String]'
    }, toS = Object.prototype.toString;
    
    function isString (obj) {
        return obj && toS.call(obj) === types.string;         
    }

    var Jtsys = function ( options ) {
        // todo: implementation of strict mode, some parameters etc.
        this.defaultOpts = {
            isStrictMode: false
        };
        
        $.extend(this.defaultOpts, options);
        
        this._result = [];
    };

    Jtsys.prototype = {
    
        constructor: Jtsys,
    
        reset: function () {
            this._result = [];  
        },
        
        append: function (html) {
            isString(html) && this._result.push(html);
        },
        
        get: function () {
            return this._result.join( '' ); 
        },

        process: function ( tmpl, collection, filters ) {
            var templateHtml, templateScript;

            if (typeof tmpl !== "string") {
                throw new Error("Template's identifier expected");
            }
            if ( collection.constructor != Array ) {
                collection = [collection];
            }

            templateScript = document.getElementById( tmpl );
            if ( !!!templateScript ) {
                throw new Error("Template expected");
            }
            templateHtml = this.trim( templateScript.innerHTML );
            
            this.templateHandle( templateHtml, collection, filters );
        },
        
        templateHandle: function ( templateHtml, collection, filters ) { 
            var has = Object.prototype.hasOwnProperty,
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
                this._result.push( _template );
            }    
        },
        
        trim: function ( inStr ) {
            return inStr.replace( /(^\s+)|(\s+$)/g, "" );
        }
    };

    window.Jtsys = Jtsys;
    
}) ( window );
