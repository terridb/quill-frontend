import type { AuthError } from "@supabase/supabase-js";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "Email or password is incorrect.",
  user_already_exists: "An account with this email already exists.",
  email_exists: "An account with this email already exists.",
  weak_password: "Password must be at least 6 characters.",
  over_email_send_rate_limit:
    "Too many attempts. Wait a moment and try again.",
  over_request_rate_limit: "Too many attempts. Wait a moment and try again.",
};

export function mapAuthError(error: AuthError | Error | null): string {
  if (!error) {
    return "Something went wrong. Try again.";
  }

  if ("code" in error && error.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }

  const message = error.message.toLowerCase();

  if (message.includes("invalid login credentials")) {
    return "Email or password is incorrect.";
  }

  if (
    message.includes("user already registered") ||
    message.includes("already been registered")
  ) {
    return "An account with this email already exists.";
  }

  if (message.includes("password")) {
    return error.message;
  }

  return "Something went wrong. Try again.";
}
