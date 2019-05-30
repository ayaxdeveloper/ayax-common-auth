import { Guid } from "ayax-common-types";

export interface ISearchUserRequest {
  isActive?: boolean;
  isSelectAll?: boolean;
  name?: string;
  showChildren?: boolean;
  subdivisionsIds?: number[];
  groupGuids?: Guid[];
  notInGroupGuids?: Guid[];
  page?: number;
  perPage?: number;
}