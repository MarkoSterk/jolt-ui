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
        if(Configs.unauthorizedRedirect === undefined || typeof Configs.unauthorizedRedirect === "String"){
            throw new AuthenticatorConstructorError("Missing unauthorizedRedirect for authenticator");
        }
        if(Configs.unauthorizedRedirect === undefined || typeof Configs.unauthorizedRedirect === "String"){
            throw new AuthenticatorConstructorError("Missing authorizedRedirect for authenticator");
        }
        this._unauthorizedRedirect = Configs.unauthorizedRedirect;
        this._authorizedRedirect = Configs.authorizedRedirect;
        this._authRoleField = Configs?.authRoleField;
    }

    _registerApp(app){
        this._app = app;
        app._authenticator = this;
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

    _makeUnauthorizedRedirect(component){
        const redirectEvent = this._createRedirectEvent(this._unauthorizedRedirect);
        component.DOM.dispatchEvent(redirectEvent);
    }

    _makeAuthorizedRedirect(component){
        const redirectEvent = this._createRedirectEvent(this._authorizedRedirect);
        component.DOM.dispatchEvent(redirectEvent);
    }

    set isAuthenticated(authenticated){
        this._isAuthenticated = authenticated;
    }

    get isAuthenticated(){
        return this._isAuthenticated;
    }

    get user(){
        return this._user;
    }

    set user(user){
        this._user = user;
    }

    get authRoleField(){
        return this._getNestedField(this.user);
    }
}

export default Authenticator;
