/**
 * doT.js render engine
 * MIT license
 * 
 * https://olado.github.io/doT/index.html
 * 
 * EXTENDED THE RENDER ENGINE TO PARSE data-bind ATTRIBUTES ON HTML ELEMENTS.
 * THIS IS CRUCIAL FOR SOME ADVANCED FUNCTIONALITY
 * 
 */
import { camelToKebab } from "./app.js"

"use strict";

var doT = {
	name: "doT",
	version: "1.1.1",
	templateSettings: {
		evaluate:    /\{\{([\s\S]+?(\}?)+)\}\}/g,
		interpolate: /\{\{=([\s\S]+?)\}\}/g,
		encode:      /\{\{!([\s\S]+?)\}\}/g,
		use:         /\{\{#([\s\S]+?)\}\}/g,
		useParams:   /(^|[^\w$])def(?:\.|\[[\'\"])([\w$\.]+)(?:[\'\"]\])?\s*\:\s*([\w$\.]+|\"[^\"]+\"|\'[^\']+\'|\{[^\}]+\})/g,
		define:      /\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g,
		defineParams:/^\s*([\w$]+):([\s\S]+)/,
		conditional: /\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}/g,
		iterate:     /\{\{~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})/g,
		varname:	"it",
		strip:		true,
		append:		true,
		selfcontained: false,
		doNotSkipEncoded: false
	},
	template: undefined, //fn, compile template
	compile:  undefined, //fn, for express
	log: true
};

doT.encodeHTMLSource = function(doNotSkipEncoded) {
	var encodeHTMLRules = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': "&#34;", "'": "&#39;", "/": "&#47;" },
		matchHTML = doNotSkipEncoded ? /[&<>"'\/]/g : /&(?!#?\w+;)|<|>|"|'|\//g;
	return function(code) {
		return code ? code.toString().replace(matchHTML, function(m) {return encodeHTMLRules[m] || m;}) : "";
	};
};

var startend = {
	append: { start: "'+(",      end: ")+'",      startencode: "'+encodeHTML(" },
	split:  { start: "';out+=(", end: ");out+='", startencode: "';out+=encodeHTML(" }
}, skip = /$^/;

function resolveDefs(c, block, def) {
	return ((typeof block === "string") ? block : block.toString())
	.replace(c.define || skip, function(m, code, assign, value) {
		if (code.indexOf("def.") === 0) {
			code = code.substring(4);
		}
		if (!(code in def)) {
			if (assign === ":") {
				if (c.defineParams) value.replace(c.defineParams, function(m, param, v) {
					def[code] = {arg: param, text: v};
				});
				if (!(code in def)) def[code]= value;
			} else {
				new Function("def", "def['"+code+"']=" + value)(def);
			}
		}
		return "";
	})
	.replace(c.use || skip, function(m, code) {
		if (c.useParams) code = code.replace(c.useParams, function(m, s, d, param) {
			if (def[d] && def[d].arg && param) {
				var rw = (d+":"+param).replace(/'|\\/g, "_");
				def.__exp = def.__exp || {};
				def.__exp[rw] = def[d].text.replace(new RegExp("(^|[^\\w$])" + def[d].arg + "([^\\w$])", "g"), "$1" + param + "$2");
				return s + "def.__exp['"+rw+"']";
			}
		});
		var v = new Function("def", "return " + code)(def);
		return v ? resolveDefs(c, v, def) : v;
	});
}

function unescape(code) {
	return code.replace(/\\('|\\)/g, "$1").replace(/[\r\t\n]/g, " ");
}

doT.template = function(tmpl, c, def) {
	c = c || doT.templateSettings;
    var cse = c.append ? startend.append : startend.split, needhtmlencode, sid = 0, indv;

    // Resolve definitions and prepare the template string
    tmpl = (c.use || c.define) ? resolveDefs(c, tmpl, def || {}) : tmpl;
	
	// Handle data-bind attributes
	//Adds unique data-bind-id attributes to elements/tags
	tmpl = tmpl.replace(/<([a-zA-Z0-9\-]+)([^>]*)\sdata-bind="([^"]+)"([^>]*)>/g, (match, tag, before, bindValue, after) => {
        var randomId = this.generateHash(); // Generate unique ID
        var fullTag = `<${tag}${before} data-bind="${camelToKebab(bindValue)}" data-bind-id="${randomId}"${after}>`;
        return fullTag; // Return the modified opening tag
    });

	//parses the string tmpl to a DOM element and extracts the inner html
	//of all data-bind elements
	const div = document.createElement("div");
	this.app._originalInnerHTML.call(div, tmpl);
	div.querySelectorAll('[data-bind]').forEach((elem) => {
		const bindValue = elem.getAttribute("data-bind");
		const bindId = elem.getAttribute("data-bind-id");
		const innerTemplate = elem.innerHTML;
		if (!c.dataBinds.has(bindValue)) {
			c.dataBinds.set(bindValue, {});
		}

		//string encoding
		const textarea = document.createElement("textarea");
		textarea.innerHTML = innerTemplate

		const currentValue = c.dataBinds.get(bindValue);
		currentValue[bindId] = textarea.value;
		c.dataBinds.set(bindValue, currentValue);
		//console.log(c.dataBinds)
	})
	////////////////////////////////////////////////////////

	tmpl = ("var out='" + (c.strip ? tmpl.replace(/(^|\r|\n)\t* +| +\t*(\r|\n|$)/g, " ")
        .replace(/\r|\n|\t|\/\*[\s\S]*?\*\//g, "") : tmpl)
        .replace(/'|\\/g, "\\$&")
        .replace(c.interpolate || skip, function (m, code) {
            return cse.start + unescape(code) + cse.end;
        })
        .replace(c.encode || skip, function (m, code) {
            needhtmlencode = true;
            return cse.startencode + unescape(code) + cse.end;
        })
        .replace(c.conditional || skip, function (m, elsecase, code) {
            return elsecase ?
                (code ? "';}else if(" + unescape(code) + "){out+='" : "';}else{out+='") :
                (code ? "';if(" + unescape(code) + "){out+='" : "';}out+='");
        })
        .replace(c.iterate || skip, function (m, iterate, vname, iname) {
            if (!iterate) return "';} } out+='";
            sid += 1; indv = iname || "i" + sid; iterate = unescape(iterate);
            return "';var arr" + sid + "=" + iterate + ";if(arr" + sid + "){var " + vname + "," + indv + "=-1,l" + sid + "=arr" + sid + ".length-1;while(" + indv + "<l" + sid + "){"
                + vname + "=arr" + sid + "[" + indv + "+=1];out+='";
        })
        .replace(c.evaluate || skip, function (m, code) {
            return "';" + unescape(code) + "out+='";
        })
        + "';return out;")
        .replace(/\n/g, "\\n").replace(/\t/g, '\\t').replace(/\r/g, "\\r")
        .replace(/(\s|;|\}|^|\{)out\+='';/g, '$1').replace(/\+''/g, "");

    if (needhtmlencode) {
        tmpl = "var encodeHTML = " + doT.encodeHTMLSource.toString() + "(" + (c.doNotSkipEncoded || '') + ");" + tmpl;
    }

    // Compile the template string into a function
    try {
        return new Function(c.varname, tmpl);
    } catch (e) {
        if (typeof console !== "undefined") console.log("Could not create a template function: " + tmpl);
        throw e;
    }
};

doT.compile = function(tmpl, def) {
	return doT.template(tmpl, null, def);
};

export default doT;
