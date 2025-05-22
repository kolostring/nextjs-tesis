export type DomainError = {
  code: string;
  field?: string;
  message: string;
};

type SuccessResult<T> = {
  ok: true;
  value: T;
};

type ErrorResult = {
  ok: false;
  errors: DomainError[];
};

export type Result<T> = SuccessResult<T> | ErrorResult;

export const Result = {
  ok: function <T>(value: T): SuccessResult<T> {
    return {
      ok: true,
      value: value,
    };
  },
  error: function (errors: DomainError[]): ErrorResult {
    return {
      ok: false,
      errors: errors,
    };
  },
};
