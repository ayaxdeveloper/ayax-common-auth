import { Guid } from "ayax-common-types";
import { AuthUser } from "./AuthUser";

export class AuthGroup {
  activeDirectoryId: string;
  guid: Guid;
  id: number;
  name: string;
  users: AuthUser[];
}