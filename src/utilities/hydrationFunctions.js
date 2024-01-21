
/**
 * 
 * @param {HTMLElement} elem 
 * @returns {Object.<string, any>}
 */
export function getAllArgs(elem){
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
 * Utility function for getting all elements with Jolt events.
 * @param {NodeList} template 
 * @returns {Array<Node>}
 */
export function getElementsWithJoltEvent(template){
    const allElements = template.querySelectorAll("*");
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


export async function setEventListeners(){
    const joltElements = this._getElementsWithJoltEvent();
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
    return ;
}

