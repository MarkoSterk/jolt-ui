import App from "./app.js";
import { CustomElement } from "./baseCore.js";

/**
 * ENUM with router events
 * @type {Object}
 * @property {string} START - emited when route change starts
 * @property {string} FINISHED - emited when route change finished
 * @property {string} LAYOUTCHANGEFINISHED - emited when the layout finished loading
 */
export const routeEventsEnum = {
    START: "route-change.start",
    FINISHED: "route-change.finished",
    LAYOUTCHANGEFINISHED: "route-change.layout-change.finished",
    ERRORPAGESTART: "route-change.error-page.start",
    ERRORPAGEFINISHED: "route-change.error-page.finished",
    ABORTROUTETRANSITION: "route-change.abort"
}

/**
 * @typedef {import('./types.js').ROUTE} ROUTE
 * @typedef {import('./types.js').RouterConfigs} RouterConfigs
 */


class Router {

    /**
     * Application object
     * @type {App}
     */
    #app;

    /**
     * @type {Object}
     * @property {string} route - app endpoint
     * @property {Object<string, CustomElement>} handlers - elements to render (target - element pairs)
     * @property {string} title - title of the page
     * @property {Array<string>} [roles] - array with allowed user roles (optional)
     * @property {CustomElement} [layout] - layout of page (optional, default=baseLayout)
     * @property {Object<string, string|number>} params - url parameters
     * @property {Array<Array<string, string, CustomElement>>} renderSequence - sequence in which elements were rendered (with target and hash ids)
     */
    _currentRoute;

    /**
     * Constructor for router
     * @param {RouterConfigs} configs
     */
    constructor({ baseUrl = "", routes, baseLayout, defaultTarget, pageNotFoundCode = 404, index = "/", app }){
        if(!app){
            throw new Error("Missing application object in router constructor")
        }
        if(!routes){
            throw new Error("Missing routes object for router.")
        }
        if(!baseLayout && !(baseLayout instanceof CustomElement)){
            throw new Error("Missing base layout element for the application");
        }
        this.#app = app;
        this.baseLayout = baseLayout;
        this.pageNotFoundCode = pageNotFoundCode;
        if(typeof routes == "function"){
            routes = routes.bind(this)();
        }
        this.defaultTarget = defaultTarget;
        this._inTransition = false;
        this._transitionToRoute = "";
        this._abort = false;
        // @ts-ignore
        this._parseRoutes({ routes }); //parses routes to route map
        this._baseUrl = baseUrl;
        this.index = index;
        this.app.addEventListener("click", this.#clickHandler); //click events for htags are registered with the application container.
        window.addEventListener("popstate", this.#popStateHandler) //popstate event is registered on the window object.
        this._currentRoute = null;
    }

    /**
     * Method for parsing routes tree
     * @param {Object} configs
     * @param {Object<string, string} configs.routes
     * @param {string} configs.parentPath - The parent path (used during recursion)
     * @param {Object} configs.parentHandlers - The parent handlers (used during recursion)
     * @param {CustomElement} [configs.layout] - The current layout being applied (top-level routes can override this)
     */
    _parseRoutes({ routes, parentPath = "", parentHandlers = {}, layout }){
        this.routeMap = new Map(Object.entries(this.#parseRoutes({ routes, parentPath, parentHandlers, layout })));
        this.routeMap = this.sortRouteMap();
        //console.log(this.routeMap)
    }

    /**
     * Method for parsing routes tree
     * @param {Object} configs
     * @param {Object<string, string} configs.routes
     * @param {string} configs.parentPath - The parent path (used during recursion)
     * @param {Object} configs.parentHandlers - The parent handlers (used during recursion)
     * @param {CustomElement} [configs.layout] - The current layout being applied (top-level routes can override this)
     */
    #parseRoutes({ routes, parentPath = "", parentHandlers = {}, layout }) {
        let currentLayout = layout;
        if(!currentLayout){
            currentLayout = this.baseLayout;
        }
        
        const routeMap = {};

        routes.forEach(route => {
            // Full path for current route
            const fullPath = parentPath + route.path;

            // Merge existing handlers (from parent) if any
            if(typeof route.handler != "function"){
                throw new Error("Route handler must be of type CustomElement from ElementFactory.")
            }

            const handlers = route.handler
                ? { ...parentHandlers, [route.target]: route.handler }
                : { ...parentHandlers };

            // If multiple handlers are present, merge them into the handler object
            if (route.handlers) {
                Object.keys(route.handlers).forEach(target => {
                    handlers[target] = route.handlers[target];
                });
            }

            // Determine the layout for this route (use currentLayout or route's layout if provided)
            const layout = route.layout || currentLayout;

            // Adds the current route to the map with its handlers under "handlers"
            routeMap[fullPath] = {
                handlers: { ...handlers },
                layout: layout,
                title: route?.title,// || this.app.appName,
                roles: route.roles || null,
                details: route?.details || null,
                attributes: route?.attributes ? {[route.handler.tagName]: route.attributes} : null,
                authenticationRequired: [undefined].includes(route?.authenticationRequired) ? false : route?.authenticationRequired,
                rolesRequired: [undefined].includes(route?.authenticationRequired) ? [] : route?.rolesRequired,
            };

            // Recursive parsing of children paths if any
            if (route.children) {
                // Recursively parse the children routes with the same layout
                Object.assign(routeMap, this.#parseRoutes({
                    routes: route.children,
                    parentPath: fullPath,
                    parentHandlers: handlers,
                    layout: layout // Pass down the layout to children
                }));
            }
            
        });
        return routeMap;
    }

    /**
     * Sorting method for Array.sort for routes
     * @param {Array} a 
     * @param {Array} b 
     * @returns {Number}
     */
    #routesSorter = (a, b) => {
        // More specific (aka longer) paths come first
        const lengthDiff = b[0].length - a[0].length;
        if (lengthDiff !== 0) return lengthDiff;

        // String parameters are prioritized over integer parameters
        if (a[0].includes('<str:') && b[0].includes('<int:')) return -1;
        if (a[0].includes('<int:') && b[0].includes('<str:')) return 1;

        return 0;  // Equality
    }

