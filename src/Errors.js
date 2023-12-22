class AppConstructorError extends Error {
    constructor(message){
        super(message);
        this.name = "App constructor error";
        this.description = ```
            App constructor failed. Please check if all required configuration fields are present.
            Required fields are: container (String), name (String) and data (Object)
        ```
    }
}


class InitializationError extends Error{
    constructor(message){
        super(message);
        this.name = "App initialization error";
        this.description = ```
            App constructor failed. Please check if all required configuration fields are present.
            Required fields are: container (String), name (String) and data (Object)
        ```
    }
}

class DataError extends Error{
    constructor(message){
        super(message);
        this.name = "Data error";
    }
}

class RouterTypeError extends Error{
    constructor(message){
        super(message);
        this.name = "Router type error";
        this.description = ```
            Router type error. Only two types of routers are available. 
            Available types are: "url" and "hash". Please check your router configurations. 
        ```
    }
}

class RouteError extends Error{
    constructor(message){
        super(message);
        this.name = "Route error";
        this.description = ```
            Route error. Router was unable to find requested route. To avoid this error
            provide an unknownView component to the router using the unknownViewComponent method.
        ```
    }
}

class ComponentConstructorError extends Error{
    constructor(message){
        super(message);
        this.name = "Component constructor error.";
        this.description = ```
            Component constructor error. Failed to construct component due to missing configuration
            options. Configuration object must include fields: (String) container, (String) name and (Function) merkup.
        ```
    }
}

class RenderOptionsError extends Error{
    constructor(message, name){
        super(message);
        this.name = `Component - ${name} - render options error`;
        this.description = ```
            Component render options error. If render options object is provided both render options fields must be defined.
            Render option fields are: (Boolean) delete and (String) insert.
            Available insert field options are: ["beforebegin", "afterbegin", "beforeend", "afterend"]
        ```
    }
}


export {
    DataError,
    InitializationError,
    AppConstructorError,
    RouterTypeError,
    RouteError,
    ComponentConstructorError,
    RenderOptionsError
}
