import { CacheHelper } from "ayax-common-cache";
import { IOperationService } from "ayax-common-operation";
import { SearchResponse } from "ayax-common-types";
import { AuthResponse } from "../../Types/AuthResponse";
import { AuthSubdivision } from "../../Types/AuthSubdivision";
import { AuthUser } from "../../Types/AuthUser";
import { IAuthService } from "./IAuthService";
import { IAuthServiceOptions } from "./IAuthServiceOptions";

export class AuthService implements IAuthService {
    private _identityOperation: IOperationService;
    private _readerOperation: IOperationService;
    private _tokenStorageItem = "token";
    private _accessRules = "accessRules";
    private _modulesStorageItem = "modules";
    private _currentUserStorageItem = "currentUser";
    private _cacheExpiresAfter: number;
    private _authenticateUrl: string;
    private _currentUser: AuthUser;
    private _token: string;
    private _cookieDomain: string;
    private _tokenExpiresInHours: number;
    private _cookieTokenName: string;
    
    constructor(options: IAuthServiceOptions) {
        this._identityOperation = options.identityOperation;
        this._readerOperation = options.readerOperation;
        this._cacheExpiresAfter = options.cacheExpiresAfter ? options.cacheExpiresAfter : 15;
        this._authenticateUrl = options.authenticateUrl ? options.authenticateUrl : "/authentication/Login";
        this._token = options.token;
        this._cookieDomain = location.href.startsWith("http://localhost") ? "localhost" : options.cookieDomain ? options.cookieDomain : ".ayax.ru";
        this._tokenExpiresInHours = options.tokenExpiresInHours ? options.tokenExpiresInHours : 72;
        this._cookieTokenName = options.cookieTokenName ? options.cookieTokenName : "token";
    }

    get accessRules(): string[] {
        const fromStorage = localStorage.getItem(this._accessRules);
        if (fromStorage) {
            return <string[]> JSON.parse(fromStorage);
        } else {
            return null;
        }
    }

    set accessRules(value: string[]) {
        localStorage.setItem(this._accessRules, JSON.stringify(value));
    }

    get modules(): string[] {
        const fromStorage = localStorage.getItem(this._modulesStorageItem);
        if (fromStorage) {
            return <string[]> JSON.parse(fromStorage);
        } else {
            return null;
        }
    }

    set modules(value: string[]) {
        localStorage.setItem(this._modulesStorageItem, JSON.stringify(value));
    }

    get currentUser(): AuthUser {
        if (!this._currentUser) {
            const currentUserFromStorage = localStorage.getItem(this._currentUserStorageItem);
            this._currentUser = <AuthUser> JSON.parse(currentUserFromStorage);
        } 
        return this._currentUser;
    }

    set currentUser(value: AuthUser) {
        const currentUserFromStorage = localStorage.getItem(this._currentUserStorageItem);
        if (!currentUserFromStorage) {
            localStorage.setItem(this._currentUserStorageItem, JSON.stringify(value));
        }
        this._currentUser = value;
    }

    async GetCurrentUser(): Promise<AuthUser> {
        if (this.currentUser) {
            return this.currentUser;
        }
        try {
            const currentUserFromLocalStorage = localStorage.getItem(this._currentUserStorageItem);
            if (currentUserFromLocalStorage) {

                const value = JSON.parse(currentUserFromLocalStorage);
                this.currentUser = value;
                return value; 
            }
    
            const currentUser = await this.GetAuthenticatedUser();
            this.currentUser = currentUser;
            return currentUser;

        } catch (e) {
            localStorage.clear();
            throw new Error(e);
        }
    }

    async Login(login: string, password: string, modules?: string[]): Promise<boolean> {
        if (!login || !password) {
            console.error("Неверные параметры для авторизации");
            return false;
        }
        if (modules) {
            this.modules = modules;
        }

        console.log(modules);

        const request = {
            login, 
            password
        };

        if (modules) {
            request["modules"] = modules;
        }

        try {
            const operation = await this._identityOperation.post<AuthResponse>(this._authenticateUrl, request).then(x => x.ensureSuccess());
            const result = operation;
            this._token = result.token;
            localStorage.setItem(this._tokenStorageItem, result.token);
            localStorage.setItem(this._accessRules, JSON.stringify(result.accessRules));
            localStorage.setItem(this._modulesStorageItem, JSON.stringify(modules));
            this.SetTokenCookie(result.token);
            await this.GetCurrentUser();
            return true;
        } catch (e) {
            localStorage.clear();
            this.DeleteTokenCookie();
            console.error(`Ошибка авторизации ${JSON.stringify(e)}`);
            return false;
        }
    }

    private async GetAuthenticatedUser(modules?: string[]): Promise<AuthUser> {
        if (!this._token || this._token === "") {
            console.error(`Неверный токен token=${this._token}`);
            throw Error(`Ошибка авторизации`);
        }
    
        const request = { token: this._token};
        if (modules) {
            request["modules"] = modules;
            this.modules = modules;
        }
        try {
            const user = await this._identityOperation.post<AuthUser>(`/authentication/GetAuthenticatedUser`, request).then(x => x.ensureSuccess());
            this.currentUser = user;
            if (user.accessRulesNames.length > 0 && !this.accessRules) {
                this.accessRules = user.accessRulesNames;
                location.reload();
            }
            return user;
        } catch (e) {
            console.error(e);
            throw Error(e);
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
        const fetchResponse = () => this._readerOperation.post<SearchResponse<AuthUser[]>>("/user/search", request);
        return (await CacheHelper.TryOperationSearchResponseFromCache<AuthUser>(fetchResponse, this._cacheExpiresAfter, "post", "/user/search", request));
    }

    async GetSubdivisions(isMain?: boolean): Promise<AuthSubdivision[]> {
        const request = {};
        if (isMain) {
            request["isMain"] = isMain;
        } else {
            request["isMain"] = true;
        }
        const fetchResponse = () => this._readerOperation.post<SearchResponse<AuthSubdivision[]>>("/subdivision/search", request);
        return (await CacheHelper.TryOperationSearchResponseFromCache<AuthSubdivision>(fetchResponse, this._cacheExpiresAfter, "post", "/subdivision/search", request));
    }

    private SetTokenCookie(token: string) {
        let expires = "";
        const date = new Date();
        date.setTime(date.getTime() + (this._tokenExpiresInHours * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
        document.cookie = `${this._cookieTokenName}=${token}${expires};path=/;domain=${this._cookieDomain};`;
    }

    private DeleteTokenCookie() {
        document.cookie = `${this._cookieTokenName}=; Max-Age=-99999999;`;
    }
}