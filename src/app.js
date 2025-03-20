/**
 * Base app component that wraps everything
 */
import Router from "./router.js";
import Authenticator from "./authenticator.js";
import { transformSelector } from "./selectorParser/index.js"
import { CustomElement } from "./baseCore.js";
//import { DiffDOM, nodeToObj, stringToObj } from "diff-dom/dist/index.js";
import Diff from "./diff/diff.js";
/**
 * @typedef {import('./types.js').AppConfigs} AppConfigs
 */

/**
 * @typedef {Object} DataEventNum
 * @property {string} CHANGE,
 * @property {string} QUERYCHANGE
 */

/**
 * @type {DataEventNum}
 */
const dataEventEnum = {
    "CHANGE": "app-data-change",
    "QUERYCHANGE": "query-data-change"
}

/**
 * Converts a camelCase string to kebab-case.
 * @param {string} str - The input camelCase string.
 * @returns {string} - The converted kebab-case string.
 */
export function camelToKebab(str){
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * SVG element attributes that must remain in camalCase
 */
const svgCamelCaseAttributes = new Set([
    "viewBox", "preserveAspectRatio", "patternTransform", "clipPathUnits"
]);

class QueryClass{

    /**
     * Container element of the app
     * @type {HTMLElement|Element}
     * @property {App} app
     */
    container;

    constructor(){

    }

    /**
     * @param {string} selector
     * @returns {HTMLElement|undefined}
     */
    querySelector = (selector) => {
        return this.container.querySelector(selector);
    }
    /**
     * @param {string} selector
     * @returns {NodeList}
     */
    querySelectorAll = (selector) => {
        return this.container.querySelectorAll(selector);
    }
    /**
     * @param {string} selector
     * @returns {HTMLElement|undefined}
     */
    getElementById = (selector) => {
        return this.container.querySelector(`#${selector}`);
    }
    /**
     * @param {string} selector
     * @returns {HTMLCollectionOf}
     */
    getElementsByClassName = (selector) => {
        return this.container.getElementsByClassName(selector);
    }
    /**
     * @param {string} selector
     * @returns {HTMLCollectionOf}
     */
    getElementsByTagName = (selector) => {
        return this.container.getElementsByTagName(selector);
    }
    /**
     * @param {string} selector
     * @returns {boolean}
     */
    matches = (selector) => {
        return this.container.matches(selector);
    }

    /**
     * Adds event listener to application container
     * @param {string} eventType - name of event
     * @param {(event: Event) => void} func - callback function for event
     */
    addEventListener = (eventType, func) => {
        this.container.addEventListener(eventType, func)
    }

    /**
     * Removes event listener from application container
     * @param {string} eventType - name of event
     * @param {(event: Event) => void} func - callback function for event
     */
    removeEventListener = (eventType, func) => {
        this.container.removeEventListener(eventType, func);
    }

    /**
     * @param {InsertPosition} position
     * @param {string} markup
     */
    insertAdjacentHTML = (position, markup) => {
        this.container.insertAdjacentHTML(position, markup);
    }

    /**
     * @returns {HTMLCollection}
     */
    get children(){
        return this.container.children;
    }

    /**
     * @returns {NodeListOf}
     */
    get childNodes(){
        return this.container.childNodes;
    }
}


class App extends QueryClass{

    /**
     * @type {string}
     */
    identifier = "app";

    /**
     * @type {string}
     */
    #appName;

    /**
     * @type {Map<string, any>}
     */
    #dataStructure = new Map();

    /**
     * @type {Object<string, CallableFunction>}
     */
    #beforeInit

    /**
     * @type {Object<string, CallableFunction>}
     */
    #afterInit

    /**
     * Application properties
     * @type {Object<string, any>}
     */
    #properties

    /**
     * @type {CallableFunction}
     */
    _router;
    /**
     * App router
     * @type {Router}
     */
    #router;

    /**
     * @type {CallableFunction}
     */
    _authenticator;
    /**
     * App authenticator
     * @type {Authenticator
     */
    #authenticator

    /**
     * @type {Object<string, CallableFunction>}
     */
    _extensions;
    /**
     * Application extensions
     * @type {Object<string, CallableFunction>|undefined}
     */
    #extensions;

    /**
     * @type {Object<string, HTMLElement>}
     */
    #elements;

    /**
     * Custom render functions
     * @type {Object<string, CallableFunction>}
     * @private
     */
    _renderFunctions;

    /**
     * @type {string[]}
     */
    #protectedProperties;

    /**
     * Reserved attribute names that should not be manually set
     * @type {Array<string>}
     */
    _filterAttributeNames = ["hashId", "data-hash-id", "hash-id",
                            "parentId", "data-parent-id", "parent-id",
                            "renderTime", "data-render-time", "render-time",
                            "bind", "data-bind",
                            "bindId", "data-bind-id", "bind-id"];

    /**
     * Creates app html element
     * @param {AppConfigs} configs
     */
    constructor({ appName, dataStructure = {}, elements = {}, renderFunctions = {},
        router = null, authenticator = null, extensions = {}, properties = {}, methods = {},
        beforeInit = {}, afterInit = {}, errorPages = null }){
        super();
        if(!appName){
            throw new Error("Missing appName parameter");
        }
        this.#appName = appName;
        this.#createDataStructure(dataStructure)
        this.#elements = elements;
        this._router = router;
        this._authenticator = authenticator;
        this._extensions = extensions;
        this._renderFunctions = renderFunctions;
        this._errorPages = errorPages;
        this.#properties = properties;
        this.#beforeInit = beforeInit;
        this.#afterInit = afterInit;
        this._methods = methods;
        this.#protectedProperties = Object.getOwnPropertyNames(this);
    }

    /**
     * Initilizer function for application
     * Kicks of all neccessary steps
     * @param {string} target - query selector for application container
     */
    init = async (target) => {
        const container = document.querySelector(target);
        if(!container){
            throw new Error("Could not find application container with selector: " + target);
        }
        this.containerId = target;
        this.container = container;
        this.container.setAttribute("app-id", this.generateHash());
        // @ts-ignore
        this.container.app = this;
        this.registerCustomElements(this.#elements);
        this.registerCustomElements(this._errorPages);
        this._modifyPrototypeMethods();
        if(this._authenticator){
            this.#authenticator = this._authenticator(this);
        }
        this.#assignMethods();
        await this.#runMethods(this.#beforeInit);
        if(this._router){
            this.#router = this._router(this);
        }
        await this.#initializeExtensions();
        if(this.#router){
            await this.#router.route();
        }
        await this.#waitForSubelements();
        await this.#runMethods(this.#afterInit);
    }

    #assignMethods = () => {
        for(const [name, method] of Object.entries(this._methods)){
            if(this.#protectedProperties.includes(name) || name.startsWith("#") || name.startsWith("_")){
                throw new Error(`Illegal or protected method name. Can't assign method with name (${name})
                    that is protected or if it is of illegal format (startswith: # or _) to application`);
            }
            try{
                this[name] = method.bind(this);
            }catch(e){
                throw new Error(`${method} is probably not a function. Failed to bind method ${method} to application.` + e)
            }
        }
        this._methods = null;
    }

    isCustomElement(node){
        return (
            node instanceof CustomElement &&
            customElements.get(node.tagName.toLowerCase())
        )
    }

    /**
     * Modifies prototype methods of HTMLElement
     * insertAdjacentHTML
     * innerHTML
     * outerHTML
     * appendChild
     * setAttribute
     * removeAttribute
     *
     * Modifies prototype method for query selectors on Element and Document
     * querySelector
     * querySelectorAll
     */
    _modifyPrototypeMethods = () => {
        this._originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML').set; //copy of original innerHTML property setter
        this._originalOuterHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'outerHTML').set; //copy of original outerHTML property setter
        this._originalInsertAdjacentHTML = Element.prototype.insertAdjacentHTML; //copy of the original insertAdjacentHTML method
        this._originalAppendChild = Element.prototype.appendChild;
        this._originalSetAttribute = Element.prototype.setAttribute; // copy of original setAttribute method
        this._originalRemoveAttribute = Element.prototype.removeAttribute; //copy of removeAttribute method
        const appInstance = this; //closure to retain reference to app instance
        Element.prototype.insertAdjacentHTML = function(position, html, ){
            //"this" refers to the element the operation is being performed on

            /**
             * @type {CustomElement}
             */
            const customElement = this.closest("[data-hash-id]");
            if(!customElement){
                return appInstance._originalInsertAdjacentHTML.call(this, position, html);
            }
            //html = customElement._processDataBinds(html);
            const renderedTemplate = customElement._dotJSengine(html)
            appInstance._originalInsertAdjacentHTML.call(this, position, renderedTemplate);
            customElement._hydrate();
            customElement.clearTemplateVariables();
        }
        Object.defineProperty(Element.prototype, 'innerHTML',  {
            set: function(html){
                //this points to the element whos innerHTML changes.
                //appInstance._originalInnerHTML.call(this, "");
                //this.insertAdjacentHTML("afterbegin", html);

                //DiffDOM
                const customElement = this.closest("[data-hash-id]");
                if(!customElement){
                    appInstance._originalInnerHTML.call(this, html);
                    return;
                }
                const diff = new Diff({
                    targetElement: this,
                    newMarkup: html,
                    customElement: customElement
                });
                diff.setInnerHTML();
                customElement._hydrate();
                customElement.clearTemplateVariables();
            }
        });
        Object.defineProperty(Element.prototype, 'outerHTML', {
            set: function(html){
                //this points to the element which outerHTML is changed
                //tries to find the parent (custom) element of the element that changes outerHTML
                const customElement = this.parent?.closest("[data-hash-id]");
                if(customElement){
                    const renderedTemplate = customElement._dotJSengine(html)
                    appInstance._originalOuterHTML.call(this, renderedTemplate);
                    customElement._hydrate();
                    return;
                }
                appInstance._originalOuterHTML.call(this, html);
            }
        });

        // Override setAttribute
        Element.prototype.setAttribute = function (name, value) {
            let attrName = name.startsWith(":") ? `data-${name.substring(1)}` : name;
            if (!(this instanceof SVGElement && svgCamelCaseAttributes.has(attrName))) {
                attrName = camelToKebab(attrName);
            }
            appInstance._originalSetAttribute.call(this, attrName, value);
            if(this instanceof CustomElement){
                this._refreshBoundElements(`attrs.${attrName.replace("data-", "")}`)
            }
        };

        //adds setAttributes method to Element prototype
        /**
         * maps key-value pairs to element attributes
         * @param {Object<string, any>} attrs
         */
        // @ts-ignore
        Element.prototype.setAttributes = function (attrs) {
            for (const [key, value] of Object.entries(attrs)) {
                this.setAttribute(key, value);
            }
        }

        // Override removeAttribute
        Element.prototype.removeAttribute = function (name, value) {
            const attrName = name.startsWith(":") ? `data-${name.substring(1)}` : name;
            appInstance._originalRemoveAttribute.call(this, attrName, value);
            if(this instanceof CustomElement){
                this._refreshBoundElements(`attrs.${attrName.replace("data-", "")}`)
            }
        };

        this._originalDocQS   = Document.prototype.querySelector;
        this._originalDocQSA  = Document.prototype.querySelectorAll;
        this._originalElQS    = Element.prototype.querySelector;
        this._originalElQSA   = Element.prototype.querySelectorAll;

        // 2) Patch Document methods
        Document.prototype.querySelector = function(selector) {
            const newSelector = transformSelector(selector)
            return appInstance._originalDocQS.call(this, newSelector);
        };

        Document.prototype.querySelectorAll = function(selector) {
            const newSelector = transformSelector(selector)
            return appInstance._originalDocQSA.call(this, newSelector);
        };

        // 3) Patch Element methods
        Element.prototype.querySelector = function(selector) {
            const newSelector = transformSelector(selector)
            return appInstance._originalElQS.call(this, newSelector);
        };

        Element.prototype.querySelectorAll = function(selector) {
            const newSelector = transformSelector(selector)
            return appInstance._originalElQSA.call(this, newSelector);
        };

    }

    /**
     * Initializes all application extensions
     * @returns {Promise<void>}
     */
    #initializeExtensions = async () => {
        if(this._extensions){
            this.#extensions = {};
            for(const [key, initializer] of Object.entries(this._extensions)){
                this.#extensions[key] = await initializer(this);
            }
        }
    }

    /**
     * Runs all methods in provided object
     * @param {Object<string, CallableFunction>} methods
     * @returns {Promise<void>}
     */
    #runMethods = async (methods) => {
        for(const [key, func] of Object.entries(methods)){
            await func.bind(this)()
        }
    }

    /**
     * Maps provided data structure object to data map
     * @param {Object<string, any>} dataStructure
     */
    #createDataStructure = (dataStructure) => {
        for(const [field, value] of Object.entries(dataStructure)){
            this.#dataStructure.set(field, value);
        }
    }

    /**
     * Method to wait for all custom subelements to finish loading/rendering
     * Returns array with subelement promises to be resolved upon initialization
     * @returns {Promise<Array<Promise>>}
     */
    #waitForSubelements = async () => {
        const subelementPromises = [];
        const allCustomElements = Array.from(this.querySelectorAll('*')).filter(
            (el) => {
                return el instanceof CustomElement
            }
        );
        allCustomElements.forEach(elem => {
            subelementPromises.push(elem.initComplete);
        })
        return await Promise.all(subelementPromises);
    }

    /**
     * Sets data to application data storage
     * @param {string} field
     * @param {any} data
     */
    setData = (field, data) => {
        if(!this.#dataStructure.has(field)){
            throw new Error(`Failed to set data. Missing data field ${field} in app data structure`);
        }
        this.#dataStructure.set(field, data);
        this.#dataChangeEvent(field);
    }

    /**
     * Removes data from app data (sets as null). Convenience method for setData(field, null);
     * @param {string} field
     */
    removeData = (field) => {
        if(!this.#dataStructure.has(field)){
            throw new Error(`Failed to set data. Missing data field ${field} in app data structure`);
        }
        this.#dataStructure.set(field, null);
        this.#dataChangeEvent(field);
    }

    /**
     * Gets data from application data storage
     * @param {string} field
     * @returns {any|undefined}
     */
    getData = (field) => {
        if(!this.#dataStructure.has(field)){
            throw new Error(`Failed to fetch data for field ${field}. Data field does not exist`);
        }
        return this.#dataStructure.get(field);
    }

    /**
     * Returns entire data structure as Map or object
     * @returns {Map|Object<string, any>}
     */
    getAllData = (asObject = false) => {
        if(asObject){
            return Object.fromEntries(this.#dataStructure);
        }
        return this.#dataStructure;
    }

    /**
     * Emits event for application dta change
     * @param {string} field
     */
    #dataChangeEvent = (field) => {
        const event = new CustomEvent(dataEventEnum.CHANGE, {
            detail: {field: camelToKebab(field)}
        });
        this.container.dispatchEvent(event);
    }

    /**
     * Emits event for application dta change
     * @param {string} key
     * @param {string} value
     */
    #queryChangeEventKey = (key, value) => {
        const event = new CustomEvent(dataEventEnum.QUERYCHANGE, {
            detail: {key, value}
        });
        this.container.dispatchEvent(event);
    }

    #queryChangeEvent = () => {
        const event = new CustomEvent(dataEventEnum.QUERYCHANGE, {
            detail: {query: this.queryParams}
        });
        this.container.dispatchEvent(event);
    }

    /**
     * Performs redirect
     * @param {string} pathname
     */
    redirect = (pathname) => {
        if(!this.router){
            throw new Error("Redirect is only available with Router")
        }
        this.router.redirect(pathname);
    }

    /**
     * Returns the app instance (this). Implemented for
     * compatibility with customElement instances
     */
    get app(){
        return this;
    }

    /**
     * Getter for application properties set as an object
     */
    get properties(){
        return this.#properties;
    }

    /**
     * Getter for application name
     */
    get appName(){
        return this.#appName;
    }

    /**
     * Getter for router
     */
    get router(){
        if(!this.#router){
            throw new Error("Router is not installed with Application.")
        }
        return this.#router;
    }

    /**
     * Getter for authenticator
     */
    get authenticator(){
        if(!this.#authenticator){
            throw new Error("Authenticator is not installed with the Application.")
        }
        return this.#authenticator;
    }

    get authenticatorInstalled(){
        if(!this.#authenticator){
            return false;
        }
        return true;
    }

    /**
     * Returns object with initialized extensions
     */
    get ext(){
        return this.#extensions;
    }

    /**
     * Registers custom elements
     * @param {Object<string|number, HTMLElement>} elements
     */
    registerCustomElements = (elements) => {
        if(!elements){
            return;
        }
        for(const elem of Object.values(elements)){
            //In case of error pages the same error page might be used for different
            //error codes. This prevents the duplicate custom element tag error.
            if(!customElements.get(elem.tagName)){
                customElements.define(elem.tagName, elem);
            }
        }
    }

    /**
     * Converts the location.search string to an object of key-value pairs
     * @param {string} search - location.search string
     * @returns {Object<string, string>|{}}
     */
    queryParamsToObject = (search) => {
        const searchParams = new URLSearchParams(search);
        const params = {};
        for (const [key, value] of searchParams.entries()) {
            params[key] = value;
        }
        return params;
    }

    /**
     * Returns location.search params (query params) either as object (true) or as a string (false)
     * Default: false
     * @param {boolean} toObject
     * @returns {string|Object<string, string>|{}}
     */
    getQueryParams = (toObject = false) => {
        if(!toObject){
            return location.search;
        }
        return this.queryParamsToObject(location.search);
    }

    /**
     * @returns {Object<string, string>}
     */
    get queryParams(){
        return this.queryParamsToObject(location.search);
    }

    /**
     * Sets new query(search) parameters to url based on the
     * provided queryParamsObject
     * @param {Object<string, string>|{}} queryParamsObject
     */
    set queryParams(queryParamsObject){
        const url = new URL(window.location.origin + window.location.pathname);
        for(const [key, value] of Object.entries(queryParamsObject)){
            url.searchParams.set(key, value);
        }
        window.history.replaceState(null, null, url); // or pushState
        for(const [key, value] of Object.entries(queryParamsObject)){
            this.#queryChangeEventKey(key, value);
        }
        this.#queryChangeEvent();
    }

    /**
     * Removes query parameters in provided array
     * @param {Array<string>} names
     */
    removeQueryParams(names){
        const queryParams = this.queryParams;
        const newQueryParams = {};
        for(const [key, value] of Object.entries(queryParams)){
            if(!names.includes(key)){
                newQueryParams[key] = value;
            }
        }
        this.queryParams = newQueryParams;
    }

    /**
     * Generates a random hash with provided length. Default is 16
     * @param {number} length
     * @returns {string}
     */
    generateHash = (length = 16) => {
        const array = new Uint8Array(length);
        window.crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    get _elements(){
        return this.#elements;
    }

    /**
     * Getter for url hash
     * @returns {string}
     */
    get hash(){
        return location.hash;
    }

    /**
     * Getter for port number
     * @returns {string}
     */
    get port(){
        return location.port;
    }

    /**
     * Getter for hostname
     * @returns {string}
     */
    get hostname(){
        return location.hostname;
    }

    /**
     * Getter for host
     * @returns {string}
     */
    get host(){
        return location.host;
    }

    /**
     * Getter for pathname
     * @returns {string}
     */
    get pathname(){
        return location.pathname;
    }

    /**
     * Getter for origin
     * @returns {string}
     */
    get origin(){
        return location.origin;
    }

    /**
     * Returns object with route parameters
     * @returns {Object<string, string|number>}
     */
    get routeParameters(){
        return this.router.routeParameters;
    }

    /**
     * Returns object with all available render functions
     * @returns {Object<string, CallableFunction>}
     */
    get renderFunctions(){
        return this._renderFunctions;
    }
}

export default App;

export {
    dataEventEnum
}

