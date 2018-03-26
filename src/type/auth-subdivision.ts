import { IEntity } from "ayax-common-types";

export class AuthSubdivision implements IEntity {
    id: number;
    name: string;
    parentId: number;
    address: string;
    isMain: boolean;
    constructor(init?: Partial<AuthSubdivision>) {
        if(init) {
            Object.assign(this, init)
        }
    }
}