
class ErrorXXX extends Error{

    default500 = {
        "statusCode" : "ERR",
        "responseMsg": "Internal server error",
        "payload": null
    }

    /**
     * 
     * @param {Object} configs
     * @param {string} configs.msg - error msg
     * @param {string} configs.name - error name
     * @param {Number} configs.statusCode - status code or error
     * @param {Response} configs.response - response object of request
     */
    constructor({ msg, name, statusCode, response }){
        super(msg);
        this.statusCode = statusCode;
        this.name = name;
        this.response = response;
        this.init();
    }

    init = () => {
        this.responseBody = this.handleResponse(this.response);
    }

    /**
     * Handles the response object and tries to parse it to JSON
     * @param {Response} response 
     * @returns {Object<string, any>|null}
     */
    handleResponse = (response) => {
        const status = response.status;
        if(response?.headers){
            return response.json()
            .then((json) => {
                return json;
            }
            ).catch((err) => {
                if(status == 500){
                    return this.default500;
                }
                return null;
            })
        }
        return response;
    }

}

export default ErrorXXX;
