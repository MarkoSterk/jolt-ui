import { parse, stringify } from "./css_what/index.js";
import { camelToKebab } from "../app.js";

function escapeAttributeNames(astTokens) {
    return astTokens.map(tokenOrGroup => {
        // If it's an array, recurse into it (because css-what can nest arrays)
        if (Array.isArray(tokenOrGroup)) {
            return escapeAttributeNames(tokenOrGroup);
        }

        // Otherwise, tokenOrGroup is a single token object
        if (tokenOrGroup.type === 'attribute') {
            // Return a new object with an escaped name
            let attributeName = tokenOrGroup.name.replace(/:/g, 'data-');
            attributeName = attributeName.replace(/@/g, 'jolt-');
            return {
                ...tokenOrGroup,
                name: camelToKebab(attributeName)
            };
        }

        // For non-attribute tokens, just clone them so we don't mutate in place
        return { ...tokenOrGroup };
    });
}

/**
 * Parses provided query selector and escapes any attributes
 * with a ":" prefix
 * @param {string} selector - query selector
 * @returns {string}
*/
function transformSelector(selector){
    const ast = parse(selector);
    const escaped = escapeAttributeNames(ast);
    return stringify(escaped);
}

export {
    transformSelector,
    escapeAttributeNames
}
