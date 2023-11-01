class Component {
    /**
   * Main Component class.
   * @param {String} name Name of the component
   * @param  {String} container  ID/class or other identifier of container HTML element (i.e. div, section etc.). querySelector is used to fetch container.
   * @param  {String} messageContainer   ID/class or other identifier of message container for message rendering (i.e. div, section etc.). querySelector is used to fetch container.
   * @param  {Function} markup Function for template rendering. Gets "this" object bound-
   * @param  {BigInt} messageTimeout  Time in miliseconds how long messages are displayed. default = 5000
   * @param {object} subcomponents Object with subcomponents for this component
   * @param {Array} intervalMethods array of arrays [method, intervalDuration] for methods that need to run repeatedly
   * @param {Component} parent Parent component if this component is a subcomponent
   * @param {object} methods Object with methods which extend component functionality. Used to create event listeners. Each method gets "this" (component) bound.
   * @param {object} metaData Object with any additional data that the new component might need
   * @param {object} beforeGenerate Object with methods that should run before the component is generated and displayed. Fetching of data/api calls for example.
   * @param {object} afterGenerate Object with methods that should run after the component is generated. Should not include any data fetching because that would trigger a component reload
   * @param {object} beforeDeconstruct Object with methods that should run before the component is deconstructed. Can include custom data cleaning or other stuff.
   * @param {object} afterDeconstruct Object with methods that should run after the component is deconstructed. Can include custom data cleaning or other stuff.
    * @param {String} dataField string name of data field this components listenes to. Maps to the "data[dataField]" field of the App
    */
    name;
    container;
    messageContainer;
    markup;
    messageTimeout = 5000;
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

    constructor(configs) {
        Object.assign(this, configs)
    }

    async _template(){
        return await this.markup.bind(this)();
    }

    async _setAnimations(){
        let allElems = [...document.querySelector(this.container).querySelectorAll('[animate]')];
        for(let elem of allElems){
            let args = this._getArgs(elem, 'sjs-animate')
            if(args){
                this.methods[elem.getAttribute('sjs-animate')](elem, args, this._app._data, this);
            }
            else {
                this.methods[elem.getAttribute('sjs-animate')](elem, this._app._data, this);
            }
        }
    }

    _getArgs(elem, event){
        let args = elem.getAttribute(`${event}-args`);
        if(args){
            try{
                args = JSON.parse(args);
            } catch{
                //
            }
        }
        return args
    }

    async _setEventListeners(){
        let allEventTypes = {
            'sjs-click': 'click',
            'sjs-dblclick': 'dblclick',
            'sjs-hover': 'mouseover',
            'sjs-change': 'change',
            'sjs-input': 'input',
            'sjs-focusout': 'focusout'
        }
        for(let eventType in allEventTypes){
            let allElems = [...document.querySelector(this.container).querySelectorAll(`[${eventType}]`)]
            for(let elem of allElems){
                elem.addEventListener(`${allEventTypes[eventType]}`, async function(event){
                    let args = this._getArgs(elem, `${eventType}`)
                    if(args) await this.methods[elem.getAttribute(`${eventType}`)].bind(this)(elem, args, event, this._app._data);
                    else await this.methods[elem.getAttribute(`${eventType}`)].bind(this)(elem, event, this._app._data);
                }.bind(this))
            }
        }
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

    unsetMessage(){
        document.querySelector(this.messageContainer).innerHTML = '';
    }

    setMessage(msg, status) {
        const markup = `
            <div class="alert alert-${status} text-center">
                ${msg}
            </div>
        `
        window.scrollTo(0, 0);
        document.querySelector(this.messageContainer).insertAdjacentHTML('afterbegin', markup);
        setTimeout(this.unsetMessage.bind(this), this.messageTimeout);
    }

    async _reloadComponent() {
        const markup = await this._template();
        document.querySelector(this.container).innerHTML = '';
        document.querySelector(this.container).innerHTML = markup;
        await this._setEventListeners();
        await this._setAnimations();
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
            return this._app.getData(field)
        }
        throw new Error('Not a valid data field')
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

    async generateComponent() {
        for(let method in this.beforeGenerate){
            await this.beforeGenerate[method].bind(this)();
        }
        const template = await this._template();
        document.querySelector(this.container).innerHTML = '';
        document.querySelector(this.container).insertAdjacentHTML('afterbegin', template);
        await this._setEventListeners();
        await this._setAnimations();
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