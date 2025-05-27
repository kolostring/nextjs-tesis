import { TutorAuthService } from "@/application/services/AuthService";
import { Result } from "@/common/types/Result";
import { SupabaseClient } from "@supabase/supabase-js";

export default function SupabaseAuthService(
  supabase: SupabaseClient,
): TutorAuthService {
  return {
    async getTutor() {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error) {
          return Result.error([
            {
              code: "SUPABASE_ERROR",
              message: error.message,
            },
          ]);
        }

        return Result.ok({
          email: data.user.email ?? "NOT_FOUND",
          id: data.user.id,
        });
      } catch (error) {
        return Result.error([
          {
            code: "UNEXPECTED_ERROR",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        ]);
      }
    },
    async signup(email, password) {
      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          return Result.error([
            {
              code: "SUPABASE_ERROR",
              message: error.message,
            },
          ]);
        }

        return Result.ok(undefined);
      } catch (error) {
        return Result.error([
          {
            code: "UNEXPECTED_ERROR",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        ]);
      }
    },

    async login(email, password) {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          return Result.error([
            {
              code: "SUPABASE_ERROR",
              message: error.message,
            },
          ]);
        }

        return Result.ok(undefined);
      } catch (error) {
        return Result.error([
          {
            code: "UNEXPECTED_ERROR",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        ]);
      }
    },

    async logout() {
      try {
        const { error } = await supabase.auth.signOut();

        if (error) {
          return Result.error([
            {
              code: "SUPABASE_ERROR",
              message: error.message,
            },
          ]);
        }

        return Result.ok(undefined);
      } catch (error) {
        return Result.error([
          {
            code: "UNEXPECTED_ERROR",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        ]);
      }
    },
  };
}
