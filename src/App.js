import { DataError, InitializationError, AppConstructorError } from "./Errors";

class App{
    name;
    properties;
    staticComponents;
    components;
    index;
    _data;
    _queryParams;
    _dataMapping = {};
    beforeStart = {};
    afterStart = {};
    _activeComponents = [];
    _registeredPaths = [];
    _router;

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
        if(configs.container === undefined ||
        configs.name === undefined || configs.data === undefined){
            throw new AppConstructorError("Missing application configurations.")
        }
        try{
            this.container = configs.container;
            this.name = configs.name
            this._data = configs.data
            for(let dataField in this._data){
                this._dataMapping[dataField] = [];
            }
            if(configs["beforeStart"] !== undefined){
                this.beforeStart = configs.beforeStart;
            }
            if(configs["afterStart"] !== undefined){
                this.afterStart = configs.afterStart
            }
        }catch(e){
            throw new AppConstructorError("Failed to initialize application.")
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
     * Extracts all components paths including subpaths with children components
     * @param {Object} data object with key-value pairs corresponding to routing paths
     * @param {String} currentPath current path; default = ""
     * @returns 
     */
    _extractPathsAndComponents(data, currentPath = "") {
        const result = {};

        for (const key in data) {
            const newPath = currentPath ? `${currentPath}/${key}` : key;
            const component = data[key].component;
            const children = data[key].children;
            if (component !== null) {
                result[newPath] = [component];
            }
            if (children) {
                const childResult = this._extractPathsAndComponents(children, newPath);
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
        this._registerAppToComponents();
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
                    throw err;
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

    /**
     * Sets default/index component of app.
     * @param {String} path of the index component
     */
    setIndex(index){
        this.index = index
    }

    get path(){
        return this._router.currentView;
    }

    get DOM(){
        return document.querySelector(this.container);;
    }

    async start(routePath){
        /**
         * Starts the app and loads first/index component. Defaults to the index component if set, otherwise loads first component in components.
         * @param {String} route String name or hash of the start component
         */
        try{
            let visitedRoute = routePath;
            for(let method in this.beforeStart){
                await this.beforeStart[method].bind(this)()
            }
            for(let component in this.staticComponents){
                await this.staticComponents[component].generateComponent();
            }
            if(routePath && Object.keys(this._registeredPaths).includes(routePath)){
                const pathComponents = this._registeredPaths[routePath];
                for(const component of pathComponents){
                    if(component) await component.generateComponent();
                }
                return routePath;
            }
            else if(this.index){
                await this.components[this.index].component.generateComponent();
                visitedRoute = this.index;
            }
            else{
                route = Object.keys(this.components)[0]
                await this.components[route].component.generateComponent();
                visitedRoute = route;
            }
            for(let method in this.afterStart){
                await this.afterStart[method].bind(this)()
            }
            return visitedRoute;
        }catch(err){
            throw new InitializationError("App failed to start.");
        }
    }
}

export default App;