    /**
     * Method for sorting the routeMap object
     * @returns {Map}
     */
    sortRouteMap() {
        // Convert the routeMap to an array of entries
        const sortedEntries = Array.from(this.routeMap.entries())
            .sort(this.#routesSorter);  // Apply the custom sorter

        // Convert the sorted array back to a Map
        return new Map(sortedEntries);
    }

    /**
     * Click handler method for routing
     * @param {Event} event 
     */
    #clickHandler = async (event) => {
        // @ts-ignore
        const isAtag = event?.target?.matches("a");
        // @ts-ignore
        const parentAtag = event?.target?.closest("a");
        // @ts-ignore
        const ignoreRoute = isAtag ? event?.target?.getAttribute("router-ignore") : parentAtag?.getAttribute("router-ignore");
        // @ts-ignore
        const href = isAtag ? event?.target?.href : parentAtag?.href;
        if( (isAtag || parentAtag) && !ignoreRoute && href && !href.startsWith("mailto:")){
            event.preventDefault();
            if(this._inTransition && this._transitionToRoute == href){
                event.preventDefault();
                return;
            }

            //if a transition is ongoing current routing is aborted.
            if(this._inTransition){
                //event.preventDefault();
                this.#emitAbortRouteTransition();
                //return;
            }
            this._inTransition = true;
            try{
                this._transitionToRoute = href;
                await this.#handleLinkPress(href);
            }catch(e){
                if(!this._abort){
                    console.error("Routing failed for route: ", href);
                }
                this._abort = false;
            }
            this._transitionToRoute = "";
            this._inTransition = false;
        }
    }

