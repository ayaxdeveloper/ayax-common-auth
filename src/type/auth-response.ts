export class AuthResponse {
    uid: string;
    token: string;
    accessRules: string[];
    constructor(init?: Partial<AuthResponse>) {
        if(init) {
            Object.assign(this, init)
        }
    }
    
}