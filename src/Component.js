// @ts-check

import { ComponentConstructorError,
        RenderOptionsError, ComponentContainerError,
        ReservedKeywordError, DataMappingError } from "./Errors";
import Authenticator from "./Authenticator";
import dot from "./dot/doT";
import App from "./App";

class Component {

    /**
     * String name of the Component
     * @type {string}
     */
    name;

    /**
     * Container HTML element of the component. Valid query selector
     * @type {string}
     */
    container;

    /**
     * Markup function for the component
     * @type {Function}
     */
    markup;

    /**
     * Render options for the component
     * @type {Object.<string, any>}
     */
    renderOptions = {
        delete: true,
        insert: "afterbegin",
        template_name: null,
        cache: false,
        useEngine: false
    }

    /**
     * Authentication required boolean option
     * @type {boolean}
     */
    _authenticationRequired = false;

    /**
     * Subcomponents object of the component. Contains all subcomponents
     * @type {Object.<string, Component>}
     */
    subcomponents = {};

    /**
     * Before generate lifecycle hook functions of the component.
     * @type {Object.<string, Function>}
     */
    beforeGenerate = {};

    /**
     * After generate lifecycle hook functions of the component.
     * @type {Object.<string, Function>}
     */
    afterGenerate = {};

    /**
     * Before active lifecycle hook functions of the component.
     * @type {Object.<string, Function>}
     */
    beforeActive = {};

    /**
     * after active lifecycle hook functions of the component.
     * @type {Object.<string, Function>}
     */
    afterActive = {};

    /**
     * Before deconstruct lifecycle hook functions of the component.
     * @type {Object.<string, Function>}
     */
    beforeDeconstruct = {};

    /**
     * After deconstruct lifecycle hook functions of the component.
     * @type {Object.<string, Function>}
     */
    afterDeconstruct = {};

    /**
     * Before deactive lifecycle hook functions of the component.
     * @type {Object.<string, Function>}
     */
    beforeDeactive = {};

    /**
     * After deactive lifecycle hook functions of the component.
     * @type {Object.<string, Function>}
     */
    afterDeactive = {};

    /**
     * Interval methods for the component.
     * @type {Array<Array<Function, number>>}
     */
    intervalMethods = [];

    /**
     * Connected functions for the component (for event handlers)
     * @type {Object.<string, Function>}
     */
    methods = {};

    /**
     * Meta data field for the component. Can contain any additional information
     * @type {Object}
     */
    metaData = {};

    /**
     * Data field of the object
     * @type {string}
     */
    dataField;

    /**
     * Whether the component should reload upon data change. Default true
     * @type {boolean}
     */
    reloadOnDataChange = true;

    /**
     * Indicates if component is currently active
     * @type {boolean}
     */
    _active = false;

    /**
     * Parent component if this component is a subcomponent
     * @type {Component}
     */
    _parent

    /**
     * Array of interval methods IDs
     * @type {Array<number>}
     */
    _intervalMethodsIds = [];

    /**
     * Application instance
     * @type {App}
     */
    _app;

    /**
     * Current data of the component
     * @type {any|undefined}
     */
    _data;

    /**
     * Current url query string
     * @type {string|undefined}
     */
    _queryParams;

    /**
     * Component DOM parser
     * @type {DOMParser}
     */
    _domParser;

    /**
     * Compiled component template function if the DotJS render engine is used
     * @type {any|undefined}
     */
    _templateFn;

    /**
     * Cached template string if caching is enabled
     * @type {string|undefined}
     */
    _templateCache;

    /**
     * Signals that the component may emit when certain events occur.
     * @type {Object.<string, string>}
     */
    _signals = {
        success: "success",
        redirect: "redirect",
        fail: "fail"
    };

    /**
     * Identifier string for Jolt Components in DOM elements
     * @type {string}
     */
    _identifier = "JoltComponent";