    /**
     * Pop state handler for routing (nav btns back/forth)
     * @param {Event} event 
     */
    #popStateHandler = async (event) => {
        await this.route();
        // @ts-ignore
        if (event.state && event.state.scrollPosition) {
            // @ts-ignore
            const { x, y } = event.state.scrollPosition;
            window.scrollTo(x, y);
        }
    }

    /**
     * Handles the clicked navigation aTag
     * @param {string} href - the clicked a tag 
     */
    #handleLinkPress = async (href) => {
        const state = this.#getCurrentState();
        history.pushState(state, null, href);
        await this.route();
    }

    /**
     * Performs the actual route based on the current browser url
     * @returns {Promise<void>}
     */
    route = async () => {
        let path = location.pathname;
        path = path.replace(this.baseUrl, "");
        if(path === ""){
            path = "/";
        }
        const matchedPath = this.#matchRoute(path);
        if(matchedPath && !this.app?.authenticatorInstalled){
            await this.#loadPath(matchedPath);
            return;
        }
        if(matchedPath && this.app?.authenticatorInstalled){
            if(!matchedPath.authenticationRequired){
                await this.#loadPath(matchedPath);
                return;
            }
            if(matchedPath.authenticationRequired && (this.app.authenticator.isAuthenticated && this.app.authenticator.hasRole(matchedPath?.rolesRequired || []))){
                await this.#loadPath(matchedPath);
                return;
            }
            if(matchedPath.authenticationRequired && (!this.app.authenticator.isAuthenticated() || !this.app.authenticator.hasRole(matchedPath?.rolesRequired || []))){
                await this.app.authenticator.unauthorizedRedirect();
                if(this.app.authenticator.redirectCallback){
                    await this.app.authenticator.redirectCallback();
                }
                return;
            }
        }
        await this.#loadErrorPage();
    }

    /**
     * Performs redirect to provided path
     * @param {string} pathname 
     */
    redirect = async (pathname) => {
        const path = `${this.baseUrl}${pathname}`;
        const state = this.#getCurrentState();
        history.pushState(state, null, path);
        await this.route();
    }

    /**
     * Loads home/index route
     */
    home = async () => {
        const path = `${this.baseUrl}${this.index}`;
        const state = this.#getCurrentState();
        history.pushState(state, null, path);
        await this.route();
    }

    /**
     * Matches current browser url to appropriate route handler
     * Performs pattern matching for int/str variables in url
     * @param {string} pathname - current location.pathname variable
     * @returns {null|Object<string, CustomElement|string|null|Array<string>>}
     */
    #matchRoute(pathname) {
        for (const [route, config] of this.routeMap.entries()) {
            // Convert the route pattern with type definitions to a regular expression
            const paramNames = [];
            const paramTypes = [];
    
            const regexPath = route.replace(/<(\w+):(\w+)>/g, (_, type, paramName) => {
                paramNames.push(paramName);
                paramTypes.push(type);
                if (type === 'str') return '([^/]+)'; // Capture group for any string
                if (type === 'int') return '(\\d+)';  // Capture group for integers only
            });
    
            const match = pathname.match(new RegExp(`^${regexPath}$`));
    
            if (match) {
                const params = paramNames.reduce((acc, paramName, i) => {
                    let paramValue = match[i + 1]; 
                    if (paramTypes[i] === 'int') {
                        paramValue = parseInt(paramValue, 10);  
                    }
                    acc[paramName] = paramValue;
                    return acc;
                }, {});
                this.routeParameters = params || null;
                return { 
                    route: route,
                    handlers: config.handlers, 
                    details: config?.details || null,
                    title: config.title,
                    rolesRequired: config.rolesRequired || [],
                    authenticationRequired: config.authenticationRequired || false,
                    layout: config.layout, 
                    params: params,
                    attributes: config?.attributes || null
                };
            }
        }
    
        return null;
    }

    /**
     * Loads appropriate page according to matchedPath
     * @param {Object<string, CustomElement|string|null>} matchedPath 
     */
    #loadPath = async (matchedPath) => {
        this.#emitRouteChangeStart();
        const renderSequence = [];
        await this.#renderLayout(matchedPath.layout);
        // @ts-ignore
        const layout = this.app.querySelector(matchedPath.layout.tagName);
        // @ts-ignore
        await layout.initComplete; //must wait for the layout element to finish rendering.
        const handlersArray = Object.entries(matchedPath.handlers)
        for(const [index, [target, handler]] of handlersArray.entries()){
            const targetContainer = this.app.querySelector(target);
            if(!targetContainer){
                throw new Error(`Failed to get target (${target}) container for route ${matchedPath.route} and handler (${handler})`);
            }
            const existingElement = targetContainer.querySelector(handler.tagName);
            //rerenders only the last handler in the handlersArray.
            if(existingElement && handlersArray.length != 1 && index < (handlersArray.length - 1)){
                continue;
            }
            const hashId = this.app.generateHash()
            //targetContainer.innerHTML = handler.generate(hashId, matchedPath.attributes?.[handler.tagName]);
            this.app._originalInnerHTML.call(targetContainer, handler.generate(hashId, matchedPath.attributes?.[handler.tagName]))
            // Should this break be enabled? If enabled, the _inTransition flag supresses 
            // route changes (clicks) until the current transition finishes
            const generatedHandler = this.app.querySelector(`[data-hash-id="${hashId}"]`);
            if(generatedHandler){
                // @ts-ignore
                await generatedHandler.initComplete;//typeof CustomElement
            }
            renderSequence.push([target, hashId, handler])
        }
        this.#setTitle(matchedPath.title);
        this._currentRoute = {
            ...matchedPath,
            renderSequence,
            href: window.location.href
        };
        this.#emitRouteChangeFinished();
    }

    /**
     * Renders layout of matched path of not already loaded.
     * @param {CustomElement} matchedLayout 
     */
    #renderLayout = async (matchedLayout) => {
        if(!this.app.querySelector(matchedLayout.tagName)){
            this.app.container.innerHTML = matchedLayout.generate();
            const layout = this.app.querySelector(matchedLayout.tagName);
            // @ts-ignore
            await layout.initComplete;
            this.#emitRouteChangeLayoutGeneratedFinished(layout.tagName);
        }
    }

    /**
     * Loads error page
     * @returns {Promise<void>}
     */
    #loadErrorPage = async () => {
        if(!this.app.querySelector(this.baseLayout.tagName)){
            // @ts-ignore
            this.app.container.innerHTML = this.baseLayout.generate();
            const layout = this.app.querySelector(this.baseLayout.tagName);
            // @ts-ignore
            await layout.initComplete;
            this.#emitRouteChangeLayoutGeneratedFinished(this.baseLayout.tagName);
        }
        const container = this.app.querySelector(this.defaultTarget);
        if(!container){
            return;
        }
        // @ts-ignore
        const htmlMarkup = this.app._errorPages[this.pageNotFoundCode].generate();
        container.innerHTML = htmlMarkup;
        this.#emitRouteChangeFinished();
    }

    /**
     * Aborts page load
     * @param {number|null} status 
     */
    _abortPageLoad = async (status = null) => {
        this.#emitAbortPageLoadStart();
        let renderTarget = this.defaultTarget;
        let layout = this.baseLayout;
        if(this._currentRoute){
            layout = this._currentRoute.layout;
            renderTarget = this._currentRoute.renderSequence[0][0];
        }
        await this.#renderLayout(layout);
        const targetContainer = this.app.querySelector(renderTarget);
        if(!targetContainer){
            throw new Error(`Failed to get target (${renderTarget}) container for error page`);
        }
        if(!Object.keys(this.app._errorPages).includes(`${status}`)){
            status = 500;
        }
        // @ts-ignore
        const htmlMarkup = this.app._errorPages[status].generate();
        targetContainer.innerHTML = htmlMarkup;
        this.#emitAbortPageLoadFinished();
    }

    #emitAbortRouteTransition = () => {
        const customEvent = new CustomEvent(routeEventsEnum.ABORTROUTETRANSITION, {
            bubbles: true,
            cancelable: true,
        })
        this._abort = true;
        this.app.container.dispatchEvent(customEvent);
    }

    /**
     * Emits route change start event
     */
    #emitRouteChangeStart = () => {
        const customEvent = new CustomEvent(routeEventsEnum.START, {
            bubbles: true,
            cancelable: true,
            detail: {
                ...this._currentRoute,
            }
        })
        this.app.container.dispatchEvent(customEvent);
    }

    /**
     * Emits route change finished event
     */
    #emitRouteChangeFinished = () => {
        const customEvent = new CustomEvent(routeEventsEnum.FINISHED, {
            bubbles: true,
            cancelable: true,
            detail: {
                ...this._currentRoute
            }
        })
        this.app.container.dispatchEvent(customEvent);
    }

    /**
     * Emits layout generated finished event
     * @param {string} tagName tagName of layout
     */
    #emitRouteChangeLayoutGeneratedFinished = (tagName) => {
        const customEvent = new CustomEvent(routeEventsEnum.LAYOUTCHANGEFINISHED, {
            bubbles: true,
            cancelable: true,
            detail: {
                layout: tagName
            }
        })
        this.app.container.dispatchEvent(customEvent);
    }

    /**
     * Emits abort page load start event
     * @param {number} [status] status code of error 
     */
    #emitAbortPageLoadStart = (status) => {
        const customEvent = new CustomEvent(routeEventsEnum.ERRORPAGESTART, {
            bubbles: true,
            cancelable: true,
            detail: {
                errorStatus: status,
                errorPage: this.app._errorPages[status]
            }
        })
        this.app.container.dispatchEvent(customEvent);
    }

    /**
     * Emits abort page load finished event
     * @param {number} [status] status code of error 
     */
    #emitAbortPageLoadFinished = (status) => {
        const customEvent = new CustomEvent(routeEventsEnum.ERRORPAGEFINISHED, {
            bubbles: true,
            cancelable: true,
            detail: {
                errorStatus: status,
                errorPage: this.app._errorPages[status]
            }
        })
        this.app.container.dispatchEvent(customEvent);
    }

    /**
     * Gets current state of location (scroll position)
     * @returns {Object<string, Object<string, Number>>}
     */
    #getCurrentState = () => {
        const state = {
            scrollPosition: {
                x: window.scrollX,
                y: window.scrollY
            }
        }

        return state;
    }

    /**
     * Sets title of current page
     * @param {string} title 
     * @returns {undefined}
     */
    #setTitle = (title) => {
        const titleElement = document.querySelector("title");
        if(!titleElement){
            throw new Error("Missing title tag in page header. This is considered bad practice!")
        }
        if(!title){
            //titleElement.innerText = this.app.appName;
            return;
        }
        let finalTitle = title;
        titleElement.innerText = finalTitle;
    }

    /**
     * Returns location.search params either as object (true) or as a string (false)
     * Default: false
     * @param {boolean} toObject 
     * @returns {string|Object<string, string>}
     */
    getQueryParams = (toObject = false) => {
        return this.app.getQueryParams(toObject);
    }

    /**
     * Returns the base url of the application
     * @returns {string}
     */
    get baseUrl(){
        return this._baseUrl;
    }

    get hash(){
        return this.app.hash;
    }

    get port(){
        return this.app.port;
    }

    get hostname(){
        return this.app.hostname;
    }

    get host(){
        return location.host;
    }

    get pathname(){
        return location.pathname;
    }

    get origin(){
        return location.origin;
    }

    get app(){
        return this.#app;
    }

    get currentRoute(){
        return this._currentRoute;
    }

}

export default Router;
