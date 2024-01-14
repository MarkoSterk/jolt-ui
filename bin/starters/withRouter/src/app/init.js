/**
 * Initialization file for your application.
 * Set any application configurations here.
 */

import { App } from "jolt-ui";
<authImport>
import menu from "./components/menu/menu.js";
import footer from "./components/footer/footer.js";
import main from "./components/main/main.js";
import docs from "./components/docs/docs.js";
import ExampleElement from "./elements/exampleElement/exampleElement.js";

const app = new App({
    name: "<appName>",
    container: "#app",
    <authInit>
    //add data and properties field if needed
});

app.registerCustomElements({
    ExampleElement
})

app.addStaticComponents({
    menu,
    footer
});

app.addPaths({
    "index": {component: main},
    "docs": {component: docs}
});

app.setIndex("index");

export default app;