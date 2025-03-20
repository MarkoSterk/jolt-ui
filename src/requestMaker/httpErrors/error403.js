import ErrorXXX from "./errorXXX.js";

class Error403 extends ErrorXXX{

    constructor(response){
        super({
            msg: "Forbidden resource",
            name: "ForbiddenRequest",
            statusCode: response.status,
            response: response
        })
    }
}

export default Error403;
