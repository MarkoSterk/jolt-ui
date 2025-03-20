import App from "../app.js";
import { html } from "../baseCore.js";

class CDfMessenger extends HTMLElement{

    static tagName = "c-df-messenger";

    constructor(){
        super();
    }

    /**
     * Generates message id with random number
     * @param {number} max 
     * @param {number} min 
     * @returns {string}
     */
    _randomMsgId = (max = 1000, min = 1) => {
        const id = Math.floor(Math.random() * (max - min + 1)) + min;
        return `message-${id}`;
    }

    markup = ({ message, status, msgId }) => {
        return html`
        <div class="msg-container row ${status} ${msgId} bg-${status} border border-dark rounded py-4 px-1 shadow" id="${msgId}">
            <div class="col-auto">
        	    <button class="btn btn-sm close-${msgId}" type="button"><i class="fa-solid fa-xmark"></i></button>
            </div>
        	<div class="col text-center m-1">
	        	${message}
	        </div>
        </div>`
        
    }

    /**
     * Sets message
     * @param {Object} configs
     * @param {string} configs.message - message to display
     * @param {string} configs.status - status of the message (bootstrap class) 
     * @param {Number} configs.timeout - timeout for message in seconds
     */
    _setMessage = ({ message, status, timeout }) => {
        const msgId = this._randomMsgId();
        const msgMarkup = this.markup({ message, status, msgId});
        this.insertAdjacentHTML("afterbegin", msgMarkup);
        setTimeout(() => this.querySelector("#"+msgId)?.classList.add("shown"), 20);
        const intervalId = this._activateMsg(msgId, timeout);
        this._setTimeout(msgId, timeout, intervalId);
    }

    /**
     * Sets timeout for shown message
     * @param {string} msgId 
     * @param {number} timeout 
     * @param {number} intervalId
     */
    _setTimeout = (msgId, timeout, intervalId) => {
        setTimeout(() => {
            const el = this.querySelector(`.${msgId}`);
            if(el){
               el.remove()
            }
        }, timeout*1000);
    }

    /**
     * Adds event listener to msg button for removing message
     * and activates animation
     * @param {string} msgId
     * @param {number} timeout
     */
    _activateMsg = (msgId, timeout) => {
        const btn = this.querySelector(`.close-${msgId}`);
        btn?.addEventListener("click", (event) => {
            this._removeMsg(event);
        });
    }

    /**
     * Removes msg containing the pressed button - event listener method
     * @param {Event} event 
     */
	_removeMsg = (event) => {
		const el = event.target.closest(".msg-container");
		if(!el) return;
		el.classList.remove("shown");
		el.ontransitionend = (event) => {
			el.remove();
	    };
    }

    /**
     * Returns simple html markup for this HTML element with some styling
     * @returns {string}
     */
    static _generate(appId){
        if(!appId){
            throw new Error("Line messenger element need a valid appId from their parent application.")
        }
        return `<${this.tagName} app-id="${appId}" style="position: fixed; z-index: 3000; 
                width: 95%; max-width:330px; right:20px; top:65px"></${this.tagName}>`
    }

}

class CDfModalMessenger extends HTMLElement{

    static tagName = "c-df-modal-messenger";

    constructor(){
        super();
    }

    /**
     * Generates message id with random number
     * @param {number} max 
     * @param {number} min 
     * @returns {string}
     */
    _modalId = (max = 1000, min = 1) => {
        const id = Math.floor(Math.random() * (max - min + 1)) + min;
        return `modal-${id}`;
    }

    _confirmModalMarkup = ({ title, message,  closeTxt, modalSize, confirmTxt, modalId }) => {
        const zIndex = this._getCurrentZindex();
        return html`
        <div class="modal fade modal-animate anim-blur ${modalId}" tabindex="-1" id="${modalId}" 
        style="z-index: ${zIndex};" data-bs-backdrop="static" data-bs-keyboard="false">
            <div class="modal-dialog ${modalSize}">
                <div class="modal-content">
                    <div class="modal-body swal2-icon-warning">
                    	<div class="swal2-icon swal2-warning swal2-icon-show d-flex">
                    		<div class="swal2-icon-content">!</div>
                    	</div>
                    	<h2 class="swal2-title text-center" id="confirm-title">${title}</h2>
                    	<div class="swal2-html-container text-center" id="swal2-html-container">${message}</div>
                    </div>
                    <div class="modal-footer justify-content-center">
                        <button type="button" class="btn btn-success confirm confirm-${modalId}">
                            ${confirmTxt}
                        </button>
                        <button type="button" class="btn btn-light-secondary close close-${modalId}">
                            ${closeTxt}
                        </button>
                    </div>
                </div>
            </div>
        </div>`
    }

