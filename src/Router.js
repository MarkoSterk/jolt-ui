class Router {
        /**
   * Main Router class. Listenes and handles routing of the app via a hashchange event listener.
   * @param {Object} app instance of the App class
   */
    app;
    currentView;
    unknownView;
    unknownViewActive;

    constructor(app) {
        this.app = app
        this.app._router = this;
        window.addEventListener('popstate', (event) => {this._onUrlChange(event)});
    }

    _getRouteAndQueryParams = () => {
        let currentUrl = window.location.href;
        let hashAndQueryParams = [this.app.index];
        if(currentUrl.includes('#')) hashAndQueryParams = currentUrl.split('#')[1].split('?');
        const hashPath = hashAndQueryParams[0];
        let queryParams = hashAndQueryParams[1] ? `?${hashAndQueryParams[1]}` : null;
        this.app.setQueryParams(queryParams);
        return hashPath;
    }

    _onUrlChange = (event) => {
        const routePath = this._getRouteAndQueryParams();
        if(Object.keys(this.paths).includes(routePath)){
            this._changeView(routePath);
        }
        else{
            this._unknownView();
        }
    }

    _deconstructPathComponents = async (oldPath) => {
        const oldPathReversed = oldPath.slice().reverse()
        for(let component of oldPathReversed){
            await component.deconstructComponent();
        }
    }

    _constructPathComponents = async (newPath) => {
        for(let component of newPath){
            await component.generateComponent();
        }
    }

    _reconstructCurrentComponent = async (pathComponents) => {
        /*
        Regenerates last child component of the path.
        Can be expanded to all current components if needed.
        */
        await pathComponents[pathComponents.length - 1].deconstructComponent();
        await pathComponents[pathComponents.length - 1].generateComponent();
    }

    _changeView = async (routePath) => {
        if(routePath==this.currentView){
            /*
            If same path needs reloading the last child component is regenerated.
            */
            return await this._reconstructCurrentComponent(this.paths[this.currentView]);
        }
        if(this.unknownViewActive){
            this.unknownView.deconstructComponent();
            this.unknownViewActive = false;
        } else{
            await this._deconstructPathComponents(this.paths[this.currentView]);
        }
        await this._constructPathComponents(this.paths[routePath]);
        this.currentView = routePath;
    }

    _unknownView = async () => {
        if(!this.unknownViewActive){
            await this._deconstructPathComponents(this.paths[this.currentView]);
            await this.unknownView.generateComponent();
            this.currentView = null;
            this.unknownViewActive = true;
        }
    }

    unknownViewComponent = (component) => {
        this.unknownView = component;
    }

    get paths(){
        return this.app._registeredPaths;
    }

    start = async () => {
        /**
         * Starts the app
         */
        const route = this._getRouteAndQueryParams();
        this.currentView = await this.app.start(route);
    }
}

export default Router;