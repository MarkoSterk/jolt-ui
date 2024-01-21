// @ts-check

/**
 * Helper methods and objects for easier work
 */

/**
 * Utility for writing html in JS code.
 * @type {any}
 */
export const html = String.raw;

/**
 * Helper function for fetching templates from server
 * @returns {Promise<string>}
 */
export async function getTemplate(){
    /**
     * this keyword points at the Component that is calling this function
     */
    // @ts-ignore
    if(this.renderOptions.cache && this.templateCache !== undefined){
        return this.templateCache;
    }
    // @ts-ignore
    const url = this.properties.templateBaseUrl + `/${this.renderOptions.template_name}`;
    try{
        const response = await fetch(url);
        if(!response.ok){
            throw new Error("Failed to load template from backend.");
        }
        const template = await response.text();
        this.templateCache = template;
        return template;
    }catch(err){
        throw new Error("Failed to load template from backend.")
    }
}