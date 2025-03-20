/**
 * @typedef LOGLEVELS
 * @property {string} ALL
 * @property {string} DEBUG
 * @property {string} INFO
 * @property {string} WARN
 * @property {string} ERROR
 * @property {string} FATAL
 * @property {string} OFF
 * @property {string} TRACE
 */

/**
 * @type {LOGLEVELS}
 */
const logLevels = {
    ALL: "ALL",
    DEBUG: "DEBUG",
    INFO: "INFO",
    WARN: "WARN",
    ERROR: "ERROR",
    FATAL: "FATAL",
    OFF: "OFF",
    TRACE: "TRACE"
}

class Logger{

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
     * Logger constructor method
     * @param {Object} configs
     * @param {string} configs.url - logger backend url
     * @param {Object<string, any>} [configs.requestConfigs] - possible custom configurations for post request
     */
    constructor({ url, requestConfigs }){
        this.url = url;
        if(!this.url){
            throw new Error("Missing logger url");
        }
        this.requestConfigs = requestConfigs;
    }

    /**
     * Logs error to backend url
     * @param {Object} configs
     * @param {string|Object} configs.message - log message
     * @param {LOGLEVELS} configs.level - log level of message 
     */
    log = ({ message, level = logLevels.ERROR }) => {
        const msg = JSON.stringify({message, level})
        const customConfigs = this.requestConfigs || {};
        return fetch(this.url, {
            ...this.constructor.requestConfigs,
            ...customConfigs,
            method: "POST",
            body: msg
        })
    }
}

export default Logger
export {
    logLevels
}
