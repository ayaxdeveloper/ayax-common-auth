import { IHttpService, IOperationService, OperationResult, SearchResponse, guid } from "ayax-common-types";
import { OperationService } from "ayax-common-services";
import { AuthUser } from "../type/auth-user";
import { AuthSubdivision } from "../type/auth-subdivision";
import { AxiosPromise } from 'axios';
import axios from 'axios';
import { CacheHelper } from 'ayax-common-cache';
import { AuthResponse } from "../type/auth-response";

export class AuthService implements IAuthService {
    private _identityOperation: IOperationService;
    private _readerOperation: IOperationService;
    private _currentLocalStorageItem = 'currentUser';
    private _uidStorageItem = 'uid';
    private _tokenStorageItem = 'token';
    private _accessRules = 'accessRules';
    private _cacheExpiresAfter: number;
    private _authenticateUrl: string;
    
    constructor(identityOperation: IOperationService, readerOperation: IOperationService, cacheExpiresAfter?: number, authenticateUrl?: string) {
        this._identityOperation = identityOperation;
        this._readerOperation = readerOperation;
        this._cacheExpiresAfter = cacheExpiresAfter ? cacheExpiresAfter : 15;
        this._authenticateUrl = authenticateUrl ? authenticateUrl : '/authentication/Login';
    }

    async Login(login: string, password: string, modules?: string[]): Promise<boolean> {
        if(!login || !password) {
            console.error("Неверные параметры для авторизации");
            return false;
        }
        try {
            const operation = (await axios.post<OperationResult<AuthResponse>>(this._authenticateUrl, {login: login, password: password, modules: modules})).data;
            if(operation.status == 0) {
                const result = operation.result;
                localStorage.setItem(this._uidStorageItem, result.uid);
                localStorage.setItem(this._tokenStorageItem, result.token);
                localStorage.setItem(this._accessRules, JSON.stringify(result.accessRules));
                return true;
            } else {
                localStorage.removeItem(this._uidStorageItem);
                localStorage.removeItem(this._tokenStorageItem);
                localStorage.removeItem(this._accessRules);   
                return false;         
            }
        } catch (e) {
            console.error(`Ошибка авторизации ${JSON.stringify(e)}`);
            return false;
        }
    }

    async GetAuthenticatedUser(token: string | null): Promise<AuthUser> {
        if(!token || token == "") {
            console.error(`Неверный токен token=${token}`);
            throw Error(`Ошибка авторизации`);
        }
        let uid = localStorage.getItem(this._uidStorageItem);
        if(!uid) {
            let operation = (await this._identityOperation.post<AuthUser>(`/authentication/GetAuthenticatedUser`,{token: token})).data;
            if(operation.status == 0) {
                let user = operation.result;
                localStorage.setItem(this._currentLocalStorageItem, JSON.stringify(user));
                localStorage.setItem(this._uidStorageItem, JSON.stringify(user.uid));
                return user;
            } else {
                console.error(operation.message);
                throw Error(`Ошибка загрузки ${operation.message}`);
            }
        }
        let currentUserLocalStorageItem = localStorage.getItem(this._currentLocalStorageItem);
        if(currentUserLocalStorageItem) {
            return JSON.parse(currentUserLocalStorageItem);
        }
        else {
            let operation = (await this._readerOperation.get<AuthUser>(`/user/getuserbyuid/${uid}`)).data;
            if(operation.status == 0) {
                let user = operation.result;
                localStorage.setItem(this._currentLocalStorageItem, JSON.stringify(user))
                return user;
            } else {
                console.error(operation.message);
                throw Error(`Ошибка загрузки ${operation.message}`);
            }
        }
    }

    async GetUsers(subdivisionId?: number): Promise<AuthUser[]> {
        let request = subdivisionId ? {page: 1, perPage: 10000, subdivisionsIds: [subdivisionId], showChildren: true} : {page: 1, perpage: 10000};
        let fetchResponse = this._readerOperation.post<SearchResponse<AuthUser[]>>('/user/search', request);
        return (await CacheHelper.TryOperationSearchResponseFromCache<AuthUser>(fetchResponse, this._cacheExpiresAfter, "post", '/user/search', request));
    }

    async GetSubdivisions(isMain?: boolean): Promise<AuthSubdivision[]> {
        let request = {};
        if(isMain) {
            request['isMain'] = isMain;
        } else {
            request['isMain'] = true;
        }
        let fetchResponse = this._readerOperation.post<SearchResponse<AuthSubdivision[]>>('/subdivision/search', request);
        return (await CacheHelper.TryOperationSearchResponseFromCache<AuthSubdivision>(fetchResponse, this._cacheExpiresAfter, "post", '/subdivision/search', request));
    }
}

export interface IAuthService {
    Login(login: string, password: string, modules?: string[]): Promise<boolean>
    GetUsers(subdivisionId?: number): Promise<AuthUser[]>;
    GetSubdivisions(isMain?: boolean): Promise<AuthSubdivision[]>
    GetAuthenticatedUser(token: string | null): Promise<AuthUser>;
}