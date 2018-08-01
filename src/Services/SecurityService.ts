import { IAccessProxy } from "./../Types/AccessProxy/IAccessProxy";
import { ISecurityService } from "./ISecurityService";

export class SecurityService implements ISecurityService {
    private _accessRules: string[] = [];
    private _accessRulesLocalStorageName: string;
    constructor(accessRulesLocalStorageName?: string) {
        this._accessRulesLocalStorageName = accessRulesLocalStorageName ? accessRulesLocalStorageName : "accessRules";
        this._accessRules = this.GetAccessRules(this._accessRulesLocalStorageName);
    }

    private GetAccessRules(name: string): string[] {
        const rulesString = localStorage.getItem(name);
        return rulesString ? <string[]> JSON.parse(rulesString.toLocaleLowerCase()) : [];
    }

    public UserHasAccessRule(accessRuleName: string): boolean {
        return this._accessRules.indexOf(accessRuleName.toLocaleLowerCase()) !== -1;
    }

    public UserHasAnyAccessRule(accessRuleNames: string[]): boolean {
        return accessRuleNames.some(rule => this._accessRules.indexOf(rule.toLocaleLowerCase()) !== -1);
    }
}

