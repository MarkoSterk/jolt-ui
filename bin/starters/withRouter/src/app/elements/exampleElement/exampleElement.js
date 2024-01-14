import { CustomElement, html } from "jolt-ui";

async function exampleElementMarkup(){
    return html`
        <div>
            Example CustomElement.
        </div>
    `
}

const exampleElement = CustomElement({
    name: "example-element",
    markup: exampleElementMarkup,
});

export default exampleElement;