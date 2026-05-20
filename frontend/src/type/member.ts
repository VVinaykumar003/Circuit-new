import type { UserRole } from "./attendance";

export type Member={
  id: string;
  name: string;
  email: string;
  role:UserRole;
dateOfBirth?: string | Date;
designation?:string;
  imgUrl?: string;
  status?: "active" | "inactive";
  joinedAt?: string;
  phone?: string;
  gender?: string;
  address?:string;
}