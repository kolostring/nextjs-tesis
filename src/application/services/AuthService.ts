import { Result } from "@/common/types/Result";
import { User } from "@/domain/entities/User";
import { createDIToken } from "@/ioc/common/utils";

export interface AuthService {
  getUser(): Promise<Result<User>>;
  signup(email: string, password: string): Promise<Result<undefined>>;
  login(email: string, password: string): Promise<Result<undefined>>;
  logout(): Promise<Result<undefined>>;
}

export const AuthService = createDIToken<AuthService>("AuthService");
