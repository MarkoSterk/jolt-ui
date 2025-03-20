/**
 * Base class for custom elements
 */
import App, { dataEventEnum, camelToKebab } from "./app.js";
import Authenticator from "./authenticator.js";
import Router from "./router.js";
import doT from "./dot.js";
import { routeEventsEnum } from "./router.js";

/**
 * @typedef {import('./types.js').ElementFactoryConfigs} ElementFactoryConfigs
 */

const templateSettings = {
    evaluate:    /\{\{([\s\S]+?)\}\}/g,
    interpolate: /\{\{=([\s\S]+?)\}\}/g,
    encode:      /\{\{!([\s\S]+?)\}\}/g,
    use:         /\{\{#([\s\S]+?)\}\}/g,
    define:      /\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g,
    conditional: /\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}/g,
    iterate:     /\{\{~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})/g,
    varname: 'it',
    strip: true,
    append: true,
    selfcontained: false,
    dataBinds: new Map(),
    def: {}
}

/**
 * Generates message id with random number
 * @param {number} max 
 * @param {number} min 
 * @returns {number}
 */
function randomId(max = 10000, min = 1){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * @this {CustomElement}
 * @typedef {Object} ValueAccessor
 * @property {() => any} get - Retrieves the value.
 * @property {(value: any) => void} set - Updates the value and refreshes bound elements.
 */

/**
 * Factory function that creates a getter/setter accessor function.
 * @this {CustomElement}
 * @param {any} initValue - The initial value to be assigned.
 * @returns {(name: string) => ValueAccessor} A function that takes a key name and returns an accessor with `get` and `set` methods.
 */
function defineValue(initValue){
    return function defineValueInner(name){
        const _initValue = window.structuredClone(initValue);
        if(![undefined, null].includes(_initValue)){
            this["_values"][name] = _initValue;
        }
        return {
            /**
             * @this {CustomElement}
             * @returns {any}
             */
            get(){
                return this["_values"][name]
            },
            /**
             * @this {CustomElement}
             * @param {any} value 
             */
            set(value){
                this["_values"][name] = value;
                this._refreshBoundElements(camelToKebab(name));
            }
        }
    }
}

/**
 * @typedef {Object} QuerySelectorAccessor
 * @property {() => Element|null} get - Retrieves the first matching element using `querySelector`.
 */

/**
 * Factory function that creates a getter for `querySelector`.
 * @this {CustomElement}
 * @param {string} selector - A valid CSS selector string.
 * @returns {() => QuerySelectorAccessor} A function that returns an accessor object with a `get` method.
 * @throws {Error} If the selector is missing, null, or an empty string.
 */
function querySelector(selector){
    if([undefined, null, ""].includes(selector)){
        throw new Error("Missing or invalid query selector for querySelector getter factory")
    }
    return function querySelectorInner(){
        const _selector = selector;
        return {
            /**
             * Gets the first matching element within the current context.
             * @this {CustomElement}
             * @returns {Element|null} The first matching element or `null` if none is found.
             */
            get(){
                return this.querySelector(_selector);
            }
        }
    }
}

/**
 * @typedef {Object} QuerySelectorAllAccessor
 * @property {() => NodeListOf<Element>} get - Retrieves all matching elements using `querySelectorAll`.
 */

/**
 * Factory function that creates a getter for `querySelectorAll`.
 * @this {CustomElement}
 * @param {string} selector - A valid CSS selector string.
 * @returns {() => QuerySelectorAllAccessor} A function that returns an accessor object with a `get` method.
 * @throws {Error} If the selector is missing, null, or an empty string.
 */
function querySelectorAll(selector){
    if([undefined, null, ""].includes(selector)){
        throw new Error("Missing or invalid query selector for querySelector getter factory")
    }
    return function querySelectorAllInner(){
        const _selector = selector;
        return {
            /**
             * Gets all matching elements within the current context.
             * @this {CustomElement}
             * @returns {NodeListOf<Element>}
             */
            get(){
                return this.querySelectorAll(_selector);
            }
        }
    }
}

const html = String.raw;
const css = String.raw
export {
    html,
    css,
    randomId,
    defineValue,
    querySelector,
    querySelectorAll
}

class CustomElement extends HTMLElement{

    constructor(){
        super();
        this.resolveInitialization = null;
        this.initComplete = null;
        this._startInitilization();
    }

    _startInitilization = () => {
        this.resolveInitialization = null;
        this.initComplete = new Promise((resolve) => {
            this.resolveInitialization = resolve;
        });
    }

    /**
     * @type {Promise<void>}
     */
    initComplete;

    /**
    * Element tagName
    * @type {string}
    */
    static tagName;

    /**
     * Component methods
     * @type {Object<string, CallableFunction}
     */
    _methods;

    /**
     * Component markup method
     * @type {CallableFunction}
     * @async
     */
    markup;

    /**
     * Component css method
     * @type {Object<string, CallableFunction|string>}
     */
    css;

    /**
     * If the style should be scoped or not
     * @type {boolean}
     */
    #scopedCss;
    
    /**
     * CSS style string
     * @type {string}
     */
    #style;

    /**
     * Methods that should run before initialization
     * @type {Object<string, CallableFunction>}
     */
    _beforeInit;

    /**
     * Methods that should run after initialization
     * @type {Object<string, CallableFunction>}
     */
    _beforeInitResolve;

    /**
     * Methods that should run after initialization
     * @type {Object<string, CallableFunction>}
     */
    _afterInit;

    /**
     * Methods that should run before rerender
     * @type {Object<string, CallableFunction>}
     */
    _beforeRerender;

    /**
     * Methods that should run after rerender
     * @type {Object<string, CallableFunction>}
     */
    _afterRerender;

    /**
     * Methods that should run after element unmounts (in disconnectedCallback)
     * @type {Object<string, CallableFunction>}
     */
    _afterDisconnect;

    /**
     * App element (main wrapper)
     * @type {App}
     */
    app;

    /**
     * @type {CustomElement}
     */
    _parent;

    /**
     * Class for virtual render div
     * @type {string}
     */
    #virtualRenderDiv = "virtual-render-div";

    /**
     * Getter/setter defined values
     * @type {Object<string, any>}
     */
    _values = {};

    /**
     * Array with protected properties of the object
     * @type {Array<string>}
     */
    #protectedProperties;

    /**
     * Template engine settings
     * @type {Object<string, any>}
     */
    #templateSettings;

    /**
     * @type {Object<string, CallableFunction>}
     */
    _templateFunctions = {};

    /**
     * @type {Object<string, any>}
     */
    _templateVariables;

    /**
     * @type {Object<string, Object<string, CallableFunction>>}
     */
    _define;



    async connectedCallback(){
        if([true, "true", "", "defer"].includes(this.getAttribute("defer"))){
            this.resolveInitialization();
            return;
        }
        try{
            await this.#init();
        }catch(e){
            this._abort = true;
            this.resolveInitialization();
            console.log(`Failed to initilize element ${this.tagName}`);
            console.error(e);
        }
    }

    initElement = () => {
        this.#init();
    }

    /**
     * Initilizer method of element. Triggered in the connectedCallback
     * @returns {Promise<void>}
     */
    #init = async () => {
        this._startInitilization();
        this._abort = false;
        //finds app container and gets the app instance object from it
        // @ts-ignore
        const app = this.closest("[app-id]")?.app; //app-identifier="app"
        if(!app){
            throw new Error("Could not find container with application.")
        }
        this.app = app;
        this.app.addEventListener(routeEventsEnum.ABORTROUTETRANSITION, this.#abortInitilization);
        this.rndId = randomId();
        this.hashId = this.getAttribute("data-hash-id") || this.generateHash();
        if(!this.getAttribute("data-hash-id")){
            this.setAttribute("data-hash-id", this.hashId);
        }
        if(!this.getAttribute("data-parent-id")){
            let parent = this.parentElement.closest("[data-hash-id]");
            if(parent){
                this.setAttribute("data-parent-id", parent.getAttribute("data-hash-id"));
                // @ts-ignore
                this._parent = parent;
            }
        }
        this._templateVariables = {};
        this.#templateSettings = window.structuredClone(templateSettings)
        this.#assignTemplateFunction();
        this.#protectedProperties = Object.getOwnPropertyNames(this);
        this.#assignMethods();
        this.#assignDefinedGettersAndSetters();
        await this.#runMethods(this._beforeInit);
        this.app.addEventListener(dataEventEnum.CHANGE, this._updateBoundAppDataParts);
        this.app.addEventListener(dataEventEnum.QUERYCHANGE, this._updateBoundQueryDataParts);
        await this.#handleCssStyle();
        await this.render();
        if(this._abort){
            this.resolveInitialization();
            return;
        }
        await this.#waitForSubelements();
        await this.#runMethods(this._beforeInitResolve);
        this.resolveInitialization();
        await this.#runMethods(this._afterInit);
    }

    /**
     * Disconnected callback for element
     */
    disconnectedCallback(){
        this.app.removeEventListener(dataEventEnum.CHANGE, this._updateBoundAppDataParts);
        this.app.removeEventListener(dataEventEnum.QUERYCHANGE, this._updateBoundQueryDataParts);
        const style = document.head.querySelector(`style[data-parent-id="${this.hashId}"]`);
        if(style){
            style.remove();
        }
        this.#runMethods(this._afterDisconnect)
    }

    #abortInitilization = (event) => {
        this._abort = true;
        this.resolveInitialization();
    }

    #assignTemplateFunction = () => {
        for(const [name, func] of Object.entries(this._templateFunctions)){
            this.#templateSettings.def[name] = func.bind(this);
        }
    }

    #assignDefinedGettersAndSetters = () => {
        for(const [prop, methods] of Object.entries(this._define)){
            if(this.#protectedProperties.includes(prop) || prop.startsWith("#") || prop.startsWith("_")){
                throw new Error(`Illegal or protected property name. Can't assign property with name (${prop}) that is protected or if it is of illegal format (startswith: # or _) to element ${this.tagName}`);
            }
            if(typeof methods === "function"){
                // @ts-ignore
                Object.defineProperty(this, prop, methods.bind(this)(prop));
            }else{
                let modifiedGetterAndSetter = {
                    get(){
                        return methods.get.bind(this)();
                    },
                }
                if(methods.set){
                    modifiedGetterAndSetter = {
                        ...modifiedGetterAndSetter,
                        set(value){
                            methods.set.bind(this)(value);
                            this._refreshBoundElements(prop);
                        }
                    }
                }   
                Object.defineProperty(this, prop, modifiedGetterAndSetter);
            }
        }
    }

    /**
     * Refreshes inner html of all elements bound to this property
     * @param {string} propertyName 
     */
    _refreshBoundElements = (propertyName) => {
        this.renderTime = Date.now()
        this.querySelectorAll(`[data-bind="${propertyName}"]`)?.forEach((elem) => {
            const mapObject = this.#templateSettings.dataBinds.get(propertyName);
            if(!mapObject){
                return;
            }
            const elemId = elem.getAttribute("data-bind-id");
            if(!elemId){
                return;
            }
            const elementTemplate = mapObject[elemId];
            if(!elementTemplate){
                return;
            }
            elem.setAttribute("data-render-time", `${this.renderTime}`);
            elem.innerHTML = elementTemplate;
        })
    }

    _updateBoundAppDataParts = (event) => {
        this._refreshBoundElements(`app.${event.detail.field}`)
    }

    _updateBoundQueryDataParts = (event) => {
        if(event?.detail?.key){
            this._refreshBoundElements(`query.${event.detail.key}`)
        }else{
            this._refreshBoundElements("query");
        }
    }

    #assignMethods = () => {
        for(const [name, method] of Object.entries(this._methods)){
            if(this.#protectedProperties.includes(name) || name.startsWith("#") || name.startsWith("_")){
                throw new Error(`Illegal or protected method name. Can't assign method with name (${name}) 
                    that is protected or if it is of illegal format (startswith: # or _) to element ${this.tagName}`);
            }
            try{
                this[name] = method.bind(this);
            }catch(e){
                throw new Error(`${method} is probably not a function. Failed to bind method ${method} to element ${this.tagName}.` + e)
            }
        }
        this._methods = null;
    }

    #waitForSubelements = async () => {
        const subelementPromises = [];
        const allCustomElements = Array.from(this.querySelectorAll('*')).filter(
            (el) => {
                return el instanceof CustomElement
            }
        );
        allCustomElements.forEach(elem => {
            // @ts-ignore
            subelementPromises.push(elem.initComplete);
        })
        return await Promise.all(subelementPromises);
    }

    awaitElementsActivation = async () => {
        return await this.#waitForSubelements();
    }

    /**
     * Runs all methods in object
     * @param {Object<string, CallableFunction>} methods 
     */
    #runMethods = async (methods) => {
        for(const [key, func] of Object.entries(methods)){
            await func.bind(this)();
        }
    }


    #handleCssStyle = async () => {
        if(!css){
            return;
        }
        // @ts-ignore
        this.#scopedCss = this?.css?.scoped || false;
        // @ts-ignore
        this.#style = await this.css?.style.bind(this)() || null;
        this.#parseCss();
    }

    #parseCss = () => {
        if(!this.#style){
            return;
        }
        const attributeSelector = `[data-element="${this.tagName.toLowerCase()}"]`
        if(document.head.querySelector(attributeSelector)){
            return;
        }
        // Create a <style> element
        const style = document.createElement('style');
        style.textContent = this.#style;
        
        // Disable the style element to prevent it from applying styles
        style.setAttribute('disabled', '');
        style.setAttribute('data-element', this.tagName.toLowerCase());
        
        // Append the style to the <head> temporarily so that the CSS is parsed
        document.head.appendChild(style);
        
        //if CSS is not scoped it activated the style
        if(!this.#scopedCss){
            style.removeAttribute('disabled');
            return;
        }
        
        // Access the CSSStyleSheet object
        const sheet = style.sheet;
        
        // Function to insert the attribute before pseudo-classes or combinators
        const insertAttribute = (selector, attribute) => {
            // Split the selector by spaces to handle individual parts (e.g., combinators)
            return selector.split(' ').map(part => {
            // Handle pseudo-classes like :hover, :nth-child, etc.
            return part.replace(/([a-zA-Z0-9\.\#\-_]+)([:].*)?/, (match, base, pseudo) => {
                // Append the attribute to the base part, and preserve any pseudo-classes
                return base + attribute + (pseudo || '');
            });
            }).join(' ');
        };
        
        // Loop over each CSS rule and modify the selector
        const newCSSRules = [];
        for (let rule of sheet.cssRules) {
            if (rule instanceof CSSStyleRule) {
            // Modify the selector to append the custom attribute in the correct place
            const scopedSelector = rule.selectorText
                .split(',')
                .map(selector => insertAttribute(selector.trim(), attributeSelector))
                .join(', ');
        
            newCSSRules.push(`${scopedSelector} { ${rule.style.cssText} }`);
            }
            // Handle media queries or other types of rules
            else if (rule instanceof CSSMediaRule) {
            const scopedMediaRules = [];
            for (let mediaRule of rule.cssRules) {
                if (mediaRule instanceof CSSStyleRule) {
                const scopedSelector = mediaRule.selectorText
                    .split(',')
                    .map(selector => insertAttribute(selector.trim(), attributeSelector))
                    .join(', ');
        
                scopedMediaRules.push(`${scopedSelector} { ${mediaRule.style.cssText} }`);
                }
            }
            newCSSRules.push(`@media ${rule.media.mediaText} { ${scopedMediaRules.join(' ')} }`);
            }
        }
        
        // Remove the original disabled style element
        style.textContent = newCSSRules.join('\n');
        style.removeAttribute('disabled');
    }

    /**
     * Should be implemented for template rendering
     * @returns {Promise<string>}
     * @async
     */
    #markup = async () => {
        if(!this.markup){
            throw new Error(`Missing markup method for element ${this.tagName}`);
        }
        try{
            return await this.markup();
        }catch(e){
            throw new Error(`Failed to run markup method of element: ${this.tagName} - ` + e.message);
        }
    }

    /**
     * Renders template of element. Uses markup method.
     * Adds event listeners to elements with appropriate attributes (df-<event>)
     * @async
     * @returns {Promise<void>}
     */
    render = async () => {
        let html = await this.#markup();
        this.innerHTML = html;
    }

    /**
     * Parses the provided string template. Adds all
     * required data-parent tags etc...
     * @param {string} html 
     * @returns {string}
     */
    #parseStringTemplate = (html) => {
        html = this.#replaceAtWithDf(html);
        html = this.#replaceColonWithData(html);
        html = this.#parseCustomElementTags(html);
        const div = document.createElement("div");
        div.classList.add(this.#virtualRenderDiv);
        this.app._originalInsertAdjacentHTML.call(div, "afterbegin", html);
        this.lastRender = Date.now();
        this.#parseConditionals(div);
        return this.#tagAllelementsWithParent(div);
    }

    /**
     * @param {string} html 
     * @returns {string}
     */
    #dotJSengine = (html) => {
        try{
            const templateFn = doT.template.bind(this)(html, this.#templateSettings, undefined);
            let renderedTemplate = templateFn.bind(this)(this._templateVariables);
            this._templateVariables = {};
            return this.#parseStringTemplate(renderedTemplate);
        }catch(e){
            console.error(`Failed to run #dotJSengine for element: `, this);
        }
    }

    /**
     * Runs the dotJS render engine with the provided html string
     * @param {string} html 
     * @returns {string}
     */
    _dotJSengine = (html) => {
        return this.#dotJSengine(html);
    }

    /**
     * Activates methods of all elements inside the designated HTML element
     * that are part of the current CustomElement and have the data-render-time attribute the same as this.lastRender
     * @param {HTMLElement|string} elem - element or valid querySelector string 
     */
    activateElement(elem) {
        if(typeof elem === "string"){
            // @ts-ignore
            elem = this.querySelector(elem);
        }
        const elementsWithEvents = this.#allElementsWithEvents(
            // @ts-ignore
            elem.querySelectorAll(`[data-parent-id="${this.hashId}"][data-render-time="${this.lastRender}"]`));
        this.#setEventListeners(elementsWithEvents);
    }

    get attrs(){
        return this.getAttrs(this);
    }

    getAttrs = (elem) => {
        const data =  elem.dataset;
        const parsedMap = {};
        for(const [key, value] of Object.entries(data)){
            if(this.app._filterAttributeNames.includes(key)){
                continue;
            }
            try{
                parsedMap[key] = JSON.parse(value.trim());
            }catch{
                parsedMap[key] = value;
            }
        }
        return parsedMap;
    }


    /**
     * Adds variable for template rendring
     * @param {string} name 
     * @param {any} value 
     */
    addTemplateVariable = (name, value) => {
        this._templateVariables[name] = value;
    }

    clearTemplateVariables = () => {
        this._templateVariables = {};
    }

    get variables(){
        return this._templateVariables; 
    }

    /**
     * Replaces shorthand "@<eventName>=" synatx with jolt-<eventName>
     * @param {string} inputString 
     * @returns 
     */
    #replaceAtWithDf = (inputString) => {
        return inputString.replace(/@(\w+)=/g, "jolt-$1=");
    }

    #replaceColonWithData = (inputString) => {
        return inputString.replace(/:(\w+)=/g, "data-$1=")
    }

    #parseCustomElementTags = (inputString) => {
        return inputString.replace(/<([A-Z][a-zA-Z0-9]*|[a-z][a-zA-Z0-9]*)([^>]*)\s*(\/?)>/g, (match, tagName, attributes, selfClosing) => {
            if (this.app._elements[tagName]) {
                const element = this.app._elements[tagName];
                const tag = element.tagName;
                return selfClosing ? `<${tag}${attributes}/>` : `<${tag}${attributes}></${tag}>`;
            }
            return match; // Return unchanged if no mapping is found
        });
    }

    /**
     * Parses conditionals in html elements (df-if)
     * @param {HTMLElement} elem - element whose contents should be parsed
     */
    #parseConditionals = (elem) => {
        elem.querySelectorAll("[jolt-show-if]").forEach((child) => {
            const value = child.getAttribute("jolt-show-if");
            if([false, "false", null, "null", undefined, "undefined"].includes(value)){
                child.remove();
            }
        })
    }

    /**
     * Gets all arguments on the element with an df-{eventName} attribute. Parses all
     * arguments that starts with a ":" and collects them into an object with key-value pairs.
     * @param {HTMLElement|CustomElement} elem 
     * @returns {Object<string, string|number|object>}
     */
    #getAllCustomAttributes = (elem) => {
        return this.getAttrs(elem);
    }

    /**
     * Returns the type-method pair of the assigned event
     * or null if no event was assigned to the element
     * @param {HTMLElement} elem 
     * @returns {Array<string, string>|null}
     */
    getEventTypeAndMethod = (elem) => {
        const attributes = elem.attributes;
        if(!attributes){return [null, null];}
        for(const attr of elem.attributes){
            if(attr.name.startsWith("jolt-")){
                const value = elem.getAttribute(attr.name);
                return [attr.name, value];
            }
        }
        return [null, null];
    }

    /**
     * Sets event listeners on all elements
     * @param {{element: HTMLElement, eventName: string, methodName: string}[]}  elementsWithevents
     */
    #setEventListeners = (elementsWithevents) => {
        for(let elementWithEvent of elementsWithevents){
            const elem = elementWithEvent.element;
            const eventName = elementWithEvent.eventName;
            const methodName = elementWithEvent.methodName;
            //Checks if the element is already active
            //This attribute apparently disappears if the element is taken out of the DOM
            //and reappended again. Maybe just the consequence of manipulation by the SimpleDataTable library
            if(elem[`jolt-${eventName}:active`]){
                return;
            }
            const listener = this._createEventListenerMethod(elem, methodName);
            // @ts-ignore
            elem.addEventListener(eventName, listener);
            elem[`jolt-${eventName}:active`] = true;
            elem[`jolt-${eventName}:active-method-${methodName}`] = listener;
        }
    }

    /**
     * Creates listener method for event listener of element
     * @param {HTMLElement} elem - the HTMLElement with eventListener
     * @param {string} methodName - name of the method
     * @returns {CallableFunction}
     */
    _createEventListenerMethod = (elem, methodName) => {
        return async (event) => {
            let attrs = this.#getAllCustomAttributes(elem)
            try{
                if(attrs && Object.keys(attrs).length != 0){
                    await this[methodName](elem, event, attrs);
                }else{
                    await this[methodName](elem, event);
                }
            }catch(e){
                console.error(e);
                throw new Error(`Could not run method ${methodName} on element ${this.tagName}`);
            }
        }
    }

    /**
     * Public acces to _createEventListenerMethod
     * @param {HTMLElement} elem - the HTMLElement with eventListener
     * @param {string} methodName - name of the method
     * @returns {CallableFunction}
     */
    createEventListenerMethod = (elem, methodName) => {
        return this._createEventListenerMethod(elem, methodName);
    }

    /**
     * Sets event listeners to elements in array
     * @param {{element: HTMLElement, eventName: string, methodName: string}[]} elementsWithEvents 
     */
    _setEventListeners = (elementsWithEvents) => {
        this.#setEventListeners(elementsWithEvents);
    }

    /**
     * Finds all elements with event listeners
     * @param {NodeListOf} allElements 
     * @returns {{element: HTMLElement, eventName: string, methodName: string}[]} 
     */
    #allElementsWithEvents = (allElements) => {
        const elementsWithEvents = [];
        allElements.forEach(element => {
            elementsWithEvents.push(...this.#elementWithEvent(element));
        });
        return elementsWithEvents;
    }

    /**
     * Gathers event metadata from an element's attributes.
     * @param {HTMLElement} elem - The DOM element from which to extract events.
     * @returns {{element: HTMLElement, eventName: string, methodName: string}[]} 
     *   An array of event objects, each containing the element, event name, and method name.
     */
    #elementWithEvent = (elem) => {
        const events = [];
        Array.from(elem.attributes).forEach(attr => {
            if(attr.name.startsWith("jolt-") && !attr.name.startsWith("jolt-show-if")){
                events.push({element: elem,
                                eventName: attr.name.replace("jolt-", ""),
                                methodName: attr.value})
            }
        });
        return events;
    }

    /**
     * 
     * @param {HTMLElement} elem 
     * @returns {{element: HTMLElement, eventName: string, methodName: string}[]} 
     */
    _elementWithEvent = (elem) => {
        return this.#elementWithEvent(elem);
    }

    _allElementsWithEvents = (allElements) => {
        return this.#allElementsWithEvents(allElements);
    }

    /**
     * Adds functionality to all elements in the markup of the element
     * @returns {void}
     */
    #hydrate = () => {
        const elementsWithEvents = this.#allElementsWithEvents(
            this.querySelectorAll(`[data-parent-id="${this.hashId}"][data-render-time="${this.lastRender}"]`));
        this.#setEventListeners(elementsWithEvents);
    }

    _hydrate = () => {
        this.#hydrate();
    }

    /**
     * Adds the parent name to each html element as a custom attribute (parent-name)
     * @param {HTMLElement} div
     * @returns {string}
     */
    #tagAllelementsWithParent = (div) => {
        div.querySelectorAll(":not([data-parent-id]:not(data-render-time))").forEach((elem) => {
            elem.setAttribute("data-parent-id", this.hashId);
            elem.setAttribute("data-render-time", `${this.lastRender}`
            );
        });
        return div.innerHTML;
    }

    /**
     * Triggers rerender of entire element
     * @abstract
     * @param {CustomEvent} [event]
     */
    rerender = async (event) => {
        this.#templateSettings.dataBinds = new Map();
        await this.#runMethods(this._beforeRerender);
        await this.render();
        await this.#waitForSubelements();
        return await this.#runMethods(this._afterRerender);
    }

    /**
     * Generates random hash
     * @param {Number} length 
     * @returns {string}
     */
    generateHash = (length = 16) => {
        return this.app.generateHash(length);
    }

    /**
     * Convenience method for getting data from application storage
     * @param {string} field 
     * @returns {any|undefined}
     */
    getData = (field) => {
        return this.app.getData(field);
    }

    /**
     * Convenience method for setting data to application storage
     * @param {string} field 
     * @param {any} data 
     * @throws {Error} - Missing field in app data structure
     */
    setData = (field, data) => {
        this.app.setData(field, data);
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
     * Getter for query parameters
     */
    get queryParams(){
        return this.app.queryParams
    }

    /**
     * Sets new query(search) params to url based on provided
     * query parameters object
     * @param {Object<string, string|number|boolean>} queryParamsObject
     */
    set queryParams(queryParamsObject){
        this.app.queryParams = queryParamsObject;
    }

    /**
     * Adds query parameters provided in object
     * as key-value pairs
     * @param {Object<string, string|number|boolean>} params 
     */
    addQueryParams(params){
        this.queryParams = {
            ...this.queryParams,
            ...params
        }
    }

    /**
     * Removes query parameters in provided array
     * @param {Array<string>} names 
     */
    removeQueryParams(names){
        this.app.removeQueryParams(names);
    }

    /**
     * Returns the parent CustomElement of current CustomElement if it exists. Top-level
     * elements (direct children of the app container) don't have this property
     * @returns {CustomElement|undefined}
     */
    get parent(){
        return this._parent;
    }

    /**
     * Returns application router
     * @returns {Router}
     */
    get router(){
        return this.app.router;
    }

    /**
     * Returns url hash
     * @returns {string}
     */
    get hash(){
        return this.app.hash;
    }

    /**
     * Returns url port
     * @returns {string}
     */
    get port(){
        return this.app.port;
    }

    /**
     * Returns url hostname
     * @returns {string}
     */
    get hostname(){
        return this.app.hostname;
    }

    /**
     * Returns url host
     * @returns {string}
     */
    get host(){
        return this.app.host;
    }

    /**
     * Returns url pathname
     * @returns {string}
     */
    get pathname(){
        return this.app.pathname;
    }

    /**
     * Returns url origin
     * @returns {string}
     */
    get origin(){
        return this.app.origin;
    }

    /**
     * Returns route parameters (query string) as object
     * @returns {string}
     */
    get routeParameters(){
        return this.app.router.routeParameters;
    }

    /**
     * Returns data from application storage
     * based on elements dataField property
     * @returns {Object}
     */
    get data(){
        return this.app.getAllData(true);
    }

    /**
     * Returns render functions defined on the app object
     * @returns {Object<string, CallableFunction>}
     */
    get functions(){
        return this.app.renderFunctions;
    }

    /**
     * Returns application properties
     * @returns {Object}
     */
    get properties(){
        return this.app.properties;
    }

    /**
     * Returns object with registered app extensions
     * @returns {Object<string, Extension>}
     */
    get ext(){
        return this.app.ext;
    }

    /**
     * Getter for authenticator
     * @returns {Authenticator}
     */
    get authenticator(){
        return this.app.authenticator;
    }

    /**
     * Makes fetch (GET) request for markup
     * @param {string} url 
     * @returns {Promise<string>}
     */
    getHTMLtemplate = async (url) => {
        try{
            const response = await fetch(url, {
                redirect: "manual"
            });
            if(response.status == 200){
                return await response.text();
            }
            this._abort = true;
            if(this.app?.router){
                this.app.router._abortPageLoad(response.status)
            }
            else{
                console.error(`Failed to fetch html markup for ${this.tagName} with response code ${response.status}`);
            }
            return "";
        }catch(e){
            this._abort = true;
            if(this.app?.router){
                this.app.router._abortPageLoad(500)
            }
            else{
                console.error(`Failed to fetch html markup for ${this.tagName}. Server failed to respond.`);
            }
            return "";
        }
    }

    /**
     * Static method to generate html of this element
     * @param {string} [hashId] 
     * @returns {string}
     * @static
     */
    static generate(hashId, attrs = null){
        if(!attrs){
            attrs = {};
        }
        let attrsArray = [];
        for(const [key, value] of Object.entries(attrs)){
            attrsArray.push(`:${key}="${value}"`);
        }
        let stringAttrs = attrsArray.length > 0 ? attrsArray.join(" ") : "";
        if(!hashId){
            return html`<${this.tagName} ${stringAttrs}></${this.tagName}>`
        }
        return html`<${this.tagName} data-hash-id="${hashId}" ${stringAttrs}></${this.tagName}>`
    }
}

