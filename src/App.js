// @ts-check

import { DataError, AppConstructorError,
        AppStartError, ComponentReloadError, AuthenticatorNotImplemented } from "./Errors";
import Authenticator from "./Authenticator";
import Component from "./Component";
import Router from "./Router"
import Element from "./customElements/Element"

class App{
    /**
     * Name of the application
     * @type {string}
     */
    name;
    /**
     * Container HTML element of the application. Valid query selector
     * @type {string} 
     */
    container;

    /**
     * Static components of the application. Object of Components
     * @type {Object.<string, Component>} 
     */
    staticComponents;

    /**
     * Components of the application
     * @type {Object.<string, Component>}
     */
    components;

    /**
     * Index page of the application.
     * @type {string}
     */
    index;

    /**
     * Data object of the application
     * @type {Object}
     */
    _data;

    /**
     * Current url query string
     * @type {string}
     */
    _queryParams;

    /**
     * Current url hash string
     * @type {string}
     */
    _hash;

    /**
     * Data mapping object of the application. Links components with their data fields.
     * @type {Object.<string, Array<Component>>}
     */
    _dataMapping = {};

    /**
     * Before start application lifecycle hook. All functions get the "this" keyword automatically assigned and pointed at the application instance.
     * @type {Object.<string, Function>}
     */
    beforeStart = {};

    /**
     * After start application lifecycle hook. All functions get the "this" keyword automatically assigned and pointed at the application instance.
     * @type {Object.<string, Function>}
     */
    afterStart = {};

    /**
     * Array of currently active components
     * @type {Array}
     */
    _activeComponents = [];

    /**
     * Oject with string-array<Component> values indicating components at a specific route path
     * @type {Object.<string, Array<Component>>}
     */
    _registeredPaths;

    /**
     * All applications paths (keys)
     * @type {Array<string>}
     */
    _registeredPathsKeys = [];

    /**
     * Router of the application
     * @type {Router}
     */
    _router;

    /**
     * Authenticator for the application
     * @type {Authenticator}
     */
    _authenticator;

    /**
     * Identifier of the application object in the DOM
     * @type {string}
     */
    _identifier = "JoltApp"

    constructor(configs){
        /**
         * Application constructor
         * @param {Object} configs
         */
        if(configs.container === undefined || configs.name === undefined){
            throw new AppConstructorError("Missing application configurations.")
        }
        try{
            this.container = configs.container;
            this.name = configs.name
            this.properties = configs.properties;
            if(configs.data !== undefined){
                this._data = configs.data
                for(let dataField in this._data){
                    this._dataMapping[dataField] = [];
                }
            }
            if(configs["beforeStart"] !== undefined){
                this.beforeStart = configs.beforeStart;
            }
            if(configs["afterStart"] !== undefined){
                this.afterStart = configs.afterStart
            }
            if(configs["authenticator"] !== undefined && configs["authenticator"] instanceof Authenticator){
                this._authenticator = configs["authenticator"];
                this._authenticator._registerApp(this)
            }

            /**
             * application container
             * @type {?HTMLElement}
             */
            const appContainer = document.querySelector(this.container);
            appContainer?.setAttribute("identifier", this._identifier);
            // @ts-ignore
            appContainer.app = this;
        }catch(e){
            throw(e);
        }
    }

    /**
     * Adds static components to app - static components don't respond to data changes (ex: menu, header, footer etc.)
     * @param {Object.<string, Component>} components Object with key-value pairs corresponding to static components
     */
    addStaticComponents(components){
        /**
         * Adds static components to the App.
         * @param  {Object} components  All static app components that don't change (banner, menu, header, footer etc.)
         */
        this.staticComponents = components
        for(let component in this.staticComponents){
            this.staticComponents[component]._registerApp(this);
        }
    }

    /**
     * Extracts all components paths including subpaths and components
     * @param {Object.<string, Object.<string, Object>>} data object with key-value pairs corresponding to routing paths
     * @param {String} currentPath current path; default = ""
     * @returns {Object.<string, Array<Component>>}
     */
    _extractPathsAndComponents(data, currentPath = "") {
        /**
         * @type {Object.<string, Array<Component>>}
         */
        const result = {};
        for (const key in data) {
            const newPath = currentPath ? `${currentPath}/${key}` : key;
            const component = data[key].component;
            const paths = data[key].paths;
            if (component !== null) {
                result[newPath] = [component];
            }
            if (paths) {
                const childResult = this._extractPathsAndComponents(paths, newPath);
                for (const childKey in childResult) {
                    result[childKey] = [component, ...childResult[childKey]].filter((comp) => comp instanceof Component);
                }
            }
        }
        return result;
    }

    /**
     * Registers the app to individual components
     * @returns {Promise<void>}
     */
    async _registerAppToComponents(){
        for(let path of Object.keys(this._registeredPaths)){
            for(let component of this._registeredPaths[path]){
                if(!component._app) await component._registerApp(this);
            }
        }
    }

    /**
    * Adds components to the App.
    * @param  {Object} components  Object with app components. If used with router the keys of the object refer to the addressess
    */
    async addPaths(components){
        this._registeredPaths = this._extractPathsAndComponents(components);
        this._registeredPathsKeys = Object.keys(this._registeredPaths);
        this._registerAppToComponents();
    }

