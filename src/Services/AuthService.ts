import axios from "axios";
import { CacheHelper } from "ayax-common-cache";
import { IOperationService, OperationResult } from "ayax-common-operation";
import { SearchResponse } from "ayax-common-types";
import { AuthResponse } from "../Types/AuthResponse";
import { AuthSubdivision } from "../Types/AuthSubdivision";
import { AuthUser } from "../Types/AuthUser";

export class AuthService implements IAuthService {
    private _identityOperation: IOperationService;
    private _readerOperation: IOperationService;
    private _uidStorageItem = "uid";
    private _tokenStorageItem = "token";
    private _accessRules = "accessRules";
    private _cacheExpiresAfter: number;
    private _authenticateUrl: string;
    private _currentUser: AuthUser;
    private _token: string;
    
    constructor(identityOperation: IOperationService, readerOperation: IOperationService, token: string, cacheExpiresAfter?: number, authenticateUrl?: string) {
        this._identityOperation = identityOperation;
        this._readerOperation = readerOperation;
        this._cacheExpiresAfter = cacheExpiresAfter ? cacheExpiresAfter : 15;
        this._authenticateUrl = authenticateUrl ? authenticateUrl : "/authentication/Login";
        this._token = token;
    }

    async Login(login: string, password: string, modules?: string[]): Promise<boolean> {
        if (!login || !password) {
            console.error("Неверные параметры для авторизации");
            return false;
        }
        try {
            const operation = (await axios.post<OperationResult<AuthResponse>>(this._authenticateUrl, {login, password, modules})).data;
            if (operation.status === 0) {
                const result = operation.result;
                localStorage.setItem(this._uidStorageItem, result.uid);
                localStorage.setItem(this._tokenStorageItem, result.token);
                this._token = result.token;
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

    async GetAuthenticatedUser(modules: string[]): Promise<AuthUser> {
        if (!this._token || this._token === "") {
            console.error(`Неверный токен token=${this._token}`);
            throw Error(`Ошибка авторизации`);
        }
        const uid = localStorage.getItem(this._uidStorageItem);
        if (!uid) {
            const request = { token: this._token};
            if (modules) {
                request["modules"] = modules;
            }
            const operation = (await this._identityOperation.post<AuthUser>(`/authentication/GetAuthenticatedUser`, request));
            if (operation.status === 0) {
                const user = operation.result;
                this._currentUser = user;
                localStorage.setItem(this._uidStorageItem, JSON.stringify(user.uid).replace(/"/g, ""));
                localStorage.setItem(this._tokenStorageItem, this._token);
                localStorage.setItem(this._accessRules, JSON.stringify(user.accessRulesNames));
                location.reload();
                return user;
            } else {
                console.error(operation.message);
                throw Error(`Ошибка загрузки ${operation.message}`);
            }
        }
        if (this._currentUser) {
            return this._currentUser;
        }
        else {
            const operation = (await this._readerOperation.get<AuthUser>(`/user/getuserbyuid/${uid}`));
            if (operation.status === 0) {
                const user = operation.result;
                this._currentUser = user;
                return user;
            } else {
                console.error(operation.message);
                throw Error(`Ошибка загрузки ${operation.message}`);
            }
        }
    }

    async GetUserByUid(uid: string): Promise<AuthUser> {
        const operation = (await this._readerOperation.get<AuthUser>(`/user/getuserbyuid/${uid}`));
        if (operation.status === 0) {
            const user = operation.result;
            return user;
        } else {
            console.error(operation.message);
            throw Error(`Ошибка загрузки ${operation.message}`);
        }
    }

    async GetUsers(subdivisionId?: number): Promise<AuthUser[]> {
        const request = subdivisionId ? {page: 1, perPage: 10000, subdivisionsIds: [subdivisionId], showChildren: true} : {page: 1, perpage: 10000};
        const fetchResponse = this._readerOperation.post<SearchResponse<AuthUser[]>>("/user/search", request);
        return (await CacheHelper.TryOperationSearchResponseFromCache<AuthUser>(fetchResponse, this._cacheExpiresAfter, "post", "/user/search", request));
    }

    async GetSubdivisions(isMain?: boolean): Promise<AuthSubdivision[]> {
        const request = {};
        if (isMain) {
            request["isMain"] = isMain;
        } else {
            request["isMain"] = true;
        }
        const fetchResponse = this._readerOperation.post<SearchResponse<AuthSubdivision[]>>("/subdivision/search", request);
        return (await CacheHelper.TryOperationSearchResponseFromCache<AuthSubdivision>(fetchResponse, this._cacheExpiresAfter, "post", "/subdivision/search", request));
    }
}

export interface IAuthService {
    Login(login: string, password: string, modules?: string[]): Promise<boolean>;
    GetUsers(subdivisionId?: number): Promise<AuthUser[]>;
    GetSubdivisions(isMain?: boolean): Promise<AuthSubdivision[]>;
    GetAuthenticatedUser(modules: string[]): Promise<AuthUser>;
    GetUserByUid(uid: string): Promise<AuthUser>;
}