    _createConfirmModal = ({ title, message, closeTxt, confirmTxt, modalSize,  callbackFunction }) => {
        const modalId = this._modalId();
        const markup = this._confirmModalMarkup({
            title: title,
            message: message,
            closeTxt: closeTxt,
            confirmTxt: confirmTxt,
            modalSize: modalSize,
            modalId: modalId
        });
        this._hideActiveModals();
        this.insertAdjacentHTML("afterbegin", markup);
        const modal = this._activateConfirmModal(modalId, callbackFunction);
        return modal;
    }

    _activateConfirmModal = (modalId, callbackFunction) => {
        const modalContainer = this.querySelector(`.${modalId}`)
        const modal = new bootstrap.Modal(modalContainer);
        const closeBtn = modalContainer.querySelectorAll(`.close-${modalId}`);
        this._activateCloseBtns(closeBtn, modal, modalContainer);
        const confirmBtn = modalContainer.querySelector(`.confirm-${modalId}`);
        this._activateConfirmBtn(confirmBtn, modal, modalContainer, callbackFunction);
        modal.show();
        return modal;
    }

    _errorModalMarkup = ({ title, message, closeTxt, modalSize, modalId }) => {
        const zIndex = this._getCurrentZindex();
        return html`
        <div class="modal fade modal-animate anim-blur ${modalId}" tabindex="-1" id="${modalId}" 
        style="z-index: ${zIndex};" data-bs-backdrop="static" data-bs-keyboard="false">
            <div class="modal-dialog ${modalSize}">
                <div class="modal-content">
                    <div class="modal-body">
						<div class="swal2-icon swal2-error swal2-icon-show" style="display: flex;">
							<span class="swal2-x-mark">
						    <span class="swal2-x-mark-line-left"></span>
						    <span class="swal2-x-mark-line-right"></span>
						  </span>
						</div>
                    	<h2 class="swal2-title text-center" id="confirm-title">${title}</h2>
                    	<div class="swal2-html-container text-center" id="swal2-html-container">${message}</div>
                    </div>
                    <div class="modal-footer justify-content-center">
                        <button type="button" class="btn btn-light-secondary close close-${modalId}">
                        ${closeTxt}</button>
                    </div>
                </div>
            </div>
        </div>`

    }

    _createErrorModal = ({ title, message, modalSize, closeTxt, callbackFunction }) => {
        const modalId = this._modalId();
        const markup = this._errorModalMarkup({
            title: title,
            message: message,
            closeTxt: closeTxt,
            modalSize: modalSize,
            modalId: modalId
        });
        this._hideActiveModals();
        this.insertAdjacentHTML("afterbegin", markup);
        const modal = this._activateErrorModal(modalId, callbackFunction);
        return modal;
    }

    _activateErrorModal = (modalId, callbackFunction) => {
        const modalContainer = this.querySelector(`.${modalId}`);
        const modal = new bootstrap.Modal(modalContainer);
        const closeBtn = modalContainer.querySelectorAll(`.close-${modalId}`);
        this._activateCloseBtns(closeBtn, modal, modalContainer, callbackFunction);
        modal.show();
        return modal;
    }

