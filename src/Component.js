import { ComponentConstructorError, DataError,
        RenderOptionsError, ComponentContainerError,
        ReservedKeywordError } from "./Errors";

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
        insert: "afterbegin"
    }

    subcomponents = {};
    childcomponents = {};

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
    reloadOnDataChange;

    _active = false;
    _parent
    _intervalMethodsIds = [];
    _app;
    _data;
    _queryParams;
    _domParser;

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

    getElementsWithJoltEvent(parsedTemplate){
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
        const joltElements = this.getElementsWithJoltEvent(parsedTemplate);
        for(let joltElement of joltElements){
            const elem = joltElement.element;
            const eventName = joltElement.eventName;
            const methodName = joltElement.methodName;
            elem.addEventListener(eventName, async function(event){
                let args = this._getAllArgs(elem)
                if(Object.keys(args).length != 0){
                    await this.methods[methodName].bind(this)(elem, args, event);
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
                this._app._dataMapping[this.dataField].push(this);
            }
            for(let subcomponent in this.subcomponents){
                await this.subcomponents[subcomponent]._registerApp(app);
            }
            for(let child in this.childcomponents){
                await this.childcomponents[child]._registerApp(app);
            }
        }
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

    async _reloadComponent() {
        const template = await this._template();
        let parsedTemplate = this._domParser.parseFromString(template, "text/html");
        parsedTemplate = await this.hydrate(parsedTemplate)
        await this.insertHtmlElements(parsedTemplate);
        for(let component in this.subcomponents){
            await this.subcomponents[component]._reloadComponent()
        }
    }

    async _reloadData(data){
        this.data = data
        if(this._active === true && this.reloadOnDataChange != false) await this._reloadComponent()
    }

    setQueryParams(params){
        this._app.setQueryParams(params);
    }

    get path(){
        return this._app.path;
    }

    get queryParams(){
        return this._app.getQueryParams();
    }

    async setData(field, data){
        await this._app.setData(field, data)
    }

    set data(data){
        this._data = data
    }

    get data(){
        return this._data
    }

    getData(field){
        if(field in this._app._data){
            return this._app.getData(field);
        }
        throw new DataError('Not a valid data field');
    }

    get parent(){
        return this._parent
    }

    registerSubcomponents(subcomponents){
        this.subcomponents = subcomponents
        for(let subcomponent in this.subcomponents){
            this.subcomponents[subcomponent]._parent = this;
        }
    }

    registerChildcomponents(childcomponents){
        this.childcomponents = childcomponents
        for(let child in this.childcomponents){
            this.childcomponents[child]._parent = this;
        }
    }

    async hydrate(parsedTemplate){
        parsedTemplate = await this._setEventListeners(parsedTemplate);
        parsedTemplate = await this._setAnimations(parsedTemplate);
        return parsedTemplate
    }

    async insertHtmlElements(parsedTemplate){
        const parsedElements = Array.from(parsedTemplate.body.childNodes)
                                    .filter(node => node.nodeType === Node.ELEMENT_NODE);
        const container = document.querySelector(this.container);
        if(!container){
            throw new ComponentContainerError("Could not find component container", this.name, this.container);
        }
        if(parsedElements){
            parsedElements.reverse().forEach(node => {
                container.insertAdjacentElement(this.renderOptions.insert, node);
            })
        }
    }

    async generateComponent() {
        for(let method in this.beforeGenerate){
            await this.beforeGenerate[method].bind(this)();
        }
        const template = await this._template();
        let parsedTemplate = this._domParser.parseFromString(template, "text/html");
        parsedTemplate = await this.hydrate(parsedTemplate)
        await this.insertHtmlElements(parsedTemplate);
        for(const component of Object.keys(this.subcomponents)){
            await this.subcomponents[component].generateComponent();
        }
        for(const intervalMethod of this.intervalMethods){
            let id = setInterval(intervalMethod[0].bind(this), intervalMethod[1]);
            this._intervalMethodsIds.push(id);
        }
        for(let method in this.afterGenerate){
            await this.afterGenerate[method].bind(this)();
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
        for(let method in this.beforeDeactive){
            await this.beforeDeactive[method].bind(this)()
        }
        this._active = false;
        for(let method in this.afterDeactive){
            await this.afterDeactive[method].bind(this)()
        }
    }

    async forceReload(){
        await this._reloadComponent()
    }
}

export default Component;