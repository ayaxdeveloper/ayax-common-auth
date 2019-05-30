import { Guid } from "ayax-common-types";

export interface ISearchGroupRequest {
  page?: number;
  perPage?: number;
  name?: string;
  guids?: Guid[];
}