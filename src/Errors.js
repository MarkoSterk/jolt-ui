// @ts-check

export class AppConstructorError extends Error {
    /**
     * Application constructor error
     * @param {string} message 
     */
    constructor(message){
        super(message);
        this.name = "App constructor error";
        this.description = `
            App constructor failed. Please check if all required configuration fields are present.
            Required fields are: container (String) and name (String)
        `
    }

    /**
     * String representation of the error
     * @returns {string}
     */
    toString() {
        return `${this.name}: ${this.message}\nDescription: ${this.description.trim()}`;
    }
}


export class InitializationError extends Error{
    /**
     * Application initialization error
     * @param {string} message 
     */
    constructor(message){
        super(message);
        this.name = "App initialization error";
        this.description = `
            App failed to initialize all components/methods at start time. Please check all configurations.
        `
    }

    /**
     * String representation of the error
     * @returns {string}
     */
    toString() {
        return `${this.name}: ${this.message}\nDescription: ${this.description.trim()}`;
    }
}

export class AppStartError extends Error{
    /**
     * Application start error
     * @param {string} message 
     */
    constructor(message){
        super(message);
        this.name = "App start error.";
        this.description = `
            App start error. App failed to start because of wrong start route and/or
            undefined unknownView route.
        `
    }

    /**
     * String representation of the error
     * @returns {string}
     */
    toString() {
        return `${this.name}: ${this.message}\nDescription: ${this.description.trim()}`;
    }
}

export class ReservedKeywordError extends Error{
    /**
     * Application constructor error
     * @param {string} message 
     * @param {string} key
     */
    constructor(message, key){
        super(message);
        this.name = "Reserved keyword error.";
        this.description = `
            The keyword ${key} is a reserved property for the application object and can't be used on the Component object.
        `
    }

    /**
     * String representation of the error
     * @returns {string}
     */
    toString() {
        return `${this.name}: ${this.message}\nDescription: ${this.description.trim()}`;
    }
}

export class DataError extends Error{
    /**
     * Application data error
     * @param {string} message 
     */
    constructor(message){
        super(message);
        this.name = "Data error";
        this.description = `
            Data error. There was an error in the app data fields. Either a component want's to listen
            to an undefined data field or a component want's to set an undefined data field.
        `
    }

    /**
     * String representation of the error
     * @returns {string}
     */
    toString() {
        return `${this.name}: ${this.message}\nDescription: ${this.description.trim()}`;
    }
}

export class DataMappingError extends Error{
    /**
     * Application data mapping error
     * @param {string} message 
     * @param {string} componentName
     * @param {string} dataField 
     */
    constructor(message, componentName, dataField){
        super(message);
        this.name = "Data mapping error";
        this.description = `
            Could not map component (${componentName}) data field name (${dataField}) to application data object.
            Please check if you provided the right data field name.
        `
    }

    /**
     * String representation of the error
     * @returns {string}
     */
    toString() {
        return `${this.name}: ${this.message}\nDescription: ${this.description.trim()}`;
    }
}

export class RouterConfigError extends Error{
    /**
     * Router config error
     * @param {string} message 
     */
    constructor(message){
        super(message);
        this.name = "Router configuration error";
        this.description = `
            Router configuration error. Missing or invalid router configuration object.
        `
    }

    /**
     * String representation of the error
     * @returns {string}
     */
    toString() {
        return `${this.name}: ${this.message}\nDescription: ${this.description.trim()}`;
    }
}

export class RouterTypeError extends Error{
    /**
     * Router type error
     * @param {string} message 
     */
    constructor(message){
        super(message);
        this.name = "Router type error";
        this.description = `
            Router type error. Only two types of routers are available. 
            Available types are: "url" and "hash". Please check your router configurations. 
        `
    }

    /**
     * String representation of the error
     * @returns {string}
     */
    toString() {
        return `${this.name}: ${this.message}\nDescription: ${this.description.trim()}`;
    }
}

export class RouteError extends Error{
    /**
     * Route error
     * @param {string} message 
     */
    constructor(message){
        super(message);
        this.name = "Route error";
        this.description = `
            Route error. Router was unable to find requested route. To avoid this error
            provide an unknownView component to the router using the unknownViewComponent method.
        `
    }

    /**
     * String representation of the error
     * @returns {string}
     */
    toString() {
        return `${this.name}: ${this.message}\nDescription: ${this.description.trim()}`;
    }
}

export class ComponentConstructorError extends Error{
    /**
     * Component constructor error
     * @param {string} message 
     */
    constructor(message){
        super(message);
        this.name = "Component constructor error.";
        this.description = `
            Component constructor error. Failed to construct component due to missing configuration
            options. Configuration object must include fields: (String) container, (String) name and (Function) merkup.
        `
    }

