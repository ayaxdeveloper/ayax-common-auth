import { IAccessProxy } from "./IAccessProxy";
import { IAccessProxyCollection } from "./IAccessProxyCollection";

export abstract class AccessProxyBase implements IAccessProxy {
    writable: IAccessProxyCollection = {};    
    visible: IAccessProxyCollection = {};
} 