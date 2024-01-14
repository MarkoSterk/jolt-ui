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
    _midViewChange = false;
    _ignorePrefix = "";

    constructor(app, configs) {
        this.app = app
        this.app._router = this;
        if(configs === undefined){
            throw new RouterConfigError("Router configuration error.");
        }
        this.configs = configs;
        if(configs.ignorePrefix !== undefined){
            this._ignorePrefix = configs.ignorePrefix;
        }
        if(this.configs.routerType === "url"){
            this._urlRouterType();
        }else if(this.configs.routerType === "hash"){
            this._hashRouterType();
        }else{
            throw new RouterTypeError("Wrong router type configuration.")
        }
        this._viewChangePromise = null; //sets change view promise to null initially
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
        this.app.DOM.addEventListener(Authenticator.redirectNavEventName, async (event) => {
            //event listener on app container to detect any application redirect events.
            event.stopPropagation();
            if(this._viewChangePromise){
                //if view change is in progress it awaits the change first
                await this._viewChangePromise;
            }
            history.pushState(null, '', event.detail.redirectTo);
            //stores promise of the view change
            this._viewChangePromise = this._onUrlChange(event);
            return;
        })
        this.app.DOM.addEventListener(JoltNav.navEventName, async (event) => {
            //event listener on app container to detect any navigation link clicks.
            event.stopPropagation();
            if(this._viewChangePromise){
                //if view change is in progress it returns directly
                return;
            }
            history.pushState(null, '', event.detail.navLink.href);
            //stores promise of the view change
            this._viewChangePromise = this._onUrlChange(event);
            return;
        });
        window.addEventListener("popstate", async (event) => {
            //event listener on window to detected navigation with browser buttons.
            if(this._viewChangePromise){
                //if view change is in progress it awaits the change first
                await this._viewChangePromise;
            }
            //stores promise of the view change
            this._viewChangePromise = this._onUrlChange(event)
        })
    }

    _hashRouterType(){
        this.app.DOM.addEventListener('popstate', async (event) => {
            if(this._viewChangePromise){
                //if view change is in progress it awaits the change first
                await this._viewChangePromise;
            }
            //stores promise of the view change
            this._viewChangePromise = this._onUrlChange(event)
        });
    }

    /**
     * Url type router. Gets current route path and query parameters based on the url path
     * @returns currentPath - the current path from the pathname part of the url.
     */
    _getRouteQueryParamsAndHashUrl = () => {
        let currentPath = window.location.pathname; //current path name
        if(this._ignorePrefix.length > 0){
            currentPath = currentPath.substring(this._ignorePrefix.length);
        }
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

    _checkRouteAndRegex(routePath){
        //checks direct match for route
        if(this.pathKeys.includes(routePath)){
            return routePath;
        }
        //check for patterns
        for(let route of this.pathKeys){
            const routeRegex = this._routeToRegExp(route);
            if(routeRegex.test(routePath)){
                return route;
            }
        }
    }

    /**
     * Changes view based on the current path (url of hash)
     * @param {*} event - event automatically provided
     */
    _onUrlChange = async (event) => {
        let routePath = this._getRouteAndQueryParams();
        routePath = this._checkRouteAndRegex(routePath);
        if(routePath){
            await this._changeView(routePath);
            this._viewChangePromise = null;
            return;
        }
        try{
            await this._unknownView(); 
        }catch(err){
            throw new RouteError("Route error. Requested route or unknownView route not found.")
        }
        //sets promise back to null
        this._viewChangePromise = null;
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
            if(component._active){
                await component.deconstructComponent();
            }
        }
    }

    /**
     * Constructs components for the new route path 
     * @param {*} newPath new path of the router
     */
    _constructPathComponents = async (newPath) => {
        let signal = "success";
        for(let component of newPath){
            if(!component._active){
                signal = await component.generateComponent();
                if(signal == component._signals.redirect){
                    return this.app._authenticator._makeUnauthenticatedRedirect(component);
                }
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
        this.app.registerCustomElements(elements);
    }

    /**
     * Activates the unknownView component if the requested route path can not be found.
     * 
     */
    _unknownView = async () => {
        if(!this.unknownViewActive){
            this._viewChangePromise = true;
            await this._deconstructPathComponents(this.paths[this.currentView]);
            await this.unknownView.generateComponent();
            this.currentView = null;
            this.unknownViewActive = true;
            this._viewChangePromise = null;
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
        let routePath = this._getRouteAndQueryParams();
        //routePath = this._checkRouteAndRegex(routePath);
        //this.currentView = await this.app.start(routePath);
        this.currentView = this._checkRouteAndRegex(routePath);
        await this.app.start(this.currentView);
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