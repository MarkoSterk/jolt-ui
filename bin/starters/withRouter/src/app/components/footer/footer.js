import { Component, html } from "jolt-ui";

async function footerMarkup(){
    return html`
        <div class="row text-center bg-secondary p-4">
            <span><jolt-nav><a href="https://jolt-ui.com" target="_blank" class="text-decoration-none text-reset">Jolt-ui.com</a></jolt-nav></span>
        </div>
    `
}

const footer = new Component({
    name: "footer",
    container: "#footer",
    markup: footerMarkup
})

export default footer;
