// @ts-ignore
import { DiffDOM, nodeToObj, stringToObj,  } from "diff-dom/dist/index.js";

/**
 * @typedef {import('../types.js').DiffConfigs} DiffConfigs
 */

/**
 * HTML diff class
 */
// @ts-ignore
class Diff{

    /**
     * HTML diffing helper class
     * @param {DiffConfigs} configs 
     */
    constructor({targetElement, newMarkup, customElement}){
        this.diffDom = new DiffDOM();
        this.target = targetElement;
        this.customElement = customElement;
        const clone = targetElement.cloneNode(true);
        const html = customElement._dotJSengine(newMarkup);
        customElement.app._originalInnerHTML.call(clone, html);
        this.clone = clone;
        this.diff = null;
    }

    performDiff = () => {
        // @ts-ignore
        const diff = this.diffDom.diff(this.target, this.clone);
        // @ts-ignore
        this.diff = this.filterDiff(diff)
    }

    filterDiff = (diff) => {
        const filteredDiff = [];
        for(const diffElement of diff){
            if(diffElement.action == "removeAttribute" && ["data-hash-id", "data-render-time"].includes(diffElement.name)){
                continue;
            }
            if(diffElement.action == "modifyAttribute" && ["data-hash-id", "data-render-time"].includes(diffElement.name)){
                continue;
            }
            if(diffElement.action == "removeElement" && diffElement.element.nodeName == "#comment"){
                //strange behavior when removing comments
                filteredDiff.push(diffElement);
                continue;
            }
            if(diffElement.action == "removeElement" && diffElement.element.attributes["data-parent-id"] != this.customElement.hashId){
                continue;
            }
            filteredDiff.push(diffElement);
        }
        return filteredDiff;
    }

    apply = () => {
        if(!this.diff){
            throw new Error("Perform the diffing operation first by calling Diff.diff method");
        }
        // @ts-ignore
        this.diffDom.apply(this.target, this.diff);
    }

    undo = () => {
        if(!this.diff){
            throw new Error("Perform the diffing operation first by calling Diff.diff method");
        }
        // @ts-ignore
        this.diffDom.undo(this.target, this.diff);
    }

    setInnerHTML = () => {
        this.performDiff();
        this.apply();
    }

    get options(){
        return this.diffDom.options;
    }

    set options(options){
        this.diffDom.options = options
    }
}

export default Diff
