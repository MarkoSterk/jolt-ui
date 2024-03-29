// @ts-check

/**
 * Jolt-ui authenticator class for authenticated route paths
 */

import { AuthenticatorConstructorError } from "./Errors";
import App from "./App"
import Component from "./Component"

class Authenticator{

    /**
     * Static class property - redirect event name
     * @type {string}
     */
    static redirectNavEventName = "redirect-nav-event";

    /**
     * if user is authenticated or not (boolean)
     * @type {boolean}
     */
    _isAuthenticated = false;

    /**
     * Auth role field on the user object for the authenticator
     * @type {string}
     */
    _authRoleField;

    /**
     * If the authenticator should reflect the authenticated user object to the app data (user) field. Default false.
     * @type {boolean}
     */
    _reflect = false;

    /**
     * User object of the authenticator
     * @type {any|null}
     */
    _user = null;

    /**
     * Unauthenticated redirect route
     * @type {string}
     */
    _unauthenticatedRedirect;

    /**
     * Authenticated redirect route
     * @type {string}
     */
    _authenticatedRedirect;

    /**
     * Application class instance
     * @type {App}
     */
    _app;


    /**
     * Authenticator configs object
     * @param {Object.<string, any>} Configs 
     */
    constructor(Configs){
        if(Configs.unauthenticatedRedirect === undefined || typeof Configs.unauthenticatedRedirect !== "string"){
            throw new AuthenticatorConstructorError("Missing unauthenticatedRedirect for authenticator");
        }
        if(Configs.authenticatedRedirect === undefined || typeof Configs.authenticatedRedirect !== "string"){
            throw new AuthenticatorConstructorError("Missing authenticatedRedirect for authenticator");
        }
        this._unauthenticatedRedirect = Configs.unauthenticatedRedirect;
        this._authenticatedRedirect = Configs.authenticatedRedirect;
        this._authRoleField = Configs?.authRoleField;
        if(Configs.reflect !== undefined){
            if(typeof Configs.reflect !== "boolean"){
                throw new AuthenticatorConstructorError("Reflect must be of type boolean.");
            }
            this._reflect = Configs.reflect
        }
    }

    /**
     * Registers application to the Authenticator instance
     * @param {App} app 
     */
    _registerApp(app){
        this._app = app;
    }

    /**
     * Utility method for getting nested object fields with period-seperated strings
     * @param {any} obj 
     * @param {string} path 
     * @returns {any|undefined}
     */
    _getNestedField(obj, path){
        return path.split('.').reduce((currentObject, key) => {
            return currentObject && currentObject[key] !== undefined ? currentObject[key] : undefined;
        }, obj);
    }

    /**
     * Creates redirect event that is picked up by the router
     * @param {string} endpoint 
     * @returns {CustomEvent}
     */
    _createRedirectEvent(endpoint){
        return new CustomEvent(Authenticator.redirectNavEventName, {
            bubbles: true,
            detail: {redirectTo: endpoint}
        });
    }

    /**
     * Authenticator method for making unauthenticated redirects
     * @param {Component} component 
     * @returns {void}
     */
    _makeUnauthenticatedRedirect(component){
        const redirectEvent = this._createRedirectEvent(this._unauthenticatedRedirect);
        component?.DOM?.dispatchEvent(redirectEvent);
    }

    /**
     * Authenticator method for making authenticated redirects.
     * @param {Component} component
     * @returns {void} 
     */
    _makeAuthenticatedRedirect(component){
        const redirectEvent = this._createRedirectEvent(this._authenticatedRedirect);
        component?.DOM?.dispatchEvent(redirectEvent);
    }

    /**
     * Sets authenticated user to the authenticator
     * @param {any} user 
     * @returns {Promise<void>}
     */
    async setAuthenticatedUser(user){
        this._isAuthenticated = true;
        this._user = user;
        if(this._reflect){
            await this._app.setData("user", user);
        }
    }

    /**
     * Unsets authenticated user
     * @returns {Promise<void>}
     */
    async unsetAuthenticatedUser(){
        this._isAuthenticated = false;
        this._user = null;
        if(this._reflect){
            await this._app.setData("user", null);
        }
    }

    /**
     * Returns true or false if user is authenticated
     * @returns {boolean}
     */
    get isAuthenticated(){
        return this._isAuthenticated;
    }

    /**
     * Returns authenticated user or null
     * @returns {any|null}
     */
    get user(){
        return this._user;
    }

    /**
     * Returns required role of authenticated user
     * @returns {any|undefined}
     */
    get authRole(){
        return this._getNestedField(this.user, this._authRoleField);
    }
}

export default Authenticator;
