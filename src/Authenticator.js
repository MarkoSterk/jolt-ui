/**
 * Jolt-ui authenticator class for authenticated route paths
 */

import { AuthenticatorConstructorError } from "./Errors";

class Authenticator{
    static redirectNavEventName = "redirect-nav-event";
    _isAuthenticated = false;
    _authRoleField;
    _user = {};

    _unauthorizedRedirect;
    _authorizedRedirect;
    _app;

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
    }

    _registerApp(app){
        this._app = app;
    }

    _getNestedField(obj, path){
        return path.split('.').reduce((currentObject, key) => {
            return currentObject && currentObject[key] !== undefined ? currentObject[key] : undefined;
        }, obj);
    }

    _createRedirectEvent(endpoint){
        return new CustomEvent(Authenticator.redirectNavEventName, {
            bubbles: true,
            detail: {redirectTo: endpoint}
        });
    }

    _makeUnauthenticatedRedirect(component){
        const redirectEvent = this._createRedirectEvent(this._unauthenticatedRedirect);
        component.DOM.dispatchEvent(redirectEvent);
    }

    _makeAuthenticatedRedirect(component){
        const redirectEvent = this._createRedirectEvent(this._authenticatedRedirect);
        component.DOM.dispatchEvent(redirectEvent);
    }

    setAuthenticatedUser(user){
        this._isAuthenticated = true;
        this._user = user;
    }

    unsetAuthenticatedUser(){
        this._isAuthenticated = false;
        this._user = null;
    }

    get isAuthenticated(){
        return this._isAuthenticated;
    }

    get user(){
        return this._user;
    }

    get authRole(){
        return this._getNestedField(this.user, this._authRoleField);
    }
}

export default Authenticator;