    /**
     * Constructor for Component
     * @param {Object} configs 
     */
    constructor(configs) {
        if(configs.properties){
            throw new ReservedKeywordError("Reserved keyword error", "properties");
        }
        if(configs.container === undefined || configs.name === undefined || configs.markup === undefined){
            throw new ComponentConstructorError("Failed to construct component. Missing configurations.");
        }
        if(configs.renderOptions !== undefined){
            if(configs.renderOptions.delete === undefined || configs.renderOptions.insert === undefined){
                throw new RenderOptionsError("Render options error", configs.name);
            }
        }
        Object.assign(this, configs);
        this._domParser = new DOMParser();
    }

    /**
     * Validates configuration field types
     * @param {any} value 
     * @param {string} valueType 
     * @returns {boolean}
     */
    validateConfigData(value, valueType){
        return typeof value === valueType.toLowerCase();
    }

    /**
     * Template method caller of the component
     * @returns {Promise<string>}
     */
    async _template(){
        return await this.markup.bind(this)();
    }

    /**
     * Sets animations on the component
     * @param {HTMLElement} parsedTemplate 
     * @returns {Promise<HTMLElement>}
     */
    async _setAnimations(parsedTemplate){
        let allElems = [...parsedTemplate.querySelectorAll('[animate]')];
        for(let elem of allElems){
            // @ts-ignore
            let args = this._getAllArgs(elem)
            if(Object.keys(args).length > 0){
                // @ts-ignore
                this.methods[elem?.getAttribute('animate')].bind(this)(elem, args);
            }else{
                // @ts-ignore
                this.methods[elem?.getAttribute('animate')].bind(this)(elem);
            }
        }
        return parsedTemplate;
    }

    /**
     * Gets all jolt arguments of html node
     * @param {HTMLElement} elem 
     * @returns {Object.<string, any>}
     */
    _getAllArgs(elem){
        return Array.from(elem.attributes).reduce((acc, attr) => {
            if(attr.name.startsWith(":")){
                const key = attr.name.substring(1);
                let value = attr.value;
                try{
                    value = JSON.parse(value);
                }catch(e){
                    //do nothing
                }
                acc[key] = value;
            }
            return acc;
        }, {});
    }

    /**
     * Gets all elements with Jolt event handlers
     * @param {HTMLElement} parsedTemplate 
     * @returns {Array<HTMLElement>}
     */
    _getElementsWithJoltEvent(parsedTemplate){
        const allElements = parsedTemplate.querySelectorAll("*");
        const joltElements = [];
        allElements.forEach(element => {
            Array.from(element.attributes).forEach(attr => {
                if(attr.name.startsWith("jolt-")){
                    joltElements.push({element: element,
                                    eventName: attr.name.replace("jolt-", ""),
                                    methodName: attr.value})
                }
            })
        });
        return joltElements;
    }

    /**
     * Sets event listeners on all elements
     * @param {HTMLElement} parsedTemplate 
     * @returns {Promise<HTMLElement>}
     */
    async _setEventListeners(parsedTemplate){
        const joltElements = this._getElementsWithJoltEvent(parsedTemplate);
        for(let joltElement of joltElements){
            // @ts-ignore
            const elem = joltElement.element;
            // @ts-ignore
            const eventName = joltElement.eventName;
            // @ts-ignore
            const methodName = joltElement.methodName;
            elem.addEventListener(eventName, async function(event){
                let args = this._getAllArgs(elem)
                if(Object.keys(args).length != 0){
                    await this.methods[methodName].bind(this)(elem, event, args);
                }else{
                    await this.methods[methodName].bind(this)(elem, event);
                }
            }.bind(this))
        }
        return parsedTemplate;
    }

    /**
     * Registers component on application
     * @param {App} app 
     * @returns {Promise<void>}
     */
    async _registerApp(app){
        if(!this._app){
            this._app = app;
            if(this.dataField){
                try{
                    this._app._dataMapping[this.dataField].push(this);
                }catch(err){
                    throw new DataMappingError("Data mapping error", this.name, this.dataField);
                }
            }
            for(let subcomponent in this.subcomponents){
                await this.subcomponents[subcomponent]._registerApp(app);
            }
        }
    }

    /**
     * Reloads data of Component
     * @param {any} data 
     * @returns {Promise<void>}
     */
    async _reloadData(data){
        this._data = data
        if(this._active === true && this.reloadOnDataChange != false) await this._reloadComponent()
    }

