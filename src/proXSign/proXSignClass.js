import proXSign from "../../../../../modules/proxsign.js";

class ProXSignClass{

    /**
     * Constructor function for ProXSign extension
     * @param {Object} configs
     * @param {string} configs.licence - url string for licence
     * @param {Object} app - application object 
     */
    constructor({ licence, app }){
        this.reason = 'user';
        this.licence = licence;
        this.app = app;
        this.proXSignInit();
    }

    proXSignUrl = "https://www.si-trust.gov.si/sl/podpora-uporabnikom/podpisovanje-s-komponento-proxsign/"
    missingProXSign = "ProXSign modul ni bil najden. Prosim, zaženite modul, osvežite spletno stran in poskusite ponovno. Če modula nimate si ga lahko namestite iz: "
    missingProXSignEng = "ProXSign module not found. Please initialize the module, refresh the page, and try again. You can download the module from: "
    html = String.raw;

    dataStartTag = '<FormData Id="1">'
    dataEndTag = "</FormData>"
    xmlDocStart = '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>'

    generateMissingProXSignMsg = () => {
        if(this.app.appData.language === "sl"){
            return this.missingProXSign + this.proXSignUrl;
        }
        return this.missingProXSignEng + this.proXSignUrl;
    }

    proXSignInit = async () => {
        proXSign.initialize(()=>{
            this.updateLicense()
            //Druga inicializacija....
            this.isInitialized = true;
        }, this.callbackError)
    }

    _SignXML = async (obj) => {
        this.reason = 'user';
        let xmlTxt = this.dataStartTag + JSON.stringify(obj) + this.dataEndTag
        if (this.reason == 'user') {
            // ustvari XML strukturo
            var xml = this.xmlDocStart + this.decode(xmlTxt);
            // configure signature properties
            var prop = proXSign.XMLProperties("bytes", ["XML:" + xml]);
            //prop.xmlNodePaths = ["0;@@"];  //hard-coded
            //prop.xmlNodePaths = ["0;0;X;@"]; //iz https://proxsign.setcce.si/proXSignCustomerPages/testXML.html hidden polje id="NODE_TO_SIGN"
            //nastavitve proXSign komponente
            prop.options = [
                proXSign.options.XSIGN_OPTION_SHA256,                           //SHA256 hashing algorithm - SHA1 is no good!
                proXSign.options.XSIGN_OPTION_CHECK_CRL,                        // Certificate revocation list check
                proXSign.options.XSIGN_OPTION_DONT_CERT_CHAIN,                  // Disables the certificate chain validity check.
                proXSign.options.SIG_TYPE_ENVELOPING,                           // signature is wrapped around the document
                //proXSign.options.SIG_TYPE_DETACHED,
                //proXSign.options.XSIGN_OPTION_INCLUDE_SN_ISSUER,                // include certificate issuer to keyinfo
                proXSign.options.XSIGN_OPTION_INCLUDE_PUB_KEY,                  // include certificate public key to keyinfo
                proXSign.options.XSIGN_OPTION_UTF8_ENCODING,
                //proXSign.options.XSIGN_OPTION_RETURN_BYTES,                     //types of return (BYTES, UTF-8 or PRETTY_PRIN)    
                //proXSign.options.XSIGN_OPTION_PRETTY_PRINT,
                proXSign.options.XSIGN_OPTION_INCLUDE_CERT,                    //include certificate string
                proXSign.options.XSIGN_OPTION_SIGN_BY_ID
            ];
    
            prop.lang = proXSign.language.XSIGN_LANG_ENGLISH;
            prop.URIId = ["1"];
            //Izklopil filtracijo, ker nimam certifikata naštetih izdajateljev.
            //prop.CAs = ['sigen-ca;POSTArCA;POSTA SLOVENIJE d.o.o.;Republika Slovenija;sigov-ca;ACNLB;NLB d.d.;Halcom d.d.;sitest-ca']; //filtering only to "official Slovenian" certs
            return new Promise((resolve, reject) => {
                const successCallback = (res, textStatus) => {
                    resolve(this.callbackSign(res, textStatus))
                }
                const errorCallback = (jqXHR, textStatus, errorThrown) => {
                    reject(this.callbackError(jqXHR, textStatus, errorThrown))
                }
                proXSign.signXML(prop, successCallback, errorCallback); //podpiše dokument (prop) in obdela odgovor (callbackSign) ali napako (callbackError)
            })
        }
    }

