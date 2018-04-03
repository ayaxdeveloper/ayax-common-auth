import { guid } from "ayax-common-types";

export class AuthResponse {
    uid: guid;
    token: string;
    accessRules: string[];
    constructor(init?: Partial<AuthResponse>) {
        if(init) {
            Object.assign(this, init)
        }
    }
    
}