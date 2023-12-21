class InitializationError extends Error{
    constructor(message){
        super(message);
        this.name = "App initialization error"
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


export {
    DataError,
    InitializationError
}
