## jolt-ui -- a simple framework for complex ideas

jolt-ui aims at helping developers create nice, responsive and fast UIs with minimal effort. The framework consists of three basic parts: App, Component and Router.

**The framework uses only vanilla JS so no third-party dependancies are required.**

##### App

The App is the heart of the framework. It combines all Components (UI parts) into a single unit which keeps the development flow simple. It's main responsibility is to keep everything running and sharing any app data among the individual components. All data fields are defined at app initialization and each time a data field changes, the corresponding active component will refresh.

##### Component

Each component represents a small piece of the UI. It can be a standalone component or be host to many subcomponents or child-components. The main difference between sub- and child-components is in the way they are rendered. A subcomponent is always rendered with its main component. You can think of it as an inseperable unit, while any child-component is only rendered (inside it's parent) if it is addressed specifically.

Regardless of the type, each component (including sub- and child-components) can listen to a single app data field and respond (i.e. refresh) when that field changes.

It is best to seperate the UI into individual, specialized components/sub-components, so that only small parts of the app have to refresh if a data field changes.

##### Router

The router allows app navigation. Each time the url changes (at this moment only hash routing is supported) the corresponding component along with its sub-components and possible child-components is rendered. The entire navigation structure (routes) is defined at initialization of the App class instance. The router used it to navigate the app.

Example uses

Check out the examples for detailed implementations of the framework.
