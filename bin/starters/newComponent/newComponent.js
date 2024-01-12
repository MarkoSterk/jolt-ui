import { Component, html } from "jolt-ui";

async function <camelCaseName>Markup(){
    return html`
        <div>
            Your component content.
        </div>
    `
}

const <camelCaseName> = new Component({
    name: "<componentName>",
    container: "<componentContainer>",
    markup: <camelCaseName>Markup,
    <dataField>
});

export default <camelCaseName>;
