import ErrorXXX from "./errorXXX.js";

class Error408 extends ErrorXXX{

    constructor(response){
        super({
            msg: "The request timed out.",
            name: "RequestTimeout",
            statusCode: response.status,
            response: response
        })
    }
}

export default Error408;