    SignXML = async (obj) => {
        try{
            return await this._SignXML(obj);
        }catch (e){
            //return this.callbackError(this.generateMissingProXSignMsg(), e.status, e.message)
            //this.openModal(this.generateMissingProXSignTitle(), this.generateMissingProXSignMsg());
            this.isInitialized = false;
            this.app.ext.messenger.errorModal({
                title: "Napaka",
                message: this.generateMissingProXSignMsg()
            })
        }
    }

    _batchSignXML = async (objs) => {
        this.reason = 'user';
        let listIndexXMLToSign = [];
        // ustvari XML strukturo
        // configure signature properties
        var prop = proXSign.XMLProperties("bytes", []);
        prop.options = [
            proXSign.options.XSIGN_OPTION_SHA256,                           //SHA256 hashing algorithm - SHA1 is no good!
            proXSign.options.XSIGN_OPTION_CHECK_CRL,                        // Certificate revocation list check
            proXSign.options.XSIGN_OPTION_DONT_CERT_CHAIN,                  // Disables the certificate chain validity check.
            //proXSign.options.SIG_TYPE_ENVELOPING,                           // signature is wrapped around the document
            proXSign.options.SIG_TYPE_DETACHED,
            proXSign.options.XSIGN_OPTION_INCLUDE_SN_ISSUER,                // include certificate issuer to keyinfo
            proXSign.options.XSIGN_OPTION_INCLUDE_PUB_KEY,                  // include certificate public key to keyinfo
            proXSign.options.XSIGN_OPTION_UTF8_ENCODING,
            proXSign.options.XSIGN_OPTION_RETURN_BYTES,                     //types of return (BYTES, UTF-8 or PRETTY_PRIN)     
            proXSign.options.XSIGN_OPTION_PRETTY_PRINT,
            proXSign.options.XSIGN_OPTION_INCLUDE_CERT                    //include certificate string
        ];

        prop.lang = proXSign.language.XSIGN_LANG_ENGLISH;
        prop.URIId = ["1"];
        //Izklopil filtracijo, ker nimam certifikata naštetih izdajateljev.
        //prop.CAs = ['sigen-ca;POSTArCA;POSTA SLOVENIJE d.o.o.;Republika Slovenija;sigov-ca;ACNLB;NLB d.d.;Halcom d.d.;sitest-ca']; //filtering only to "official Slovenian" certs
        
        let counter = 1;
        for(let obj of objs){
            let doc = this.dataStartTag + JSON.stringify(obj) + this.dataEndTag
            doc = this.xmlDocStart + this.decode(doc);
            prop.bytes.push("XML:" + doc);
            listIndexXMLToSign.push(`${counter}`);
            counter++;
        }
        
        return new Promise((resolve, reject) => {
            const successCallback = (res, textStatus) => {
                resolve(this.callbackSignBatch(res, textStatus))
            }
            const errorCallback = (jqXHR, textStatus, errorThrown) => {
                reject(this.callbackError(jqXHR, textStatus, errorThrown))
            }
            proXSign.batchSignXML(prop, successCallback, errorCallback); //podpiše dokumente in obdela odgovor ali napako
        })
    }

    /**
     * 
     * @param {Array<Object>} objs 
     */
    batchSignXML = async (objs) => {
        try{
            return await this._batchSignXML(objs);
        }catch (e){
            this.isInitialized = false;
            this.app.ext.messenger.errorModal({
                title: "Napaka",
                message: this.generateMissingProXSignMsg()
            })
        }
    }

    updateLicense = () => {
        //var licence = 'http://www.setcce.si/proxsign/licenses/MJU34178eV3.lic';
        var force = true;
        proXSign.updateLicense({ fileURL: this.licence, forceUpdate: force }, this.callbackLicense, this.callbackError)
    }

    callbackLicense = (data, textStatus) => {
        if(data.error != 1){
            return {ok: false, code: data.error, document: null, message: data.errorMessage}
        }
    }
    
    callbackSignBatch = (res, textStatus) => {
        //Obdela odgovor proXSign komponente
        if (res.error == 1) { // SIGN OK
            const documents = [];
            res.batchResults.forEach((doc) => {
                documents.push(this.decode(this.escapeXml(doc.result)));
            })
            this.reason = 'callback'; // use this to prevent submit cycling - finta iz rešitve Stroke.
            return {ok: true, code: res.error, documents: documents, message: "Documents were signed successfully."};
        }
        return {ok: false, code: res.error, document: null, message: res.errorMessage};
    }

