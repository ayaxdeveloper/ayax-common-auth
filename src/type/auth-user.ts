import { guid } from "ayax-common-types";
import { IEntity } from "ayax-common-types";

export class AuthUser implements IEntity {
    id: number;
    uid: guid;
    profilePictureUrl: string;
    name: string;
    patronymic: string;
    login: string;
    lastName: string;
    inactiveFlag: false;
    firstName: string;
    email: string;
    birthDate: Date;
    constructor(init?: Partial<AuthUser>) {
        if(init) {
            Object.assign(this, init)
        }
    }
}