/**
 * Initializing.
 */
(function (_win) {
    /*
     * Debug Flag
     */
    var __DEBUG__ = true;

    var jStrict = function () {
    };

    /**
     * Utility package
     * @since 1.0
     * @added 2015-09-22
     */
    var utilPkg = (function (jStrictPkg) {

        var extractFunctionBody = function () {
            return this.toString().match(/{([\w\W]*)}$/)[1];
        };

        if(!jStrictPkg.util) {
            jStrictPkg.util = {
                extractFunctionBody: extractFunctionBody
            }
        }
    }(jStrict));


    /**
     * Log utility class. <br />
     * @since 0.1
     * @added 2015-05-26
     */
    {
        var logClass = function () {
        };
        logClass.putLog = function (_tag, _text) {
            console.log("[" + _tag + "] : " + _text);
        };
        logClass.d = function (_tag, _text) {
            if (__DEBUG__) {
                this.putLog(_tag, _text);
            }
        }.bind(logClass);

        logClass.i = function (_tag, _text) {
            this.putLog(_tag, _text);
        }.bind(logClass);

        jStrict.util.log = function () {
        };
        var Log = jStrict.util.log.Log = logClass;
    }


    /**
     * #Utility.
     * To merge object.
     * Fore given object will override all members.
     * @param _objSuper
     */
    jStrict.merge = function (_objSuper, _objChild) {
        var proxy = j$.clone(_objSuper);
        for (var i = 1; i < arguments.length; i++) {
            var arrChildProperties = Object.getOwnPropertyNames(arguments[i]);

            for (var j in arrChildProperties) {
                proxy[arrChildProperties[j]] = arguments[i][arrChildProperties[j]];
            }
        }
        return proxy;
    };

    /**
     * Clone object.
     * @param _obj
     * @returns
     */
    jStrict.clone = function (_obj) {
        if (!(_obj instanceof Object)) {
            return _obj;
        }

        var arrProps = Object.getOwnPropertyNames(_obj);
        var proxy =
        {};

        for (var i in arrProps) {
            if (_obj[arrProps[i]] instanceof Function || !(_obj[arrProps[i]] instanceof Object)) {
                proxy[arrProps[i]] = _obj[arrProps[i]];
            } else
                proxy[arrProps[i]] = clone(_obj[arrProps[i]]);
        }

        return proxy;
    };

    _win.j$ = _win.jStrict = jStrict;

    /**
     * Clone utility
     *
     * @since 0.1
     * @added 2014-05-09
     * @param obj Object to be cloned.
     * @returns
     */
    var clone = jStrict.util.clone = function cloneInstance(obj) {
        if (!(obj instanceof Object)) {
            return obj;
        }

        var arrProps = Object.getOwnPropertyNames(obj);
        var clone = {};

        for (var i in arrProps) {
            if (obj[arrProps[i]] instanceof Function || !(obj[arrProps[i]] instanceof Object)) {
                clone[arrProps[i]] = obj[arrProps[i]];
            } else
                clone[arrProps[i]] = clone(obj[arrProps[i]]);
        }

        return clone;
    };

    var// Regular expression set to detect member constructor, field, method
        /**
         * Regexp for extracting member
         *
         * @since 0.1
         * @added 2013-12-13
         */
        rxMember = /^((?:(?:public|protected|private|static|final)\s+)*)([_a-zA-Z][_a-zA-Z0-9]*)\s+([_a-zA-Z][_a-zA-Z0-9]*)\s*$/,

        /**
         * Regexp for extracting constructor
         *
         * @since 0.1
         * @added 2014-03-11 This can recognize first match, namespace and split
         *        each keyword into array.
         */
        rxConstructor = null,

        /**
         * Regexp for extracting methods This return : ["keywords", "method name",
         * "arguments"]
         *
         * @since 0.1
         * @added 2013-12-13
         * @modif 2014-04-15
         */
        rxMethod = /^((?:(?:public|protected|private|static|final)\s+)*)([_a-zA-Z][_a-zA-Z0-9]*)\s+([_a-zA-Z][_a-zA-Z0-9]*)\s*\(([_a-zA-Z][_a-zA-Z0-9]*(?:\.[_a-zA-Z][_a-zA-Z0-9]*)*\s*[_a-zA-Z][_a-zA-Z0-9]*\s*(?:,\s*[_a-zA-Z][_a-zA-Z0-9]*(?:\.[_a-zA-Z][_a-zA-Z0-9]*)*\s*[_a-zA-Z][_a-zA-Z0-9]*)*\s*)?\)$/,

        /**
         * Class to extend
         *
         * @since 0.1
         * @created 2015-06-15
         * @type {Function}
         */
        extendedClass = null;


    /**
     * Generic class manufacturing function
     *
     * @desc Class
     * @param opt
     * @since 0.1
     * @created 2013-11-25
     */
    var classBuilder = function (opt) {

        var
            /**
             * Class proxy object
             *
             * @since 0.1
             * @added 2013-12-10
             */
            clazz = null,

            /**
             * Class name
             *
             * @since 0.1
             * @added 2014-02-17
             */
            strClassName = null,

            /**
             * User defined object in JStrict grammar.
             *
             * @since 0.1
             * @added 2014-01-28
             */
            objClassDefiner = null,

            /**
             * Constructor container which contains parsed constructor function
             * [{ :
             *  	Index means count of constructor's arguments
             * 		.scope : Scope of constructor function
	         * 		.type : (Array)
             * 		.name : (Array)
             * 		.value : Function body
             * }]
             * @since 0.1
             * @added 2014-03-17
             */
            objConstructorContainer = new Array(),

            /**
             * Temporary dynamic container for parsed properties. This object contains
             * dynamic properties when parse objClassDefiner. Target class will be gain instance
             * data from this container by each scope.
             *
             * @since 0.1
             * @added 2014-02-14
             * @modif 2014-04-22 Separate 3 parts by scope.
             */
            objMemberContainer =
            {
                /**
                 * Public member field and method container.
                 */
                'public': {},

                /**
                 * Protected member field and method container.
                 */
                'protected': {},

                /**
                 * Default member field and method container. (Reserved)
                 */
                'default': {},

                /**
                 * Private member field and method container.
                 */
                'private': {}
            },

            /**
             * Properties name array of given object.
             *
             * @since 0.1
             * @added 2013-12-13
             */
            aryProtoPropertiesName = null;

        // Parse properties.
        switch (arguments.length) {

        /**
         * Do nothing with zero length arguments.
         */
            case 0:
            {
                break;
            }

        /**
         * Class(objClassDefiner:Object)
         *
         * @since 0.1
         * @created 2013-12-06
         */
            case 1:
            {
                break;
            } // End of Class(properties)

        /**
         * Class(_strName:String, _objDeclare:Object)
         *
         * @param _strName :
         *            Name of class declaration
         * @param _objDeclare :
         *            Object contains declared members and methods
         * @since 0.1
         * @created 2014-01-14
         */
            case 2:
            {
                strClassName = arguments[0];

                // Constructor regular expression define.
                rxConstructor = new RegExp(
                    "^(public|protected|private)\\s"
                    + strClassName
                    + "\\(((?:(?:(?:[a-zA-Z][_a-zA-Z0-9]*)(?:\\.[a-zA-Z][_a-zA-Z0-9]*)*)\\s(?:[_a-zA-Z][_a-zA-Z0-9]*))(?:,\\s(?:(?:(?:[a-zA-Z][_a-zA-Z0-9]*)(?:\\.[a-zA-Z][_a-zA-Z0-9]*)*)\\s(?:[_a-zA-Z][_a-zA-Z0-9]*)))*)?\\)$");

                objClassDefiner = arguments[1];

                aryProtoPropertiesName = Object.getOwnPropertyNames(objClassDefiner);


                (function parseProperties() {
                    // Parse given properties.
                    for (var i in aryProtoPropertiesName) {
                        /*
                         * Original Properties
                         */
                        var strDeclaredName = aryProtoPropertiesName[i];

                        Log.d("Declared member string", strDeclaredName);

                        /*
                         * Contains keyword such as 'public, private' etc.
                         */
                        var tknKeywords = null;

                        /*
                         * Contains parameter if it is method.
                         */
                        var tknParams = null;

                        // Give member is a constructor
                        if (tknKeywords = rxConstructor.exec(strDeclaredName)) {
                            console.log("Constructor found" + tknKeywords);
                            // TODO Process constructors

                            tknKeywords.shift(); // Remove first match(Original full name)

                            // Recognize scope
                            var scope = tknKeywords.shift();

                            var tknConArgs = new Array();

                            if (tknKeywords[0])
                                tknConArgs = tknKeywords[0].replace(",", "").split(" ");

                            var iArgCount = tknConArgs.length / 2;

                            // Verify matching of type and name
                            if (tknConArgs.length % 2 != 0) {
                                // TODO Throw parameter error;
                                if (__DEBUG__) {
                                    console.error("Constructor Parameter unmatch Error");
                                    return;
                                }
                            }

                            var objConstructor =
                            {
                                scope: scope,
                                type: new Array(),
                                args: new Array()
                            };

                            if (tknConArgs.length >= 2) {
                                for (var iTkn = 0; iTkn <= iArgCount; iTkn += 2) {
                                    objConstructor.type.push(tknConArgs[iTkn]);
                                    objConstructor.args.push(tknConArgs[iTkn + 1]);
                                }
                            }

                            // Refine constructor function.
                            objConstructor.value = objConstructor.args.length > 0 ?
                                new Function(objConstructor.args, strClassName, extractFunctionBody.call(objClassDefiner[strDeclaredName]))
                                : new Function(strClassName, extractFunctionBody.call(objClassDefiner[strDeclaredName]));

                            // Prepare constructor array
                            if (objConstructorContainer[iArgCount] === undefined)
                                objConstructorContainer[iArgCount] = new Array();

                            objConstructorContainer[tknConArgs.length / 2].push(objConstructor);
                            continue;
                        }

                        /********************************************************************************/
                        /*                                                                              */
                        /* If given field declare Method.
                         /*                                                                              */
                        /*                                                                              */
                        /********************************************************************************/
                        else if (tknParams = rxMethod.exec(strDeclaredName)) {

                            // Print parameters
                            Log.d("Parse Method", tknParams);

                            var strDeclaration = tknParams.shift(); // Original declaration
                            // string.
                            var strKeywords = tknParams.shift(); // Keyword string set.
                            var tknKeywords = strKeywords.split(' '); // Keyword token
                            // set.

                            var strReturnType = tknParams.shift(); // Return type
                            // declaration.

                            var strMethodName = tknParams.shift(); // Method name string.

                            var strArguments = tknParams.shift(); // Arguments string.
                            var tknArguments = null;
                            if (strArguments)
                                tknArguments = strArguments.split(" ,"); // Arguments
                            // token set.

                            var
                                /**
                                 * String for method scope
                                 *
                                 * @since 0.1
                                 * @added 2014-02-06
                                 */
                                strScope = null,

                                /**
                                 * Flag for final
                                 *
                                 * @since 0.1
                                 * @added 2014-02-06
                                 */
                                fFinal = null,

                                /**
                                 * Flag for static
                                 *
                                 * @since 0.1
                                 * @added 2014-02-06
                                 */
                                fStatic = null;

                            // Parse keyword of method declaration
                            for (var iKey in tknKeywords) {
                                switch (tknKeywords[iKey]) {
                                    case 'public':
                                    case 'protected':
                                    case 'private':
                                    {
                                        if (strScope == null) {
                                            strScope = tknKeywords[iKey];
                                        } else {
                                            // Throw exception for duplication of scope
                                            // declaration
                                            console.error("Scope declaration duplicated error" + tknKeywords[iKey]);
                                            return null;
                                        }
                                        break;
                                    }

                                    case 'static':
                                    {
                                        if (fStatic == null)
                                            fStatic = true;
                                        else {
                                            // Throw exception for duplication of static
                                            // declaration.
                                            console.error("Static declaration duplicated error" + tknKeywords[iKey]);
                                            return null;
                                        }
                                        break;
                                    }

                                    case 'final':
                                    {
                                        if (fFinal == null)
                                            fFinal = null;

                                        else {
                                            // Throw exception for duplication of final
                                            // declaration.
                                            console.error("Final declaration duplicated error" + tknKeywords[iKey]);
                                            return null;
                                        }
                                    }

                                    default:
                                    {
                                        fStatic = fStatic || false;
                                        fFinal = fFinal || false;
                                        break;
                                    }
                                } // End of switching keywords
                            } // End of parsing keywords

                            // Parsing parameters
                            var arrTypes = new Array();
                            var arrNames = new Array();
                            if (tknArguments) {
                                for (var iPrm in tknArguments) {
                                    var strParam = tknArguments[iPrm].trim().split(' ');
                                    arrTypes.push(strParam[0]);
                                    arrNames.push(strParam[1]);
                                }
                                // End of parsing parameters
                            }

                            // Insert method
                            objMemberContainer[strScope][strMethodName] =
                            {
                                static: fStatic || false,
                                final: fFinal || false,
                                value: objClassDefiner[strDeclaredName],
                                types: arrTypes,
                                names: arrNames,
                                result: strReturnType
                            };// End of method inserting

                            continue;
                        } // End of processing methods

                        // Given member is a Member
                        else if (tknParams = rxMember.exec(strDeclaredName)) {
                            Log.d("Parse Member", strDeclaredName);

                            // Split to tokens
                            tknKeywords = strDeclaredName.split(" ");

                            var
                                /**
                                 * Flag for final or not
                                 *
                                 * @since 0.1
                                 * @added 2014-01-28
                                 */
                                fFinal = false,

                                /**
                                 * Flag for static or not
                                 *
                                 * @since 0.1
                                 * @added 2014-01-28
                                 */
                                fStatic = false,

                                /**
                                 * String of scope
                                 */
                                strScope = null,

                                /**
                                 * Property type string
                                 *
                                 * @since 0.1
                                 * @added 2014-01-28
                                 */
                                strType = null,

                                /**
                                 * Property name string
                                 *
                                 * @since 0.1
                                 * @added 2014-01-28
                                 */
                                strName = null;

                            // Parse keyword
                            for (var iKey in tknKeywords) {
                                /*
                                 * Keyword
                                 */
                                var strKeywordToken = tknKeywords[iKey];

                                switch (strKeywordToken) {
                                    case 'public':
                                    case 'private':
                                    case 'protected':
                                    {
                                        // If scope already defined
                                        if (strScope != null) {
                                            throw new Error("Scope keyword duplicated exception");
                                        } else {
                                            strScope = strKeywordToken;
                                        }
                                        break;
                                    } // End of scope keyword

                                    case 'final':
                                    {
                                        if (fFinal) {
                                            throw new Error("Final keyword duplicated exception");
                                        } else {
                                            fFinal = true;
                                        }
                                        break;
                                    } // End of final keyword

                                    case 'static':
                                    {
                                        if (fStatic) {
                                            throw new Error("Static keyword duplicated exception");
                                        } else {
                                            fStatic = true;
                                        }
                                        break;
                                    } // End of static keyword

                                    default:
                                    {
                                        strScope = strScope || 'default';

                                        if (strType == null) {
                                            strType = strKeywordToken;
                                            continue;
                                        }

                                        if (strName == null) {
                                            strName = strKeywordToken;
                                            continue;
                                        }

                                        // TODO Throwing unnecessary keyword exception
                                        throw new Error("Unnecessary keyword exception");
                                        break;
                                    } // End of other keyword
                                } // End of switching keyword
                            }// End of keyword parsing.

                            /* Property injection */
                            objMemberContainer[strScope][strName] =
                            {
                                static: fStatic || false,
                                final: fFinal || false,
                                value: objClassDefiner[strDeclaredName]
                            };
                            // End of property injection
                            continue;
                        } // End of Member parsing.

                        else {
                            // TODO Throw parse declaration failure exception
                            console.error("Can't parse declared string : " + strDeclaredName);
                            return null;
                        }
                    }
                })();	// End of parsing properties.

                /**
                 * Alternative of prototype of member method. <br />
                 * λ©€λ² λ©μ?? prototype? ?΄ κ°μΌλ‘? λ³?κ²½ν΄ μ€??€. <br />
                 * ?€λ₯? κ³³μ? ? ?©?κ²? ?¬?©?  κ°μ’ ??λ₯? κ°?μ§?κ³? ??€. <br />
                 */
                var objFunctionPrototypeOrigin = {

                    /**
                     * Hidden field
                     */
                    '': {

                        /**
                         * This field will be filled as instance when created. <br />
                         * ?΄ Origin ??? ?Έ?€?΄?€κ°? ??±?  ? κ·? instanceλ₯? ?£?΄μ€??€. <br />
                         * ?΄ ??λ₯? ?΅?΄ κ°? method?€?? ?? ? ?ΈμΆν method? ?? ?λ₯? ? ? ??€. <br />
                         */
                        origin: null
                    }
                };


                /* #Build proxy Class */
                var

                    /**
                     * Public static member container
                     *
                     * @since 0.1
                     * @added 2014-02-17
                     * @modif 2014-04-22 Directly put members into container
                     */
                    funcStaticPublicContainer = function () {
                        for (var iPub in objMemberContainer["public"]) {
                            if (objMemberContainer["public"][iPub].static) {
                                if (typeof objMemberContainer["public"][iPub].value == 'function') {
                                    this[iPub] = (function (idx) {
                                        return function () {
                                            // TODO Verify arguments.

                                            // Static container injection
                                            eval('var ' + strClassName + ' = objStaticContainer');

                                            // TODO Execute function.
                                            var result = objMemberContainer["public"][idx].value();

                                            // TODO Handle result.
                                            return result;
                                        };
                                    })(iPub);
                                } else
                                    this[iPub] = objMemberContainer["public"][iPub].value;
                            } else
                                continue;
                        }
                    },

                    /**
                     * Protected static member container
                     *
                     * @since 0.1
                     * @added 2014-02-17
                     */
                    funcStaticProtectedConstructor = function () {
                        for (var iPro in objMemberContainer["protected"]) {
                            if (objMemberContainer["protected"][iPro].static) {
                                if (typeof objMemberContainer["protected"][iPro].value == 'function') {
                                    this[iPro] = (function (idx) {
                                        return function () {
                                            // TODO Verify arguments.

                                            // Static container injection
                                            eval('var ' + strClassName + ' = objStaticContainer');

                                            // TODO Execute function.
                                            var result = objMemberContainer["protected"][idx].value();

                                            // TODO Handle result.
                                            return result;
                                        };
                                    })(iPro);
                                } else
                                    this[iPro] = objMemberContainer["protected"][iPro].value;
                            } else
                                continue;
                        }
                    },

                    /**
                     * Private static member container
                     *
                     * @since 0.1
                     * @added 2014-02-17
                     */
                    funcStaticPrivateContainer = function () {
                        for (var iPri in objMemberContainer["private"]) {
                            if (objMemberContainer["private"][iPri].static) {
                                if (typeof objMemberContainer["private"][iPri].value == 'function') {
                                    this[iPri] = (function (idx) {
                                        return function () {
                                            // TODO Verify arguments.

                                            // Static container injection
                                            eval('var ' + strClassName + ' = objStaticContainer');

                                            // TODO Execute function.
                                            var result = objMemberContainer["private"][idx].value();

                                            // TODO Handle result.
                                            return result;
                                        };
                                    })(iPri);
                                } else
                                    this[iPri] = objMemberContainer["private"][iPri].value;
                            } else
                                continue;
                        }
                    };

                funcStaticProtectedConstructor.prototype = new funcStaticPublicContainer();
                funcStaticProtectedConstructor.prototype.constructor = funcStaticProtectedConstructor;
                funcStaticPrivateContainer.prototype = new funcStaticProtectedConstructor();
                funcStaticPrivateContainer.prototype.constructor = funcStaticProtectedConstructor;

                /**
                 * Static member prototype chain container instance.
                 *
                 * @since 0.1
                 * @added 2014-02-17
                 */
                var objStaticContainer = new funcStaticPrivateContainer();

                var

                    /**
                     * Public Member container
                     *
                     * @since 0.1
                     * @added 2014/02/11
                     */
                    funcDynamicPublicContainer = function () {
                        for (var iNt in objMemberContainer["public"]) {
                            if (!objMemberContainer["public"][iNt].static) {
                                if (typeof objMemberContainer["public"][iNt].value == 'function') {
                                    this[iNt] = (function (idx) {
                                        // Redefine function to inject Static container into closure scope
                                        var funcExec = null;
                                        if (objMemberContainer["public"][iNt].names.length > 0)
                                            funcExec = new Function(objMemberContainer["public"][iNt].names, strClassName, extractFunctionBody.call(objMemberContainer["public"][iNt].value));
                                        else
                                            funcExec = new Function(strClassName, extractFunctionBody.call(objMemberContainer["public"][iNt].value));

                                        var proxyFunction = function () {
                                            // TODO Verify arguments.

                                            var argsArray = Array.prototype.slice.call(arguments);

                                            if (objMemberContainer["public"][idx].names.length != argsArray.length)
                                                throw new Error("Arguments count not matched.");

                                            // Insert static member container to arguments
                                            argsArray[argsArray.length] = objStaticContainer;

                                            var result = funcExec.apply(this, argsArray);

                                            // TODO Handle result.

                                            return result;
                                        };

                                        // Inject function origin data.
                                        proxyFunction[''] = objFunctionPrototypeOrigin[''];

                                        return proxyFunction;
                                    })(iNt);
                                } else

                                // Object member must be cloned to be separated from original given object.
                                    this[iNt] = clone(objMemberContainer["public"][iNt].value);
                            }
                        }
                    },

                    /**
                     * Protected member container constructor.
                     *
                     * @since 0.1
                     * @added 2014/02/11
                     * @modif 2014/05/12 Change to instance creator which wrap a real
                     *        container.
                     */
                    funcDynamicProtectedConstructor = function () {
                        // this is a real container
                        var protectedContainer = function () {
                            for (var iNt in objMemberContainer["protected"]) {
                                if (objMemberContainer["protected"][iNt].static == false) {
                                    if (typeof objMemberContainer["protected"][iNt].value == 'function') {
                                        this[iNt] = (function (idx) {

                                            // Redefine function to inject Static container into closure scope
                                            var funcExec = null;
                                            if (objMemberContainer["protected"][iNt].names.length > 0)
                                                funcExec = new Function(objMemberContainer["protected"][iNt].names, strClassName, extractFunctionBody.call(objMemberContainer["protected"][iNt].value));
                                            else
                                                funcExec = new Function(strClassName, extractFunctionBody.call(objMemberContainer["protected"][iNt].value));

                                            var proxyFunction = function () {
                                                // Check scope permission
                                                var callerInstance = null;
                                                if (arguments.callee.caller.caller != null && arguments.callee.caller.caller.hasOwnProperty('')) {
                                                    callerInstance = arguments.callee.caller.caller[''].origin;
                                                    if (!callerInstance instanceof funcDynamicProtectedConstructor) {
                                                        Log.d("Scope", "Protected method cannot be called from another class");
                                                        return null;
                                                    }
                                                }
                                                else {
                                                    Log.d("Scope", "Protected method cannot be called from public scope");
                                                    return null;
                                                }

                                                // TODO Verify arguments.
                                                var argsArray = Array.prototype.slice.call(arguments);

                                                if (objMemberContainer["protected"][idx].names.length != argsArray.length)
                                                    throw new Error("Arguments count not matched.");

                                                // Insert static member container to arguments
                                                argsArray[argsArray.length] = objStaticContainer;

                                                var result = funcExec.apply(this, argsArray);

                                                // TODO Handle result.

                                                return result;
                                            };

                                            // Inject function origin data.
                                            proxyFunction[''] = objFunctionPrototypeOrigin[''];

                                            return proxyFunction;
                                        })(iNt);
                                    } else
                                        this[iNt] = clone(objMemberContainer["protected"][iNt].value);
                                }
                            }
                            // Set toss function to delegate handling upper scope variable to upper container.
                            for (var iNt in objMemberContainer["public"]) {
                                if (objMemberContainer["public"][iNt].static == false) {
                                    if (typeof objMemberContainer["public"][iNt].value == 'function') {

                                    } else {
                                        Object.defineProperty(this, iNt, {
                                            get: function () {
                                                return Object.getPrototypeOf(this)[iNt];
                                            },
                                            set: function (newValue) {
                                                return Object.getPrototypeOf(this)[iNt] = newValue;
                                            }
                                        });
                                    }

                                }
                            }
                        };
                        protectedContainer.prototype = new funcDynamicPublicContainer();
                        protectedContainer.prototype.constructor = protectedContainer;

                        return new protectedContainer();
                    },

                    /**
                     * Private Member container
                     *
                     * @since 0.1
                     * @added 2014/02/11
                     */
                    funcDynamicPrivateConstructor = function () {
                        var privateContainer = function () {
                            for (var iNt in objMemberContainer["private"]) {
                                if (objMemberContainer["private"][iNt].static == false) {
                                    if (typeof objMemberContainer["private"][iNt].value == 'function') {
                                        this[iNt] = (function (idx) {
                                            // Static container injection
                                            // eval('var ' + strClassName + ' =
                                            // objStaticContainer');

                                            // Redefine function to inject Static container
                                            // into closure scope
                                            var funcExec = null;
                                            if (objMemberContainer["private"][iNt].names.length > 0)
                                                funcExec = new Function(objMemberContainer["private"][iNt].names, strClassName, extractFunctionBody.call(objMemberContainer["private"][iNt].value));
                                            else
                                                funcExec = new Function(strClassName, extractFunctionBody.call(objMemberContainer["private"][iNt].value));

                                            var proxyFunction = function () {
                                                // Check scope permission
                                                var callerInstance = null;
                                                if (arguments.callee.caller.caller != null && arguments.callee.caller.caller.hasOwnProperty('')) {
                                                    callerInstance = arguments.callee.caller.caller[''].origin;
                                                    if (!callerInstance instanceof funcDynamicPrivateConstructor) {
                                                        Log.d("Scope", "Private method cannot be called from another class");
                                                        return null;
                                                    }
                                                }
                                                else {
                                                    Log.d("Scope", "Private method cannot be called from public scope");
                                                    return null;
                                                }

                                                // TODO Verify arguments.
                                                var argsArray = Array.prototype.slice.call(arguments);

                                                if (objMemberContainer["private"][idx].names.length != argsArray.length)
                                                    throw new Error("Arguments count not matched.");

                                                // Insert static member container to arguments
                                                argsArray[argsArray.length] = objStaticContainer;

                                                var result = funcExec.apply(this, argsArray);

                                                // TODO Handle result.

                                                return result;
                                            };

                                            // Inject function origin data.
                                            proxyFunction[''] = objFunctionPrototypeOrigin[''];

                                            return proxyFunction;
                                        })(iNt);
                                    } else

                                    // Object member must be cloned to be separated from original given object.
                                        this[iNt] = clone(objMemberContainer["private"][iNt].value);
                                }
                            }
                            // Set toss function to delegate handling upper scope variable to upper container.
                            for (var iNt in objMemberContainer["public"]) {
                                if (objMemberContainer["public"][iNt].static == false) {
                                    if (typeof objMemberContainer["public"][iNt].value == 'function') {

                                    } else {
                                        Object.defineProperty(this, iNt, {
                                            get: function () {
                                                return Object.getPrototypeOf(this)[iNt];
                                            },
                                            set: function (newValue) {
                                                return Object.getPrototypeOf(this)[iNt] = newValue;
                                            }
                                        });
                                    }

                                }
                            }

                            // Set toss function to delegate handling upper scope variable to upper container.
                            for (var iNt in objMemberContainer["protected"]) {
                                if (objMemberContainer["protected"][iNt].static == false) {
                                    if (typeof objMemberContainer["protected"][iNt].value == 'function') {

                                    } else {
                                        Object.defineProperty(this, iNt, {
                                            get: function () {
                                                return Object.getPrototypeOf(this)[iNt];
                                            },
                                            set: function (newValue) {
                                                return Object.getPrototypeOf(this)[iNt] = newValue;
                                            }
                                        });
                                    }

                                }
                            }
                        };
                        privateContainer.prototype = funcDynamicProtectedConstructor();
                        privateContainer.prototype.constructor = privateContainer;

                        /**
                         * #Nested function Binding Class instance to all property
                         * functions.
                         *
                         * @since 0.1
                         * @added 2014-02-14
                         * @param _objDsc
                         * @param _objSrc
                         */
                        function bindProperty(_objDsc, _objSrc) {
                            var properties = Object.getOwnPropertyNames(_objDsc);

                            for (var idx in properties) {
                                // Only function except constructor
                                if (typeof _objDsc[properties[idx]] == 'function' && properties[idx] !== 'constructor') {

                                    // Preserve function origin container.
                                    var functionOrigin = _objDsc[properties[idx]][''];
                                    _objDsc[properties[idx]] = _objDsc[properties[idx]].bind(_objSrc);
                                    _objDsc[properties[idx]][''] = functionOrigin;
                                }
                            }

                            // If reached at top of scope chain.
                            if (Object.getPrototypeOf(_objDsc).constructor === Object)
                                return;

                            bindProperty(Object.getPrototypeOf(_objDsc), _objSrc);
                        }

                        var instance = new privateContainer();
                        bindProperty(instance, instance);
                        return instance;
                    };

                // Proxy clazz initialize.
                clazz = function () {
                    // Extract member with upper level than "protected" to extend.
                    if (arguments.caller == Extends) {
                        return [funcDynamicProtectedContainer()];
                    }
                    if (this instanceof Window) {
                        //
                        console.log("This method cannot be executed");
                        return;
                    }

                    var proxy = funcDynamicPrivateConstructor();

                    // Inject proxy instance to hidden field container.
                    objFunctionPrototypeOrigin[''].origin = proxy;

                    // Constructor Binding
                    if (objConstructorContainer.length > 0) {
                        var iArgsLength = arguments.length;
                        arguments[arguments.length] = objStaticContainer;

                        if (iArgsLength == 0) {
                            fConsFlag = true;
                            objConstructorContainer[iArgsLength][0].value.apply(proxy, Array.prototype.slice.call(arguments));
                            return proxy;
                        } else {
                            if (objConstructorContainer[iArgsLength]) {
                                for (var iCon in objConstructorContainer[iArgsLength]) {
                                    var fVerify = true;
                                    for (var iArg in objConstructorContainer[iArgsLength][iCon].type) {
                                        fVerify &= typeof arguments[iArg] == objConstructorContainer[iArgsLength][iCon].type[iArg];
                                    }

                                    // Right constructor found.
                                    if (fVerify) {
                                        fConsFlag = true;
                                        objConstructorContainer[iArgsLength][iCon].value.apply(proxy, arguments);
                                        return proxy;
                                    }
                                }

                                // No matched constructor found.
                                Log.d("Constructor", "There is no matched constructor");
                                return null;
                            } else {
                                // Throw no constructor exception
                                Log.d("Constructor", "There is no matched constructor");
                                return null;
                            }
                        }
                    }

                    return proxy;
                };

                // End of prototype chaining.
                window[strClassName] = clazz;
                break;
            } // End of Class(className, objProperties)

        /**
         * Class(_strClassName, _objSuper, _objProps)
         *
         * @param _strClassName :
         *            Class name string
         * @param _objSuper :
         *            Object from superclass by extends function
         *
         * @since 0.1
         * @created 2014-01-14
         */
            case 3:
            {

            } // End of Class(className, superClass, objProperties)
        } // End of arguments switch
    };

    jStrict.Class = classBuilder;

    // Class builder injection;
    if ("Class" in _win === false) {
        _win.Class = classBuilder;
    }

    /**
     * Abstract class manufacturing function
     * @param opt
     * @since 0.1
     * @created 2015-06-02
     */
    var abstractClassBuilder = function (opt) {
        switch (arguments.length) {
            case 0:
            {
                break;
            }

            case 1:
            {
                break;
            }

            case 2 :
            {
                break;
            }
            case 3:
            {
                break;
            }
        }

    };
    jStrict.AbstractClass = abstractClassBuilder;
    if ("AbstractClass" in _win === false) {
        _win.Class = classBuilder;
    }

    /**
     * Extend function to Get a protected and public member from super class.
     *
     * @since 0.1
     * @created 2014-03-18
     * @param _funcSuper
     * @returns
     */
    var Extends = jStrict.extends = function (_funcSuper) {
        if (typeof _funcSuper == "function") {
            extendedClass = _funcSuper;
        }
        else {
            throw new GrammarException();
        }
    }

})(this);