    /**
     * String representation of the error
     * @returns {string}
     */
    toString() {
        return `${this.name}: ${this.message}\nDescription: ${this.description.trim()}`;
    }
}

export class RenderOptionsError extends Error{
    /**
     * Render options error
     * @param {string} message
     * @param {string} componentName 
     */
    constructor(message, componentName){
        super(message);
        this.name = `Component render options error`;
        this.description = `
            Component (${componentName}) render options error. If render options object is provided both render options fields must be defined.
            Render option fields are: (Boolean) delete and (String) insert.
            Available insert field options are: ["beforebegin", "afterbegin", "beforeend", "afterend"]
        `
    }

    /**
     * String representation of the error
     * @returns {string}
     */
    toString() {
        return `${this.name}: ${this.message}\nDescription: ${this.description.trim()}`;
    }
}

export class ComponentContainerError extends Error{
    /**
     * Component container error
     * @param {string} message 
     * @param {string} componentName
     * @param {string} container
     */
    constructor(message, componentName, container){
        super(message);
        this.name = `Component container error`;
        this.description = `
            Component container error. Could not find container with name ${container} for component with name ${componentName}.
            Check if you specified the container for the component and if the container is present.
        `
    }

    /**
     * String representation of the error
     * @returns {string}
     */
    toString() {
        return `${this.name}: ${this.message}\nDescription: ${this.description.trim()}`;
    }
}

export class ComponentReloadError extends Error{
    /**
     * Component reload error
     * @param {string} message 
     * @param {string} componentName
     */
    constructor(message, componentName){
        super(message);
        this.name = "Failed to reload component";
        this.description = `
            Failed to reload component ${componentName}. Error happened during component reload triggered manually or 
            automatically by data changes.
        `
    }
    
    /**
     * String representation of the error
     * @returns {string}
     */
    toString() {
        return `${this.name}: ${this.message}\nDescription: ${this.description.trim()}`;
    }
}

export class GetTemplateError extends Error{
    /**
     * Get template rror
     * @param {string} message 
     * @param {string} componentName
     */
    constructor(message, componentName){
        super(message);
        this.name = "Failed to get component template";
        this.description = `
            Failed to get component (${componentName}) template. The template render function did not produce a valid template.
            Please check method and/or configurations and component meta data in case you use the build-in getTemplate method.
        `
    }

    /**
     * String representation of the error
     * @returns {string}
     */
    toString() {
        return `${this.name}: ${this.message}\nDescription: ${this.description.trim()}`;
    }
}

export class AuthenticatorConstructorError extends Error{
    /**
     * Authenticator constructor error
     * @param {string} message 
     */
    constructor(message){
        super(message);
        this.name = "Authenticator failed to construct";
        this.description = `
            Failed to construct Authenticator. Please check all required configurations options.
        `
    }

    /**
     * String representation of the error
     * @returns {string}
     */
    toString() {
        return `${this.name}: ${this.message}\nDescription: ${this.description.trim()}`;
    }
}

export class AuthenticatorNotImplemented extends Error{
    /**
     * Authenticator not implemented error
     * @param {string} message 
     */
    constructor(message){
        super(message);
        this.name ="Authenticator not implemented";
        this.description = `
            Authenticator is not implemented. Please implement the authenticator first before
            you call this method.
        `
    }
    /**
     * String representation of the error
     * @returns {string}
     */
    toString() {
        return `${this.name}: ${this.message}\nDescription: ${this.description.trim()}`;
    }
}

export class CustomElementOptionsMissing extends Error{
    /**
     * Custom Element options missing
     * @param {string} message 
     */
    constructor(message){
        super(message);
        this.name = "CustomElement missing options.";
        this.description = `
            Missing options object for CustomElement.
        `
    }
    /**
     * String representation of the error
     * @returns {string}
     */
    toString() {
        return `${this.name}: ${this.message}\nDescription: ${this.description.trim()}`;
    }
}

export class CustomElementConstructorError extends Error{
    /**
     * Custom Element constructor error
     * @param {string} message 
     * @param {string} missingFieldName
     */
    constructor(message, missingFieldName){
        super(message);
        this.name = "CustomElement constructor error";
        this.description = `
            Failed to construct CustomElement. Missing options field ${missingFieldName}.
        `
    }
    /**
     * String representation of the error
     * @returns {string}
     */
    toString() {
        return `${this.name}: ${this.message}\nDescription: ${this.description.trim()}`;
    }
}
