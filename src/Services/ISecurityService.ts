import { IAccessProxy } from "../Types/AccessProxy/IAccessProxy";

export interface ISecurityService {
    UserHasAccessRule(accessRuleName: string): boolean;
    UserHasAnyAccessRule(accessRuleNames: string[]): boolean;
    MapAccessProxy(accessProxyClass: IAccessProxy);
}