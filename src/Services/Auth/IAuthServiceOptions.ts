import { IOperationService } from "ayax-common-operation";

export interface IAuthServiceOptions {
    identityOperation: IOperationService;
    readerOperation: IOperationService;
    token: string;
    cacheExpiresAfter?: number;
    authenticateUrl?: string;
    /** Домен токена */
    cookieDomain?: string;
    /** Время жизни токена */
    tokenExpiresInHours?: number;
    /** Имя куки для хранения токена */
    cookieTokenName?: string;
    modules?: string[];
}
