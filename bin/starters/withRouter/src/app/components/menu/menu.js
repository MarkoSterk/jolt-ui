import { Component, html } from "jolt-ui";

async function menuMarkup(){
    return html`
    <jolt-nav>
        <nav class="navbar navbar-expand-lg navbar-dark bg-secondary">
            <div class="container-fluid">
                <a class="navbar-brand" href="/index">Jolt-ui Project</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav">
                        <li class="nav-item">
                            <a class="nav-link active" aria-current="page" href="/index">Main</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="/docs">Docs</a>
                        </li>
                        <viteLink>
                        <li class="nav-item">
                            <a class="nav-link" target="_blank" href="https://github.com/MarkoSterk/jolt-ui">GitHub</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" target="_blank" href="https://www.npmjs.com/package/jolt-ui">NPM</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    </jolt-nav>
    `
}

const menu = new Component({
    name: "menu",
    container: "#menu",
    markup: menuMarkup
});

export default menu;
