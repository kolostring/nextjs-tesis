import { Result } from "@/common/types/Result";
import { Tutor } from "@/domain/entities/Tutor";
import { createDIToken } from "@/ioc/common/utils";

export interface TutorAuthService {
  getTutor(): Promise<Result<Tutor>>;
  signup(email: string, password: string): Promise<Result<undefined>>;
  login(email: string, password: string): Promise<Result<undefined>>;
  logout(): Promise<Result<undefined>>;
}

export const TutorAuthService =
  createDIToken<TutorAuthService>("TutorAuthService");
