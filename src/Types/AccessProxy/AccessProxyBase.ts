import { CONFIGURATION } from "../../Configuration/Configuration";
import { IAccessProxy } from "./IAccessProxy";
import { IAccessProxyCollection } from "./IAccessProxyCollection";

export abstract class AccessProxyBase implements IAccessProxy {
    writable: IAccessProxyCollection = {};    
    visible: IAccessProxyCollection = {};
    constructor() {
        Object.keys(this).forEach(key => {
            this.visible[key] = CONFIGURATION.VisibleBehaviorIfNoAccessRules;
        });
    }
}