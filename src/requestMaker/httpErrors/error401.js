import ErrorXXX from "./errorXXX.js";

class Error401 extends ErrorXXX{

    constructor(response){
        super({
            msg: "Unauthorized",
            name: "UnauthorizedRequest",
            statusCode: response.status,
            response: response
        })
    }
}

export default Error401;
