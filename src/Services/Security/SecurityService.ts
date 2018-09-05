import { CONFIGURATION } from "../../Configuration/Configuration";
import { IAccessProxy } from "../../Types/AccessProxy/IAccessProxy";
import { AuthUser } from "../../Types/AuthUser";
import { ISecurityService } from "./ISecurityService";
import { ISecurityServiceOptions } from "./ISecurityServiceOptions";

export class SecurityService implements ISecurityService {
    
    private _accessRules: string[] = [];
    private _accessRulesLocalStorageName: string;
    private _currentUserStorageItem: string;

    constructor(options?: ISecurityServiceOptions) {
        this._accessRulesLocalStorageName = options && options.accessRulesLocalStorageName ? options.accessRulesLocalStorageName : "accessRules";
        this._accessRules = this.GetAccessRules(this._accessRulesLocalStorageName);
        this._currentUserStorageItem = options && options.currentUserStorageItem ? options.currentUserStorageItem : "currentUser";
    }

    get CurrentUser() : AuthUser {
        const currentUserFromLocalStorage = localStorage.getItem(this._currentUserStorageItem);
        if (currentUserFromLocalStorage) {

            const value = JSON.parse(currentUserFromLocalStorage);
            return value; 
        }
        return null;
    }

    GetAccessRules(name: string): string[] {
        const rulesString = localStorage.getItem(name);
        return rulesString ? <string[]> JSON.parse(rulesString.toLocaleLowerCase()) : [];
    }

    public UserHasAccessRule(accessRuleName: string): boolean {
        return this._accessRules.indexOf(accessRuleName.toLocaleLowerCase()) !== -1;
    }

    public UserHasAccessRuleStartsWith(accessRuleStarts: string): boolean {
        const query = new RegExp(`\^${accessRuleStarts}`, "i");
        return this._accessRules.some(accessRule => query.test(accessRule));
    }

    public UserHasAnyAccessRuleStartsWith(accessRuleStarts: string[]): boolean {
        return accessRuleStarts.some(start => this.UserHasAccessRuleStartsWith(start));
    }

    public UserHasAnyAccessRule(accessRuleNames: string[]): boolean {
        return accessRuleNames.some(rule => this._accessRules.indexOf(rule.toLocaleLowerCase()) !== -1);
    }
    public MapAccessProxy(accessProxyClass: IAccessProxy) : IAccessProxy {
        if (accessProxyClass[CONFIGURATION.AccessProxyVisibleRulesName]) {
            for (const key in accessProxyClass[CONFIGURATION.AccessProxyVisibleRulesName]) {
                if (accessProxyClass[CONFIGURATION.AccessProxyVisibleRulesName][key]) {
                    const rules = accessProxyClass[CONFIGURATION.AccessProxyVisibleRulesName][key];
                    accessProxyClass.visible[key] = Array.isArray(rules) ? this.UserHasAnyAccessRule(rules) : this.UserHasAccessRule(rules);
                }
            }
        }
        if (accessProxyClass[CONFIGURATION.AccessProxyWritableRulesName]) {
            for (const key in accessProxyClass[CONFIGURATION.AccessProxyWritableRulesName]) {
                if (accessProxyClass[CONFIGURATION.AccessProxyWritableRulesName][key]) {
                    const rules = accessProxyClass[CONFIGURATION.AccessProxyWritableRulesName][key];
                    if (!accessProxyClass.writable[key]) {
                        accessProxyClass.writable[key] = Array.isArray(rules) ? this.UserHasAnyAccessRule(rules) : this.UserHasAccessRule(rules);
                    }
                }
            }
        }
        return accessProxyClass;
    }
}