    /**
     * Gets data from the application instance
     * @param {string} field 
     * @returns {any}
     */
    getData(field){
        return this._app.getData(field);
    }

    /**
     * Sets data on the application data object
     * @param {string} field 
     * @param {any} data
     * @returns {Promise<any>} 
     */
    async setData(field, data){
        await this._app.setData(field, data)
    }

    /**
     * Parses provided query string
     * @param {string} queryString 
     * @returns {Object.<string, string|number>}
     */
    parseQueryParams(queryString){
        return this.app.parseQueryParams(queryString);
    }

    /**
     * Stringifies object with query parameters
     * @param {Object.<string, string|number>} queryParams 
     * @returns {string}
     */
    stringifyQueryParams(queryParams){
        return this.app.stringifyQueryParams(queryParams);
    }

    /**
     * Registers subcomponents with this Component
     * @param {Object.<string, Component>} subcomponents 
     * @returns {void}
     */
    registerSubcomponents(subcomponents){
        this.subcomponents = subcomponents
        for(let subcomponent in this.subcomponents){
            this.subcomponents[subcomponent]._parent = this;
        }
    }

    /**
     * Hydrates template with Jolt functionality
     * @param {Document} parsedTemplate 
     * @returns {Promise<Document>}
     */
    async _hydrate(parsedTemplate){
        // @ts-ignore
        parsedTemplate = await this._setEventListeners(parsedTemplate);
        // @ts-ignore
        parsedTemplate = await this._setAnimations(parsedTemplate);
        return parsedTemplate
    }

    /**
     * Inserts HTML elements into current markup of component
     * @param {Document} parsedTemplate 
     * @returns {Promise<void>}
     */
    async _insertHtmlElements(parsedTemplate){
        // @ts-ignore
        const parsedElements = Array.from(parsedTemplate.body.childNodes)
                                    .filter(node => node.nodeType === Node.ELEMENT_NODE);
        const container = document.querySelector(this.container);
        if(!container){
            throw new ComponentContainerError("Could not find component container", this.name, this.container);
        }
        if(this.renderOptions.delete){
            container.innerHTML = '';
        }
        if(parsedElements){
            parsedElements.reverse().forEach(node => {
                // @ts-ignore
                container.insertAdjacentElement(this.renderOptions.insert, node);
            })
        }
    }

    /**
     * Envokes templating engine if set in configs (renderOptions)
     * @param {string} template 
     * @returns {string}
     */
    _templatingEngine(template){
        if(!this._templateFn && this.renderOptions?.useEngine){
            // @ts-ignore
            this._templateFn = dot.template(template);
        }
        if(this.renderOptions?.useEngine){
            template = this._templateFn(this._app.data);
        }
        return template
    }

    /**
     * Reloads component
     * @returns {Promise<void>}
     */
    async _reloadComponent() {
        let template = await this._template();
        template = this._templatingEngine(template)
        let parsedTemplate = this._domParser.parseFromString(template, "text/html");
        // @ts-ignore
        parsedTemplate = await this._hydrate(parsedTemplate)
        await this._insertHtmlElements(parsedTemplate);
        for(let component in this.subcomponents){
            await this.subcomponents[component]._reloadComponent()
        }
    }


    /**
     * Generates component
     * @returns {Promise<string>}
     */
    async generateComponent() {
        if(this._authenticationRequired && !this._app._authenticator._isAuthenticated){
            return this._signals.redirect;
        }
        const containerElement = document.querySelector(this.container);
        // @ts-ignore
        containerElement.setAttribute("identifier", this._identifier);
        // @ts-ignore
        containerElement.component = this;
        for(let method in this.beforeGenerate){
            await this.beforeGenerate[method].bind(this)();
        }
        let template = await this._template();
        template = this._templatingEngine(template)
        let parsedTemplate = this._domParser.parseFromString(template, "text/html");
        parsedTemplate = await this._hydrate(parsedTemplate)
        await this._insertHtmlElements(parsedTemplate);
        for(let method in this.afterGenerate){
            await this.afterGenerate[method].bind(this)();
        }
        for(const component of Object.keys(this.subcomponents)){
            await this.subcomponents[component].generateComponent();
        }
        for(const intervalMethod of this.intervalMethods){
            // @ts-ignore
            let id = setInterval(intervalMethod[0].bind(this), intervalMethod[1]);
            // @ts-ignore
            this._intervalMethodsIds.push(id);
        }
        for(let method in this.beforeActive){
            await this.beforeActive[method].bind(this)();
        }
        this._active = true;
        for(let method in this.afterActive){
            await this.afterActive[method].bind(this)();
        }
        return this._signals.success;
    }

