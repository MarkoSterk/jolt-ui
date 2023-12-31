import { ComponentConstructorError, DataError,
        RenderOptionsError, ComponentContainerError,
        ReservedKeywordError, DataMappingError } from "./Errors";
import Authenticator from "./Authenticator";
import dot from "./dot/doT";

class Component {
    /**
   * Main Component class.
   * @param {String} name Name of the component
   * @param  {String} container  ID/class or other identifier of container HTML element (i.e. div, section etc.). querySelector is used to fetch container.
   * @param  {Function} markup Function for template rendering. Gets "this" object bound-
   * @param {object} subcomponents Object with subcomponents for this component
   * @param {Array} intervalMethods array of arrays [method, intervalDuration] for methods that need to run repeatedly
   * @param {Component} parent Parent component if this component is a subcomponent or childcomponent
   * @param {object} methods Object with methods which extend component functionality. Used to create event listeners. Each method gets "this" (component) bound.
   * @param {object} beforeGenerate Object with methods that should run before the component is generated and displayed. Fetching of data/api calls for example.
   * @param {object} afterGenerate Object with methods that should run after the component is generated. Should not include any data fetching because that would trigger a component reload
   * @param {object} beforeDeconstruct Object with methods that should run before the component is deconstructed. Can include custom data cleaning or other stuff.
   * @param {object} afterDeconstruct Object with methods that should run after the component is deconstructed. Can include custom data cleaning or other stuff.
    * @param {String} dataField string name of data field this components listenes to. Maps to the "data[dataField]" field of the App
    */
    name;
    container;
    markup;
    renderOptions = {
        delete: true,
        insert: "afterbegin",
        template_name: null,
        cache: false,
        useEngine: false
    }

    _authenticationRequired = false;

    subcomponents = {};

    beforeGenerate = {};
    afterGenerate = {};
    beforeActive = {};
    afterActive = {};

    beforeDeconstruct = {}
    afterDeconstruct = {};
    beforeDeactive = {};
    afterDeactive = {};

    intervalMethods = [];
    methods = {};
    metaData = {};
    dataField;
    reloadOnDataChange = true;

    _active = false;
    _parent
    _intervalMethodsIds = [];
    _app;
    _data;
    _queryParams;
    _domParser;
    _templateFn;
    _templateCache;

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
        Object.assign(this, configs)
        this._domParser = new DOMParser();
    }

    validateConfigData(value, valueType){
        return typeof value === valueType.toLowerCase();
    }

    async _template(){
        return await this.markup.bind(this)();
    }

    async _setAnimations(parsedTemplate){
        let allElems = [...parsedTemplate.querySelectorAll('[animate]')];
        for(let elem of allElems){
            let args = this._getAllArgs(elem)
            if(Object.keys(args).length > 0){
                this.methods[elem.getAttribute('animate')].bind(this)(elem, args);
            }else{
                this.methods[elem.getAttribute('animate')].bind(this)(elem);
            }
        }
        return parsedTemplate;
    }

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

    async _setEventListeners(parsedTemplate){
        const joltElements = this._getElementsWithJoltEvent(parsedTemplate);
        for(let joltElement of joltElements){
            const elem = joltElement.element;
            const eventName = joltElement.eventName;
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

    async _reloadData(data){
        this._data = data
        if(this._active === true && this.reloadOnDataChange != false) await this._reloadComponent()
    }

    getData(field){
        return this._app.getData(field);
    }

    async setData(field, data){
        await this._app.setData(field, data)
    }

    parseQueryParams(queryString){
        return this.app.parseQueryParams(queryString);
    }

    stringifyQueryParams(queryParams){
        return this.app.stringifyQueryParams(queryParams);
    }

    registerSubcomponents(subcomponents){
        this.subcomponents = subcomponents
        for(let subcomponent in this.subcomponents){
            this.subcomponents[subcomponent]._parent = this;
        }
    }

    async _hydrate(parsedTemplate){
        parsedTemplate = await this._setEventListeners(parsedTemplate);
        parsedTemplate = await this._setAnimations(parsedTemplate);
        return parsedTemplate
    }

    async _insertHtmlElements(parsedTemplate){
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
                container.insertAdjacentElement(this.renderOptions.insert, node);
            })
        }
    }

    _templatingEngine(template){
        if(!this._templateFn && this.renderOptions?.useEngine){
            this._templateFn = dot.template(template);
        }
        if(this.renderOptions?.useEngine){
            template = this._templateFn(this._app.data);
        }
        return template
    }

    async _reloadComponent() {
        let template = await this._template();
        template = this._templatingEngine(template)
        let parsedTemplate = this._domParser.parseFromString(template, "text/html");
        parsedTemplate = await this._hydrate(parsedTemplate)
        await this._insertHtmlElements(parsedTemplate);
        for(let component in this.subcomponents){
            await this.subcomponents[component]._reloadComponent()
        }
    }

    async generateComponent() {
        if(this._authenticationRequired && !this._app._authenticator._isAuthenticated){
            return this._app._authenticator._makeUnauthenticatedRedirect(this);
        }
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
            let id = setInterval(intervalMethod[0].bind(this), intervalMethod[1]);
            this._intervalMethodsIds.push(id);
        }

        for(let method in this.beforeActive){
            await this.beforeActive[method].bind(this)();
        }

        this._active = true;

        for(let method in this.afterActive){
            await this.afterActive[method].bind(this)();
        }
    }

    async deconstructComponent() {
        for(let method in this.beforeDeconstruct){
            await this.beforeDeconstruct[method].bind(this)()
        }
        for(const id of this._intervalMethodsIds){
            clearInterval(id);
        }
        this.intervalMethodsIds = [];
        for(const component of Object.keys(this.subcomponents)){
            await this.subcomponents[component].deconstructComponent();
        }
        document.querySelector(this.container).innerHTML = '';
        for(let method in this.afterDeconstruct){
            await this.afterDeconstruct[method].bind(this)()
        }
        this._active = false;
        for(let method in this.afterDeactive){
            await this.afterDeactive[method].bind(this)()
        }
    }

    makeRedirect(path){
        const redirectEvent = new CustomEvent(Authenticator.redirectNavEventName, {
            bubbles: true,
            detail: {redirectTo: path}
        });
        this.DOM.dispatchEvent(redirectEvent);
    }

    async forceReload(){
        await this._reloadComponent()
    }

    //setters and getters
    get parent(){
        return this._parent
    }

    set templateCache(cache){
        this._templateCache = cache;
    }

    get templateCache(){
        return this._templateCache;
    }

    set queryParams(params){
        this._app.queryParams = params;
    }

    get queryParams(){
        return this._app.queryParams;
    }

    get path(){
        return this._app.path;
    }

    get hash(){
        return this._app.hash;
    }

    // set data(data){
    //     this._data = data
    // }

    get app(){
        return this._app;
    }

    get data(){
        if(this.dataField){
            return this._data
        }
        return null;
    }

    get appDOM(){
        return this._app.DOM;
    }

    get DOM(){
        return document.querySelector(this.container);;
    }

    get properties(){
        return this._app.properties;
    }

    get authenticationRequired(){
        return this._authenticationRequired;
    }

    set authenticationRequired(authentication){
        this._authenticationRequired = authentication;
    }
}

export default Component;