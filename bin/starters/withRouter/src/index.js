import { Router } from "jolt-ui";
import app from "./app/init.js";

import unknown from "./app/components/unknown/unknown.js";

async function init(){
    const router = new Router(app, {
        routerType: "url"
    });
    router.unknownViewComponent(unknown);
    await router.start();
}

await init();