export {CustomElement};

/**
 * @typedef {Object<string, (name: string) => ValueAccessor>} DefineMethods
 * An object containing methods that return a getter/setter pair.
 */

/**
 * @typedef {Object} ElementConfig
 * @property {string} tagName - The tag name for the custom element (must be kebab-case).
 * @property {() => Promise<string>} markup - A function that returns the element's HTML structure.
 * @property {string|null} [css] - Optional CSS for styling the element.
 * @property {Object<string, Function>} [methods] - Methods to be added to the element.
 * @property {Object<string, Function>} [beforeInit] - Lifecycle hooks executed before initialization.
 * @property {Object<string, Function>} [beforeInitResolve] - Lifecycle hooks executed before resolving initialization.
 * @property {Object<string, Function>} [afterInit] - Lifecycle hooks executed after initialization.
 * @property {Object<string, Function>} [beforeRerender] - Hooks executed before re-rendering.
 * @property {Object<string, Function>} [afterRerender] - Hooks executed after re-rendering.
 * @property {Object<string, Function>} [afterDisconnect] - Hooks executed after the element is disconnected.
 * @property {DefineMethods} [define] - Object containing `defineValue` factory functions that return getter/setter pairs.
 * @property {Object<string, Function>} [templateFunctions] - Functions for dynamic template rendering.
 */