    /**
     * Deconstructs component
     * @returns {Promise<void>}
     */
    async deconstructComponent() {
        for(let method in this.beforeDeconstruct){
            await this.beforeDeconstruct[method].bind(this)()
        }
        for(const id of this._intervalMethodsIds){
            clearInterval(id);
        }
        this._intervalMethodsIds = [];
        for(const component of Object.keys(this.subcomponents)){
            await this.subcomponents[component].deconstructComponent();
        }
        // @ts-ignore
        document.querySelector(this.container).innerHTML = '';
        for(let method in this.afterDeconstruct){
            await this.afterDeconstruct[method].bind(this)()
        }
        this._active = false;
        for(let method in this.afterDeactive){
            await this.afterDeactive[method].bind(this)()
        }
        const containerElement = document.querySelector(this.container);
        // @ts-ignore
        containerElement.removeAttribute("identifier");
        // @ts-ignore
        containerElement.component = null;
    }

    /**
     * Makes redirect event
     * @param {string} path 
     * @returns {void}
     */
    makeRedirect(path){
        const redirectEvent = new CustomEvent(Authenticator.redirectNavEventName, {
            bubbles: true,
            detail: {redirectTo: path}
        });
        // @ts-ignore
        this.DOM.dispatchEvent(redirectEvent);
    }

    /**
     * Forces component reload
     * @returns {Promise<void>}
     */
    async forceReload(){
        await this._reloadComponent()
    }

    //setters and getters
    get parent(){
        return this._parent
    }

    /**
     * Sets template cache if it is enabled in renderOptions
     * @param {string} cache 
     */
    set templateCache(cache){
        this._templateCache = cache;
    }

    /**
     * Returns chached template
     * @return {string|undefined}
     */
    get templateCache(){
        return this._templateCache;
    }

    /**
     * Sets new query parameter string
     * @param {string} params 
     */
    set queryParams(params){
        // @ts-ignore
        this._app.queryParams = params;
    }

    /**
     * Returns query params
     * @return {string|undefined}
     */
    get queryParams(){
        return this._app.queryParams;
    }

    /**
     * Returns current app path
     * @returns {string|null|undefined}
     */
    get path(){
        return this._app.path;
    }

    /**
     * Returns current url hash
     * @returns {string|undefined}
     */
    get hash(){
        return this._app.hash;
    }

    /**
     * Returns application class instance
     * @returns {App}
     */
    get app(){
        return this._app;
    }

    /**
     * Returns component data field from application data object if dataField parameter is set
     * @returns {any|null}
     */
    get data(){
        if(this.dataField){
            return this._data
        }
        return null;
    }

    /**
     * Returns application container element and all its sub-elements
     * @returns {Element|null}
     */
    get appDOM(){
        return this._app.DOM;
    }

    /**
     * Returns component container element and all its sub-elements
     * @returns {Element|null}
     */
    get DOM(){
        return document.querySelector(this.container);;
    }

    /**
     * Returns application properties if set
     * @returns {any|null|undefined}
     */
    get properties(){
        return this._app.properties;
    }

    /**
     * Returns authenticated user from the Authenticator
     * @returns {any|undefined}
     */
    get authenticatedUser(){
        return this._app.authenticatedUser;
    }

    /**
     * Returns boolean if Authenticated user is set or not
     * @returns {boolean}
     */
    get isAuthenticated(){
        return this._app.isAuthenticated;
    }

    /**
     * Returns true or false if authentication for this component is required
     * @returns {boolean}
     */
    get authenticationRequired(){
        return this._authenticationRequired;
    }

    /**
     * Sets if authentication is required for this component
     * @return {void}
     */
    set authenticationRequired(authentication){
        this._authenticationRequired = authentication;
    }
}

export default Component;