    /**
     * 
     * @param {Object} configs
     * @param {string} configs.title - modal title
     * @param {string} configs.content
     * @param {string} [configs.modalSize] - size of the modal (valid bootstrap modal size classes)
     * @param {string} configs.closeTxt
     * @param {string} configs.modalId
     * @param {string} configs.confirmTxt
     * @returns {string}
     */
    _blankModalMarkup = ({ title, content, modalSize, closeTxt, confirmTxt, modalId }) => {
        const zIndex = this._getCurrentZindex();
        return html`
        <div id="${modalId}" class="modal fade modal-animate anim-blur ${modalId}" tabindex="-1" style="z-index: ${zIndex};" data-bs-backdrop="static" data-bs-keyboard="false">
            <div class="modal-dialog ${modalSize}">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close close-${modalId}" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    <div class="modal-footer">
                        <button type="button" 
                                class="btn btn-primary confirm confirm-${modalId}" 
                                style="display: ${confirmTxt ? 'inline-block' : 'none'};">
                            ${confirmTxt}
                        </button>
                        <button type="button" class="btn btn-secondary close close-${modalId}">
                            ${closeTxt}
                        </button>
                    </div>
                </div>
            </div>
        </div>`
    }

    /**
     * 
     * @param {Object} configs
     * @param {string} configs.title - modal title
     * @param {string} configs.content
     * @param {string} [configs.modalSize] - size of the modal (valid bootstrap modal size classes)
     * @param {string} configs.closeTxt
     * @param {string} configs.modalId
     * @returns {string}
     */
    _infoModalMarkup = ({ title, content, modalSize = "", closeTxt, modalId }) => {
        const zIndex = this._getCurrentZindex();
        return html`
        <div id="${modalId}" class="modal fade modal-animate anim-blur ${modalId}" 
        tabindex="-1" style="z-index: ${zIndex};" data-bs-backdrop="static" data-bs-keyboard="false">
            <div class="modal-dialog ${modalSize}">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close close-${modalId}" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary close close-${modalId}">
                            ${closeTxt}
                        </button>
                    </div>
                </div>
            </div>
        </div>`
    }

    /**
     * 
     * @param {Object} configs - blank modal configurations
     * @param {string} configs.title - blank modal title
     * @param {string} configs.content - blank modal content (HTML)
     * @param {string} [configs.closeTxt] - blank modal close btn text
     * @param {string} [configs.confirmTxt] - blank modal confirm btn text
     * @param {string} [configs.modalSize] - size of the modal (valid bootstrap modal size classes)
     * @param {CallableFunction} configs.callbackFunction - callback function for blank modal
     * @returns {bootstrap.Modal}
     */
    _createBlankModal = ({title, content, closeTxt, confirmTxt, modalSize, callbackFunction}) => {
        const modalId = this._modalId();
        const markup = this._blankModalMarkup({
            title: title,
            content: content,
            closeTxt: closeTxt,
            confirmTxt: confirmTxt,
            modalSize: modalSize,
            modalId: modalId
        });
        this._hideActiveModals();
        this.insertAdjacentHTML("afterbegin", markup);
        const modal = this._activateBlankModal(modalId, callbackFunction);
        return modal;
    }

    _activateBlankModal = (modalId, callbackFunction) => {
        const modalContainer = this.querySelector(`.${modalId}`)
        const modal = new bootstrap.Modal(modalContainer);
        const closeBtn = modalContainer.querySelectorAll(`.close-${modalId}`);
        this._activateCloseBtns(closeBtn, modal, modalContainer);
        const confirmBtn = modalContainer.querySelector(`.confirm-${modalId}`);
        this._activateConfirmBtn(confirmBtn, modal, modalContainer, callbackFunction);
        modal.show();
        return modal;
    }

    /**
     * 
     * @param {Object} configs - blank modal configurations
     * @param {string} configs.title - blank modal title
     * @param {string} configs.content - blank modal content (HTML)
     * @param {string} [configs.closeTxt] - blank modal close btn text
     * @param {string} [configs.modalSize] - size of the modal (valid bootstrap modal size classes)
     * @returns {bootstrap.Modal}
     */
    _createInfoModal = ({title, content, closeTxt, modalSize}) => {
        const modalId = this._modalId();
        const markup = this._infoModalMarkup({
            title: title,
            content: content,
            closeTxt: closeTxt,
            modalSize: modalSize,
            modalId: modalId
        });
        this._hideActiveModals();
        this.insertAdjacentHTML("afterbegin", markup);
        const modal = this._activateInfoModal(modalId);
        return modal;
    }

