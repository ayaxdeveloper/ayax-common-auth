import { CONFIGURATION } from "../Configuration/Configuration";
import { AuthUser } from "../Types/AuthUser";
import { IAccessProxy } from "./../Types/AccessProxy/IAccessProxy";
import { ISecurityService } from "./ISecurityService";

export class SecurityService implements ISecurityService {
    
    private _accessRules: string[] = [];
    private _accessRulesLocalStorageName: string;
    private _currentUserStorageItem = "currentUser";
    private _currentUser: AuthUser;

    constructor(accessRulesLocalStorageName?: string) {
        this._accessRulesLocalStorageName = accessRulesLocalStorageName ? accessRulesLocalStorageName : "accessRules";
        this._accessRules = this.GetAccessRules(this._accessRulesLocalStorageName);
    }

    get CurrentUser(): AuthUser {
        if (!this._currentUser) {
            const currentUserFromStorage = localStorage.getItem(this._currentUserStorageItem);
            this._currentUser = <AuthUser> JSON.parse(currentUserFromStorage);
        } 
        return this._currentUser;
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
        return accessProxyClass;
    }
}

