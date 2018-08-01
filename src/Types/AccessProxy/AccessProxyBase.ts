import { ISecurityService } from "../../services/ISecurityService";
import { IAccessProxy } from "./IAccessProxy";
import { IAccessProxyCollection } from "./IAccessProxyCollection";

export abstract class AccessProxyBase implements IAccessProxy {
    writeable: IAccessProxyCollection = {};    
    visible: IAccessProxyCollection = {};
    constructor() {
        this["__visibleRules__"] = {};
        Object.keys(this).forEach(key => {
            this.visible[key] = true;
        });
    }

    public MapAccessProxy(securityService: ISecurityService) {
        securityService.MapAccessProxy(this);
        return this;
    }
}