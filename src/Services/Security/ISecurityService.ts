import { IAccessProxy } from "../../Types/AccessProxy/IAccessProxy";
import { AuthUser } from "../../Types/AuthUser";

export interface ISecurityService {
    UserHasAccessRule(accessRuleName: string): boolean;
    UserHasAnyAccessRule(accessRuleNames: string[]): boolean;
    UserHasAccessRuleStartsWith(accessRuleStarts: string): boolean;
    UserHasAnyAccessRuleStartsWith(accessRuleStarts: string[]): boolean;
    MapAccessProxy(accessProxyClass: IAccessProxy) : IAccessProxy;
    CurrentUser: AuthUser;
}