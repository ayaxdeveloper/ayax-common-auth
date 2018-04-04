export class TokenService implements ITokenService {
    private _localStorageTokenName: string;
    constructor(localStorageTokenName?: string) {
        this._localStorageTokenName = localStorageTokenName ? localStorageTokenName : "token";
    }
    private getTokenFromCookie(name: string, source: string): string | null {
        var matches = source.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
          ));
          let cookie = matches ? decodeURIComponent(matches[1]) : null;
        return cookie;
    }
    private getTokenFromLocalStorage(name: string): string | null {
        return localStorage.getItem(this._localStorageTokenName);
    }

    public getToken() : string | null {
        let cookie = this.getTokenFromCookie(this._localStorageTokenName, document.cookie);
        if(!cookie) {
            cookie = this.getTokenFromLocalStorage(this._localStorageTokenName);
        }
        return cookie
    }

    public setToken(token: string) {
        return localStorage.setItem(this._localStorageTokenName, token);
    }

    public clearToken() {
        localStorage.removeItem(this._localStorageTokenName);
    }
}

export interface ITokenService {
    getToken() : string | null;
    setToken(token: string);
    clearToken();
}