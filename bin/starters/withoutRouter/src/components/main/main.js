import { Component, html } from "jolt-ui";

async function mainMarkup(){
    return html`
        <div class="row p-5 bg-light" style="min-height: 78vh;">
            <div class="col-6 mx-auto">
                <div class="text-center">
                    <img src="/images/jolt-ui_logo_gs.png"/>
                </div>
                <div>
                    <p class="text-center">
                        Welcome, to your Jolt-ui project. This is an example application. Feel free to modify this application
                        in whatever way you want.
                    </p>
                    <p class="mt-2 text-center">
                        Check out the documentations page for more information and examples.
                        Click <a class="text-decoration-none text-reset" target="_blank" href="https://jolt-ui.com/docs/introduction">here</a>
                    </p>
                </div>
            </div>
        </div>
    `
}

const main = new Component({
    name: "main",
    container: "#content",
    markup: mainMarkup
})

export default main;
