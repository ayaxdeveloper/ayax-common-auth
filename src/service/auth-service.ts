import { IHttpService, IOperationService, OperationResult, SearchResponse } from "ayax-common-types";
import { OperationService } from "ayax-common-services";
import { AuthUser } from "../type/auth-user";
import { AuthSubdivision } from "../type/auth-subdivision";
import { AxiosPromise } from 'axios';

export class AuthService implements IAuthService {
    private _identityOperation: IOperationService;
    private _readerOperation: IOperationService;
    private _currentLocalStorageItem = 'currentUser';
    
    constructor(identityOperation: IOperationService, readerOperation: IOperationService) {
        this._identityOperation = identityOperation;
        this._readerOperation = readerOperation;
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

    GetUsers(subdivisionId?: number): AxiosPromise<OperationResult<SearchResponse<AuthUser[]>>> {
        let request = subdivisionId ? {page: 1, perPage: 10000, subdivisionsIds: [subdivisionId]} : {page: 1, perpage: 10000};
        return this._readerOperation.post<SearchResponse<AuthUser[]>>('/user/search', request);
    }

    GetSubdivisions(isMain?: boolean): AxiosPromise<OperationResult<SearchResponse<AuthSubdivision[]>>> {
        let params = {};
        if(isMain) {
            params['isMain'] = isMain;
        } else {
            params['isMain'] = true;
        }
        return this._readerOperation.post<SearchResponse<AuthSubdivision[]>>('/subdivision/search', params);
    }
}

export interface IAuthService {
    GetUsers(subdivisionId?: number) : AxiosPromise<OperationResult<SearchResponse<AuthUser[]>>>;
    GetSubdivisions(isMain?: boolean) : AxiosPromise<OperationResult<SearchResponse<AuthSubdivision[]>>>;
    GetAuthenticatedUser(token: string): Promise<AuthUser>;
}