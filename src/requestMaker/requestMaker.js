import Errors from "./httpErrors/errors.js"

const httpErrorMap = new Map(Object.entries(Errors));

class CustomResponse {

    /**
     * 
     * @param {Response} response 
     */
    constructor(response) {
      this._response = response;
      this._consumedJson = null;
      this._consumedText = null;
      this._consumedBlob = null;
      this._consumedArrayBuffer = null;
    }

    get status(){
        return this._response.status
    }

    get ok(){
        return this._response.ok;
    }

    get statusText(){
        return this._response.statusText;
    }

    get bodyUsed(){
        return this._consumedArrayBuffer != null || this._consumedText != null || this._consumedJson != null || this._consumedBlob != null;
    }

    get headers(){
        return this._response.headers;
    }

    get redirected(){
        return this._response.redirected;
    }

    get type(){
        return this._response.type;
    }

    get url(){
        return this._response.url;
    }
  
    /**
     * Overrides the native response.text() method.
     * @returns {Promise<[undefined|Error, string|undefined]>}
     */
    async text() {
      try{
        if(this._consumedText){
            return [undefined, this._consumedText];
        }
        const textContent = await this._response.text();
        this._consumedText = textContent
        return [undefined, textContent];
      }catch(e){
        return [e, undefined]
      }
    }
  
    /**
     * Overrides the native response.json() method.
     * @returns {Promise<[undefined|Error, Object|undefined]>}
     */
    async json() {
      try{
        if(this._consumedJson){
            return [undefined, this._consumedJson];
        }
        const jsonContent = await this._response.json();
        this._consumedJson = jsonContent;
        return [undefined, jsonContent];
      }catch(e){
        return [e, undefined];
      }
    }

    /**
     * Overrides the native response.blob() method.
     * @returns {Promise<[undefined|Error, Blob|undefined]>}
     */
    async blob() {
        try{
            if(this._consumedBlob){
                return [undefined, this._consumedBlob];
            }
          const blobObject = await this._response.blob();
          this._consumedBlob = blobObject;
          return [undefined, blobObject];
        }catch(e){
          return [e, undefined];
        }
    }

    /**
     * Overrides the native response.blob() method.
     * @returns {Promise<[undefined|Error, ArrayBuffer|undefined]>}
     */
    async arrayBuffer(){
        try{
            if(this._consumedArrayBuffer){
                return [undefined, this._consumedArrayBuffer];
            }
            const arrayBuffer = await this._response.arrayBuffer();
            this._consumedArrayBuffer = arrayBuffer;
            return [undefined, arrayBuffer];
          }catch(e){
            return [e, undefined];
          }
    }

}

class RequestMaker{

    static requestConfigs = {
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
            "Content-Type": "application/json"
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    }

    /**
     * Catches and handles promise based errors (i.e. no network, DNS error etc)
     * @param {Promise<Response>} promise - the promise (i.e. Fetch)
     * @param {Array<Error>} [errors] - an array with expected errors
     * @throws {Error}
     * @returns {Promise<[undefined|Error, CustomResponse|undefined]>}
     */
    static catchError = async (promise, errors) => {
        try {
            // If successful, return [undefined, CustomResponse]
            const response = await promise;
            const customResponse = new CustomResponse(response);
            return [undefined, customResponse];
        } 
        catch (error) {
            // If no specific errors array provided, or if error is in errors array
            // return [error, undefined]
            if (!errors || errors.some(e => error instanceof e)) {
              return [error, undefined];
            }
            // Otherwise throw it (an "unexpected" error)
            throw error;
        }
    }

    /**
     * Makes get request and returns the HTML
     * @param {Object} configs - configurations for function call
     * @param {string} configs.url - request url
     * @param {Array<Error>} [configs.errors] - array of expected errors
     * @returns {Promise<[undefined|Error, string|undefined]>}
     * @throws {Error}
     */
    static getHTML = async ({ url, errors }) => {
        if(!url){
            throw new Error("Missing url parameter in GET getHTML call. Forgot to provide a config object? {}")
        }
        const [ error, response ] = await this.catchError(fetch(url), errors);
        if(error){
            return [error, undefined];
        }
        return await response.text();
    }

    /**
     * Makes GET request
     * @param {Object} configs - configurations object for function
     * @param {String} configs.url - the url of the get request 
     * @param {Object<String, String|Object>} [configs.requestConfigs] - any custom configurations for the call 
     * @param {Array<Error>} [configs.errors] - array of expected errors to catch
     * @returns {Promise<[undefined|Error, CustomResponse|undefined]>}
     * @throws {Error}
     */
    static get = async ({ url, requestConfigs = {}, errors }) => {
        if(!url){
            throw new Error("Missing url parameter in GET call. Forgot to provide a config object? {}")
        }
        return await this.catchError(fetch(url, {
            ...this.requestConfigs,
            ...requestConfigs
        }), errors);
    }

    /**
     * Makes POST request with data
     * @param {Object} configs - configurations object for function
     * @param {String} configs.url - url for post request
     * @param {Object} configs.data - data for post request
     * @param {Object<String, String|Object>} [configs.requestConfigs] - any custom configurations for the call
     * @param {Array<Error>} [configs.errors] - array of expected errors to catch
     * @returns {Promise<[undefined|Error, CustomResponse|undefined]>}
     * @throws {Error}
     */
    static post = async ({ url, data, requestConfigs = {} , errors }) => {
        if(!url){
            throw new Error("Missing url parameter in POST call. Forgot to provide a config object? {}")
        }
        return await this.catchError(fetch(url, {
            ...this.requestConfigs,
            ...requestConfigs,
            method: "POST",
            body: JSON.stringify(data),
        }), errors);
    }

