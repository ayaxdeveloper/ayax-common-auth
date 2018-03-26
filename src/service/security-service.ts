export class SecurityService implements ISecurityService {
    _accessRules: string[] = [];
    constructor(accessRulesLocalStorageName: string) {
        this._accessRules = this.GetAccessRules(accessRulesLocalStorageName);
    }

    private GetAccessRules(name: string): string[] {
        let rulesString = localStorage.getItem(name);
        return rulesString ? <string[]>JSON.parse(rulesString.toLocaleLowerCase()) : [];
    }

    public UserHasAccessRule(accessRuleName: string): boolean {
        return this._accessRules.indexOf(accessRuleName.toLocaleLowerCase()) != -1;
    }

    public UserHasAnyAccessRule(accessRuleNames: string[]): boolean {
        return accessRuleNames.some(rule => this._accessRules.indexOf(rule.toLocaleLowerCase()) != -1);
    }
}

export interface ISecurityService {
    UserHasAccessRule(accessRuleName: string): boolean;
    UserHasAnyAccessRule(accessRuleNames: string[]): boolean;
}