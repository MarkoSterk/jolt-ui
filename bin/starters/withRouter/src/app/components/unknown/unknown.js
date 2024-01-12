import { Component, html } from "jolt-ui";

async function unknownMarkup(){
    return html`
        <div class="row p-5 bg-light" style="min-height: 78vh;">
            <div class="col-6 mx-auto">
                <h4>Unknown route!</h4>
                <p>The requested route could not be found. Please check the url.</p>
            </div>
        </div>
    `
}

const unknown = new Component({
    name: "Unknown route",
    container: "#content",
    markup: unknownMarkup
})

export default unknown;
