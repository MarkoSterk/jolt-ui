import App from "./app.js";

/**
 * @typedef {import('./types.js').AuthenticatorConfigs} AuthenticatorConfigs
 */

class Authenticator{

    /**
     * @type {Array<string>}
     */
    _authenticatedUserRoles;

    /**
     * Constructor for authenticator for application
     * @param {AuthenticatorConfigs} configs
     */
    constructor({ redirect, redirectCallback, dataField, app }){
        if(!redirect || !app){
            throw new Error("Missing application instance or redirect route in Authenticator constructor");
        }
        this._app = app;
        this._redirect = redirect
        this._redirectCallback = redirectCallback;
        this._authenticatedUser = null;
        this._authenticatedUserRoles = null;
        this._dataField = dataField
    }

    /**
     * Sets authenticated user and roles to authenticator AND application data
     * @param {Object} configs
     * @param {Object} configs.user - user object
     * @param {Array<string>} [configs.roles] - array of strings with user roles. default = []
     */
    setAuthenticatedUser = ({ user, roles }) => {
        this._authenticatedUser = user;
        if(roles){
            this._authenticatedUserRoles = roles;
        }
        if(this._dataField){
            this.app.setData(this._dataField, user);
        }
    }

    /**
     * Sets new user roles
     * @param {Array<string>} roles 
     */
    setUserRoles = (roles) => {
        this._authenticatedUserRoles = roles;
    }

    /**
     * Removes authenticated user and their roles
     */
    removeAuthenticatedUser = () => {
        this._authenticatedUser = null;
        this._authenticatedUserRoles = null;
        if(this.app?.router?.currentRoute?.authenticationRequired){
            this.app.router.redirect(this._redirect);
        }
        if(this._dataField){
            this.app.removeData(this._dataField);
        }
    }

    /**
     * Checks if user roles contains any of the required roles
     * @param {Array<string>} rolesRequired 
     * @returns {boolean}
     */
    hasRole = (rolesRequired = []) => {
        if(!this._authenticatedUser){
            return false;
        }
        if(rolesRequired.length == 0){
            return true;
        }
        if(!this._authenticatedUserRoles){
            return false;
        }
        const userRolesSet = new Set(this._authenticatedUserRoles);
        return rolesRequired.some(role => userRolesSet.has(role));
    }

    /**
     * Returns all roles of current authenticated user
     * @returns {Array<string>|null}
     */
    getRoles = () => {
        return this._authenticatedUserRoles;
    }

    /**
     * Returns current authenticated user
     * @returns {Object<string, any>}
     */
    getUser = () => {
        return this._authenticatedUser;
    }

    /**
     * Checks if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated = () => {
        if(!this._authenticatedUser){
            return false;
        }
        return true;
    }

    /**
     * Performs unauthorized redirect
     * @async
     */
    unauthorizedRedirect = async () => {
        await this.app.router.redirect(this.redirect)
    }

    /**
     * Getter for redirect callback
     * @returns {CallableFunction}
     */
    get redirectCallback(){
        return this._redirectCallback;
    }

    /**
     * Getter for application object on authenticator instance
     * @returns {App}
     */
    get app(){
        return this._app;
    }

    /**
     * Redirect location
     * @returns {string}
     */
    get redirect(){
        return this._redirect;
    }


}

export default Authenticator;
