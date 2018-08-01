import { ISecurityService } from "../../services/ISecurityService";
import { IAccessProxyCollection } from "./IAccessProxyCollection";
export interface IAccessProxy {
    writable: IAccessProxyCollection;
    visible: IAccessProxyCollection;
    MapAccessProxy(securityService: ISecurityService);
} 