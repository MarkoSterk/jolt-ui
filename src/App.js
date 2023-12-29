import { DataError, AppConstructorError,
        AppStartError, ComponentReloadError, AuthenticatorNotImplemented } from "./Errors";
import Authenticator from "./Authenticator";

class App{
    name;
    container;
    properties;
    staticComponents;
    components;
    index;
    _data;
    _queryParams;
    _hash;
    _dataMapping = {};
    beforeStart = {};
    afterStart = {};
    _activeComponents = [];
    _registeredPaths = [];
    _registeredPathsKeys = [];
    _router;
    _authenticator;

    /**
     * Accepts configuration object with main app configs.
     * Must contain fields for:
     * container - query selector for the app container HTML element
     * name - String name of the app
     * data - data object with key-value pairs for the expected data structure of the app
     * beforeStart - object with methods that should run before the app starts
     * afterStart - object with methods that should run immediately after the app starts
     * @param {Object} configs configuration object with key-value pairs
     */
    constructor(configs){
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
        }catch(e){
            throw(e);
        }
    }

    /**
     * Adds static components to app - static components don't respond to data changes (ex: menu, header, footer etc.)
     * @param {Object} components Object with key-value pairs corresponding to static components
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
     * @param {Object} data object with key-value pairs corresponding to routing paths
     * @param {String} currentPath current path; default = ""
     * @returns 
     */
    _extractPathsAndComponents(data, currentPath = "") {
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
                    result[childKey] = [component, ...childResult[childKey]];
                }
            }
        }
        return result;
    }

    /**
     * Registers the app to individual components
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
     * @returns Object with key-value pairs corresponding to query parameters
     */
    parseQueryParams(string){
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
     * @param {*} dataField Data field to set
     * @param {*} data Data to set to data field
     * @returns True if setting was successfull. Throws error if field is not accessible
     */
    async setData(dataField, data){
        if(dataField in this._data){
            this._data[dataField] = data;
            for(let component of this._dataMapping[dataField]){
                try{
                    await component._reloadData(data);
                }catch(err){
                    throw new ComponentReloadError("Component failed to reload.");
                }
            }
            return true;
        }
        throw new DataError(`"${field}" is not a valid data field`);
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

    async _startComponents(routePath){
        const pathComponents = this._registeredPaths[routePath];
        for(const component of pathComponents){
            if(component){
                await component.generateComponent();
            }
        }
    }

    /**
     * Sets default/index component of app.
     * @param {String} path of the index component
     */
    setIndex(index){
        this.index = index
    }

    async start(routePath){
        /**
         * Starts the app and loads first/index component. Defaults to the index component if set, otherwise loads first component in components.
         * @param {String} routePath String name or hash of the start component
         */
        try{
            let visitedRoute;
            for(let method in this.beforeStart){
                await this.beforeStart[method].bind(this)()
            }
            for(let component in this.staticComponents){
                await this.staticComponents[component].generateComponent();
            }
            if(this._registeredPathsKeys.length == 0){
                return;
            }
            if(routePath && this._registeredPathsKeys.includes(routePath)){
                this._startComponents(routePath);
                visitedRoute = routePath;
            }
            else if(this.index){
                this._startComponents(this.index);
                visitedRoute = this.index;
            }
            else if(this._router.unknownView){
                this._router.unknownView.generateComponent();
                this._router.unknownViewActive = true;
                visitedRoute = routePath;
            }
            else{
                throw new AppStartError("App failed to start");
            }
            for(let method in this.afterStart){
                await this.afterStart[method].bind(this)()
            }
            return visitedRoute;
        }catch(err){
            throw(err)
        }
    }

    setAuthenticatedUser(user){
        if(this._authenticator === undefined){
            throw new AuthenticatorNotImplemented("Missing authenticator implementation.")
        }
        this._authenticator.setAuthenticatedUser(user);
    }

    unsetAuthenticatedUser(){
        if(this._authenticator === undefined){
            throw new AuthenticatorNotImplemented("Missing authenticator implementation.")
        }
        this._authenticator.unsetAuthenticatedUser();
    }

    get isAuthenticated(){
        if(this._authenticator === undefined){
            throw new AuthenticatorNotImplemented("Missing authenticator implementation.")
        }
        return this._authenticator.isAuthenticated;
    }

    //setters and getters
    get path(){
        return this._router.currentView;
    }

    get DOM(){
        return document.querySelector(this.container);;
    }

    get properties(){
        return this.properties;
    }

    get data(){
        return this._data;
    }

    /**
     * @param {Object} params Object with key-value pairs corresponding to query parameters
     */
    set queryParams(params){
        this._queryParams = params;
    }

    get queryParams(){
        return this._queryParams;
    }

    set hash(hash){
        this._hash = hash;
    }

    get hash(){
        return this._hash;
    }
}

export default App;
