import ErrorXXX from "./errorXXX.js";

class Error400 extends ErrorXXX{

    constructor(response){
        super({
            msg: "Bad request",
            name: "BadRequest",
            statusCode: response.status,
            response: response
        })
    }
}

export default Error400;