    callbackSign = (res, textStatus) => {
        //Obdela odgovor proXSign komponente
        if (res.error == 1) { // SIGN OK
            //escapeXml nadomesti vse znake ("<", ">", "&", '"', "'") s html encoded znaki: "&" -> "&amp"
            //nisem prepričan, da je potrebno.
            var rez = this.decode(this.escapeXml(res.result));
            this.reason = 'callback'; // use this to prevent submit cycling - finta iz rešitve Stroke.
            return {ok: true, code: res.error, document: rez, message: "Document was signed successfully."};
        }
        if(res.error == -3){
            return {ok: false, code: res.error, document: null, message: "Podpisovanje prekinjeno iz strani uporabnika."}
        }
        return {ok: false, code: res.error, document: null, message: res.errorMessage};
    }

    callbackError = (jqXHR, textStatus, errorThrown) => {
        return {ok: false, code: 100, document: null, message: JSON.stringify(jqXHR)}
    }

    get XML_CHAR_MAP() {
        return {
            '<': '&lt;',
            '>': '&gt;',
            '&': '&amp;',
            '"': '&quot;',
            "'": '&apos;'
        }
    }

    decode = (input) => {
        //hack-ish finta za dekodiranje
        //Avtomatsko dekodira morebitne HTML entitete. "&amp;"" -> "&"", "&lt;" -> "<" 
        //Potrebno, če input element dokumenta oziroma vsebine ni textarea polje.
        var txt = document.createElement("textarea");
        txt.innerHTML = input;
        return txt.value;
    }

    escapeXml = (str) => {
        return str.replace(/[<>&"']/g, (ch) => {
            return this.XML_CHAR_MAP[ch];
        });
    }

    /**
     * Creates a signed JSON object with provided data
     * @param {Object} obj
     * @param {Object} user
     * @returns {Promise<Object<String, String>>}
     */
    signJSON = async (obj, user) => {
        const xml = await this.SignXML(obj);
        if(!xml){
            return null;
        }
        if(!xml.ok){
            return xml;
        }
        const document = xml.document
        const namespace = "http://www.w3.org/2000/09/xmldsig#";
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(document, "application/xml");
        return {
            ok: xml.ok,
            message: xml.message,
            code: xml.code,
            document: {
                data: obj,
                signatures: [{
                    date: new Date().toISOString(),
                    user: user,
                    signature: {
                        value: xmlDoc.getElementsByTagNameNS(namespace, "SignatureValue")[0].textContent.trim(),
                        modulus: xmlDoc.getElementsByTagNameNS(namespace, "Modulus")[0].textContent.trim(),
                        exponent: xmlDoc.getElementsByTagNameNS(namespace, "Exponent")[0].textContent.trim(),
                        algorithm: xmlDoc.getElementsByTagNameNS(namespace, "SignatureMethod")[0].getAttribute("Algorithm").trim(),
                        digestValue: xmlDoc.getElementsByTagNameNS(namespace, "DigestValue")[0].textContent.trim()
                    },
                    certificate: {
                        // issuer: {
                        //     name: xmlDoc.getElementsByTagNameNS(namespace, "X509IssuerName")[0].textContent.trim(),
                        //     serial: xmlDoc.getElementsByTagNameNS(namespace, "X509SerialNumber")[0].textContent.trim()
                        // },
                        value: xmlDoc.getElementsByTagNameNS(namespace, "X509Certificate")[0].textContent.trim(),
                    }
                }]
            }
        }
    }

    /**
     * Add signature to already signed JSON document
     * @param {Object} signedJSON 
     * @param {Object} user 
     * @returns {Promise<Object|null>}
     */
    addSignatureToJson = async (signedJSON, user) => {
        const xml = await this.signJSON(signedJSON.data);
        if(!xml){
            return;
        }

        if(!xml?.ok){
            return xml;
        }
        const existingSignatures = signedJSON?.signatures || [];
        return {
            ok: xml.ok,
            message: xml.message,
            code: xml.code,
            document: {
                data: signedJSON.data,
                signatures: [
                    ...existingSignatures,
                    {
                        date: xml.document.signatures[0].date,
                        user: user,
                        signature: xml.document.signatures[0].signature,
                        certificate: xml.document.signatures[0].certificate
                    }
                ],
            }
        }
    }

    set licence(licence){
        this._licence = licence;
    }

    get licence(){
        return this._licence;
    }
}

export default ProXSignClass;
