import { AuthSubdivision } from "../../Types/AuthSubdivision";
import { AuthUser } from "../../Types/AuthUser";
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
    CheckAuthentication(): Promise<boolean>;
}
