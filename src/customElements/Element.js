import {getAllArgs, getElementsWithJoltEvent, setEventListeners} from "jolt-ui/src/utilities/hydrationFunctions.js";
import { CustomElementConstructorError, CustomElementOptionsMissing } from "jolt-ui/src/Errors.js";

/*
CustomElement factory.
Takes options object with:
connect: (optional) method that runs before the element is connected to the DOM
disconnect: (optional) method that runs when the element is disconnected from the DOM
markup: method that returns the HTML markup of the custom element
*/
function Element(options){
    if(options === undefined){
        throw new CustomElementOptionsMissing("Missing options object for CustomElement.");
    }
    if(options.markup === undefined){
        throw new CustomElementConstructorError("Markup is a required options field for CustomElement", "markup");
    }
    if(options.name === undefined){
        throw new CustomElementConstructorError("Name is a required options field for CustomElement", "name");
    }
    if(options.extends === undefined){
        options.extends = HTMLElement; //by default the CustomElement extends the HTMLElement class
    }
    return class extends options.extends{
        static tagName = options.name
        static _identifier = "JoltElement";

        constructor(){
            super();
            this.renderOptions = {
                'delete': true,
                'insert': 'afterbegin'
            }
            Object.assign(this, options)
            this._observedAttributes = [];
            this.data = {};
            this.setAttribute("identifier", this.constructor._identifier);
        }

        async connectedCallback(){
            if(this.connect){
                for(const method in this.connect){
                    await this.connect[method].bind(this)();
                }
            }
            const component = this.closest('[identifier="JoltComponent"]');
            this.component = component.component;
            await this.render();
        }

        async disconnectedCallback(){
            if(this.disconnect){
                for(const method in this.disconnect){
                    await this.disconnect[method].bind(this)();
                }
            }
            this.component = null;
        }

        _getAllArgs(elem){
            return getAllArgs(elem);
        }

        _getElementsWithJoltEvent(){
            return getElementsWithJoltEvent(this);
        }

        async _setEventListeners(){
            return await setEventListeners.bind(this)();
        }

        async render() {
            this._getJoltAttributeValues();
            for(let method in this.beforeGenerate){
                await this.beforeGenerate[method].bind(this)();
            }
            if(this.renderOptions.delete){
                this.innerHTML = "";
            }
            this.insertAdjacentHTML(this.renderOptions.insert, await this.markup.bind(this)());
            this._setEventListeners();
            for(let method in this.afterGenerate){
                await this.afterGenerate[method].bind(this)();
            }
        }

        _getJoltAttributeValues(){
            const data = {}
            for(let attr of this.attributes){
                if(attr.name.startsWith(":")){
                    data[attr.name.substring(1)] = attr.value;
                }
            }
            this.data = data;
        }

        async setData(data){
            for(const name in data){
                this.setAttribute(`:${name}`, data[name]);
            }
            await this.render();
        }

        _registerApp(app){
            this.app = app;
        }

        getData(field){
            return this.getAttribute(`:${field}`);
        }

        get data (){
            return this._data;
        }

        set data(data){
            this._data = data;
        }

        get component(){
            return this._component;
        }

        get identiefier(){
            return this.getAttribute("identifier");
        }

        set component(component){
            this._component = component;
        }
    }
}

export default Element;
