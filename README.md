## jolt-ui -- a simple framework for complex ideas

jolt-ui aims at helping developers create nice, responsive and fast UIs with minimal effort. The framework consists of three basic parts: App, Component and Router.

**The framework uses only vanilla JS so no third-party dependancies are required.**

##### App

The App is the heart of the framework. It combines all Components (UI parts) into a single unit which keeps the development flow simple. It's main responsibility is to keep everything running and sharing any app data among the individual components. All data fields are defined at app initialization and each time a data field changes, the corresponding active component will refresh.

const app = new App({

    name:'App name',

    data: {

    dataField1: null,
        dataField2: null

    },

    beforeStart: {

    doSomethingMethod

    }

});

The app gets instatiated with some basic config options. The data fields are initialized with null values and get updated when neccessary. This triggers the reloading of active components that respond/listen to the target data field.

Adding components/paths:

app.addStaticComponents({

    component1,
    component2,
    .
    .
    .

});

Static component are components that are always visible and also don't respond to data changes. Example: menus, search bars etc.



app.addPaths({

    "index": {component:indexComponent},
    "profile": {
                      component:userProfileComponent,
                      children: {
                          "info": {component:profileInfoComponent},
                          "password": {component:profilePasswordComponent}
		      }
		}
});

Adds the routing structure to the app. All *Component objects are instances of the Component class.
Only main and child-components need to be declared here. Sub-components are automatically rendered with their containing component. Child-components on the other hand are rendered conditionally based on the route. profileInfoComponent is rendered when we navigate to the "#profile/info" route and the profilePasswordComponent is rendered when we navigate to the "#profile/password" route.

app.setIndex("route");
This sets the default/index route of the app. If at startup no route is provided or the route doesn't exist it automatically navigates to the default index route. If this is not provided and the above conditions apply the app loads the first component in the navigation paths.

##### Component

Each component represents a small piece of the UI. It can be a standalone component or be host to many subcomponents or child-components. The main difference between sub- and child-components is in the way they are rendered. A subcomponent is always rendered with its main component. You can think of it as an inseperable unit that shows a small part of the UI, while any child-component is only rendered (inside it's parent) if it is addressed specifically.

Sub- and child-components are instances of the same class as the main components (Component class) and have therefore the same behavior.

Regardless of the type, each component (including sub- and child-components) can listen to a single app data field and respond (i.e. refresh) when that field changes.

It is best to seperate the UI into individual, specialized components/sub-components, so that only small parts of the app have to refresh if a data field changes.

const componentName = new Component({

    name: "Component name",
    container: "identifierForContainerElement",
    messageContainer: "identifierForMessageContainerElement",
    markup: "markupMethodName",
    dataField: "dataFieldName",
    methods: {object with methods/functions},
    beforeGenerate: {methods that run before the component gets generated/rendered},
    intervalMethods: {any interval methods that the component used (for periodic rerendering)}
    afterGenerate: {methods that run after the component gets generated/rendered},
    beforeActive: {methods that run before the component is officially activated},
    afterActive: {methods that run after the component is officially activated},
    beforeDeconstruct: {methods that run before the component gets destroyed},
    afterDeconstruct: {methods that run after the components gets destroyed},
    beforeDeactive: {methods that run before the component is officially deactivated},
    afterDeactive: {methods that run after the component is officially deactivated},
    subcomponents: {
        subcomponent1,
        subcomponent2,
        .
        .
        .
    },
    childcomponents: {
        childcomponent1,
        childcomponent2,
        .
        .
        .
    }

})

***container***: Identifier (preferably unique) for the continer element of this component.
***messageContainer***: Identifier (preferably unique) for message rendering. The component has a simple message rendering engine which renders messages into this container. Doesn't have to be used.
***dataField***: "dataFieldName" for the data field that this component responds to. If null the component doesn't respond to any data changes.

**Component life-cycle**

The component has a somewhat complex life-cycle which can be altered witht he addition of method to the appropriate life-cycle hooks (fields) when initializing the component. The life-cycle hooks are:
beforeGenerate, afterGenerate, beforeActive, afterActive, beforeDeconstruct, afterDeconstruct, beforeDeactive and afterDeactive. An additional field is also the "interMethods" however, these methods are run periodically during the life of the component.

**Component rendering**

Each component needs a markup function which renders the required HTML markup (along with any neccessary data). This function is added at component initialization in the "markup" field. This function can call an API endpoint that renders and returns the markup (for server-side rendering) or make all the required rendering itself (client-side rendering). If you adhere to the paradigm of small and specialized components then client-side rendering will be faster, however, server-side rendering usually allows for more complex rendering and easier handling of permissions or user-specific functionality.

**Special functionality**

Usually, components contain some special functionality, be it click or hover events, animations etc. These functionalities can be explicitly added to each component as part of the "methods" field at component initialization. The provided methods can then be added to html elements inside the component with the "jolt-{event}" attribute. After the html markup is generated all set event listeners are added to the elements.

Currently the following jolt events are supported and mapped to their corresponding "vanilla" counterparts (.addEventListener() method event name strings):

    {

    'jolt-click':'click',

    'jolt-dblclick':'dblclick',

    'jolt-hover':'mouseover',

    'jolt-change':'change',

    'jolt-input':'input',

    'jolt-focusout':'focusout'

    }

The provided method also gets passed the "this" keyword which points at the containing component, along with some arguments (element, method-arguments, event, appData)

If, for example, you add the following function to the methods of a Component:

function clickedBtn(element, method-args, event, appData){

    console.log(this) //prints the containing Jolt Component
    console.log(method-args) //prints "1" - this can be a complex json structure which gets parsed
    console.log(event) //the event - in this case a click event
    console.log(appData) //all app data which can be used in the component

}

methods: {

    clickedBtn

}

and use it on a button element:

`<button type="button" jolt-click="clickedBtn" jolt-click-args="1">Btn text</button>`

After you click on the button element the "clickedBtn" function gets executed.


##### Router

The router allows app navigation. Each time the url changes (at this moment only hash routing is supported) the corresponding component along with its sub-components and possible child-components is rendered. The entire navigation structure (routes) is defined at initialization of the App class instance. The router used it to navigate the app.

const router = new Router(app); //initializes the router with the app
await router.start(); //starts the app

##### Example uses

We are working on providing some detailed example usecases.
