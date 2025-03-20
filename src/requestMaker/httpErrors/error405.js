import ErrorXXX from "./errorXXX.js";

class Error405 extends ErrorXXX{

    constructor(response){
        super({
            msg: "This HTTP method is not allowed",
            name: "MethodNotAllowed",
            statusCode: response.status,
            response: response
        })
    }
}

export default Error405;