/**
 * @template {Record<string, Function>} M
 * @template {Record<string, (name: string) => { get: () => any, set: (value: any) => void }>} D
 * @typedef {CustomElement & M & { [K in keyof D]: ReturnType<D[K]> }} ElementType
 */

/**
 * Factory function that creates a custom web component class extending `CustomElement`.
 * @template {Record<string, Function>} M - Methods object.
 * @template {Record<string, (name: string) => { get: () => any, set: (value: any) => void }>} D - Defined values.
 * @param {ElementConfig} config - Configuration object for the custom element.
 * @returns {typeof CustomElement & ElementType<M, D>} A class extending `CustomElement`, dynamically typed.
 * @throws {Error} If `tagName` or `markup` is missing, or if `tagName` is not in kebab-case.
 */
function ElementFactory({ tagName, markup, css = null, methods = {}, beforeInit = {}, 
    beforeInitResolve = {}, afterInit = {}, beforeRerender = {}, afterRerender = {},
    afterDisconnect = {}, define = {}, templateFunctions = {} }){

    if(!tagName || !markup){
        throw new Error(`Missing tagName or markup method in ElementFactory`);
    }

    const isValidKebabCase = (str) => {
        const kebabCaseRegex = /^[a-z]+(-[a-z]+)*$/;
        return kebabCaseRegex.test(str);
    }

    /**
     * Validates if a string is in kebab-case format.
     * @param {string} str
     * @returns {boolean}
     */
    if(!isValidKebabCase(tagName)){
        throw new Error("Element tagName must be in a valid kebab-case synatx")
    }

    return class extends CustomElement{
        /** @type {string} */
        static tagName = tagName;

        /** @type {Object<string, Function>} */
        _methods = methods;

        /** @type {() => Promise<string>} */
        markup = markup;

        css = css;

        /** @type {Object<string, Function>} */
        _beforeInit = beforeInit;

        /** @type {Object<string, Function>} */
        _beforeInitResolve = beforeInitResolve;

        /** @type {Object<string, Function>} */
        _afterInit = afterInit;

        /** @type {Object<string, Function>} */
        _beforeRerender = beforeRerender;

        /** @type {Object<string, Function>} */
        _afterRerender = afterRerender;

        /** @type {Object<string, Function>} */
        _afterDisconnect = afterDisconnect;

        /** @type {DefineMethods} */
        _define = define;

        /** @type {Object<string, Function>} */
        _templateFunctions = templateFunctions

        constructor(){
            super();
        }
    }
}

export default ElementFactory;
