import App from "./app.js";
import { CustomElement } from "./baseCore.js";

/**
 * App config object
 * @typedef {Object} AppConfigs
 * @property {string} appName - name of the application
 * @property {Object<string, any>} [dataStructure] - application data structure
 * @property {Object<string, typeof HTMLElement | typeof CustomElement>} [elements] - custom elements to register
 * @property {Object<string, CallableFunction>} [renderFunctions] - custom render functions for render engine
 * @property {CallableFunction} [router] - router for application
 * @property {CallableFunction} [authenticator] - authenticator for application
 * @property {Object<string, CallableFunction>} [extensions] - translator for application
 * @property {Object<string, any>} [properties] - application properties
 * @property {Object<string, CallableFunction>} [methods] - application methods
 * @property {Object<string, CallableFunction>} [beforeInit] - methods that should run before initialization
 * @property {Object<string, CallableFunction>} [afterInit] - methods that should run after initialization
 * @property {Object<number, typeof CustomElement>} [errorPages] - object with error pages(CustomElements). Keys correspond to error codes (500, 404, 401...)
 */

/**
 * Authenticator config object
 * @typedef {Object} AuthenticatorConfigs
 * @property {string} [dataField] - datafield for user in application data structure.
 * @property {string} redirect - redirect route for unauthenticated/unauthorized users
 * @property {CallableFunction} [redirectCallback] - callback function which can be called after redirect
 * @property {App} app - application instance
 */

/**
 * Configs for custom element factory.
 * @typedef {Object} ElementFactoryConfigs
 * @param {string} tagName - component tagName
 * @param {CallableFunction} markup - markup method for this component (async)
 * @param {Object<string, CallableFunction|string>} css - css configs of this component
 * @param {Object<string, CallableFunction>} [methods] - component methods for functionality (must be normal functions NOT arrow functions!)
 * @param {Object<string, CallableFunction>} [beforeInit] - methods that should run before initialization
 * @param {Object<string, CallableFunction>} [beforeInitResolve] - methods that should run before initialization
 * @param {Object<string, CallableFunction>} [afterInit] - methods that should run after initialization
 * @param {Object<string, CallableFunction>} [beforeRerender] - methods that should run before rerender
 * @param {Object<string, CallableFunction>} [afterRerender] - methods that should run after rerender
 * @param {Object<string, CallableFunction>} [afterDisconnect] - methods that should run in the disconnected callback
 * @param {Object<string, Object<string, CallableFunction>>} [define] - setter/getter definitions for the element
 * @param {Object<string, CallableFunction>} [templateFunctions] - object with callable template functions
 * @returns {typeof CustomElement}
 */

/**
 * Route object
 * @typedef ROUTE
 * @property {string} path
 * @property {CustomElement} handler
 * @property {string} target
 * @property {any} details
 * @property {Array<string>} [roles]
 * @property {Array<ROUTE>} [children]
 */


/**
* @typedef {Object} RouterConfigs
* @property {string} baseUrl - base url that should be ignored for routing
* @property {CallableFunction|Array<ROUTE>} routes - routing table generator fuction or routes array
* @property {CustomElement} baseLayout - base layout for the application
* @property {string} defaultTarget - default target container for rendering error pages
* @property {number} [pageNotFoundCode] - page not found error code in app.errorPages. Default 404
* @property {string} [index] - index page of app default "/"
* @property {App} app - application instance
*/

/**
 * @typedef {Object} DiffConfigs
 * @property {HTMLElement} targetElement
 * @property {string} newMarkup
 * @property {CustomElement} customElement
 */

export {};