    /**
     * 
     * @param {String} string Query parameters in string form. Can start with ? or not.
     * @returns {Object.<string, string|number>}
     */
    parseQueryParams(string){
        /**
         * @type {Object.<string, string|number>}
         */
        var queryParams = {};
        if(string.startsWith("?")) string = string.substring(1)
        string.split("&").forEach(function(item) {queryParams[item.split("=")[0]] = item.split("=")[1]})
        return queryParams
    }

    /**
     * 
     * @param {Object} queryParams 
     * @returns String form of the query parameters object with starting ?
     */
    stringifyQueryParams(queryParams){
        var array = [];
        for(let key of Object.keys(queryParams)){
            array.push(`${key}=${queryParams[key]}`);
        }
        return "?"+array.join("&");
    }

    /**
     * 
     * @param {string} dataField Data field to set
     * @param {any} data Data to set to data field
     * @returns True if setting was successfull. Throws error if field is not accessible
     */
    async setData(dataField, data){
        if(dataField in this._data){
            this._data[dataField] = data;
            for(let component of this._dataMapping[dataField]){
                try{
                    await component._reloadData(data);
                }catch(err){
                    throw new ComponentReloadError("Component failed to reload.", component.name);
                }
            }
            return true;
        }
        throw new DataError(`"${dataField}" is not a valid data field`);
    }

    /**
     * 
     * @param {String} dataField data field name
     * @returns content of the data field or throws DataError
     */
    getData(dataField){
        if(dataField in this._data){
            return this._data[dataField]
        }
        throw new DataError(`${dataField} is not a valid data field!`)
    }

    /**
     * COnstructs components corresponding to route path
     * @param {string} routePath 
     */
    async _constructComponents(routePath){
        await this._router._constructPathComponents(this._registeredPaths[routePath]);
    }

    /**
     * Registers all custom elements to the DOM
     * @param {Object.<string, Element>} elements 
     */
    registerCustomElements(elements){
        for(const name in elements){
            const element = elements[name];
            // @ts-ignore
            customElements.define(element.tagName, element);
        }
    }

    /**
     * Sets default/index component of app.
     * @param {String} index of the index component
     */
    setIndex(index){
        this.index = index
    }

    /**
     * 
     * @param {string|null} routePath 
     * @returns {Promise<void>}
     */
    async start(routePath){
        /**
         * Starts the app and loads first/index component. Defaults to the index component if set, otherwise loads first component in components.
         * @param {String} routePath String name or hash of the start component
         */
        try{
            for(let method in this.beforeStart){
                await this.beforeStart[method].bind(this)()
            }
            for(let component in this.staticComponents){
                await this.staticComponents[component].generateComponent();
            }
            if(this._registeredPathsKeys.length == 0){
                return;
            }
            if(!routePath && this._router.unknownView){
                this._router.unknownView.generateComponent();
                this._router.unknownViewActive = true;
                return;
            }
            if(routePath && this._registeredPathsKeys.includes(routePath)){
                await this._constructComponents(routePath);
            }
            else if(this.index){
                await this._constructComponents(this.index);
            }
            else{
                throw new AppStartError("App failed to start");
            }
            for(let method in this.afterStart){
                await this.afterStart[method].bind(this)()
            }
        }catch(err){
            throw(err)
        }
    }

    /**
     * Authenticated user object to set to authenticator
     * @param {any} user 
     * @returns {void}
     */
    setAuthenticatedUser(user){
        if(this._authenticator === undefined){
            throw new AuthenticatorNotImplemented("Missing authenticator implementation.")
        }
        this._authenticator.setAuthenticatedUser(user);
    }

    /**
     * Unsets authenticated user in authenticator
     * @returns {void}
     */
    unsetAuthenticatedUser(){
        if(this._authenticator === undefined){
            throw new AuthenticatorNotImplemented("Missing authenticator implementation.")
        }
        this._authenticator.unsetAuthenticatedUser();
    }

    /**
     * Returns authenticated user or null
     * @returns {any|null}
     */
    get authenticatedUser(){
        return this._authenticator.user;
    }

    /**
     * Returns true or fals if user is authenticated or not
     * @returns {boolean}
     */
    get isAuthenticated(){
        if(this._authenticator === undefined){
            throw new AuthenticatorNotImplemented("Missing authenticator implementation.")
        }
        return this._authenticator.isAuthenticated;
    }

    //setters and getters

    /**
     * Current route path of the application
     * @returns {string|null|undefined}
     */
    get path(){
        return this._router.currentView;
    }

    /**
     * DOM of the application. Returns entire node tree of the application container node
     * @returns {Element|null}
     */
    get DOM(){
        return document.querySelector(this.container);;
    }

    /**
     * Returns application properties
     * @returns {Object.<string, any>|undefined}
     */
    get properties(){
        return this._properties;
    }

    /**
     * Sets application properties
     * @type {Object.<string, any>}
     */
    set properties(properties){
        this._properties = properties;
    }

    /**
     * Returns application data object
     * @returns {Object|undefined}
     */
    get data(){
        return this._data;
    }

    /**
     * Sets current query parameters
     * @param {string} params 
     */
    set queryParams(params){
        this._queryParams = params;
    }

    /**
     * Gets current url query string
     * @returns {string|undefined}
     */
    get queryParams(){
        return this._queryParams;
    }

    /**
     * Sets current url hash string
     * @param {string} hash
     */
    set hash(hash){
        this._hash = hash;
    }

    /**
     * Gets current url hash string
     * @returns {string|undefined}
     */
    get hash(){
        return this._hash;
    }
}

export default App;
