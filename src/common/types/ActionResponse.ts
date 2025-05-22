export type ActionResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      errors: {
        message: string;
      }[];
    };
