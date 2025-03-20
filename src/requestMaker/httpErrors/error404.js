import ErrorXXX from "./errorXXX.js";

class Error404 extends ErrorXXX{

    constructor(response){
        super({
            msg: "Resource not found",
            name: "ResourceNotFound",
            statusCode: response.status,
            response: response
        })
    }
}

export default Error404;
