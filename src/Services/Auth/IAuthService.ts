import { Guid } from "ayax-common-types";
import { AuthGroup } from "../../Types/AuthGroup";
import { AuthSubdivision } from "../../Types/AuthSubdivision";
import { AuthUser } from "../../Types/AuthUser";
import { ISearchGroupRequest } from "../../Types/ISearchGroupRequest";
import { ISearchUserRequest } from "../../Types/ISearchUserRequest";
export interface IAuthService {
    Login(login: string, password: string, modules?: string[]): Promise<boolean>;
    GetUsers(subdivisionId?: number): Promise<AuthUser[]>;
    GetSubdivisions(isMain?: boolean): Promise<AuthSubdivision[]>;
    GetUserById(id: number): Promise<AuthUser>;
    GetUserByUid(uid: string): Promise<AuthUser>;
    GetCurrentUser(): Promise<AuthUser>;
    GetUsersForMyDivision(): Promise<AuthUser[]>;
    GetUsersForSubdivisionList(subdivisionIds: number[]): Promise<AuthUser[]>;
    SetTokenCookie(token: string);
    DeleteTokenCookie();
    CheckAuthentication(login?: string): Promise<boolean>;
    SearchUsers(request?: ISearchUserRequest): Promise<AuthUser[]>;
    GetGroup(guid: Guid): Promise<AuthGroup>;
    GetGroupUsers(): Promise<{[guid: string] : AuthUser[]}>;
    SearchGroups(request?: ISearchGroupRequest): Promise<AuthGroup[]>;
}
