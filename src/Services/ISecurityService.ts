import { IAccessProxy } from "../Types/AccessProxy/IAccessProxy";

export interface ISecurityService {
    UserHasAccessRule(accessRuleName: string): boolean;
    UserHasAnyAccessRule(accessRuleNames: string[]): boolean;
    UserHasAnyAccessRuleStartsWith(accessRuleStarts: string[]): boolean;
    MapAccessProxy(accessProxyClass: IAccessProxy) : IAccessProxy;
}