/**
 * Helper methods and objects for easier work
 */

export const html = String.raw;

export async function getTemplate(){
    if(this.renderOptions.cache && this.templateCache !== undefined){
        return this.templateCache;
    }
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