    /**
     * Makes POST request with FormData object
     * @param {Object} configs - configurations object for function
     * @param {String} configs.url - url for post request
     * @param {FormData} configs.data - form data object
     * @param {Object<String, String|Object>} configs.requestConfigs - any custom configurations for the call
     * @param {Array<Error>} [configs.errors] - array of expected errors to catch
     * @returns {Promise<[undefined|Error, CustomResponse|undefined]>}
     * @throws {Error}
     */
    static postForm = async ({ url, data, requestConfigs = {}, errors }) => {
        if(!url){
            throw new Error("Missing url parameter in POST form call. Forgot to provide a config object? {}")
        }
        const conf = this._multipartFormDataConfigs(requestConfigs)
        return await this.catchError(fetch(url, {
            ...conf,
            method: "POST",
            body: data,
        }), errors);
    }

    /**
     * Makes PUT request with object
     * @param {Object} configs - configurations object for function
     * @param {String} configs.url - url for put request 
     * @param {Object} configs.data - form data object 
     * @param {Object<String, String|Object>} configs.requestConfigs - any custom configurations for the call
     * @param {Array<Error>} [configs.errors] - array of expected errors to catch
     * @returns {Promise<[undefined|Error, CustomResponse|undefined]>}
     * @throws {Error}
     */
    static put = async ({ url, data, requestConfigs = {}, errors }) => {
        if(!url){
            throw new Error("Missing url parameter in PUT call. Forgot to provide a config object? {}")
        }
        return await this.catchError(fetch(url, {
            ...this.requestConfigs,
            ...requestConfigs,
            method: "PUT",
            body: JSON.stringify(data),
        }), errors);
    }

    /**
     * Makes PUT request with FormData object
     * @param {Object} configs - configurations object for function
     * @param {String} configs.url - url for post request
     * @param {FormData} configs.data - form data object
     * @param {Object<String, String|Object>} configs.requestConfigs - any custom configurations for the call
     * @param {Array<Error>} [configs.errors] - array of expected errors to catch
     * @returns {Promise<[undefined|Error, CustomResponse|undefined]>}
     * @throws {Error}
     */
    static putForm = async ({ url, data, requestConfigs = {}, errors }) => {
        if(!url){
            throw new Error("Missing url parameter in PUT form call. Forgot to provide a config object? {}")
        }
        const conf = this._multipartFormDataConfigs(requestConfigs)
        return await this.catchError(fetch(url, {
            ...conf,
            method: "PUT",
            body: data,
        }), errors);
    }

    /**
     * Makes PATCH request with object
     * @param {Object} configs - configurations object for function
     * @param {String} configs.url - url for patch request 
     * @param {Object} configs.data - form data object 
     * @param {Object<String, String|Object>} configs.requestConfigs - any custom configurations for the call
     * @param {Array<Error>} [configs.errors] - array of expected errors to catch
     * @returns {Promise<[undefined|Error, CustomResponse|undefined]>}
     * @throws {Error}
     */
    static patch = async ({ url, data, requestConfigs = {}, errors }) => {
        if(!url){
            throw new Error("Missing url parameter in PATCH call. Forgot to provide a config object? {}")
        }
        return await this.catchError(fetch(url, {
            ...this.requestConfigs,
            ...requestConfigs,
            method: "PUT",
            body: JSON.stringify(data),
        }), errors);
    }

    /**
     * Makes PATCH request with FormData object
     * @param {Object} configs - configurations object for function
     * @param {String} configs.url - url for patch request
     * @param {FormData} configs.data - form data object
     * @param {Object<String, String|Object>} configs.requestConfigs - any custom configurations for the call
     * @param {Array<Error>} [configs.errors] - array of expected errors to catch
     * @returns {Promise<[undefined|Error, CustomResponse|undefined]>}
     * @throws {Error}
     */
    static patchForm = async ({ url, data, configs = {}, errors }) => {
        if(!url){
            throw new Error("Missing url parameter in PATCH form call. Forgot to provide a config object? {}")
        }
        const conf = this._multipartFormDataConfigs(configs)
        return await this.catchError(fetch(url, {
            ...conf,
            method: "PUT",
            body: data,
        }), errors);
    }

    /**
     * Makes DELETE request
     * @param {Object} configs - configurations object for function
     * @param {String} configs.url - url for delete request 
     * @param {Object<String, String|Object>} configs.requestConfigs - any custom configurations for the call
     * @param {Array<Error>} [configs.errors] - array of expected errors to catch
     * @returns {Promise<[undefined|Error, CustomResponse|undefined]>}
     * @throws {Error}
     */
    static delete = async ({ url, requestConfigs = {}, errors }) => {
        if(!url){
            throw new Error("Missing url parameter in DELETE call. Forgot to provide a config object? {}")
        }
        return await this.catchError(fetch(url, {
            ...this.requestConfigs,
            ...requestConfigs,
            method: "DELETE",
        }), errors);
    }

    /**
     * @method
     * @param {Object<String, String|Any} configs 
     * @returns {Object}
     */
    static _multipartFormDataConfigs = (configs) => {
        return {
            ...this.requestConfigs,
            headers: {
                "Content-Type": "multipart/form-data"
            },
            ...configs
        }
    }
}

export { RequestMaker, httpErrorMap, CustomResponse };

