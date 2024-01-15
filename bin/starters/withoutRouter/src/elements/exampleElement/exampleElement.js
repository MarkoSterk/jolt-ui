import { Element, html } from "jolt-ui";

async function exampleElementMarkup(){
    return html`
        <div>
            Example Element.
        </div>
    `
}

const exampleElement = Element({
    name: "example-element",
    markup: exampleElementMarkup,
});

export default exampleElement;