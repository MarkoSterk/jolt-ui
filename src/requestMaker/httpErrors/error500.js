import ErrorXXX from "./errorXXX.js";

class Error500 extends ErrorXXX{

    constructor(response){
        super({
            msg: "Internal server error",
            name: "InternalServerError",
            statusCode: response.status,
            response: response
        })
    }
}

export default Error500;
