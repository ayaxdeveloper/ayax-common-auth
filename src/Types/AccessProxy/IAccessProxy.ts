import { ISecurityService } from "../../services/ISecurityService";
import { IAccessProxyCollection } from "./IAccessProxyCollection";
export interface IAccessProxy {
    writeable: IAccessProxyCollection;
    visible: IAccessProxyCollection;
    MapAccessProxy(securityService: ISecurityService);
} 