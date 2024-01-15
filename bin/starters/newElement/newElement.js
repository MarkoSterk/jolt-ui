import { Element, html } from "jolt-ui";

async function <camelCaseName>Markup(){
    return html`
        <div>
            Custom element markup.
        </div>
    `
}

const <camelCaseName> = Element({
    name: "<elementName>",
    markup: <camelCaseName>Markup,
});

export default <camelCaseName>;