    _activateInfoModal = (modalId) => {
        const modalContainer = this.querySelector(`.${modalId}`)
        const modal = new bootstrap.Modal(modalContainer);
        const closeBtn = modalContainer.querySelectorAll(`.close-${modalId}`);
        this._activateCloseBtns(closeBtn, modal, modalContainer);
        modal.show();
        return modal;
    }

    _activateConfirmBtn = (btn, modal, modalContainer, callbackFunction) => {
        btn.addEventListener("click", async (event) => {
            await callbackFunction(modalContainer);
            modal.hide();
            modalContainer.remove();
            this._showActiveModal();
        })
    }

    _activateCloseBtns = (btns, modal, modalContainer, callbackFunction = () => {}) => {
        btns.forEach((btn) => {
            btn.addEventListener("click", (event) => {
                callbackFunction();
                modal.hide();
                modalContainer.remove();
                this._showActiveModal();
            })
        })
    }

    _showActiveModal = () => {
        let highestZIndex = 0;
        let modalToShow = null;
        document.querySelectorAll(".modal").forEach((modal) => {
            const modalZIndex = parseInt(modal.style.zIndex) || 0;
            if(highestZIndex < modalZIndex){
                highestZIndex = modalZIndex;
                modalToShow = modal;
            }
        });
        if(modalToShow){
            const modal = bootstrap.Modal.getInstance(modalToShow);
            modal.show();
        }
    }

    _hideActiveModals = () => {
        document.querySelectorAll(".modal").forEach((modal) => {
            const activeModal = bootstrap.Modal.getInstance(modal);
            activeModal.hide();
        })
    }

    _getCurrentZindex = () => {
        const modals = document.querySelectorAll(".modal");
        const zIndexOffset = modals.length*100;
        return 1100 + zIndexOffset;
    }

    /**
     * Returns simple html markup for this HTML element with some styling
     * @returns {string}
     */
    static _generate(appId){
        if(!appId){
            throw new Error("Modal messenger element need a valid appId from their parent application.")
        }
        return `<${this.tagName} app-id="${appId}"></${this.tagName}>`
    }

}

/**
 * Enum for message status
 * @typedef msgStatus
 * @property {string} SUCCESS
 * @property {string} DANGER
 * @property {string} INFO
 * @property {string} WARNING
 */

/**
 * @type {msgStatus}
 */
let MSGSTATUSTYPE;

/**
 * @type {msgStatus}
 */
const msgStatus = {
    "SUCCESS": "success",
    "DANGER": "danger",
    "INFO": "info",
    "WARNING": "warning"
}

class Messenger{

    /**
    * @type {Object<string, string>}
    * @property {string} SUCCESS
    * @property {string} DANGER
    * @property {string} INFO
    * @property {string} WARNING
    */
    msgStatus = {
        "SUCCESS": "success",
        "DANGER": "danger",
        "INFO": "info",
        "WARNING": "warning"
    }

    /**
     * @type {CDfModalMessenger}
     */
    modalMessenger;

    /**
     * 
     * @param {Object} configs
     * @param {string} configs.defaultStatus - default status for messages
     * @param {Number} configs.defaultTimeout - default timeout for messages
     * @param {App} configs.app - application instance
     */
    constructor({ defaultStatus, defaultTimeout, app }){
        if(!defaultStatus || !defaultTimeout || !app){
            throw new Error("Missing defaultStatus, defaultTimeout or app instance in Messenger constructor.")
        }
        this.app = app;
        this.defaultStatus = defaultStatus
        this.defaultTimeout = defaultTimeout;
        //defines custom message elements (row and modal)
        customElements.define(CDfMessenger.tagName, CDfMessenger);
        customElements.define(CDfModalMessenger.tagName, CDfModalMessenger);
        const appId = this.app.container.getAttribute("app-id")
        this.app.container.insertAdjacentHTML("beforebegin", CDfMessenger._generate(appId));
        this.app.container.insertAdjacentHTML("afterend", CDfModalMessenger._generate(appId));
        this.messenger = document.querySelector(CDfMessenger.tagName);
        this.messenger.app = app;
        this.modalMessenger = document.querySelector(CDfModalMessenger.tagName);
        this.modalMessenger.app = app;
    }

