import { Guid } from "ayax-common-types";
import { IEntity } from "ayax-common-types";

export class AuthUser implements IEntity {
    id: number;
    uid: Guid;
    profilePictureUrl: string;
    name: string;
    patronymic: string;
    login: string;
    lastName: string;
    inactiveFlag: false;
    firstName: string;
    email: string;
    birthDate: Date;
    accessRulesNames: string[];
    constructor(init?: Partial<AuthUser>) {
        if (init) {
            Object.assign(this, init);
        }
    }
}