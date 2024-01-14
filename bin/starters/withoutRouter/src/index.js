/**
 * Initialization file for your application.
 * Set any application configurations here.
 */

import { App } from "jolt-ui";
import menu from "./components/menu/menu.js";
import footer from "./components/footer/footer.js";
import main from "./components/main/main.js";
import ExampleElement from "./elements/exampleElement/exampleElement.js"

const app = new App({
    name: "<appName>",
    container: "#app",
    //add data and properties field if needed
});

app.registerCustomElements({
    ExampleElement
})

app.addStaticComponents({
    menu,
    footer,
    main
});

await app.start();