    /**
     * Sets message
     * @param {Object} configs
     * @param {string} configs.message - message to display
     * @param {string} [configs.status] - status of the message (bootstrap class) 
     * @param {Number} [configs.timeout] - timeout for message (seconds)
     */
    setMessage({ message, status, timeout }){
        if(!message){
            throw new Error("Missing message in setMessage.")
        }
        let useStatus = status;
        if(!useStatus){
            useStatus = this.defaultStatus;
        }
        let useTimeout = timeout;
        if(!useTimeout){
            useTimeout = this.defaultTimeout;
        }
        this.messenger._setMessage({
            message: message,
            status: useStatus,
            timeout: useTimeout
        });
        window.scrollTo(0,0);
    }

    /**
     * Creates confirm modal
     * @param {configs} configs
     * @param {string|undefined} [configs.title] - title of the modal
     * @param {string} configs.message - message of the modal
     * @param {string|undefined} [configs.closeTxt] - close btn text
     * @param {string|undefined} [configs.comfirmTxt] - confirm btn text
     * @param {string} [configs.modalSize] - size of the modal (bootstrap modal size classes)
     * @param {callbackFunction} configs.callbackFunction - callback function bound to the confirm button
     * @returns {bootstrap.Modal}
     */
    confirmModal = ({ title = "Confirm action", message, 
        closeTxt = "Close", confirmTxt = "Confirm", modalSize = "", callbackFunction }) => {
        if(!callbackFunction || !message){
            throw new Error("Missing callback function or message for confirm modal.");
        }
        return this.modalMessenger._createConfirmModal({ 
            title: title, 
            message: message, 
            closeTxt: closeTxt, 
            confirmTxt: confirmTxt,
            modalSize: modalSize,
            callbackFunction: callbackFunction 
        })
    }

    /**
     * Creates error modal
     * @param {Object} configs
     * @param {string|undefined} [configs.title] - title of the modal
     * @param {string} configs.message - message of the modal
     * @param {string} [configs.modalSize] - size of the modal (bootstrap modal size classes)
     * @param {string|undefined} [configs.closeTxt] - close btn text,
     * @param {CallableFunction|undefined} [configs.callbackFunction] - function that should be executed upon modal close (optional)
     * @returns {bootstrap.Modal}
     */
    errorModal = ({ title = "Title", message, modalSize = "", closeTxt = "Close", callbackFunction = () => {} }) => {
        if(!message){
            throw new Error("Missing error modal message");
        }
        return this.modalMessenger._createErrorModal({
            title: title,
            message: message,
            modalSize: modalSize,
            closeTxt: closeTxt,
            callbackFunction: callbackFunction
        })
    }

    /**
     * 
     * @param {Object} configs
     * @param {string} [configs.title] - optional title of modal
     * @param {string} configs.content - content of modal (HTML)
     * @param {string} [configs.closeTxt] - text for close btn
     * @param {string} [configs.confirmTxt] - text for confirm btn
     * @param {string} [configs.modalSize] - size of the modal (bootstrap modal size classes)
     * @param {CallableFunction} configs.callbackFunction - callback function of modal
     * @returns {bootstrap.Modal}
     */
    blankModal = ({title = "", content, closeTxt = "Close", confirmTxt = "Confirm",
        modalSize = "", callbackFunction}) => {
        if(!content){
            throw new Error("Missing content for blank modal");
        }
        return this.modalMessenger._createBlankModal({
            title,
            content,
            closeTxt,
            confirmTxt,
            modalSize: modalSize,
            callbackFunction
        });
    }

    /**
     * 
     * @param {Object} configs
     * @param {string} [configs.title] - optional title of modal
     * @param {string} configs.content - content of modal (HTML)
     * @param {string} [configs.closeTxt] - text for close btn
     * @param {string} [configs.modalSize] - size of the modal (bootstrap modal size classes)
     * @returns {bootstrap.Modal}
     */
    infoModal = ({title = "", content,
        closeTxt = "Close", modalSize = ""}) => {
        if(!content){
            throw new Error("Missing content for blank modal");
        }
        return this.modalMessenger._createInfoModal({
            title,
            content,
            closeTxt,
            modalSize,
        });
    }
}

export default Messenger;
export {
    msgStatus,
    MSGSTATUSTYPE
}