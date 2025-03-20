var Kt = Object.defineProperty;
var St = (l) => {
  throw TypeError(l);
};
var en = (l, r, e) => r in l ? Kt(l, r, { enumerable: !0, configurable: !0, writable: !0, value: e }) : l[r] = e;
var p = (l, r, e) => en(l, typeof r != "symbol" ? r + "" : r, e), Et = (l, r, e) => r.has(l) || St("Cannot " + e);
var d = (l, r, e) => (Et(l, r, "read from private field"), e ? e.call(l) : r.get(l)), w = (l, r, e) => r.has(l) ? St("Cannot add the same private member more than once") : r instanceof WeakSet ? r.add(l) : r.set(l, e), U = (l, r, e, a) => (Et(l, r, "write to private field"), a ? a.call(l, e) : r.set(l, e), e), je = (l, r, e) => (Et(l, r, "access private method"), e);
class bn {
  /**
   * Constructor for authenticator for application
   * @param {AuthenticatorConfigs} configs
   */
  constructor({ redirect: r, redirectCallback: e, dataField: a, app: o }) {
    /**
     * @type {Array<string>}
     */
    p(this, "_authenticatedUserRoles");
    /**
     * Sets authenticated user and roles to authenticator AND application data
     * @param {Object} configs
     * @param {Object} configs.user - user object
     * @param {Array<string>} [configs.roles] - array of strings with user roles. default = []
     */
    p(this, "setAuthenticatedUser", ({ user: r, roles: e }) => {
      this._authenticatedUser = r, e && (this._authenticatedUserRoles = e), this._dataField && this.app.setData(this._dataField, r);
    });
    /**
     * Sets new user roles
     * @param {Array<string>} roles 
     */
    p(this, "setUserRoles", (r) => {
      this._authenticatedUserRoles = r;
    });
    /**
     * Removes authenticated user and their roles
     */
    p(this, "removeAuthenticatedUser", () => {
      var r, e, a;
      this._authenticatedUser = null, this._authenticatedUserRoles = null, (a = (e = (r = this.app) == null ? void 0 : r.router) == null ? void 0 : e.currentRoute) != null && a.authenticationRequired && this.app.router.redirect(this._redirect), this._dataField && this.app.removeData(this._dataField);
    });
    /**
     * Checks if user roles contains any of the required roles
     * @param {Array<string>} rolesRequired 
     * @returns {boolean}
     */
    p(this, "hasRole", (r = []) => {
      if (!this._authenticatedUser)
        return !1;
      if (r.length == 0)
        return !0;
      if (!this._authenticatedUserRoles)
        return !1;
      const e = new Set(this._authenticatedUserRoles);
      return r.some((a) => e.has(a));
    });
    /**
     * Returns all roles of current authenticated user
     * @returns {Array<string>|null}
     */
    p(this, "getRoles", () => this._authenticatedUserRoles);
    /**
     * Returns current authenticated user
     * @returns {Object<string, any>}
     */
    p(this, "getUser", () => this._authenticatedUser);
    /**
     * Checks if user is authenticated
     * @returns {boolean}
     */
    p(this, "isAuthenticated", () => !!this._authenticatedUser);
    /**
     * Performs unauthorized redirect
     * @async
     */
    p(this, "unauthorizedRedirect", async () => {
      await this.app.router.redirect(this.redirect);
    });
    if (!r || !o)
      throw new Error("Missing application instance or redirect route in Authenticator constructor");
    this._app = o, this._redirect = r, this._redirectCallback = e, this._authenticatedUser = null, this._authenticatedUserRoles = null, this._dataField = a;
  }
  /**
   * Getter for redirect callback
   * @returns {CallableFunction}
   */
  get redirectCallback() {
    return this._redirectCallback;
  }
  /**
   * Getter for application object on authenticator instance
   * @returns {App}
   */
  get app() {
    return this._app;
  }
  /**
   * Redirect location
   * @returns {string}
   */
  get redirect() {
    return this._redirect;
  }
}
var ee = {
  name: "doT",
  version: "1.1.1",
  templateSettings: {
    evaluate: /\{\{([\s\S]+?(\}?)+)\}\}/g,
    interpolate: /\{\{=([\s\S]+?)\}\}/g,
    encode: /\{\{!([\s\S]+?)\}\}/g,
    use: /\{\{#([\s\S]+?)\}\}/g,
    useParams: /(^|[^\w$])def(?:\.|\[[\'\"])([\w$\.]+)(?:[\'\"]\])?\s*\:\s*([\w$\.]+|\"[^\"]+\"|\'[^\']+\'|\{[^\}]+\})/g,
    define: /\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g,
    defineParams: /^\s*([\w$]+):([\s\S]+)/,
    conditional: /\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}/g,
    iterate: /\{\{~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})/g,
    varname: "it",
    strip: !0,
    append: !0,
    selfcontained: !1,
    doNotSkipEncoded: !1
  },
  template: void 0,
  //fn, compile template
  compile: void 0,
  //fn, for express
  log: !0
};
ee.encodeHTMLSource = function(l) {
  var r = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': "&#34;", "'": "&#39;", "/": "&#47;" }, e = l ? /[&<>"'\/]/g : /&(?!#?\w+;)|<|>|"|'|\//g;
  return function(a) {
    return a ? a.toString().replace(e, function(o) {
      return r[o] || o;
    }) : "";
  };
};
var Nt = {
  append: { start: "'+(", end: ")+'", startencode: "'+encodeHTML(" },
  split: { start: "';out+=(", end: ");out+='", startencode: "';out+=encodeHTML(" }
}, Z = /$^/;
function Lt(l, r, e) {
  return (typeof r == "string" ? r : r.toString()).replace(l.define || Z, function(a, o, h, _) {
    return o.indexOf("def.") === 0 && (o = o.substring(4)), o in e || (h === ":" ? (l.defineParams && _.replace(l.defineParams, function(g, b, y) {
      e[o] = { arg: b, text: y };
    }), o in e || (e[o] = _)) : new Function("def", "def['" + o + "']=" + _)(e)), "";
  }).replace(l.use || Z, function(a, o) {
    l.useParams && (o = o.replace(l.useParams, function(_, g, b, y) {
      if (e[b] && e[b].arg && y) {
        var R = (b + ":" + y).replace(/'|\\/g, "_");
        return e.__exp = e.__exp || {}, e.__exp[R] = e[b].text.replace(new RegExp("(^|[^\\w$])" + e[b].arg + "([^\\w$])", "g"), "$1" + y + "$2"), g + "def.__exp['" + R + "']";
      }
    }));
    var h = new Function("def", "return " + o)(e);
    return h && Lt(l, h, e);
  });
}
function oe(l) {
  return l.replace(/\\('|\\)/g, "$1").replace(/[\r\t\n]/g, " ");
}
ee.template = function(l, r, e) {
  r = r || ee.templateSettings;
  var a = r.append ? Nt.append : Nt.split, o, h = 0, _;
  l = r.use || r.define ? Lt(r, l, e || {}) : l, l = l.replace(/<([a-zA-Z0-9\-]+)([^>]*)\sdata-bind="([^"]+)"([^>]*)>/g, (b, y, R, L, N) => {
    var S = this.generateHash(), O = `<${y}${R} data-bind="${Ee(L)}" data-bind-id="${S}"${N}>`;
    return O;
  });
  const g = document.createElement("div");
  this.app._originalInnerHTML.call(g, l), g.querySelectorAll("[data-bind]").forEach((b) => {
    const y = b.getAttribute("data-bind"), R = b.getAttribute("data-bind-id"), L = b.innerHTML;
    r.dataBinds.has(y) || r.dataBinds.set(y, {});
    const N = document.createElement("textarea");
    N.innerHTML = L;
    const S = r.dataBinds.get(y);
    S[R] = N.value, r.dataBinds.set(y, S);
  }), l = ("var out='" + (r.strip ? l.replace(/(^|\r|\n)\t* +| +\t*(\r|\n|$)/g, " ").replace(/\r|\n|\t|\/\*[\s\S]*?\*\//g, "") : l).replace(/'|\\/g, "\\$&").replace(r.interpolate || Z, function(b, y) {
    return a.start + oe(y) + a.end;
  }).replace(r.encode || Z, function(b, y) {
    return o = !0, a.startencode + oe(y) + a.end;
  }).replace(r.conditional || Z, function(b, y, R) {
    return y ? R ? "';}else if(" + oe(R) + "){out+='" : "';}else{out+='" : R ? "';if(" + oe(R) + "){out+='" : "';}out+='";
  }).replace(r.iterate || Z, function(b, y, R, L) {
    return y ? (h += 1, _ = L || "i" + h, y = oe(y), "';var arr" + h + "=" + y + ";if(arr" + h + "){var " + R + "," + _ + "=-1,l" + h + "=arr" + h + ".length-1;while(" + _ + "<l" + h + "){" + R + "=arr" + h + "[" + _ + "+=1];out+='") : "';} } out+='";
  }).replace(r.evaluate || Z, function(b, y) {
    return "';" + oe(y) + "out+='";
  }) + "';return out;").replace(/\n/g, "\\n").replace(/\t/g, "\\t").replace(/\r/g, "\\r").replace(/(\s|;|\}|^|\{)out\+='';/g, "$1").replace(/\+''/g, ""), o && (l = "var encodeHTML = " + ee.encodeHTMLSource.toString() + "(" + (r.doNotSkipEncoded || "") + ");" + l);
  try {
    return new Function(r.varname, l);
  } catch (b) {
    throw typeof console < "u" && console.log("Could not create a template function: " + l), b;
  }
};
ee.compile = function(l, r) {
  return ee.template(l, null, r);
};
const tn = {
  evaluate: /\{\{([\s\S]+?)\}\}/g,
  interpolate: /\{\{=([\s\S]+?)\}\}/g,
  encode: /\{\{!([\s\S]+?)\}\}/g,
  use: /\{\{#([\s\S]+?)\}\}/g,
  define: /\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g,
  conditional: /\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}/g,
  iterate: /\{\{~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})/g,
  varname: "it",
  strip: !0,
  append: !0,
  selfcontained: !1,
  dataBinds: /* @__PURE__ */ new Map(),
  def: {}
};
function nn(l = 1e4, r = 1) {
  return Math.floor(Math.random() * (l - r + 1)) + r;
}
function En(l) {
  return function(e) {
    const a = window.structuredClone(l);
    return [void 0, null].includes(a) || (this._values[e] = a), {
      /**
       * @this {CustomElement}
       * @returns {any}
       */
      get() {
        return this._values[e];
      },
      /**
       * @this {CustomElement}
       * @param {any} value 
       */
      set(o) {
        this._values[e] = o, this._refreshBoundElements(Ee(e));
      }
    };
  };
}
function Vn(l) {
  if ([void 0, null, ""].includes(l))
    throw new Error("Missing or invalid query selector for querySelector getter factory");
  return function() {
    const e = l;
    return {
      /**
       * Gets the first matching element within the current context.
       * @this {CustomElement}
       * @returns {Element|null} The first matching element or `null` if none is found.
       */
      get() {
        return this.querySelector(e);
      }
    };
  };
}
function An(l) {
  if ([void 0, null, ""].includes(l))
    throw new Error("Missing or invalid query selector for querySelector getter factory");
  return function() {
    const e = l;
    return {
      /**
       * Gets all matching elements within the current context.
       * @this {CustomElement}
       * @returns {NodeListOf<Element>}
       */
      get() {
        return this.querySelectorAll(e);
      }
    };
  };
}
const Dt = String.raw, an = String.raw;
var Ve, ce, Ue, he, Q, Ae, Be, xe, We, ze, de, z, Qe, Ie, Ge, Je, Ye, Ze, Xe, Ke, et, tt, fe, pe, Ce, nt, at;
const rt = class rt extends HTMLElement {
  constructor() {
    super();
    p(this, "_startInitilization", () => {
      this.resolveInitialization = null, this.initComplete = new Promise((e) => {
        this.resolveInitialization = e;
      });
    });
    /**
     * @type {Promise<void>}
     */
    p(this, "initComplete");
    /**
     * Component methods
     * @type {Object<string, CallableFunction}
     */
    p(this, "_methods");
    /**
     * Component markup method
     * @type {CallableFunction}
     * @async
     */
    p(this, "markup");
    /**
     * Component css method
     * @type {Object<string, CallableFunction|string>}
     */
    p(this, "css");
    /**
     * If the style should be scoped or not
     * @type {boolean}
     */
    w(this, Ve);
    /**
     * CSS style string
     * @type {string}
     */
    w(this, ce);
    /**
     * Methods that should run before initialization
     * @type {Object<string, CallableFunction>}
     */
    p(this, "_beforeInit");
    /**
     * Methods that should run after initialization
     * @type {Object<string, CallableFunction>}
     */
    p(this, "_beforeInitResolve");
    /**
     * Methods that should run after initialization
     * @type {Object<string, CallableFunction>}
     */
    p(this, "_afterInit");
    /**
     * Methods that should run before rerender
     * @type {Object<string, CallableFunction>}
     */
    p(this, "_beforeRerender");
    /**
     * Methods that should run after rerender
     * @type {Object<string, CallableFunction>}
     */
    p(this, "_afterRerender");
    /**
     * Methods that should run after element unmounts (in disconnectedCallback)
     * @type {Object<string, CallableFunction>}
     */
    p(this, "_afterDisconnect");
    /**
     * App element (main wrapper)
     * @type {App}
     */
    p(this, "app");
    /**
     * @type {CustomElement}
     */
    p(this, "_parent");
    /**
     * Class for virtual render div
     * @type {string}
     */
    w(this, Ue, "virtual-render-div");
    /**
     * Getter/setter defined values
     * @type {Object<string, any>}
     */
    p(this, "_values", {});
    /**
     * Array with protected properties of the object
     * @type {Array<string>}
     */
    w(this, he);
    /**
     * Template engine settings
     * @type {Object<string, any>}
     */
    w(this, Q);
    /**
     * @type {Object<string, CallableFunction>}
     */
    p(this, "_templateFunctions", {});
    /**
     * @type {Object<string, any>}
     */
    p(this, "_templateVariables");
    /**
     * @type {Object<string, Object<string, CallableFunction>>}
     */
    p(this, "_define");
    p(this, "initElement", () => {
      d(this, Ae).call(this);
    });
    /**
     * Initilizer method of element. Triggered in the connectedCallback
     * @returns {Promise<void>}
     */
    w(this, Ae, async () => {
      var a;
      this._startInitilization(), this._abort = !1;
      const e = (a = this.closest("[app-id]")) == null ? void 0 : a.app;
      if (!e)
        throw new Error("Could not find container with application.");
      if (this.app = e, this.app.addEventListener(Y.ABORTROUTETRANSITION, d(this, Be)), this.rndId = nn(), this.hashId = this.getAttribute("data-hash-id") || this.generateHash(), this.getAttribute("data-hash-id") || this.setAttribute("data-hash-id", this.hashId), !this.getAttribute("data-parent-id")) {
        let o = this.parentElement.closest("[data-hash-id]");
        o && (this.setAttribute("data-parent-id", o.getAttribute("data-hash-id")), this._parent = o);
      }
      if (this._templateVariables = {}, U(this, Q, window.structuredClone(tn)), d(this, xe).call(this), U(this, he, Object.getOwnPropertyNames(this)), d(this, ze).call(this), d(this, We).call(this), await d(this, z).call(this, this._beforeInit), this.app.addEventListener(X.CHANGE, this._updateBoundAppDataParts), this.app.addEventListener(X.QUERYCHANGE, this._updateBoundQueryDataParts), await d(this, Qe).call(this), await this.render(), this._abort) {
        this.resolveInitialization();
        return;
      }
      await d(this, de).call(this), await d(this, z).call(this, this._beforeInitResolve), this.resolveInitialization(), await d(this, z).call(this, this._afterInit);
    });
    w(this, Be, (e) => {
      this._abort = !0, this.resolveInitialization();
    });
    w(this, xe, () => {
      for (const [e, a] of Object.entries(this._templateFunctions))
        d(this, Q).def[e] = a.bind(this);
    });
    w(this, We, () => {
      for (const [e, a] of Object.entries(this._define)) {
        if (d(this, he).includes(e) || e.startsWith("#") || e.startsWith("_"))
          throw new Error(`Illegal or protected property name. Can't assign property with name (${e}) that is protected or if it is of illegal format (startswith: # or _) to element ${this.tagName}`);
        if (typeof a == "function")
          Object.defineProperty(this, e, a.bind(this)(e));
        else {
          let o = {
            get() {
              return a.get.bind(this)();
            }
          };
          a.set && (o = {
            ...o,
            set(h) {
              a.set.bind(this)(h), this._refreshBoundElements(e);
            }
          }), Object.defineProperty(this, e, o);
        }
      }
    });
    /**
     * Refreshes inner html of all elements bound to this property
     * @param {string} propertyName 
     */
    p(this, "_refreshBoundElements", (e) => {
      var a;
      this.renderTime = Date.now(), (a = this.querySelectorAll(`[data-bind="${e}"]`)) == null || a.forEach((o) => {
        const h = d(this, Q).dataBinds.get(e);
        if (!h)
          return;
        const _ = o.getAttribute("data-bind-id");
        if (!_)
          return;
        const g = h[_];
        g && (o.setAttribute("data-render-time", `${this.renderTime}`), o.innerHTML = g);
      });
    });
    p(this, "_updateBoundAppDataParts", (e) => {
      this._refreshBoundElements(`app.${e.detail.field}`);
    });
    p(this, "_updateBoundQueryDataParts", (e) => {
      var a;
      (a = e == null ? void 0 : e.detail) != null && a.key ? this._refreshBoundElements(`query.${e.detail.key}`) : this._refreshBoundElements("query");
    });
    w(this, ze, () => {
      for (const [e, a] of Object.entries(this._methods)) {
        if (d(this, he).includes(e) || e.startsWith("#") || e.startsWith("_"))
          throw new Error(`Illegal or protected method name. Can't assign method with name (${e}) 
                    that is protected or if it is of illegal format (startswith: # or _) to element ${this.tagName}`);
        try {
          this[e] = a.bind(this);
        } catch (o) {
          throw new Error(`${a} is probably not a function. Failed to bind method ${a} to element ${this.tagName}.` + o);
        }
      }
      this._methods = null;
    });
    w(this, de, async () => {
      const e = [];
      return Array.from(this.querySelectorAll("*")).filter(
        (o) => o instanceof rt
      ).forEach((o) => {
        e.push(o.initComplete);
      }), await Promise.all(e);
    });
    p(this, "awaitElementsActivation", async () => await d(this, de).call(this));
    /**
     * Runs all methods in object
     * @param {Object<string, CallableFunction>} methods 
     */
    w(this, z, async (e) => {
      for (const [a, o] of Object.entries(e))
        await o.bind(this)();
    });
    w(this, Qe, async () => {
      var e, a;
      an && (U(this, Ve, ((e = this == null ? void 0 : this.css) == null ? void 0 : e.scoped) || !1), U(this, ce, await ((a = this.css) == null ? void 0 : a.style.bind(this)()) || null), d(this, Ie).call(this));
    });
    w(this, Ie, () => {
      if (!d(this, ce))
        return;
      const e = `[data-element="${this.tagName.toLowerCase()}"]`;
      if (document.head.querySelector(e))
        return;
      const a = document.createElement("style");
      if (a.textContent = d(this, ce), a.setAttribute("disabled", ""), a.setAttribute("data-element", this.tagName.toLowerCase()), document.head.appendChild(a), !d(this, Ve)) {
        a.removeAttribute("disabled");
        return;
      }
      const o = a.sheet, h = (g, b) => g.split(" ").map((y) => y.replace(/([a-zA-Z0-9\.\#\-_]+)([:].*)?/, (R, L, N) => L + b + (N || ""))).join(" "), _ = [];
      for (let g of o.cssRules)
        if (g instanceof CSSStyleRule) {
          const b = g.selectorText.split(",").map((y) => h(y.trim(), e)).join(", ");
          _.push(`${b} { ${g.style.cssText} }`);
        } else if (g instanceof CSSMediaRule) {
          const b = [];
          for (let y of g.cssRules)
            if (y instanceof CSSStyleRule) {
              const R = y.selectorText.split(",").map((L) => h(L.trim(), e)).join(", ");
              b.push(`${R} { ${y.style.cssText} }`);
            }
          _.push(`@media ${g.media.mediaText} { ${b.join(" ")} }`);
        }
      a.textContent = _.join(`
`), a.removeAttribute("disabled");
    });
    /**
     * Should be implemented for template rendering
     * @returns {Promise<string>}
     * @async
     */
    w(this, Ge, async () => {
      if (!this.markup)
        throw new Error(`Missing markup method for element ${this.tagName}`);
      try {
        return await this.markup();
      } catch (e) {
        throw new Error(`Failed to run markup method of element: ${this.tagName} - ` + e.message);
      }
    });
    /**
     * Renders template of element. Uses markup method.
     * Adds event listeners to elements with appropriate attributes (df-<event>)
     * @async
     * @returns {Promise<void>}
     */
    p(this, "render", async () => {
      let e = await d(this, Ge).call(this);
      this.innerHTML = e;
    });
    /**
     * Parses the provided string template. Adds all
     * required data-parent tags etc...
     * @param {string} html 
     * @returns {string}
     */
    w(this, Je, (e) => {
      e = d(this, Ze).call(this, e), e = d(this, Xe).call(this, e), e = d(this, Ke).call(this, e);
      const a = document.createElement("div");
      return a.classList.add(d(this, Ue)), this.app._originalInsertAdjacentHTML.call(a, "afterbegin", e), this.lastRender = Date.now(), d(this, et).call(this, a), d(this, at).call(this, a);
    });
    /**
     * @param {string} html 
     * @returns {string}
     */
    w(this, Ye, (e) => {
      try {
        let o = ee.template.bind(this)(e, d(this, Q), void 0).bind(this)(this._templateVariables);
        return this._templateVariables = {}, d(this, Je).call(this, o);
      } catch {
        console.error("Failed to run #dotJSengine for element: ", this);
      }
    });
    /**
     * Runs the dotJS render engine with the provided html string
     * @param {string} html 
     * @returns {string}
     */
    p(this, "_dotJSengine", (e) => d(this, Ye).call(this, e));
    p(this, "getAttrs", (e) => {
      const a = e.dataset, o = {};
      for (const [h, _] of Object.entries(a))
        if (!this.app._filterAttributeNames.includes(h))
          try {
            o[h] = JSON.parse(_.trim());
          } catch {
            o[h] = _;
          }
      return o;
    });
    /**
     * Adds variable for template rendring
     * @param {string} name 
     * @param {any} value 
     */
    p(this, "addTemplateVariable", (e, a) => {
      this._templateVariables[e] = a;
    });
    p(this, "clearTemplateVariables", () => {
      this._templateVariables = {};
    });
    /**
     * Replaces shorthand "@<eventName>=" synatx with jolt-<eventName>
     * @param {string} inputString 
     * @returns 
     */
    w(this, Ze, (e) => e.replace(/@(\w+)=/g, "jolt-$1="));
    w(this, Xe, (e) => e.replace(/:(\w+)=/g, "data-$1="));
    w(this, Ke, (e) => e.replace(/<([A-Z][a-zA-Z0-9]*|[a-z][a-zA-Z0-9]*)([^>]*)\s*(\/?)>/g, (a, o, h, _) => {
      if (this.app._elements[o]) {
        const b = this.app._elements[o].tagName;
        return _ ? `<${b}${h}/>` : `<${b}${h}></${b}>`;
      }
      return a;
    }));
    /**
     * Parses conditionals in html elements (df-if)
     * @param {HTMLElement} elem - element whose contents should be parsed
     */
    w(this, et, (e) => {
      e.querySelectorAll("[jolt-show-if]").forEach((a) => {
        const o = a.getAttribute("jolt-show-if");
        [!1, "false", null, "null", void 0, "undefined"].includes(o) && a.remove();
      });
    });
    /**
     * Gets all arguments on the element with an df-{eventName} attribute. Parses all
     * arguments that starts with a ":" and collects them into an object with key-value pairs.
     * @param {HTMLElement|CustomElement} elem 
     * @returns {Object<string, string|number|object>}
     */
    w(this, tt, (e) => this.getAttrs(e));
    /**
     * Returns the type-method pair of the assigned event
     * or null if no event was assigned to the element
     * @param {HTMLElement} elem 
     * @returns {Array<string, string>|null}
     */
    p(this, "getEventTypeAndMethod", (e) => {
      if (!e.attributes)
        return [null, null];
      for (const o of e.attributes)
        if (o.name.startsWith("jolt-")) {
          const h = e.getAttribute(o.name);
          return [o.name, h];
        }
      return [null, null];
    });
    /**
     * Sets event listeners on all elements
     * @param {{element: HTMLElement, eventName: string, methodName: string}[]}  elementsWithevents
     */
    w(this, fe, (e) => {
      for (let a of e) {
        const o = a.element, h = a.eventName, _ = a.methodName;
        if (o[`jolt-${h}:active`])
          return;
        const g = this._createEventListenerMethod(o, _);
        o.addEventListener(h, g), o[`jolt-${h}:active`] = !0, o[`jolt-${h}:active-method-${_}`] = g;
      }
    });
    /**
     * Creates listener method for event listener of element
     * @param {HTMLElement} elem - the HTMLElement with eventListener
     * @param {string} methodName - name of the method
     * @returns {CallableFunction}
     */
    p(this, "_createEventListenerMethod", (e, a) => async (o) => {
      let h = d(this, tt).call(this, e);
      try {
        h && Object.keys(h).length != 0 ? await this[a](e, o, h) : await this[a](e, o);
      } catch (_) {
        throw console.error(_), new Error(`Could not run method ${a} on element ${this.tagName}`);
      }
    });
    /**
     * Public acces to _createEventListenerMethod
     * @param {HTMLElement} elem - the HTMLElement with eventListener
     * @param {string} methodName - name of the method
     * @returns {CallableFunction}
     */
    p(this, "createEventListenerMethod", (e, a) => this._createEventListenerMethod(e, a));
    /**
     * Sets event listeners to elements in array
     * @param {{element: HTMLElement, eventName: string, methodName: string}[]} elementsWithEvents 
     */
    p(this, "_setEventListeners", (e) => {
      d(this, fe).call(this, e);
    });
    /**
     * Finds all elements with event listeners
     * @param {NodeListOf} allElements 
     * @returns {{element: HTMLElement, eventName: string, methodName: string}[]} 
     */
    w(this, pe, (e) => {
      const a = [];
      return e.forEach((o) => {
        a.push(...d(this, Ce).call(this, o));
      }), a;
    });
    /**
     * Gathers event metadata from an element's attributes.
     * @param {HTMLElement} elem - The DOM element from which to extract events.
     * @returns {{element: HTMLElement, eventName: string, methodName: string}[]} 
     *   An array of event objects, each containing the element, event name, and method name.
     */
    w(this, Ce, (e) => {
      const a = [];
      return Array.from(e.attributes).forEach((o) => {
        o.name.startsWith("jolt-") && !o.name.startsWith("jolt-show-if") && a.push({
          element: e,
          eventName: o.name.replace("jolt-", ""),
          methodName: o.value
        });
      }), a;
    });
    /**
     * 
     * @param {HTMLElement} elem 
     * @returns {{element: HTMLElement, eventName: string, methodName: string}[]} 
     */
    p(this, "_elementWithEvent", (e) => d(this, Ce).call(this, e));
    p(this, "_allElementsWithEvents", (e) => d(this, pe).call(this, e));
    /**
     * Adds functionality to all elements in the markup of the element
     * @returns {void}
     */
    w(this, nt, () => {
      const e = d(this, pe).call(this, this.querySelectorAll(`[data-parent-id="${this.hashId}"][data-render-time="${this.lastRender}"]`));
      d(this, fe).call(this, e);
    });
    p(this, "_hydrate", () => {
      d(this, nt).call(this);
    });
    /**
     * Adds the parent name to each html element as a custom attribute (parent-name)
     * @param {HTMLElement} div
     * @returns {string}
     */
    w(this, at, (e) => (e.querySelectorAll(":not([data-parent-id]:not(data-render-time))").forEach((a) => {
      a.setAttribute("data-parent-id", this.hashId), a.setAttribute(
        "data-render-time",
        `${this.lastRender}`
      );
    }), e.innerHTML));
    /**
     * Triggers rerender of entire element
     * @abstract
     * @param {CustomEvent} [event]
     */
    p(this, "rerender", async (e) => (d(this, Q).dataBinds = /* @__PURE__ */ new Map(), await d(this, z).call(this, this._beforeRerender), await this.render(), await d(this, de).call(this), await d(this, z).call(this, this._afterRerender)));
    /**
     * Generates random hash
     * @param {Number} length 
     * @returns {string}
     */
    p(this, "generateHash", (e = 16) => this.app.generateHash(e));
    /**
     * Convenience method for getting data from application storage
     * @param {string} field 
     * @returns {any|undefined}
     */
    p(this, "getData", (e) => this.app.getData(e));
    /**
     * Convenience method for setting data to application storage
     * @param {string} field 
     * @param {any} data 
     * @throws {Error} - Missing field in app data structure
     */
    p(this, "setData", (e, a) => {
      this.app.setData(e, a);
    });
    /**
     * Returns location.search params either as object (true) or as a string (false)
     * Default: false
     * @param {boolean} toObject 
     * @returns {string|Object<string, string>}
     */
    p(this, "getQueryParams", (e = !1) => this.app.getQueryParams(e));
    /**
     * Makes fetch (GET) request for markup
     * @param {string} url 
     * @returns {Promise<string>}
     */
    p(this, "getHTMLtemplate", async (e) => {
      var a, o;
      try {
        const h = await fetch(e, {
          redirect: "manual"
        });
        return h.status == 200 ? await h.text() : (this._abort = !0, (a = this.app) != null && a.router ? this.app.router._abortPageLoad(h.status) : console.error(`Failed to fetch html markup for ${this.tagName} with response code ${h.status}`), "");
      } catch {
        return this._abort = !0, (o = this.app) != null && o.router ? this.app.router._abortPageLoad(500) : console.error(`Failed to fetch html markup for ${this.tagName}. Server failed to respond.`), "";
      }
    });
    this.resolveInitialization = null, this.initComplete = null, this._startInitilization();
  }
  async connectedCallback() {
    if ([!0, "true", "", "defer"].includes(this.getAttribute("defer"))) {
      this.resolveInitialization();
      return;
    }
    try {
      await d(this, Ae).call(this);
    } catch (e) {
      this._abort = !0, this.resolveInitialization(), console.log(`Failed to initilize element ${this.tagName}`), console.error(e);
    }
  }
  /**
   * Disconnected callback for element
   */
  disconnectedCallback() {
    this.app.removeEventListener(X.CHANGE, this._updateBoundAppDataParts), this.app.removeEventListener(X.QUERYCHANGE, this._updateBoundQueryDataParts);
    const e = document.head.querySelector(`style[data-parent-id="${this.hashId}"]`);
    e && e.remove(), d(this, z).call(this, this._afterDisconnect);
  }
  /**
   * Activates methods of all elements inside the designated HTML element
   * that are part of the current CustomElement and have the data-render-time attribute the same as this.lastRender
   * @param {HTMLElement|string} elem - element or valid querySelector string 
   */
  activateElement(e) {
    typeof e == "string" && (e = this.querySelector(e));
    const a = d(this, pe).call(
      this,
      // @ts-ignore
      e.querySelectorAll(`[data-parent-id="${this.hashId}"][data-render-time="${this.lastRender}"]`)
    );
    d(this, fe).call(this, a);
  }
  get attrs() {
    return this.getAttrs(this);
  }
  get variables() {
    return this._templateVariables;
  }
  /**
   * Getter for query parameters
   */
  get queryParams() {
    return this.app.queryParams;
  }
  /**
   * Sets new query(search) params to url based on provided
   * query parameters object
   * @param {Object<string, string|number|boolean>} queryParamsObject
   */
  set queryParams(e) {
    this.app.queryParams = e;
  }
  /**
   * Adds query parameters provided in object
   * as key-value pairs
   * @param {Object<string, string|number|boolean>} params 
   */
  addQueryParams(e) {
    this.queryParams = {
      ...this.queryParams,
      ...e
    };
  }
  /**
   * Removes query parameters in provided array
   * @param {Array<string>} names 
   */
  removeQueryParams(e) {
    this.app.removeQueryParams(e);
  }
  /**
   * Returns the parent CustomElement of current CustomElement if it exists. Top-level
   * elements (direct children of the app container) don't have this property
   * @returns {CustomElement|undefined}
   */
  get parent() {
    return this._parent;
  }
  /**
   * Returns application router
   * @returns {Router}
   */
  get router() {
    return this.app.router;
  }
  /**
   * Returns url hash
   * @returns {string}
   */
  get hash() {
    return this.app.hash;
  }
  /**
   * Returns url port
   * @returns {string}
   */
  get port() {
    return this.app.port;
  }
  /**
   * Returns url hostname
   * @returns {string}
   */
  get hostname() {
    return this.app.hostname;
  }
  /**
   * Returns url host
   * @returns {string}
   */
  get host() {
    return this.app.host;
  }
  /**
   * Returns url pathname
   * @returns {string}
   */
  get pathname() {
    return this.app.pathname;
  }
  /**
   * Returns url origin
   * @returns {string}
   */
  get origin() {
    return this.app.origin;
  }
  /**
   * Returns route parameters (query string) as object
   * @returns {string}
   */
  get routeParameters() {
    return this.app.router.routeParameters;
  }
  /**
   * Returns data from application storage
   * based on elements dataField property
   * @returns {Object}
   */
  get data() {
    return this.app.getAllData(!0);
  }
  /**
   * Returns render functions defined on the app object
   * @returns {Object<string, CallableFunction>}
   */
  get functions() {
    return this.app.renderFunctions;
  }
  /**
   * Returns application properties
   * @returns {Object}
   */
  get properties() {
    return this.app.properties;
  }
  /**
   * Returns object with registered app extensions
   * @returns {Object<string, Extension>}
   */
  get ext() {
    return this.app.ext;
  }
  /**
   * Getter for authenticator
   * @returns {Authenticator}
   */
  get authenticator() {
    return this.app.authenticator;
  }
  /**
   * Static method to generate html of this element
   * @param {string} [hashId] 
   * @returns {string}
   * @static
   */
  static generate(e, a = null) {
    a || (a = {});
    let o = [];
    for (const [_, g] of Object.entries(a))
      o.push(`:${_}="${g}"`);
    let h = o.length > 0 ? o.join(" ") : "";
    return e ? Dt`<${this.tagName} data-hash-id="${e}" ${h}></${this.tagName}>` : Dt`<${this.tagName} ${h}></${this.tagName}>`;
  }
};
Ve = new WeakMap(), ce = new WeakMap(), Ue = new WeakMap(), he = new WeakMap(), Q = new WeakMap(), Ae = new WeakMap(), Be = new WeakMap(), xe = new WeakMap(), We = new WeakMap(), ze = new WeakMap(), de = new WeakMap(), z = new WeakMap(), Qe = new WeakMap(), Ie = new WeakMap(), Ge = new WeakMap(), Je = new WeakMap(), Ye = new WeakMap(), Ze = new WeakMap(), Xe = new WeakMap(), Ke = new WeakMap(), et = new WeakMap(), tt = new WeakMap(), fe = new WeakMap(), pe = new WeakMap(), Ce = new WeakMap(), nt = new WeakMap(), at = new WeakMap(), /**
* Element tagName
* @type {string}
*/
p(rt, "tagName");
let G = rt;
function Cn({
  tagName: l,
  markup: r,
  css: e = null,
  methods: a = {},
  beforeInit: o = {},
  beforeInitResolve: h = {},
  afterInit: _ = {},
  beforeRerender: g = {},
  afterRerender: b = {},
  afterDisconnect: y = {},
  define: R = {},
  templateFunctions: L = {}
}) {
  var S;
  if (!l || !r)
    throw new Error("Missing tagName or markup method in ElementFactory");
  if (!((O) => /^[a-z]+(-[a-z]+)*$/.test(O))(l))
    throw new Error("Element tagName must be in a valid kebab-case synatx");
  return S = class extends G {
    constructor() {
      super();
      /** @type {Object<string, Function>} */
      p(this, "_methods", a);
      /** @type {() => Promise<string>} */
      p(this, "markup", r);
      p(this, "css", e);
      /** @type {Object<string, Function>} */
      p(this, "_beforeInit", o);
      /** @type {Object<string, Function>} */
      p(this, "_beforeInitResolve", h);
      /** @type {Object<string, Function>} */
      p(this, "_afterInit", _);
      /** @type {Object<string, Function>} */
      p(this, "_beforeRerender", g);
      /** @type {Object<string, Function>} */
      p(this, "_afterRerender", b);
      /** @type {Object<string, Function>} */
      p(this, "_afterDisconnect", y);
      /** @type {DefineMethods} */
      p(this, "_define", R);
      /** @type {Object<string, Function>} */
      p(this, "_templateFunctions", L);
    }
  }, /** @type {string} */
  p(S, "tagName", l), S;
}
const Y = {
  START: "route-change.start",
  FINISHED: "route-change.finished",
  LAYOUTCHANGEFINISHED: "route-change.layout-change.finished",
  ERRORPAGESTART: "route-change.error-page.start",
  ERRORPAGEFINISHED: "route-change.error-page.finished",
  ABORTROUTETRANSITION: "route-change.abort"
};
var Te, te, At, st, it, ot, lt, Pt, me, Se, ut, ct, ht, Ne, De, dt, ft, ge, pt;
class Tn {
  /**
   * Constructor for router
   * @param {RouterConfigs} configs
   */
  constructor({ baseUrl: r = "", routes: e, baseLayout: a, defaultTarget: o, pageNotFoundCode: h = 404, index: _ = "/", app: g }) {
    w(this, te);
    /**
     * Application object
     * @type {App}
     */
    w(this, Te);
    /**
     * @type {Object}
     * @property {string} route - app endpoint
     * @property {Object<string, CustomElement>} handlers - elements to render (target - element pairs)
     * @property {string} title - title of the page
     * @property {Array<string>} [roles] - array with allowed user roles (optional)
     * @property {CustomElement} [layout] - layout of page (optional, default=baseLayout)
     * @property {Object<string, string|number>} params - url parameters
     * @property {Array<Array<string, string, CustomElement>>} renderSequence - sequence in which elements were rendered (with target and hash ids)
     */
    p(this, "_currentRoute");
    /**
     * Sorting method for Array.sort for routes
     * @param {Array} a 
     * @param {Array} b 
     * @returns {Number}
     */
    w(this, st, (r, e) => {
      const a = e[0].length - r[0].length;
      return a !== 0 ? a : r[0].includes("<str:") && e[0].includes("<int:") ? -1 : r[0].includes("<int:") && e[0].includes("<str:") ? 1 : 0;
    });
    /**
     * Click handler method for routing
     * @param {Event} event 
     */
    w(this, it, async (r) => {
      var _, g, b, y;
      const e = (_ = r == null ? void 0 : r.target) == null ? void 0 : _.matches("a"), a = (g = r == null ? void 0 : r.target) == null ? void 0 : g.closest("a"), o = e ? (b = r == null ? void 0 : r.target) == null ? void 0 : b.getAttribute("router-ignore") : a == null ? void 0 : a.getAttribute("router-ignore"), h = e ? (y = r == null ? void 0 : r.target) == null ? void 0 : y.href : a == null ? void 0 : a.href;
      if ((e || a) && !o && h && !h.startsWith("mailto:")) {
        if (r.preventDefault(), this._inTransition && this._transitionToRoute == h) {
          r.preventDefault();
          return;
        }
        this._inTransition && d(this, ct).call(this), this._inTransition = !0;
        try {
          this._transitionToRoute = h, await d(this, lt).call(this, h);
        } catch {
          this._abort || console.error("Routing failed for route: ", h), this._abort = !1;
        }
        this._transitionToRoute = "", this._inTransition = !1;
      }
    });
    /**
     * Pop state handler for routing (nav btns back/forth)
     * @param {Event} event 
     */
    w(this, ot, async (r) => {
      if (await this.route(), r.state && r.state.scrollPosition) {
        const { x: e, y: a } = r.state.scrollPosition;
        window.scrollTo(e, a);
      }
    });
    /**
     * Handles the clicked navigation aTag
     * @param {string} href - the clicked a tag 
     */
    w(this, lt, async (r) => {
      const e = d(this, ge).call(this);
      history.pushState(e, null, r), await this.route();
    });
    /**
     * Performs the actual route based on the current browser url
     * @returns {Promise<void>}
     */
    p(this, "route", async () => {
      var a, o;
      let r = location.pathname;
      r = r.replace(this.baseUrl, ""), r === "" && (r = "/");
      const e = je(this, te, Pt).call(this, r);
      if (e && !((a = this.app) != null && a.authenticatorInstalled)) {
        await d(this, me).call(this, e);
        return;
      }
      if (e && ((o = this.app) != null && o.authenticatorInstalled)) {
        if (!e.authenticationRequired) {
          await d(this, me).call(this, e);
          return;
        }
        if (e.authenticationRequired && this.app.authenticator.isAuthenticated && this.app.authenticator.hasRole((e == null ? void 0 : e.rolesRequired) || [])) {
          await d(this, me).call(this, e);
          return;
        }
        if (e.authenticationRequired && (!this.app.authenticator.isAuthenticated() || !this.app.authenticator.hasRole((e == null ? void 0 : e.rolesRequired) || []))) {
          await this.app.authenticator.unauthorizedRedirect(), this.app.authenticator.redirectCallback && await this.app.authenticator.redirectCallback();
          return;
        }
      }
      await d(this, ut).call(this);
    });
    /**
     * Performs redirect to provided path
     * @param {string} pathname 
     */
    p(this, "redirect", async (r) => {
      const e = `${this.baseUrl}${r}`, a = d(this, ge).call(this);
      history.pushState(a, null, e), await this.route();
    });
    /**
     * Loads home/index route
     */
    p(this, "home", async () => {
      const r = `${this.baseUrl}${this.index}`, e = d(this, ge).call(this);
      history.pushState(e, null, r), await this.route();
    });
    /**
     * Loads appropriate page according to matchedPath
     * @param {Object<string, CustomElement|string|null>} matchedPath 
     */
    w(this, me, async (r) => {
      var h;
      d(this, ht).call(this);
      const e = [];
      await d(this, Se).call(this, r.layout), await this.app.querySelector(r.layout.tagName).initComplete;
      const o = Object.entries(r.handlers);
      for (const [_, [g, b]] of o.entries()) {
        const y = this.app.querySelector(g);
        if (!y)
          throw new Error(`Failed to get target (${g}) container for route ${r.route} and handler (${b})`);
        if (y.querySelector(b.tagName) && o.length != 1 && _ < o.length - 1)
          continue;
        const L = this.app.generateHash();
        this.app._originalInnerHTML.call(y, b.generate(L, (h = r.attributes) == null ? void 0 : h[b.tagName]));
        const N = this.app.querySelector(`[data-hash-id="${L}"]`);
        N && await N.initComplete, e.push([g, L, b]);
      }
      d(this, pt).call(this, r.title), this._currentRoute = {
        ...r,
        renderSequence: e,
        href: window.location.href
      }, d(this, Ne).call(this);
    });
    /**
     * Renders layout of matched path of not already loaded.
     * @param {CustomElement} matchedLayout 
     */
    w(this, Se, async (r) => {
      if (!this.app.querySelector(r.tagName)) {
        this.app.container.innerHTML = r.generate();
        const e = this.app.querySelector(r.tagName);
        await e.initComplete, d(this, De).call(this, e.tagName);
      }
    });
    /**
     * Loads error page
     * @returns {Promise<void>}
     */
    w(this, ut, async () => {
      this.app.querySelector(this.baseLayout.tagName) || (this.app.container.innerHTML = this.baseLayout.generate(), await this.app.querySelector(this.baseLayout.tagName).initComplete, d(this, De).call(this, this.baseLayout.tagName));
      const r = this.app.querySelector(this.defaultTarget);
      if (!r)
        return;
      const e = this.app._errorPages[this.pageNotFoundCode].generate();
      r.innerHTML = e, d(this, Ne).call(this);
    });
    /**
     * Aborts page load
     * @param {number|null} status 
     */
    p(this, "_abortPageLoad", async (r = null) => {
      d(this, dt).call(this);
      let e = this.defaultTarget, a = this.baseLayout;
      this._currentRoute && (a = this._currentRoute.layout, e = this._currentRoute.renderSequence[0][0]), await d(this, Se).call(this, a);
      const o = this.app.querySelector(e);
      if (!o)
        throw new Error(`Failed to get target (${e}) container for error page`);
      Object.keys(this.app._errorPages).includes(`${r}`) || (r = 500);
      const h = this.app._errorPages[r].generate();
      o.innerHTML = h, d(this, ft).call(this);
    });
    w(this, ct, () => {
      const r = new CustomEvent(Y.ABORTROUTETRANSITION, {
        bubbles: !0,
        cancelable: !0
      });
      this._abort = !0, this.app.container.dispatchEvent(r);
    });
    /**
     * Emits route change start event
     */
    w(this, ht, () => {
      const r = new CustomEvent(Y.START, {
        bubbles: !0,
        cancelable: !0,
        detail: {
          ...this._currentRoute
        }
      });
      this.app.container.dispatchEvent(r);
    });
    /**
     * Emits route change finished event
     */
    w(this, Ne, () => {
      const r = new CustomEvent(Y.FINISHED, {
        bubbles: !0,
        cancelable: !0,
        detail: {
          ...this._currentRoute
        }
      });
      this.app.container.dispatchEvent(r);
    });
    /**
     * Emits layout generated finished event
     * @param {string} tagName tagName of layout
     */
    w(this, De, (r) => {
      const e = new CustomEvent(Y.LAYOUTCHANGEFINISHED, {
        bubbles: !0,
        cancelable: !0,
        detail: {
          layout: r
        }
      });
      this.app.container.dispatchEvent(e);
    });
    /**
     * Emits abort page load start event
     * @param {number} [status] status code of error 
     */
    w(this, dt, (r) => {
      const e = new CustomEvent(Y.ERRORPAGESTART, {
        bubbles: !0,
        cancelable: !0,
        detail: {
          errorStatus: r,
          errorPage: this.app._errorPages[r]
        }
      });
      this.app.container.dispatchEvent(e);
    });
    /**
     * Emits abort page load finished event
     * @param {number} [status] status code of error 
     */
    w(this, ft, (r) => {
      const e = new CustomEvent(Y.ERRORPAGEFINISHED, {
        bubbles: !0,
        cancelable: !0,
        detail: {
          errorStatus: r,
          errorPage: this.app._errorPages[r]
        }
      });
      this.app.container.dispatchEvent(e);
    });
    /**
     * Gets current state of location (scroll position)
     * @returns {Object<string, Object<string, Number>>}
     */
    w(this, ge, () => ({
      scrollPosition: {
        x: window.scrollX,
        y: window.scrollY
      }
    }));
    /**
     * Sets title of current page
     * @param {string} title 
     * @returns {undefined}
     */
    w(this, pt, (r) => {
      const e = document.querySelector("title");
      if (!e)
        throw new Error("Missing title tag in page header. This is considered bad practice!");
      if (!r)
        return;
      let a = r;
      e.innerText = a;
    });
    /**
     * Returns location.search params either as object (true) or as a string (false)
     * Default: false
     * @param {boolean} toObject 
     * @returns {string|Object<string, string>}
     */
    p(this, "getQueryParams", (r = !1) => this.app.getQueryParams(r));
    if (!g)
      throw new Error("Missing application object in router constructor");
    if (!e)
      throw new Error("Missing routes object for router.");
    if (!a && !(a instanceof G))
      throw new Error("Missing base layout element for the application");
    U(this, Te, g), this.baseLayout = a, this.pageNotFoundCode = h, typeof e == "function" && (e = e.bind(this)()), this.defaultTarget = o, this._inTransition = !1, this._transitionToRoute = "", this._abort = !1, this._parseRoutes({ routes: e }), this._baseUrl = r, this.index = _, this.app.addEventListener("click", d(this, it)), window.addEventListener("popstate", d(this, ot)), this._currentRoute = null;
  }
  /**
   * Method for parsing routes tree
   * @param {Object} configs
   * @param {Object<string, string} configs.routes
   * @param {string} configs.parentPath - The parent path (used during recursion)
   * @param {Object} configs.parentHandlers - The parent handlers (used during recursion)
   * @param {CustomElement} [configs.layout] - The current layout being applied (top-level routes can override this)
   */
  _parseRoutes({ routes: r, parentPath: e = "", parentHandlers: a = {}, layout: o }) {
    this.routeMap = new Map(Object.entries(je(this, te, At).call(this, { routes: r, parentPath: e, parentHandlers: a, layout: o }))), this.routeMap = this.sortRouteMap();
  }
  /**
   * Method for sorting the routeMap object
   * @returns {Map}
   */
  sortRouteMap() {
    const r = Array.from(this.routeMap.entries()).sort(d(this, st));
    return new Map(r);
  }
  /**
   * Returns the base url of the application
   * @returns {string}
   */
  get baseUrl() {
    return this._baseUrl;
  }
  get hash() {
    return this.app.hash;
  }
  get port() {
    return this.app.port;
  }
  get hostname() {
    return this.app.hostname;
  }
  get host() {
    return location.host;
  }
  get pathname() {
    return location.pathname;
  }
  get origin() {
    return location.origin;
  }
  get app() {
    return d(this, Te);
  }
  get currentRoute() {
    return this._currentRoute;
  }
}
Te = new WeakMap(), te = new WeakSet(), /**
 * Method for parsing routes tree
 * @param {Object} configs
 * @param {Object<string, string} configs.routes
 * @param {string} configs.parentPath - The parent path (used during recursion)
 * @param {Object} configs.parentHandlers - The parent handlers (used during recursion)
 * @param {CustomElement} [configs.layout] - The current layout being applied (top-level routes can override this)
 */
At = function({ routes: r, parentPath: e = "", parentHandlers: a = {}, layout: o }) {
  let h = o;
  h || (h = this.baseLayout);
  const _ = {};
  return r.forEach((g) => {
    const b = e + g.path;
    if (typeof g.handler != "function")
      throw new Error("Route handler must be of type CustomElement from ElementFactory.");
    const y = g.handler ? { ...a, [g.target]: g.handler } : { ...a };
    g.handlers && Object.keys(g.handlers).forEach((L) => {
      y[L] = g.handlers[L];
    });
    const R = g.layout || h;
    _[b] = {
      handlers: { ...y },
      layout: R,
      title: g == null ? void 0 : g.title,
      // || this.app.appName,
      roles: g.roles || null,
      details: (g == null ? void 0 : g.details) || null,
      attributes: g != null && g.attributes ? { [g.handler.tagName]: g.attributes } : null,
      authenticationRequired: [void 0].includes(g == null ? void 0 : g.authenticationRequired) ? !1 : g == null ? void 0 : g.authenticationRequired,
      rolesRequired: [void 0].includes(g == null ? void 0 : g.authenticationRequired) ? [] : g == null ? void 0 : g.rolesRequired
    }, g.children && Object.assign(_, je(this, te, At).call(this, {
      routes: g.children,
      parentPath: b,
      parentHandlers: y,
      layout: R
      // Pass down the layout to children
    }));
  }), _;
}, st = new WeakMap(), it = new WeakMap(), ot = new WeakMap(), lt = new WeakMap(), /**
 * Matches current browser url to appropriate route handler
 * Performs pattern matching for int/str variables in url
 * @param {string} pathname - current location.pathname variable
 * @returns {null|Object<string, CustomElement|string|null|Array<string>>}
 */
Pt = function(r) {
  for (const [e, a] of this.routeMap.entries()) {
    const o = [], h = [], _ = e.replace(/<(\w+):(\w+)>/g, (b, y, R) => {
      if (o.push(R), h.push(y), y === "str") return "([^/]+)";
      if (y === "int") return "(\\d+)";
    }), g = r.match(new RegExp(`^${_}$`));
    if (g) {
      const b = o.reduce((y, R, L) => {
        let N = g[L + 1];
        return h[L] === "int" && (N = parseInt(N, 10)), y[R] = N, y;
      }, {});
      return this.routeParameters = b || null, {
        route: e,
        handlers: a.handlers,
        details: (a == null ? void 0 : a.details) || null,
        title: a.title,
        rolesRequired: a.rolesRequired || [],
        authenticationRequired: a.authenticationRequired || !1,
        layout: a.layout,
        params: b,
        attributes: (a == null ? void 0 : a.attributes) || null
      };
    }
  }
  return null;
}, me = new WeakMap(), Se = new WeakMap(), ut = new WeakMap(), ct = new WeakMap(), ht = new WeakMap(), Ne = new WeakMap(), De = new WeakMap(), dt = new WeakMap(), ft = new WeakMap(), ge = new WeakMap(), pt = new WeakMap();
var M;
(function(l) {
  l.Attribute = "attribute", l.Pseudo = "pseudo", l.PseudoElement = "pseudo-element", l.Tag = "tag", l.Universal = "universal", l.Adjacent = "adjacent", l.Child = "child", l.Descendant = "descendant", l.Parent = "parent", l.Sibling = "sibling", l.ColumnCombinator = "column-combinator";
})(M || (M = {}));
var H;
(function(l) {
  l.Any = "any", l.Element = "element", l.End = "end", l.Equals = "equals", l.Exists = "exists", l.Hyphen = "hyphen", l.Not = "not", l.Start = "start";
})(H || (H = {}));
const Rt = /^[^\\#]?(?:\\(?:[\da-f]{1,6}\s?|.)|[\w\-\u00b0-\uFFFF])+/, rn = /\\([\da-f]{1,6}\s?|(\s)|.)/gi, sn = /* @__PURE__ */ new Map([
  [126, H.Element],
  [94, H.Start],
  [36, H.End],
  [42, H.Any],
  [33, H.Not],
  [124, H.Hyphen]
]), on = /* @__PURE__ */ new Set([
  "has",
  "not",
  "matches",
  "is",
  "where",
  "host",
  "host-context"
]);
function ln(l) {
  switch (l.type) {
    case M.Adjacent:
    case M.Child:
    case M.Descendant:
    case M.Parent:
    case M.Sibling:
    case M.ColumnCombinator:
      return !0;
    default:
      return !1;
  }
}
const un = /* @__PURE__ */ new Set(["contains", "icontains"]);
function cn(l, r, e) {
  const a = parseInt(r, 16) - 65536;
  return a !== a || e ? r : a < 0 ? (
    // BMP codepoint
    String.fromCharCode(a + 65536)
  ) : (
    // Supplemental Plane codepoint (surrogate pair)
    String.fromCharCode(a >> 10 | 55296, a & 1023 | 56320)
  );
}
function be(l) {
  return l.replace(rn, cn);
}
function Vt(l) {
  return l === 39 || l === 34;
}
function Ot(l) {
  return l === 32 || l === 9 || l === 10 || l === 12 || l === 13;
}
function hn(l) {
  const r = [], e = qt(r, `${l}`, 0);
  if (e < l.length)
    throw new Error(`Unmatched selector: ${l.slice(e)}`);
  return r;
}
function qt(l, r, e) {
  let a = [];
  function o(N) {
    const S = r.slice(e + N).match(Rt);
    if (!S)
      throw new Error(`Expected name, found ${r.slice(e)}`);
    const [O] = S;
    return e += N + O.length, be(O);
  }
  function h(N) {
    for (e += N; e < r.length && Ot(r.charCodeAt(e)); )
      e++;
  }
  function _() {
    e += 1;
    const N = e;
    let S = 1;
    for (; S > 0 && e < r.length; e++)
      r.charCodeAt(e) === 40 && !g(e) ? S++ : r.charCodeAt(e) === 41 && !g(e) && S--;
    if (S)
      throw new Error("Parenthesis not matched");
    return be(r.slice(N, e - 1));
  }
  function g(N) {
    let S = 0;
    for (; r.charCodeAt(--N) === 92; )
      S++;
    return (S & 1) === 1;
  }
  function b() {
    if (a.length > 0 && ln(a[a.length - 1]))
      throw new Error("Did not expect successive traversals.");
  }
  function y(N) {
    if (a.length > 0 && a[a.length - 1].type === M.Descendant) {
      a[a.length - 1].type = N;
      return;
    }
    b(), a.push({ type: N });
  }
  function R(N, S) {
    a.push({
      type: M.Attribute,
      name: N,
      action: S,
      value: o(1),
      namespace: null,
      ignoreCase: "quirks"
    });
  }
  function L() {
    if (a.length && a[a.length - 1].type === M.Descendant && a.pop(), a.length === 0)
      throw new Error("Empty sub-selector");
    l.push(a);
  }
  if (h(0), r.length === e)
    return e;
  e: for (; e < r.length; ) {
    const N = r.charCodeAt(e);
    switch (N) {
      // Whitespace
      case 32:
      case 9:
      case 10:
      case 12:
      case 13: {
        (a.length === 0 || a[0].type !== M.Descendant) && (b(), a.push({ type: M.Descendant })), h(1);
        break;
      }
      // Traversals
      case 62: {
        y(M.Child), h(1);
        break;
      }
      case 60: {
        y(M.Parent), h(1);
        break;
      }
      case 126: {
        y(M.Sibling), h(1);
        break;
      }
      case 43: {
        y(M.Adjacent), h(1);
        break;
      }
      // Special attribute selectors: .class, #id
      case 46: {
        R("class", H.Element);
        break;
      }
      case 35: {
        R("id", H.Equals);
        break;
      }
      case 91: {
        h(1);
        let S, O = null;
        r.charCodeAt(e) === 124 ? S = o(1) : r.startsWith("*|", e) ? (O = "*", S = o(2)) : (S = o(0), r.charCodeAt(e) === 124 && r.charCodeAt(e + 1) !== 61 && (O = S, S = o(1))), h(0);
        let k = H.Exists;
        const ne = sn.get(r.charCodeAt(e));
        if (ne) {
          if (k = ne, r.charCodeAt(e + 1) !== 61)
            throw new Error("Expected `=`");
          h(2);
        } else r.charCodeAt(e) === 61 && (k = H.Equals, h(1));
        let J = "", ye = null;
        if (k !== "exists") {
          if (Vt(r.charCodeAt(e))) {
            const re = r.charCodeAt(e);
            let x = e + 1;
            for (; x < r.length && (r.charCodeAt(x) !== re || g(x)); )
              x += 1;
            if (r.charCodeAt(x) !== re)
              throw new Error("Attribute value didn't end");
            J = be(r.slice(e + 1, x)), e = x + 1;
          } else {
            const re = e;
            for (; e < r.length && (!Ot(r.charCodeAt(e)) && r.charCodeAt(e) !== 93 || g(e)); )
              e += 1;
            J = be(r.slice(re, e));
          }
          h(0);
          const qe = r.charCodeAt(e) | 32;
          qe === 115 ? (ye = !1, h(1)) : qe === 105 && (ye = !0, h(1));
        }
        if (r.charCodeAt(e) !== 93)
          throw new Error("Attribute selector didn't terminate");
        e += 1;
        const ae = {
          type: M.Attribute,
          name: S,
          action: k,
          value: J,
          namespace: O,
          ignoreCase: ye
        };
        a.push(ae);
        break;
      }
      case 58: {
        if (r.charCodeAt(e + 1) === 58) {
          a.push({
            type: M.PseudoElement,
            name: o(2).toLowerCase(),
            data: r.charCodeAt(e) === 40 ? _() : null
          });
          continue;
        }
        const S = o(1).toLowerCase();
        let O = null;
        if (r.charCodeAt(e) === 40)
          if (on.has(S)) {
            if (Vt(r.charCodeAt(e + 1)))
              throw new Error(`Pseudo-selector ${S} cannot be quoted`);
            if (O = [], e = qt(O, r, e + 1), r.charCodeAt(e) !== 41)
              throw new Error(`Missing closing parenthesis in :${S} (${r})`);
            e += 1;
          } else {
            if (O = _(), un.has(S)) {
              const k = O.charCodeAt(0);
              k === O.charCodeAt(O.length - 1) && Vt(k) && (O = O.slice(1, -1));
            }
            O = be(O);
          }
        a.push({ type: M.Pseudo, name: S, data: O });
        break;
      }
      case 44: {
        L(), a = [], h(1);
        break;
      }
      default: {
        if (r.startsWith("/*", e)) {
          const k = r.indexOf("*/", e + 2);
          if (k < 0)
            throw new Error("Comment was not terminated");
          e = k + 2, a.length === 0 && h(0);
          break;
        }
        let S = null, O;
        if (N === 42)
          e += 1, O = "*";
        else if (N === 124) {
          if (O = "", r.charCodeAt(e + 1) === 124) {
            y(M.ColumnCombinator), h(2);
            break;
          }
        } else if (Rt.test(r.slice(e)))
          O = o(0);
        else
          break e;
        r.charCodeAt(e) === 124 && r.charCodeAt(e + 1) !== 124 && (S = O, r.charCodeAt(e + 1) === 42 ? (O = "*", e += 2) : O = o(1)), a.push(O === "*" ? { type: M.Universal, namespace: S } : { type: M.Tag, name: O, namespace: S });
      }
    }
  }
  return L(), e;
}
const Ht = ["\\", '"'], jt = [...Ht, "(", ")"], dn = new Set(Ht.map((l) => l.charCodeAt(0))), $t = new Set(jt.map((l) => l.charCodeAt(0))), ue = new Set([
  ...jt,
  "~",
  "^",
  "$",
  "*",
  "+",
  "!",
  "|",
  ":",
  "[",
  "]",
  " ",
  "."
].map((l) => l.charCodeAt(0)));
function Ft(l) {
  return l.map((r) => r.map(fn).join("")).join(", ");
}
function fn(l, r, e) {
  switch (l.type) {
    // Simple types
    case M.Child:
      return r === 0 ? "> " : " > ";
    case M.Parent:
      return r === 0 ? "< " : " < ";
    case M.Sibling:
      return r === 0 ? "~ " : " ~ ";
    case M.Adjacent:
      return r === 0 ? "+ " : " + ";
    case M.Descendant:
      return " ";
    case M.ColumnCombinator:
      return r === 0 ? "|| " : " || ";
    case M.Universal:
      return l.namespace === "*" && r + 1 < e.length && "name" in e[r + 1] ? "" : `${Ut(l.namespace)}*`;
    case M.Tag:
      return Mt(l);
    case M.PseudoElement:
      return `::${W(l.name, ue)}${l.data === null ? "" : `(${W(l.data, $t)})`}`;
    case M.Pseudo:
      return `:${W(l.name, ue)}${l.data === null ? "" : `(${typeof l.data == "string" ? W(l.data, $t) : Ft(l.data)})`}`;
    case M.Attribute: {
      if (l.name === "id" && l.action === H.Equals && l.ignoreCase === "quirks" && !l.namespace)
        return `#${W(l.value, ue)}`;
      if (l.name === "class" && l.action === H.Element && l.ignoreCase === "quirks" && !l.namespace)
        return `.${W(l.value, ue)}`;
      const a = Mt(l);
      return l.action === H.Exists ? `[${a}]` : `[${a}${pn(l.action)}="${W(l.value, dn)}"${l.ignoreCase === null ? "" : l.ignoreCase ? " i" : " s"}]`;
    }
  }
}
function pn(l) {
  switch (l) {
    case H.Equals:
      return "";
    case H.Element:
      return "~";
    case H.Start:
      return "^";
    case H.End:
      return "$";
    case H.Any:
      return "*";
    case H.Not:
      return "!";
    case H.Hyphen:
      return "|";
    case H.Exists:
      throw new Error("Shouldn't be here");
  }
}
function Mt(l) {
  return `${Ut(l.namespace)}${W(l.name, ue)}`;
}
function Ut(l) {
  return l !== null ? `${l === "*" ? "*" : W(l, ue)}|` : "";
}
function W(l, r) {
  let e = 0, a = "";
  for (let o = 0; o < l.length; o++)
    r.has(l.charCodeAt(o)) && (a += `${l.slice(e, o)}\\${l.charAt(o)}`, e = o + 1);
  return a.length > 0 ? a + l.slice(e) : l;
}
function Bt(l) {
  return l.map((r) => {
    if (Array.isArray(r))
      return Bt(r);
    if (r.type === "attribute") {
      let e = r.name.replace(/:/g, "data-");
      return e = e.replace(/@/g, "jolt-"), {
        ...r,
        name: Ee(e)
      };
    }
    return { ...r };
  });
}
function Fe(l) {
  const r = hn(l), e = Bt(r);
  return Ft(e);
}
var le = {}, kt;
function mn() {
  if (kt) return le;
  kt = 1;
  var l = function() {
    return l = Object.assign || function(n) {
      for (var t = arguments, u, i = 1, c = arguments.length; i < c; i++) {
        u = t[i];
        for (var m in u)
          Object.prototype.hasOwnProperty.call(u, m) && (n[m] = u[m]);
      }
      return n;
    }, l.apply(this, arguments);
  };
  function r(s, n, t) {
    for (var u = 0, i = n.length, c; u < i; u++)
      (c || !(u in n)) && (c || (c = Array.prototype.slice.call(n, 0, u)), c[u] = n[u]);
    return s.concat(c || Array.prototype.slice.call(n));
  }
  typeof SuppressedError == "function" && SuppressedError;
  var e = (
    /** @class */
    function() {
      function s(n) {
        n === void 0 && (n = {});
        var t = this;
        Object.entries(n).forEach(function(u) {
          var i = u[0], c = u[1];
          return t[i] = c;
        });
      }
      return s.prototype.toString = function() {
        return JSON.stringify(this);
      }, s.prototype.setValue = function(n, t) {
        return this[n] = t, this;
      }, s;
    }()
  );
  function a(s) {
    for (var n = arguments, t = [], u = 1; u < arguments.length; u++)
      t[u - 1] = n[u];
    return typeof s > "u" || s === null ? !1 : t.some(function(i) {
      var c, m;
      return typeof ((m = (c = s == null ? void 0 : s.ownerDocument) === null || c === void 0 ? void 0 : c.defaultView) === null || m === void 0 ? void 0 : m[i]) == "function" && s instanceof s.ownerDocument.defaultView[i];
    });
  }
  function o(s, n, t) {
    var u;
    return s.nodeName === "#text" ? u = t.document.createTextNode(s.data) : s.nodeName === "#comment" ? u = t.document.createComment(s.data) : (n ? (u = t.document.createElementNS("http://www.w3.org/2000/svg", s.nodeName), s.nodeName === "foreignObject" && (n = !1)) : s.nodeName.toLowerCase() === "svg" ? (u = t.document.createElementNS("http://www.w3.org/2000/svg", "svg"), n = !0) : u = t.document.createElement(s.nodeName), s.attributes && Object.entries(s.attributes).forEach(function(i) {
      var c = i[0], m = i[1];
      return u.setAttribute(c, m);
    }), s.childNodes && (u = u, s.childNodes.forEach(function(i) {
      return u.appendChild(o(i, n, t));
    })), t.valueDiffing && (s.value && a(u, "HTMLButtonElement", "HTMLDataElement", "HTMLInputElement", "HTMLLIElement", "HTMLMeterElement", "HTMLOptionElement", "HTMLProgressElement", "HTMLParamElement") && (u.value = s.value), s.checked && a(u, "HTMLInputElement") && (u.checked = s.checked), s.selected && a(u, "HTMLOptionElement") && (u.selected = s.selected))), u;
  }
  var h = function(s, n) {
    for (n = n.slice(); n.length > 0; ) {
      var t = n.splice(0, 1)[0];
      s = s.childNodes[t];
    }
    return s;
  };
  function _(s, n, t) {
    var u = n[t._const.action], i = n[t._const.route], c;
    [t._const.addElement, t._const.addTextElement].includes(u) || (c = h(s, i));
    var m, A, v, E = {
      diff: n,
      node: c
    };
    if (t.preDiffApply(E))
      return !0;
    switch (u) {
      case t._const.addAttribute:
        if (!c || !a(c, "Element"))
          return !1;
        c.setAttribute(n[t._const.name], n[t._const.value]);
        break;
      case t._const.modifyAttribute:
        if (!c || !a(c, "Element"))
          return !1;
        c.setAttribute(n[t._const.name], n[t._const.newValue]), a(c, "HTMLInputElement") && n[t._const.name] === "value" && (c.value = n[t._const.newValue]);
        break;
      case t._const.removeAttribute:
        if (!c || !a(c, "Element"))
          return !1;
        c.removeAttribute(n[t._const.name]);
        break;
      case t._const.modifyTextElement:
        if (!c || !a(c, "Text"))
          return !1;
        t.textDiff(c, c.data, n[t._const.oldValue], n[t._const.newValue]), a(c.parentNode, "HTMLTextAreaElement") && (c.parentNode.value = n[t._const.newValue]);
        break;
      case t._const.modifyValue:
        if (!c || typeof c.value > "u")
          return !1;
        c.value = n[t._const.newValue];
        break;
      case t._const.modifyComment:
        if (!c || !a(c, "Comment"))
          return !1;
        t.textDiff(c, c.data, n[t._const.oldValue], n[t._const.newValue]);
        break;
      case t._const.modifyChecked:
        if (!c || typeof c.checked > "u")
          return !1;
        c.checked = n[t._const.newValue];
        break;
      case t._const.modifySelected:
        if (!c || typeof c.selected > "u")
          return !1;
        c.selected = n[t._const.newValue];
        break;
      case t._const.replaceElement: {
        var V = n[t._const.newValue].nodeName.toLowerCase() === "svg" || c.parentNode.namespaceURI === "http://www.w3.org/2000/svg";
        c.parentNode.replaceChild(o(n[t._const.newValue], V, t), c);
        break;
      }
      case t._const.relocateGroup:
        v = r([], new Array(n[t._const.groupLength])).map(function() {
          return c.removeChild(c.childNodes[n[t._const.from]]);
        }), v.forEach(function(D, f) {
          f === 0 && (A = c.childNodes[n[t._const.to]]), c.insertBefore(D, A || null);
        });
        break;
      case t._const.removeElement:
        c.parentNode.removeChild(c);
        break;
      case t._const.addElement: {
        var T = i.slice(), $ = T.splice(T.length - 1, 1)[0];
        if (c = h(s, T), !a(c, "Element"))
          return !1;
        c.insertBefore(o(n[t._const.element], c.namespaceURI === "http://www.w3.org/2000/svg", t), c.childNodes[$] || null);
        break;
      }
      case t._const.removeTextElement: {
        if (!c || c.nodeType !== 3)
          return !1;
        var C = c.parentNode;
        C.removeChild(c), a(C, "HTMLTextAreaElement") && (C.value = "");
        break;
      }
      case t._const.addTextElement: {
        var T = i.slice(), $ = T.splice(T.length - 1, 1)[0];
        if (m = t.document.createTextNode(n[t._const.value]), c = h(s, T), !c.childNodes)
          return !1;
        c.insertBefore(m, c.childNodes[$] || null), a(c.parentNode, "HTMLTextAreaElement") && (c.parentNode.value = n[t._const.value]);
        break;
      }
      default:
        console.log("unknown action");
    }
    return t.postDiffApply({
      diff: E.diff,
      node: E.node,
      newNode: m
    }), !0;
  }
  function g(s, n, t) {
    return n.every(function(u) {
      return _(s, u, t);
    });
  }
  function b(s, n, t) {
    var u = s[n];
    s[n] = s[t], s[t] = u;
  }
  function y(s, n, t) {
    switch (n[t._const.action]) {
      case t._const.addAttribute:
        n[t._const.action] = t._const.removeAttribute, _(s, n, t);
        break;
      case t._const.modifyAttribute:
        b(n, t._const.oldValue, t._const.newValue), _(s, n, t);
        break;
      case t._const.removeAttribute:
        n[t._const.action] = t._const.addAttribute, _(s, n, t);
        break;
      case t._const.modifyTextElement:
        b(n, t._const.oldValue, t._const.newValue), _(s, n, t);
        break;
      case t._const.modifyValue:
        b(n, t._const.oldValue, t._const.newValue), _(s, n, t);
        break;
      case t._const.modifyComment:
        b(n, t._const.oldValue, t._const.newValue), _(s, n, t);
        break;
      case t._const.modifyChecked:
        b(n, t._const.oldValue, t._const.newValue), _(s, n, t);
        break;
      case t._const.modifySelected:
        b(n, t._const.oldValue, t._const.newValue), _(s, n, t);
        break;
      case t._const.replaceElement:
        b(n, t._const.oldValue, t._const.newValue), _(s, n, t);
        break;
      case t._const.relocateGroup:
        b(n, t._const.from, t._const.to), _(s, n, t);
        break;
      case t._const.removeElement:
        n[t._const.action] = t._const.addElement, _(s, n, t);
        break;
      case t._const.addElement:
        n[t._const.action] = t._const.removeElement, _(s, n, t);
        break;
      case t._const.removeTextElement:
        n[t._const.action] = t._const.addTextElement, _(s, n, t);
        break;
      case t._const.addTextElement:
        n[t._const.action] = t._const.removeTextElement, _(s, n, t);
        break;
      default:
        console.log("unknown action");
    }
  }
  function R(s, n, t) {
    n = n.slice(), n.reverse(), n.forEach(function(u) {
      y(s, u, t);
    });
  }
  var L = function(s) {
    var n = [];
    return n.push(s.nodeName), s.nodeName !== "#text" && s.nodeName !== "#comment" && (s = s, s.attributes && (s.attributes.class && n.push("".concat(s.nodeName, ".").concat(s.attributes.class.replace(/ /g, "."))), s.attributes.id && n.push("".concat(s.nodeName, "#").concat(s.attributes.id)))), n;
  }, N = function(s) {
    var n = {}, t = {};
    return s.forEach(function(u) {
      L(u).forEach(function(i) {
        var c = i in n, m = i in t;
        !c && !m ? n[i] = !0 : c && (delete n[i], t[i] = !0);
      });
    }), n;
  }, S = function(s, n) {
    var t = N(s), u = N(n), i = {};
    return Object.keys(t).forEach(function(c) {
      u[c] && (i[c] = !0);
    }), i;
  }, O = function(s) {
    return delete s.outerDone, delete s.innerDone, delete s.valueDone, s.childNodes ? s.childNodes.every(O) : !0;
  }, k = function(s) {
    if (Object.prototype.hasOwnProperty.call(s, "data")) {
      var n = {
        nodeName: s.nodeName === "#text" ? "#text" : "#comment",
        data: s.data
      };
      return n;
    } else {
      var t = {
        nodeName: s.nodeName
      };
      return s = s, Object.prototype.hasOwnProperty.call(s, "attributes") && (t.attributes = l({}, s.attributes)), Object.prototype.hasOwnProperty.call(s, "checked") && (t.checked = s.checked), Object.prototype.hasOwnProperty.call(s, "value") && (t.value = s.value), Object.prototype.hasOwnProperty.call(s, "selected") && (t.selected = s.selected), Object.prototype.hasOwnProperty.call(s, "childNodes") && (t.childNodes = s.childNodes.map(function(u) {
        return k(u);
      })), t;
    }
  }, ne = function(s, n) {
    if (!["nodeName", "value", "checked", "selected", "data"].every(function(i) {
      return s[i] === n[i];
    }))
      return !1;
    if (Object.prototype.hasOwnProperty.call(s, "data"))
      return !0;
    if (s = s, n = n, !!s.attributes != !!n.attributes || !!s.childNodes != !!n.childNodes)
      return !1;
    if (s.attributes) {
      var t = Object.keys(s.attributes), u = Object.keys(n.attributes);
      if (t.length !== u.length || !t.every(function(i) {
        return s.attributes[i] === n.attributes[i];
      }))
        return !1;
    }
    return !(s.childNodes && (s.childNodes.length !== n.childNodes.length || !s.childNodes.every(function(i, c) {
      return ne(i, n.childNodes[c]);
    })));
  }, J = function(s, n, t, u, i) {
    if (i === void 0 && (i = !1), !s || !n || s.nodeName !== n.nodeName)
      return !1;
    if (["#text", "#comment"].includes(s.nodeName))
      return i ? !0 : s.data === n.data;
    if (s = s, n = n, s.nodeName in t)
      return !0;
    if (s.attributes && n.attributes) {
      if (s.attributes.id) {
        if (s.attributes.id !== n.attributes.id)
          return !1;
        var c = "".concat(s.nodeName, "#").concat(s.attributes.id);
        if (c in t)
          return !0;
      }
      if (s.attributes.class && s.attributes.class === n.attributes.class) {
        var m = "".concat(s.nodeName, ".").concat(s.attributes.class.replace(/ /g, "."));
        if (m in t)
          return !0;
      }
    }
    if (u)
      return !0;
    var A = s.childNodes ? s.childNodes.slice().reverse() : [], v = n.childNodes ? n.childNodes.slice().reverse() : [];
    if (A.length !== v.length)
      return !1;
    if (i)
      return A.every(function(V, T) {
        return V.nodeName === v[T].nodeName;
      });
    var E = S(A, v);
    return A.every(function(V, T) {
      return J(V, v[T], E, !0, !0);
    });
  }, ye = function(s, n, t, u) {
    var i = 0, c = [], m = s.length, A = n.length, v = r([], new Array(m + 1)).map(function() {
      return [];
    }), E = S(s, n), V = m === A;
    V && s.some(function(f, P) {
      var F = L(f), j = L(n[P]);
      if (F.length !== j.length)
        return V = !1, !0;
      if (F.some(function(q, ie) {
        if (q !== j[ie])
          return V = !1, !0;
      }), !V)
        return !0;
    });
    for (var T = 0; T < m; T++)
      for (var $ = s[T], C = 0; C < A; C++) {
        var D = n[C];
        !t[T] && !u[C] && J($, D, E, V) ? (v[T + 1][C + 1] = v[T][C] ? v[T][C] + 1 : 1, v[T + 1][C + 1] >= i && (i = v[T + 1][C + 1], c = [T + 1, C + 1])) : v[T + 1][C + 1] = 0;
      }
    return i === 0 ? !1 : {
      oldValue: c[0] - i,
      newValue: c[1] - i,
      length: i
    };
  }, ae = function(s, n) {
    return r([], new Array(s)).map(function() {
      return n;
    });
  }, qe = function(s, n, t) {
    var u = s.childNodes ? ae(s.childNodes.length, !0) : [], i = n.childNodes ? ae(n.childNodes.length, !0) : [], c = 0;
    return t.forEach(function(m) {
      for (var A = m.oldValue + m.length, v = m.newValue + m.length, E = m.oldValue; E < A; E += 1)
        u[E] = c;
      for (var E = m.newValue; E < v; E += 1)
        i[E] = c;
      c += 1;
    }), {
      gaps1: u,
      gaps2: i
    };
  }, re = function(s, n, t, u) {
    s[t.oldValue + u] = !0, n[t.newValue + u] = !0;
  }, x = function(s, n) {
    for (var t = s.childNodes ? s.childNodes : [], u = n.childNodes ? n.childNodes : [], i = ae(t.length, !1), c = ae(u.length, !1), m = [], A = function() {
      return arguments[1];
    }, v = !1, E = function() {
      var V = ye(t, u, i, c);
      if (V) {
        m.push(V);
        var T = r([], new Array(V.length)).map(A);
        T.forEach(function($) {
          return re(i, c, V, $);
        });
      } else
        v = !0;
    }; !v; )
      E();
    return s.subsets = m, s.subsetsAge = 100, m;
  }, xt = (
    /** @class */
    function() {
      function s() {
        this.list = [];
      }
      return s.prototype.add = function(n) {
        var t;
        (t = this.list).push.apply(t, n);
      }, s.prototype.forEach = function(n) {
        this.list.forEach(function(t) {
          return n(t);
        });
      }, s;
    }()
  );
  function bt(s, n) {
    var t = s, u, i;
    for (n = n.slice(); n.length > 0; )
      i = n.splice(0, 1)[0], u = t, t = t.childNodes ? t.childNodes[i] : void 0;
    return {
      node: t,
      parentNode: u,
      nodeIndex: i
    };
  }
  function Wt(s, n, t) {
    var u, i, c, m;
    if (![t._const.addElement, t._const.addTextElement].includes(n[t._const.action])) {
      var A = bt(s, n[t._const.route]);
      i = A.node, c = A.parentNode, m = A.nodeIndex;
    }
    var v = [], E = {
      diff: n,
      node: i
    };
    if (t.preVirtualDiffApply(E))
      return !0;
    var V, T, $;
    switch (n[t._const.action]) {
      case t._const.addAttribute:
        i.attributes || (i.attributes = {}), i.attributes[n[t._const.name]] = n[t._const.value], n[t._const.name] === "checked" ? i.checked = !0 : n[t._const.name] === "selected" ? i.selected = !0 : i.nodeName === "INPUT" && n[t._const.name] === "value" && (i.value = n[t._const.value]);
        break;
      case t._const.modifyAttribute:
        i.attributes[n[t._const.name]] = n[t._const.newValue];
        break;
      case t._const.removeAttribute:
        delete i.attributes[n[t._const.name]], Object.keys(i.attributes).length === 0 && delete i.attributes, n[t._const.name] === "checked" ? i.checked = !1 : n[t._const.name] === "selected" ? delete i.selected : i.nodeName === "INPUT" && n[t._const.name] === "value" && delete i.value;
        break;
      case t._const.modifyTextElement:
        i.data = n[t._const.newValue], c.nodeName === "TEXTAREA" && (c.value = n[t._const.newValue]);
        break;
      case t._const.modifyValue:
        i.value = n[t._const.newValue];
        break;
      case t._const.modifyComment:
        i.data = n[t._const.newValue];
        break;
      case t._const.modifyChecked:
        i.checked = n[t._const.newValue];
        break;
      case t._const.modifySelected:
        i.selected = n[t._const.newValue];
        break;
      case t._const.replaceElement:
        V = k(n[t._const.newValue]), c.childNodes[m] = V;
        break;
      case t._const.relocateGroup:
        T = i.childNodes.splice(n[t._const.from], n[t._const.groupLength]).reverse(), T.forEach(function(f) {
          return i.childNodes.splice(n[t._const.to], 0, f);
        }), i.subsets && i.subsets.forEach(function(f) {
          if (n[t._const.from] < n[t._const.to] && f.oldValue <= n[t._const.to] && f.oldValue > n[t._const.from]) {
            f.oldValue -= n[t._const.groupLength];
            var P = f.oldValue + f.length - n[t._const.to];
            P > 0 && (v.push({
              oldValue: n[t._const.to] + n[t._const.groupLength],
              newValue: f.newValue + f.length - P,
              length: P
            }), f.length -= P);
          } else if (n[t._const.from] > n[t._const.to] && f.oldValue > n[t._const.to] && f.oldValue < n[t._const.from]) {
            f.oldValue += n[t._const.groupLength];
            var P = f.oldValue + f.length - n[t._const.to];
            P > 0 && (v.push({
              oldValue: n[t._const.to] + n[t._const.groupLength],
              newValue: f.newValue + f.length - P,
              length: P
            }), f.length -= P);
          } else f.oldValue === n[t._const.from] && (f.oldValue = n[t._const.to]);
        });
        break;
      case t._const.removeElement:
        c.childNodes.splice(m, 1), c.subsets && c.subsets.forEach(function(f) {
          f.oldValue > m ? f.oldValue -= 1 : f.oldValue === m ? f.delete = !0 : f.oldValue < m && f.oldValue + f.length > m && (f.oldValue + f.length - 1 === m ? f.length-- : (v.push({
            newValue: f.newValue + m - f.oldValue,
            oldValue: m,
            length: f.length - m + f.oldValue - 1
          }), f.length = m - f.oldValue));
        }), i = c;
        break;
      case t._const.addElement: {
        $ = n[t._const.route].slice();
        var C = $.splice($.length - 1, 1)[0];
        i = (u = bt(s, $)) === null || u === void 0 ? void 0 : u.node, V = k(n[t._const.element]), i.childNodes || (i.childNodes = []), C >= i.childNodes.length ? i.childNodes.push(V) : i.childNodes.splice(C, 0, V), i.subsets && i.subsets.forEach(function(f) {
          if (f.oldValue >= C)
            f.oldValue += 1;
          else if (f.oldValue < C && f.oldValue + f.length > C) {
            var P = f.oldValue + f.length - C;
            v.push({
              newValue: f.newValue + f.length - P,
              oldValue: C + 1,
              length: P
            }), f.length -= P;
          }
        });
        break;
      }
      case t._const.removeTextElement:
        c.childNodes.splice(m, 1), c.nodeName === "TEXTAREA" && delete c.value, c.subsets && c.subsets.forEach(function(f) {
          f.oldValue > m ? f.oldValue -= 1 : f.oldValue === m ? f.delete = !0 : f.oldValue < m && f.oldValue + f.length > m && (f.oldValue + f.length - 1 === m ? f.length-- : (v.push({
            newValue: f.newValue + m - f.oldValue,
            oldValue: m,
            length: f.length - m + f.oldValue - 1
          }), f.length = m - f.oldValue));
        }), i = c;
        break;
      case t._const.addTextElement: {
        $ = n[t._const.route].slice();
        var D = $.splice($.length - 1, 1)[0];
        V = {
          nodeName: "#text",
          data: n[t._const.value]
        }, i = bt(s, $).node, i.childNodes || (i.childNodes = []), D >= i.childNodes.length ? i.childNodes.push(V) : i.childNodes.splice(D, 0, V), i.nodeName === "TEXTAREA" && (i.value = n[t._const.newValue]), i.subsets && i.subsets.forEach(function(f) {
          if (f.oldValue >= D && (f.oldValue += 1), f.oldValue < D && f.oldValue + f.length > D) {
            var P = f.oldValue + f.length - D;
            v.push({
              newValue: f.newValue + f.length - P,
              oldValue: D + 1,
              length: P
            }), f.length -= P;
          }
        });
        break;
      }
      default:
        console.log("unknown action");
    }
    i.subsets && (i.subsets = i.subsets.filter(function(f) {
      return !f.delete && f.oldValue !== f.newValue;
    }), v.length && (i.subsets = i.subsets.concat(v))), t.postVirtualDiffApply({
      node: E.node,
      diff: E.diff,
      newNode: V
    });
  }
  function zt(s, n, t) {
    return n.forEach(function(u) {
      Wt(s, u, t);
    }), !0;
  }
  function se(s, n) {
    n === void 0 && (n = { valueDiffing: !0 });
    var t = {
      nodeName: s.nodeName
    };
    if (a(s, "Text", "Comment"))
      t.data = s.data;
    else {
      if (s.attributes && s.attributes.length > 0) {
        t.attributes = {};
        var u = Array.prototype.slice.call(s.attributes);
        u.forEach(function(i) {
          return t.attributes[i.name] = i.value;
        });
      }
      if (s.childNodes && s.childNodes.length > 0) {
        t.childNodes = [];
        var u = Array.prototype.slice.call(s.childNodes);
        u.forEach(function(c) {
          return t.childNodes.push(se(c, n));
        });
      }
      n.valueDiffing && (a(s, "HTMLTextAreaElement") && (t.value = s.value), a(s, "HTMLInputElement") && ["radio", "checkbox"].includes(s.type.toLowerCase()) && s.checked !== void 0 ? t.checked = s.checked : a(s, "HTMLButtonElement", "HTMLDataElement", "HTMLInputElement", "HTMLLIElement", "HTMLMeterElement", "HTMLOptionElement", "HTMLProgressElement", "HTMLParamElement") && (t.value = s.value), a(s, "HTMLOptionElement") && (t.selected = s.selected));
    }
    return t;
  }
  var Qt = /<\s*\/*[a-zA-Z:_][a-zA-Z0-9:_\-.]*\s*(?:"[^"]*"['"]*|'[^']*'['"]*|[^'"/>])*\/*\s*>|<!--(?:.|\n|\r)*?-->/g, It = /\s([^'"/\s><]+?)[\s/>]|([^\s=]+)=\s?(".*?"|'.*?')/g;
  function Ct(s) {
    return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
  }
  var Gt = {
    area: !0,
    base: !0,
    br: !0,
    col: !0,
    embed: !0,
    hr: !0,
    img: !0,
    input: !0,
    keygen: !0,
    link: !0,
    menuItem: !0,
    meta: !0,
    param: !0,
    source: !0,
    track: !0,
    wbr: !0
  }, Tt = function(s, n) {
    var t = {
      nodeName: "",
      attributes: {}
    }, u = !1, i = "tag", c = s.match(/<\/?([^\s]+?)[/\s>]/);
    if (c && (t.nodeName = n || c[1] === "svg" ? c[1] : c[1].toUpperCase(), (Gt[c[1]] || s.charAt(s.length - 2) === "/") && (u = !0), t.nodeName.startsWith("!--"))) {
      var m = s.indexOf("-->");
      return {
        type: "comment",
        node: {
          nodeName: "#comment",
          data: m !== -1 ? s.slice(4, m) : ""
        },
        voidElement: u
      };
    }
    for (var A = new RegExp(It), v = null, E = !1; !E; )
      if (v = A.exec(s), v === null)
        E = !0;
      else if (v[0].trim())
        if (v[1]) {
          var V = v[1].trim(), T = [V, ""];
          V.indexOf("=") > -1 && (T = V.split("=")), t.attributes[T[0]] = T[1], A.lastIndex--;
        } else v[2] && (t.attributes[v[2]] = v[3].trim().substring(1, v[3].length - 1));
    return {
      type: i,
      node: t,
      voidElement: u
    };
  }, we = function(s, n) {
    n === void 0 && (n = {
      valueDiffing: !0,
      caseSensitive: !1
    });
    var t = [], u, i = -1, c = [], m = !1;
    if (s.indexOf("<") !== 0) {
      var A = s.indexOf("<");
      t.push({
        nodeName: "#text",
        data: A === -1 ? s : s.substring(0, A)
      });
    }
    return s.replace(Qt, function(v, E) {
      var V = v.charAt(1) !== "/", T = v.startsWith("<!--"), $ = E + v.length, C = s.charAt($);
      if (T) {
        var D = Tt(v, n.caseSensitive).node;
        if (i < 0)
          return t.push(D), "";
        var f = c[i];
        return f && D.nodeName && (f.node.childNodes || (f.node.childNodes = []), f.node.childNodes.push(D)), "";
      }
      if (V) {
        if (u = Tt(v, n.caseSensitive || m), u.node.nodeName === "svg" && (m = !0), i++, !u.voidElement && C && C !== "<") {
          u.node.childNodes || (u.node.childNodes = []);
          var P = Ct(s.slice($, s.indexOf("<", $)));
          u.node.childNodes.push({
            nodeName: "#text",
            data: P
          }), n.valueDiffing && u.node.nodeName === "TEXTAREA" && (u.node.value = P);
        }
        i === 0 && u.node.nodeName && t.push(u.node);
        var F = c[i - 1];
        F && u.node.nodeName && (F.node.childNodes || (F.node.childNodes = []), F.node.childNodes.push(u.node)), c[i] = u;
      }
      if ((!V || u.voidElement) && (i > -1 && (u.voidElement || n.caseSensitive && u.node.nodeName === v.slice(2, -1) || !n.caseSensitive && u.node.nodeName.toUpperCase() === v.slice(2, -1).toUpperCase()) && (i--, i > -1 && (u.node.nodeName === "svg" && (m = !1), u = c[i])), C !== "<" && C)) {
        var j = i === -1 ? t : c[i].node.childNodes || [], q = s.indexOf("<", $), P = Ct(s.slice($, q === -1 ? void 0 : q));
        j.push({
          nodeName: "#text",
          data: P
        });
      }
      return "";
    }), t[0];
  }, Jt = (
    /** @class */
    function() {
      function s(n, t, u) {
        this.options = u, this.t1 = typeof Element < "u" && a(n, "Element") ? se(n, this.options) : typeof n == "string" ? we(n, this.options) : JSON.parse(JSON.stringify(n)), this.t2 = typeof Element < "u" && a(t, "Element") ? se(t, this.options) : typeof t == "string" ? we(t, this.options) : JSON.parse(JSON.stringify(t)), this.diffcount = 0, this.foundAll = !1, this.debug && (this.t1Orig = typeof Element < "u" && a(n, "Element") ? se(n, this.options) : typeof n == "string" ? we(n, this.options) : JSON.parse(JSON.stringify(n)), this.t2Orig = typeof Element < "u" && a(t, "Element") ? se(t, this.options) : typeof t == "string" ? we(t, this.options) : JSON.parse(JSON.stringify(t))), this.tracker = new xt();
      }
      return s.prototype.init = function() {
        return this.findDiffs(this.t1, this.t2);
      }, s.prototype.findDiffs = function(n, t) {
        var u;
        do {
          if (this.options.debug && (this.diffcount += 1, this.diffcount > this.options.diffcap))
            throw new Error("surpassed diffcap:".concat(JSON.stringify(this.t1Orig), " -> ").concat(JSON.stringify(this.t2Orig)));
          u = this.findNextDiff(n, t, []), u.length === 0 && (ne(n, t) || (this.foundAll ? console.error("Could not find remaining diffs!") : (this.foundAll = !0, O(n), u = this.findNextDiff(n, t, [])))), u.length > 0 && (this.foundAll = !1, this.tracker.add(u), zt(n, u, this.options));
        } while (u.length > 0);
        return this.tracker.list;
      }, s.prototype.findNextDiff = function(n, t, u) {
        var i, c;
        if (this.options.maxDepth && u.length > this.options.maxDepth)
          return [];
        if (!n.outerDone) {
          if (i = this.findOuterDiff(n, t, u), this.options.filterOuterDiff && (c = this.options.filterOuterDiff(n, t, i), c && (i = c)), i.length > 0)
            return n.outerDone = !0, i;
          n.outerDone = !0;
        }
        if (Object.prototype.hasOwnProperty.call(n, "data"))
          return [];
        if (n = n, t = t, !n.innerDone) {
          if (i = this.findInnerDiff(n, t, u), i.length > 0)
            return i;
          n.innerDone = !0;
        }
        if (this.options.valueDiffing && !n.valueDone) {
          if (i = this.findValueDiff(n, t, u), i.length > 0)
            return n.valueDone = !0, i;
          n.valueDone = !0;
        }
        return [];
      }, s.prototype.findOuterDiff = function(n, t, u) {
        var i = [], c, m, A, v, E, V;
        if (n.nodeName !== t.nodeName) {
          if (!u.length)
            throw new Error("Top level nodes have to be of the same kind.");
          return [
            new e().setValue(this.options._const.action, this.options._const.replaceElement).setValue(this.options._const.oldValue, k(n)).setValue(this.options._const.newValue, k(t)).setValue(this.options._const.route, u)
          ];
        }
        if (u.length && this.options.diffcap < Math.abs((n.childNodes || []).length - (t.childNodes || []).length))
          return [
            new e().setValue(this.options._const.action, this.options._const.replaceElement).setValue(this.options._const.oldValue, k(n)).setValue(this.options._const.newValue, k(t)).setValue(this.options._const.route, u)
          ];
        if (Object.prototype.hasOwnProperty.call(n, "data") && n.data !== t.data)
          return n.nodeName === "#text" ? [
            new e().setValue(this.options._const.action, this.options._const.modifyTextElement).setValue(this.options._const.route, u).setValue(this.options._const.oldValue, n.data).setValue(this.options._const.newValue, t.data)
          ] : [
            new e().setValue(this.options._const.action, this.options._const.modifyComment).setValue(this.options._const.route, u).setValue(this.options._const.oldValue, n.data).setValue(this.options._const.newValue, t.data)
          ];
        for (n = n, t = t, m = n.attributes ? Object.keys(n.attributes).sort() : [], A = t.attributes ? Object.keys(t.attributes).sort() : [], v = m.length, V = 0; V < v; V++)
          c = m[V], E = A.indexOf(c), E === -1 ? i.push(new e().setValue(this.options._const.action, this.options._const.removeAttribute).setValue(this.options._const.route, u).setValue(this.options._const.name, c).setValue(this.options._const.value, n.attributes[c])) : (A.splice(E, 1), n.attributes[c] !== t.attributes[c] && i.push(new e().setValue(this.options._const.action, this.options._const.modifyAttribute).setValue(this.options._const.route, u).setValue(this.options._const.name, c).setValue(this.options._const.oldValue, n.attributes[c]).setValue(this.options._const.newValue, t.attributes[c])));
        for (v = A.length, V = 0; V < v; V++)
          c = A[V], i.push(new e().setValue(this.options._const.action, this.options._const.addAttribute).setValue(this.options._const.route, u).setValue(this.options._const.name, c).setValue(this.options._const.value, t.attributes[c]));
        return i;
      }, s.prototype.findInnerDiff = function(n, t, u) {
        var i = n.childNodes ? n.childNodes.slice() : [], c = t.childNodes ? t.childNodes.slice() : [], m = Math.max(i.length, c.length), A = Math.abs(i.length - c.length), v = [], E = 0;
        if (!this.options.maxChildCount || m < this.options.maxChildCount) {
          var V = !!(n.subsets && n.subsetsAge--), T = V ? n.subsets : n.childNodes && t.childNodes ? x(n, t) : [];
          if (T.length > 0 && (v = this.attemptGroupRelocation(n, t, T, u, V), v.length > 0))
            return v;
        }
        for (var $ = 0; $ < m; $ += 1) {
          var C = i[$], D = c[$];
          A && (C && !D ? C.nodeName === "#text" ? (v.push(new e().setValue(this.options._const.action, this.options._const.removeTextElement).setValue(this.options._const.route, u.concat(E)).setValue(this.options._const.value, C.data)), E -= 1) : (v.push(new e().setValue(this.options._const.action, this.options._const.removeElement).setValue(this.options._const.route, u.concat(E)).setValue(this.options._const.element, k(C))), E -= 1) : D && !C && (D.nodeName === "#text" ? v.push(new e().setValue(this.options._const.action, this.options._const.addTextElement).setValue(this.options._const.route, u.concat(E)).setValue(this.options._const.value, D.data)) : v.push(new e().setValue(this.options._const.action, this.options._const.addElement).setValue(this.options._const.route, u.concat(E)).setValue(this.options._const.element, k(D))))), C && D && (!this.options.maxChildCount || m < this.options.maxChildCount ? v = v.concat(this.findNextDiff(C, D, u.concat(E))) : ne(C, D) || (i.length > c.length ? (C.nodeName === "#text" ? v.push(new e().setValue(this.options._const.action, this.options._const.removeTextElement).setValue(this.options._const.route, u.concat(E)).setValue(this.options._const.value, C.data)) : v.push(new e().setValue(this.options._const.action, this.options._const.removeElement).setValue(this.options._const.element, k(C)).setValue(this.options._const.route, u.concat(E))), i.splice($, 1), $ -= 1, E -= 1, A -= 1) : i.length < c.length ? (v = v.concat([
            new e().setValue(this.options._const.action, this.options._const.addElement).setValue(this.options._const.element, k(D)).setValue(this.options._const.route, u.concat(E))
          ]), i.splice($, 0, k(D)), A -= 1) : v = v.concat([
            new e().setValue(this.options._const.action, this.options._const.replaceElement).setValue(this.options._const.oldValue, k(C)).setValue(this.options._const.newValue, k(D)).setValue(this.options._const.route, u.concat(E))
          ]))), E += 1;
        }
        return n.innerDone = !0, v;
      }, s.prototype.attemptGroupRelocation = function(n, t, u, i, c) {
        for (var m = qe(n, t, u), A = m.gaps1, v = m.gaps2, E = n.childNodes.slice(), V = t.childNodes.slice(), T = Math.min(A.length, v.length), $, C, D, f, P, F = [], j = 0, q = 0; j < T; q += 1, j += 1)
          if (!(c && (A[j] === !0 || v[j] === !0))) {
            if (A[q] === !0)
              if (f = E[q], f.nodeName === "#text")
                if (V[j].nodeName === "#text") {
                  if (f.data !== V[j].data) {
                    for (var ie = q; E.length > ie + 1 && E[ie + 1].nodeName === "#text"; )
                      if (ie += 1, V[j].data === E[ie].data) {
                        P = !0;
                        break;
                      }
                    P || F.push(new e().setValue(this.options._const.action, this.options._const.modifyTextElement).setValue(this.options._const.route, i.concat(q)).setValue(this.options._const.oldValue, f.data).setValue(this.options._const.newValue, V[j].data));
                  }
                } else
                  F.push(new e().setValue(this.options._const.action, this.options._const.removeTextElement).setValue(this.options._const.route, i.concat(q)).setValue(this.options._const.value, f.data)), A.splice(q, 1), E.splice(q, 1), T = Math.min(A.length, v.length), q -= 1, j -= 1;
              else v[j] === !0 ? F.push(new e().setValue(this.options._const.action, this.options._const.replaceElement).setValue(this.options._const.oldValue, k(f)).setValue(this.options._const.newValue, k(V[j])).setValue(this.options._const.route, i.concat(q))) : (F.push(new e().setValue(this.options._const.action, this.options._const.removeElement).setValue(this.options._const.route, i.concat(q)).setValue(this.options._const.element, k(f))), A.splice(q, 1), E.splice(q, 1), T = Math.min(A.length, v.length), q -= 1, j -= 1);
            else if (v[j] === !0)
              f = V[j], f.nodeName === "#text" ? (F.push(new e().setValue(this.options._const.action, this.options._const.addTextElement).setValue(this.options._const.route, i.concat(q)).setValue(this.options._const.value, f.data)), A.splice(q, 0, !0), E.splice(q, 0, {
                nodeName: "#text",
                data: f.data
              }), T = Math.min(A.length, v.length)) : (F.push(new e().setValue(this.options._const.action, this.options._const.addElement).setValue(this.options._const.route, i.concat(q)).setValue(this.options._const.element, k(f))), A.splice(q, 0, !0), E.splice(q, 0, k(f)), T = Math.min(A.length, v.length));
            else if (A[q] !== v[j]) {
              if (F.length > 0)
                return F;
              if (D = u[A[q]], C = Math.min(D.newValue, E.length - D.length), C !== D.oldValue && C > -1) {
                $ = !1;
                for (var He = 0; He < D.length; He += 1)
                  J(E[C + He], E[D.oldValue + He], {}, !1, !0) || ($ = !0);
                if ($)
                  return [
                    new e().setValue(this.options._const.action, this.options._const.relocateGroup).setValue(this.options._const.groupLength, D.length).setValue(this.options._const.from, D.oldValue).setValue(this.options._const.to, C).setValue(this.options._const.route, i)
                  ];
              }
            }
          }
        return F;
      }, s.prototype.findValueDiff = function(n, t, u) {
        var i = [];
        return n.selected !== t.selected && i.push(new e().setValue(this.options._const.action, this.options._const.modifySelected).setValue(this.options._const.oldValue, n.selected).setValue(this.options._const.newValue, t.selected).setValue(this.options._const.route, u)), (n.value || t.value) && n.value !== t.value && n.nodeName !== "OPTION" && i.push(new e().setValue(this.options._const.action, this.options._const.modifyValue).setValue(this.options._const.oldValue, n.value || "").setValue(this.options._const.newValue, t.value || "").setValue(this.options._const.route, u)), n.checked !== t.checked && i.push(new e().setValue(this.options._const.action, this.options._const.modifyChecked).setValue(this.options._const.oldValue, n.checked).setValue(this.options._const.newValue, t.checked).setValue(this.options._const.route, u)), i;
      }, s;
    }()
  ), Yt = {
    debug: !1,
    diffcap: 10,
    maxDepth: !1,
    maxChildCount: 50,
    valueDiffing: !0,
    // syntax: textDiff: function (node, currentValue, expectedValue, newValue)
    textDiff: function(s, n, t, u) {
      s.data = u;
    },
    // empty functions were benchmarked as running faster than both
    // `f && f()` and `if (f) { f(); }`
    preVirtualDiffApply: function() {
    },
    postVirtualDiffApply: function() {
    },
    preDiffApply: function() {
    },
    postDiffApply: function() {
    },
    filterOuterDiff: null,
    compress: !1,
    _const: !1,
    document: typeof window < "u" && window.document ? window.document : !1,
    components: []
  }, Zt = (
    /** @class */
    function() {
      function s(n) {
        if (n === void 0 && (n = {}), Object.entries(Yt).forEach(function(i) {
          var c = i[0], m = i[1];
          Object.prototype.hasOwnProperty.call(n, c) || (n[c] = m);
        }), !n._const) {
          var t = [
            "addAttribute",
            "modifyAttribute",
            "removeAttribute",
            "modifyTextElement",
            "relocateGroup",
            "removeElement",
            "addElement",
            "removeTextElement",
            "addTextElement",
            "replaceElement",
            "modifyValue",
            "modifyChecked",
            "modifySelected",
            "modifyComment",
            "action",
            "route",
            "oldValue",
            "newValue",
            "element",
            "group",
            "groupLength",
            "from",
            "to",
            "name",
            "value",
            "data",
            "attributes",
            "nodeName",
            "childNodes",
            "checked",
            "selected"
          ], u = {};
          n.compress ? t.forEach(function(i, c) {
            return u[i] = c;
          }) : t.forEach(function(i) {
            return u[i] = i;
          }), n._const = u;
        }
        this.options = n;
      }
      return s.prototype.apply = function(n, t) {
        return g(n, t, this.options);
      }, s.prototype.undo = function(n, t) {
        return R(n, t, this.options);
      }, s.prototype.diff = function(n, t) {
        var u = new Jt(n, t, this.options);
        return u.init();
      }, s;
    }()
  ), Xt = (
    /** @class */
    function() {
      function s(n) {
        n === void 0 && (n = {});
        var t = this;
        this.pad = "│   ", this.padding = "", this.tick = 1, this.messages = [];
        var u = function(c, m) {
          var A = c[m];
          c[m] = function() {
            for (var v = arguments, E = [], V = 0; V < arguments.length; V++)
              E[V] = v[V];
            t.fin(m, Array.prototype.slice.call(E));
            var T = A.apply(c, E);
            return t.fout(m, T), T;
          };
        };
        for (var i in n)
          typeof n[i] == "function" && u(n, i);
        this.log("┌ TRACELOG START");
      }
      return s.prototype.fin = function(n, t) {
        this.padding += this.pad, this.log("├─> entering ".concat(n), t);
      }, s.prototype.fout = function(n, t) {
        this.log("│<──┘ generated return value", t), this.padding = this.padding.substring(0, this.padding.length - this.pad.length);
      }, s.prototype.format = function(n, t) {
        var u = function(i) {
          for (var c = "".concat(i); c.length < 4; )
            c = "0".concat(i);
          return c;
        };
        return "".concat(u(t), "> ").concat(this.padding).concat(n);
      }, s.prototype.log = function() {
        for (var n = arguments, t = [], u = 0; u < arguments.length; u++)
          t[u] = n[u];
        var i = function(m) {
          return m ? typeof m == "string" ? m : a(m, "HTMLElement") ? m.outerHTML || "<empty>" : m instanceof Array ? "[".concat(m.map(i).join(","), "]") : m.toString() || m.valueOf() || "<unknown>" : "<falsey>";
        }, c = t.map(i).join(", ");
        this.messages.push(this.format(c, this.tick++));
      }, s.prototype.toString = function() {
        for (var n = "×   ", t = "└───"; t.length <= this.padding.length + this.pad.length; )
          t += n;
        var u = this.padding;
        return this.padding = "", t = this.format(t, this.tick), this.padding = u, "".concat(this.messages.join(`
`), `
`).concat(t);
      }, s;
    }()
  );
  return le.DiffDOM = Zt, le.TraceLogger = Xt, le.nodeToObj = se, le.stringToObj = we, le;
}
var gn = mn();
class vn {
  /**
   * HTML diffing helper class
   * @param {DiffConfigs} configs 
   */
  constructor({ targetElement: r, newMarkup: e, customElement: a }) {
    p(this, "performDiff", () => {
      const r = this.diffDom.diff(this.target, this.clone);
      this.diff = this.filterDiff(r);
    });
    p(this, "filterDiff", (r) => {
      const e = [];
      for (const a of r)
        if (!(a.action == "removeAttribute" && ["data-hash-id", "data-render-time"].includes(a.name)) && !(a.action == "modifyAttribute" && ["data-hash-id", "data-render-time"].includes(a.name))) {
          if (a.action == "removeElement" && a.element.nodeName == "#comment") {
            e.push(a);
            continue;
          }
          a.action == "removeElement" && a.element.attributes["data-parent-id"] != this.customElement.hashId || e.push(a);
        }
      return e;
    });
    p(this, "apply", () => {
      if (!this.diff)
        throw new Error("Perform the diffing operation first by calling Diff.diff method");
      this.diffDom.apply(this.target, this.diff);
    });
    p(this, "undo", () => {
      if (!this.diff)
        throw new Error("Perform the diffing operation first by calling Diff.diff method");
      this.diffDom.undo(this.target, this.diff);
    });
    p(this, "setInnerHTML", () => {
      this.performDiff(), this.apply();
    });
    this.diffDom = new gn.DiffDOM(), this.target = r, this.customElement = a;
    const o = r.cloneNode(!0), h = a._dotJSengine(e);
    a.app._originalInnerHTML.call(o, h), this.clone = o, this.diff = null;
  }
  get options() {
    return this.diffDom.options;
  }
  set options(r) {
    this.diffDom.options = r;
  }
}
const X = {
  CHANGE: "app-data-change",
  QUERYCHANGE: "query-data-change"
};
function Ee(l) {
  return l.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
const _n = /* @__PURE__ */ new Set([
  "viewBox",
  "preserveAspectRatio",
  "patternTransform",
  "clipPathUnits"
]);
class yn {
  constructor() {
    /**
     * Container element of the app
     * @type {HTMLElement|Element}
     * @property {App} app
     */
    p(this, "container");
    /**
     * @param {string} selector
     * @returns {HTMLElement|undefined}
     */
    p(this, "querySelector", (r) => this.container.querySelector(r));
    /**
     * @param {string} selector
     * @returns {NodeList}
     */
    p(this, "querySelectorAll", (r) => this.container.querySelectorAll(r));
    /**
     * @param {string} selector
     * @returns {HTMLElement|undefined}
     */
    p(this, "getElementById", (r) => this.container.querySelector(`#${r}`));
    /**
     * @param {string} selector
     * @returns {HTMLCollectionOf}
     */
    p(this, "getElementsByClassName", (r) => this.container.getElementsByClassName(r));
    /**
     * @param {string} selector
     * @returns {HTMLCollectionOf}
     */
    p(this, "getElementsByTagName", (r) => this.container.getElementsByTagName(r));
    /**
     * @param {string} selector
     * @returns {boolean}
     */
    p(this, "matches", (r) => this.container.matches(r));
    /**
     * Adds event listener to application container
     * @param {string} eventType - name of event
     * @param {(event: Event) => void} func - callback function for event
     */
    p(this, "addEventListener", (r, e) => {
      this.container.addEventListener(r, e);
    });
    /**
     * Removes event listener from application container
     * @param {string} eventType - name of event
     * @param {(event: Event) => void} func - callback function for event
     */
    p(this, "removeEventListener", (r, e) => {
      this.container.removeEventListener(r, e);
    });
    /**
     * @param {InsertPosition} position
     * @param {string} markup
     */
    p(this, "insertAdjacentHTML", (r, e) => {
      this.container.insertAdjacentHTML(r, e);
    });
  }
  /**
   * @returns {HTMLCollection}
   */
  get children() {
    return this.container.children;
  }
  /**
   * @returns {NodeListOf}
   */
  get childNodes() {
    return this.container.childNodes;
  }
}
var Re, B, Oe, $e, Me, I, K, ve, _e, ke, mt, gt, Le, vt, _t, Pe, yt, wt;
class Sn extends yn {
  /**
   * Creates app html element
   * @param {AppConfigs} configs
   */
  constructor({
    appName: e,
    dataStructure: a = {},
    elements: o = {},
    renderFunctions: h = {},
    router: _ = null,
    authenticator: g = null,
    extensions: b = {},
    properties: y = {},
    methods: R = {},
    beforeInit: L = {},
    afterInit: N = {},
    errorPages: S = null
  }) {
    super();
    /**
     * @type {string}
     */
    p(this, "identifier", "app");
    /**
     * @type {string}
     */
    w(this, Re);
    /**
     * @type {Map<string, any>}
     */
    w(this, B, /* @__PURE__ */ new Map());
    /**
     * @type {Object<string, CallableFunction>}
     */
    w(this, Oe);
    /**
     * @type {Object<string, CallableFunction>}
     */
    w(this, $e);
    /**
     * Application properties
     * @type {Object<string, any>}
     */
    w(this, Me);
    /**
     * @type {CallableFunction}
     */
    p(this, "_router");
    /**
     * App router
     * @type {Router}
     */
    w(this, I);
    /**
     * @type {CallableFunction}
     */
    p(this, "_authenticator");
    /**
     * App authenticator
     * @type {Authenticator
     */
    w(this, K);
    /**
     * @type {Object<string, CallableFunction>}
     */
    p(this, "_extensions");
    /**
     * Application extensions
     * @type {Object<string, CallableFunction>|undefined}
     */
    w(this, ve);
    /**
     * @type {Object<string, HTMLElement>}
     */
    w(this, _e);
    /**
     * Custom render functions
     * @type {Object<string, CallableFunction>}
     * @private
     */
    p(this, "_renderFunctions");
    /**
     * @type {string[]}
     */
    w(this, ke);
    /**
     * Reserved attribute names that should not be manually set
     * @type {Array<string>}
     */
    p(this, "_filterAttributeNames", [
      "hashId",
      "data-hash-id",
      "hash-id",
      "parentId",
      "data-parent-id",
      "parent-id",
      "renderTime",
      "data-render-time",
      "render-time",
      "bind",
      "data-bind",
      "bindId",
      "data-bind-id",
      "bind-id"
    ]);
    /**
     * Initilizer function for application
     * Kicks of all neccessary steps
     * @param {string} target - query selector for application container
     */
    p(this, "init", async (e) => {
      const a = document.querySelector(e);
      if (!a)
        throw new Error("Could not find application container with selector: " + e);
      this.containerId = e, this.container = a, this.container.setAttribute("app-id", this.generateHash()), this.container.app = this, this.registerCustomElements(d(this, _e)), this.registerCustomElements(this._errorPages), this._modifyPrototypeMethods(), this._authenticator && U(this, K, this._authenticator(this)), d(this, mt).call(this), await d(this, Le).call(this, d(this, Oe)), this._router && U(this, I, this._router(this)), await d(this, gt).call(this), d(this, I) && await d(this, I).route(), await d(this, _t).call(this), await d(this, Le).call(this, d(this, $e));
    });
    w(this, mt, () => {
      for (const [e, a] of Object.entries(this._methods)) {
        if (d(this, ke).includes(e) || e.startsWith("#") || e.startsWith("_"))
          throw new Error(`Illegal or protected method name. Can't assign method with name (${e})
                    that is protected or if it is of illegal format (startswith: # or _) to application`);
        try {
          this[e] = a.bind(this);
        } catch (o) {
          throw new Error(`${a} is probably not a function. Failed to bind method ${a} to application.` + o);
        }
      }
      this._methods = null;
    });
    /**
     * Modifies prototype methods of HTMLElement
     * insertAdjacentHTML
     * innerHTML
     * outerHTML
     * appendChild
     * setAttribute
     * removeAttribute
     *
     * Modifies prototype method for query selectors on Element and Document
     * querySelector
     * querySelectorAll
     */
    p(this, "_modifyPrototypeMethods", () => {
      this._originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, "innerHTML").set, this._originalOuterHTML = Object.getOwnPropertyDescriptor(Element.prototype, "outerHTML").set, this._originalInsertAdjacentHTML = Element.prototype.insertAdjacentHTML, this._originalAppendChild = Element.prototype.appendChild, this._originalSetAttribute = Element.prototype.setAttribute, this._originalRemoveAttribute = Element.prototype.removeAttribute;
      const e = this;
      Element.prototype.insertAdjacentHTML = function(a, o) {
        const h = this.closest("[data-hash-id]");
        if (!h)
          return e._originalInsertAdjacentHTML.call(this, a, o);
        const _ = h._dotJSengine(o);
        e._originalInsertAdjacentHTML.call(this, a, _), h._hydrate(), h.clearTemplateVariables();
      }, Object.defineProperty(Element.prototype, "innerHTML", {
        set: function(a) {
          const o = this.closest("[data-hash-id]");
          if (!o) {
            e._originalInnerHTML.call(this, a);
            return;
          }
          new vn({
            targetElement: this,
            newMarkup: a,
            customElement: o
          }).setInnerHTML(), o._hydrate(), o.clearTemplateVariables();
        }
      }), Object.defineProperty(Element.prototype, "outerHTML", {
        set: function(a) {
          var h;
          const o = (h = this.parent) == null ? void 0 : h.closest("[data-hash-id]");
          if (o) {
            const _ = o._dotJSengine(a);
            e._originalOuterHTML.call(this, _), o._hydrate();
            return;
          }
          e._originalOuterHTML.call(this, a);
        }
      }), Element.prototype.setAttribute = function(a, o) {
        let h = a.startsWith(":") ? `data-${a.substring(1)}` : a;
        this instanceof SVGElement && _n.has(h) || (h = Ee(h)), e._originalSetAttribute.call(this, h, o), this instanceof G && this._refreshBoundElements(`attrs.${h.replace("data-", "")}`);
      }, Element.prototype.setAttributes = function(a) {
        for (const [o, h] of Object.entries(a))
          this.setAttribute(o, h);
      }, Element.prototype.removeAttribute = function(a, o) {
        const h = a.startsWith(":") ? `data-${a.substring(1)}` : a;
        e._originalRemoveAttribute.call(this, h, o), this instanceof G && this._refreshBoundElements(`attrs.${h.replace("data-", "")}`);
      }, this._originalDocQS = Document.prototype.querySelector, this._originalDocQSA = Document.prototype.querySelectorAll, this._originalElQS = Element.prototype.querySelector, this._originalElQSA = Element.prototype.querySelectorAll, Document.prototype.querySelector = function(a) {
        const o = Fe(a);
        return e._originalDocQS.call(this, o);
      }, Document.prototype.querySelectorAll = function(a) {
        const o = Fe(a);
        return e._originalDocQSA.call(this, o);
      }, Element.prototype.querySelector = function(a) {
        const o = Fe(a);
        return e._originalElQS.call(this, o);
      }, Element.prototype.querySelectorAll = function(a) {
        const o = Fe(a);
        return e._originalElQSA.call(this, o);
      };
    });
    /**
     * Initializes all application extensions
     * @returns {Promise<void>}
     */
    w(this, gt, async () => {
      if (this._extensions) {
        U(this, ve, {});
        for (const [e, a] of Object.entries(this._extensions))
          d(this, ve)[e] = await a(this);
      }
    });
    /**
     * Runs all methods in provided object
     * @param {Object<string, CallableFunction>} methods
     * @returns {Promise<void>}
     */
    w(this, Le, async (e) => {
      for (const [a, o] of Object.entries(e))
        await o.bind(this)();
    });
    /**
     * Maps provided data structure object to data map
     * @param {Object<string, any>} dataStructure
     */
    w(this, vt, (e) => {
      for (const [a, o] of Object.entries(e))
        d(this, B).set(a, o);
    });
    /**
     * Method to wait for all custom subelements to finish loading/rendering
     * Returns array with subelement promises to be resolved upon initialization
     * @returns {Promise<Array<Promise>>}
     */
    w(this, _t, async () => {
      const e = [];
      return Array.from(this.querySelectorAll("*")).filter(
        (o) => o instanceof G
      ).forEach((o) => {
        e.push(o.initComplete);
      }), await Promise.all(e);
    });
    /**
     * Sets data to application data storage
     * @param {string} field
     * @param {any} data
     */
    p(this, "setData", (e, a) => {
      if (!d(this, B).has(e))
        throw new Error(`Failed to set data. Missing data field ${e} in app data structure`);
      d(this, B).set(e, a), d(this, Pe).call(this, e);
    });
    /**
     * Removes data from app data (sets as null). Convenience method for setData(field, null);
     * @param {string} field
     */
    p(this, "removeData", (e) => {
      if (!d(this, B).has(e))
        throw new Error(`Failed to set data. Missing data field ${e} in app data structure`);
      d(this, B).set(e, null), d(this, Pe).call(this, e);
    });
    /**
     * Gets data from application data storage
     * @param {string} field
     * @returns {any|undefined}
     */
    p(this, "getData", (e) => {
      if (!d(this, B).has(e))
        throw new Error(`Failed to fetch data for field ${e}. Data field does not exist`);
      return d(this, B).get(e);
    });
    /**
     * Returns entire data structure as Map or object
     * @returns {Map|Object<string, any>}
     */
    p(this, "getAllData", (e = !1) => e ? Object.fromEntries(d(this, B)) : d(this, B));
    /**
     * Emits event for application dta change
     * @param {string} field
     */
    w(this, Pe, (e) => {
      const a = new CustomEvent(X.CHANGE, {
        detail: { field: Ee(e) }
      });
      this.container.dispatchEvent(a);
    });
    /**
     * Emits event for application dta change
     * @param {string} key
     * @param {string} value
     */
    w(this, yt, (e, a) => {
      const o = new CustomEvent(X.QUERYCHANGE, {
        detail: { key: e, value: a }
      });
      this.container.dispatchEvent(o);
    });
    w(this, wt, () => {
      const e = new CustomEvent(X.QUERYCHANGE, {
        detail: { query: this.queryParams }
      });
      this.container.dispatchEvent(e);
    });
    /**
     * Performs redirect
     * @param {string} pathname
     */
    p(this, "redirect", (e) => {
      if (!this.router)
        throw new Error("Redirect is only available with Router");
      this.router.redirect(e);
    });
    /**
     * Registers custom elements
     * @param {Object<string|number, HTMLElement>} elements
     */
    p(this, "registerCustomElements", (e) => {
      if (e)
        for (const a of Object.values(e))
          customElements.get(a.tagName) || customElements.define(a.tagName, a);
    });
    /**
     * Converts the location.search string to an object of key-value pairs
     * @param {string} search - location.search string
     * @returns {Object<string, string>|{}}
     */
    p(this, "queryParamsToObject", (e) => {
      const a = new URLSearchParams(e), o = {};
      for (const [h, _] of a.entries())
        o[h] = _;
      return o;
    });
    /**
     * Returns location.search params (query params) either as object (true) or as a string (false)
     * Default: false
     * @param {boolean} toObject
     * @returns {string|Object<string, string>|{}}
     */
    p(this, "getQueryParams", (e = !1) => e ? this.queryParamsToObject(location.search) : location.search);
    /**
     * Generates a random hash with provided length. Default is 16
     * @param {number} length
     * @returns {string}
     */
    p(this, "generateHash", (e = 16) => {
      const a = new Uint8Array(e);
      return window.crypto.getRandomValues(a), Array.from(a, (o) => o.toString(16).padStart(2, "0")).join("");
    });
    if (!e)
      throw new Error("Missing appName parameter");
    U(this, Re, e), d(this, vt).call(this, a), U(this, _e, o), this._router = _, this._authenticator = g, this._extensions = b, this._renderFunctions = h, this._errorPages = S, U(this, Me, y), U(this, Oe, L), U(this, $e, N), this._methods = R, U(this, ke, Object.getOwnPropertyNames(this));
  }
  isCustomElement(e) {
    return e instanceof G && customElements.get(e.tagName.toLowerCase());
  }
  /**
   * Returns the app instance (this). Implemented for
   * compatibility with customElement instances
   */
  get app() {
    return this;
  }
  /**
   * Getter for application properties set as an object
   */
  get properties() {
    return d(this, Me);
  }
  /**
   * Getter for application name
   */
  get appName() {
    return d(this, Re);
  }
  /**
   * Getter for router
   */
  get router() {
    if (!d(this, I))
      throw new Error("Router is not installed with Application.");
    return d(this, I);
  }
  /**
   * Getter for authenticator
   */
  get authenticator() {
    if (!d(this, K))
      throw new Error("Authenticator is not installed with the Application.");
    return d(this, K);
  }
  get authenticatorInstalled() {
    return !!d(this, K);
  }
  /**
   * Returns object with initialized extensions
   */
  get ext() {
    return d(this, ve);
  }
  /**
   * @returns {Object<string, string>}
   */
  get queryParams() {
    return this.queryParamsToObject(location.search);
  }
  /**
   * Sets new query(search) parameters to url based on the
   * provided queryParamsObject
   * @param {Object<string, string>|{}} queryParamsObject
   */
  set queryParams(e) {
    const a = new URL(window.location.origin + window.location.pathname);
    for (const [o, h] of Object.entries(e))
      a.searchParams.set(o, h);
    window.history.replaceState(null, null, a);
    for (const [o, h] of Object.entries(e))
      d(this, yt).call(this, o, h);
    d(this, wt).call(this);
  }
  /**
   * Removes query parameters in provided array
   * @param {Array<string>} names
   */
  removeQueryParams(e) {
    const a = this.queryParams, o = {};
    for (const [h, _] of Object.entries(a))
      e.includes(h) || (o[h] = _);
    this.queryParams = o;
  }
  get _elements() {
    return d(this, _e);
  }
  /**
   * Getter for url hash
   * @returns {string}
   */
  get hash() {
    return location.hash;
  }
  /**
   * Getter for port number
   * @returns {string}
   */
  get port() {
    return location.port;
  }
  /**
   * Getter for hostname
   * @returns {string}
   */
  get hostname() {
    return location.hostname;
  }
  /**
   * Getter for host
   * @returns {string}
   */
  get host() {
    return location.host;
  }
  /**
   * Getter for pathname
   * @returns {string}
   */
  get pathname() {
    return location.pathname;
  }
  /**
   * Getter for origin
   * @returns {string}
   */
  get origin() {
    return location.origin;
  }
  /**
   * Returns object with route parameters
   * @returns {Object<string, string|number>}
   */
  get routeParameters() {
    return this.router.routeParameters;
  }
  /**
   * Returns object with all available render functions
   * @returns {Object<string, CallableFunction>}
   */
  get renderFunctions() {
    return this._renderFunctions;
  }
}
Re = new WeakMap(), B = new WeakMap(), Oe = new WeakMap(), $e = new WeakMap(), Me = new WeakMap(), I = new WeakMap(), K = new WeakMap(), ve = new WeakMap(), _e = new WeakMap(), ke = new WeakMap(), mt = new WeakMap(), gt = new WeakMap(), Le = new WeakMap(), vt = new WeakMap(), _t = new WeakMap(), Pe = new WeakMap(), yt = new WeakMap(), wt = new WeakMap();
export {
  Sn as App,
  bn as Authenticator,
  G as CustomElement,
  Cn as ElementFactory,
  Tn as Router,
  an as css,
  X as dataEventEnum,
  En as defineValue,
  Dt as html,
  Vn as querySelector,
  An as querySelectorAll,
  nn as randomId,
  Y as routeEventsEnum
};
