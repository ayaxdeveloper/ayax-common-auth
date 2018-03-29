import { IHttpService, IOperationService, OperationResult, SearchResponse } from "ayax-common-types";
import { OperationService } from "ayax-common-services";
import { AuthUser } from "../type/auth-user";
import { AuthSubdivision } from "../type/auth-subdivision";
import { AxiosPromise } from 'axios';
import { CacheHelper } from 'ayax-common-cache';

export class AuthService implements IAuthService {
    private _identityOperation: IOperationService;
    private _readerOperation: IOperationService;
    private _currentLocalStorageItem = 'currentUser';
    private _cacheExpiresAfter: number;
    
    constructor(identityOperation: IOperationService, readerOperation: IOperationService, cacheExpiresAfter?: number) {
        this._identityOperation = identityOperation;
        this._readerOperation = readerOperation;
        this._cacheExpiresAfter = cacheExpiresAfter ? cacheExpiresAfter : 15;
    }

    async GetAuthenticatedUser(token: string): Promise<AuthUser> {
        let uid = localStorage.getItem("uid");
        if(!uid) {
            let operation = (await this._identityOperation.post<AuthUser>(`/authentication/GetAuthenticatedUser`,{token: token})).data;
            if(operation.status == 0) {
                let user = operation.result;
                localStorage.setItem(this._currentLocalStorageItem, JSON.stringify(user));
                localStorage.setItem("uid", JSON.stringify(user.uid));
                return user;
            } else {
                console.warn(operation.message);
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
                console.warn(operation.message);
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
    GetUsers(subdivisionId?: number): Promise<AuthUser[]>;
    GetSubdivisions(isMain?: boolean): Promise<AuthSubdivision[]>
    GetAuthenticatedUser(token: string): Promise<AuthUser>;
}