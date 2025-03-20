import ErrorXXX from "./errorXXX.js";

class Error429 extends ErrorXXX{

    constructor(response){
        super({
            msg: "To many requests to the server.",
            name: "ToManyRequests",
            statusCode: response.status,
            response: response
        })
    }
}

export default Error429;
