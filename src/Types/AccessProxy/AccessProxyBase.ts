import { CONFIGURATION } from "../../Configuration/Configuration";
import { ISecurityService } from "../../services/ISecurityService";
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

    public MapAccessProxy(securityService: ISecurityService) {
        if (this[CONFIGURATION.AccessProxyVisibleRulesName]) {
            for (const key in this[CONFIGURATION.AccessProxyVisibleRulesName]) {
                if (this[CONFIGURATION.AccessProxyVisibleRulesName][key]) {
                    const rules = this[CONFIGURATION.AccessProxyVisibleRulesName][key];
                    this.visible[key] = Array.isArray(rules) ? securityService.UserHasAnyAccessRule(rules) : securityService.UserHasAccessRule(rules);
                }
            }
        }
        return this;
    }
}