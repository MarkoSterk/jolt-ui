import { Component, html } from "jolt-ui";

async function docsMarkup(){
    return html`
        <div class="row" style="min-height: 78vh;">
            <div class="col-6 mx-auto pt-5">
                <p class="mt-5 text-center">
                    Thank you for using Jolt-ui for your project. If you encounter any problems or have suggestions for improvements
                    feel free to contact us via <a class="text-decoration-none" href="https://github.com/MarkoSterk/jolt-ui" target="_blank">GitHub</a> or <a class="text-decoration-none" target="_blank" href="https://jolt-ui.com">Jolt-ui.com</a>.
                </p>
                <p class="mt-5 text-center">
                    For more information and examples about how to create your app with Jolt-ui
                    check out our documentations page <a target="_blank" href="https://jolt-ui.com/docs/introduction">HERE</a>
                </p>
            </div>
        </div>
    `
}

const docs = new Component({
    name: "docs",
    container: "#content",
    markup: docsMarkup
});

export default docs;
