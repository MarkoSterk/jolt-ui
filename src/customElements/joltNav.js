class JoltNav extends HTMLElement{
    static tagName = "jolt-nav";
    static navEventName = "jolt-navigation";
    
    constructor(){
        super();
    }

    connectedCallback(){
        const links = [...this.querySelectorAll("a")];
        for(const link of links){
            if(link.getAttribute("target") != "_blank" && !link.href.includes("mailto:")
                && link.getAttribute("disabled") !== "true"){
                link.addEventListener("click", (event) => {
                    event.preventDefault();
                    this.emitNavigationEvent(link);
                });
            }
        }
    }

    emitNavigationEvent = (navLink) => {
        const navEvent = new CustomEvent(JoltNav.navEventName, {
            bubbles: true,
            detail: {navLink}
        });
        this.dispatchEvent(navEvent);
    }
}

export default JoltNav

