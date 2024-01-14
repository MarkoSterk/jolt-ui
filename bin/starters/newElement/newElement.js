import { CustomElement, html } from "jolt-ui";

async function <camelCaseName>Markup(){
    return html`
        <div>
            Custom element markup.
        </div>
    `
}

const <camelCaseName> = CustomElement({
    name: "<elementName>",
    markup: <camelCaseName>Markup,
});

export default <camelCaseName>;