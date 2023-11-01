class App{
    /**
   * Main App class.
   * @param {String} name Name of the app
   */
    name;
    staticComponents;
    components;
    index;
    _data;
    _queryParams;
    _persistData;
    _dataMapping = {};
    beforeStart = {};
    afterStart = {};
    _activeComponents = [];
    _registeredPaths = [];
    _router;

    constructor(configs){
        this.name = configs.name
        this._data = configs.data
        this._persistData = configs.persistData
        this.initData = configs.initData
        for(let dataField in this._data){
            this._dataMapping[dataField] = [];
        }
        this.beforeStart = configs.beforeStart;
    }

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

    extractPathsAndComponents(data, currentPath = "") {
        const result = {};

        for (const key in data) {
            const newPath = currentPath ? `${currentPath}/${key}` : key;
            const component = data[key].component;
            const children = data[key].children;

            if (component !== null) {
                result[newPath] = [component];
            }

            if (children) {
                const childResult = this.extractPathsAndComponents(children, newPath);
                for (const childKey in childResult) {
                    result[childKey] = [component, ...childResult[childKey]];
                }
            }
        }

        return result;
    }

    async registerAppToComponents(){
        for(let path of Object.keys(this._registeredPaths)){
            for(let component of this._registeredPaths[path]){
                if(!component._app) await component._registerApp(this);
            }
        }
    }

    async addPaths(components){
        /**
         * Adds components to the App.
         * @param  {Object} components  Object with app components. If used with router the keys of the object refer to the hash address
         */
        this._registeredPaths = this.extractPathsAndComponents(components);
        //console.log(this._registeredPaths);
        this.registerAppToComponents();
    }

    setQueryParams(params){
        this._queryParams = params;
    }

    getQueryParams(){
        return this._queryParams;
    }

    parseQueryParams(string){
        var dict = {};
        if(string.startsWith("?")) string = string.substring(1)
        string.split("&").forEach(function(item) {dict[item.split("=")[0]] = item.split("=")[1]})
        return dict
    }

    stringifyQueryParams(dict){
        var array = [];
        for(let key of Object.keys(dict)){
            array.push(`${key}=${dict[key]}`);
        }
        return "?"+array.join("&");
    }

    async setData(dataField, data){
        if(dataField in this._data){
            this._data[dataField] = data;
            for(let component of this._dataMapping[dataField]){
                await component._reloadData(data);
            }
            return true;
        }
        else throw new Error(`"${field}" is not a valid data field`)
    }

    getData(dataField){
        if(dataField in this._data){
            return this._data[dataField]
        }
        throw new Error(`${dataField} is not a valid data field!`)
    }

    setIndex(index){
        /**
         * Sets default/index component of app.
         * @param {String} path of the index component
         */
        this.index = index
    }

    get path(){
        return this._router.currentView;
    }

    async start(routePath){
        /**
         * Starts the app and loads first/index component. Defaults to the index component if set, otherwise loads first component in components.
         * @param {String} route String name or hash of the start component
         */
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
    }
}

export default App;
