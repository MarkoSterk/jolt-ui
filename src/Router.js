import { RouterTypeError, RouteError, RouterConfigError } from "./Errors";
import JoltNav from "./customElements/joltNav";
import Authenticator from "./Authenticator";

class Router {
    /**
   * Main Router class. Listenes and handles routing of the app via a hashchange event listener.
   * @param {Object} app instance of the App class
   * @param {Object} configs object with configurations for the router. Must contain the selected router type: hash or url
   */
    app;
    configs;
    currentView;
    unknownView;
    unknownViewActive;

    constructor(app, configs) {
        this.app = app
        this.app._router = this;
        if(configs === undefined){
            throw new RouterConfigError("Router configuration error.");
        }
        this.configs = configs;
        if(configs.routerType === "url"){
            this._urlRouterType();
        }else if(configs.routerType === "hash"){
           this._hashRouterType();
        }else{
            throw new RouterTypeError("Wrong router type configuration.")
        }
        this._registerCustomElements({
            JoltNav
        });
    }

    /**
     * Hash type router. Gets current route path and query parameters based on the hash
     * @returns currentPath - the current path from the hash part of the url
     */
    _getRouteAndQueryParamsHash = () => {
        let currentUrl = window.location.hash; //current hash with query parameters
        let hashAndQueryParams = currentUrl.split("?"); //splits along the "?"
        let queryParams = hashAndQueryParams[1] ? hashAndQueryParams[1] : ""; //if the list has index 1 == query params
        this.app.queryParams = queryParams; //sets query parameters
        return hashAndQueryParams[0]; //at index 0 is the hash path
    }

    _urlRouterType(){
        this.app.DOM.addEventListener(Authenticator.redirectNavEventName, (event) => {
            history.pushState(null, '', event.detail.redirectTo);
            this._onUrlChange(event);
            return;
        })
        this.app.DOM.addEventListener(JoltNav.navEventName, (event) => {
            history.pushState(null, '', event.detail.navLink.href);
            this._onUrlChange(event);
            return;
        });
        this.app.DOM.addEventListener("popstate", (event) => {
            this._onUrlChange(event)
        })
    }

    _hashRouterType(){
        this.app.DOM.addEventListener('popstate', (event) => {this._onUrlChange(event)});
    }

    /**
     * Url type router. Gets current route path and query parameters based on the url path
     * @returns currentPath - the current path from the pathname part of the url.
     */
    _getRouteQueryParamsAndHashUrl = () => {
        let currentPath = window.location.pathname; //current path name
        let queryParams = window.location.search; //query parameters
        this.app.hash = window.location.hash;
        this.app.queryParams = queryParams; //sets query parameters
        return currentPath;
    }

    /**
     * Gets current route path and query params;
     * @returns routePath current route
     */
    _getRouteAndQueryParams = () => {
        let routePath;
        if(this.configs.routerType === "hash"){
            routePath = this._getRouteAndQueryParamsHash().substring(1);
        }else if(this.configs.routerType === "url"){
            routePath = this._getRouteQueryParamsAndHashUrl().substring(1);
        } else{
            throw new RouterTypeError("Wrong router type configuration.");
        }
        if((routePath === "/" || routePath === "") && !Object.keys(this.paths).includes(routePath)){
            if(this.app.index){
                routePath = this.app.index;
            }
        }
        return routePath;
    }

    _routeToRegExp(path){
        const regexPattern = path.replace(/:string/g, '[^/]+');
        return new RegExp(`^${regexPattern}$`);
    }

    /**
     * Changes view based on the current path (url of hash)
     * @param {*} event - popstate event automatically provided
     */
    _onUrlChange = (event) => {
        const routePath = this._getRouteAndQueryParams();
        //checks direct match for route
        if(this.pathKeys.includes(routePath)){
            this._changeView(routePath);
            return;
        }

        //check for patterns
        for(let route of this.pathKeys){
            const routeRegex = this._routeToRegExp(route);
            if(routeRegex.test(routePath)){
                this._changeView(route);
                return;
            }
        }

        try{
            this._unknownView();
        }catch(err){
            throw new RouteError("Route error. Requested route or unknownView route not found.")
        }
    }

    /**
     * Deconstructs components on the previous route.
     * @param {*} oldPath old path of the router
     */
    _deconstructPathComponents = async (oldPath, newPath) => {
        if(!newPath){
            newPath = [];
        }
        const oldPathReversed = oldPath.slice().reverse()
        for(let component of oldPathReversed){
            if(newPath.includes(component)){
                break;
            }
            await component.deconstructComponent();
        }
    }

    /**
     * Constructs components for the new route path 
     * @param {*} newPath new path of the router
     */
    _constructPathComponents = async (newPath) => {
        for(let component of newPath){
            if(!component._active){
                await component.generateComponent();
            }
        }
    }

    _reconstructCurrentComponent = async (pathComponents) => {
        /*
        Regenerates last child component of the path.
        Can be expanded to all current components if needed.
        */
        await pathComponents[pathComponents.length - 1].deconstructComponent();
        await pathComponents[pathComponents.length - 1].generateComponent();
    }

    /**
     * Changes view according to the provided route path.
     * Route path is provided by the _onUrlChange method which
     * invokes this method
     * @param {*} routePath url path 
     * @returns null
     */
    _changeView = async (routePath) => {
        if(routePath==this.currentView){
            /*
            If same path needs reloading the last child component is regenerated.
            Return to escape method.
            */
            return await this._reconstructCurrentComponent(this.paths[this.currentView]);
        }
        if(this.unknownViewActive){
            this.unknownView.deconstructComponent();
            this.unknownViewActive = false;
        } else{
            await this._deconstructPathComponents(this.paths[this.currentView], this.paths[routePath]);
        }
        await this._constructPathComponents(this.paths[routePath]);
        this.currentView = routePath;
    }

    _registerCustomElements(elements){
        for(const name in elements){
            const element = elements[name];
            customElements.define(element.tagName, element);
        }
    }

    /**
     * Activates the unknownView component if the requested route path can not be found.
     * 
     */
    _unknownView = async () => {
        if(!this.unknownViewActive){
            await this._deconstructPathComponents(this.paths[this.currentView]);
            await this.unknownView.generateComponent();
            this.currentView = null;
            this.unknownViewActive = true;
        }
    }

    /**
     * Sets unknownView component for the app
     * This component if called if any requested app route can not be found
     * in the registered app paths
     * @param {*} component 
     */
    unknownViewComponent = (component) => {
        this.unknownView = component;
    }

    /**
     * Starts the application
     */
    start = async () => {
        const route = this._getRouteAndQueryParams();
        this.currentView = await this.app.start(route);
    }

    //setters and getters
    /**
     * Returns all registered application paths for navigation
     */
    get paths(){
        return this.app._registeredPaths;
    }

    get pathKeys(){
        return this.app._registeredPathsKeys;
    }
}

export default Router;