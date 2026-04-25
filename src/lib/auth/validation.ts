import type {
  UserRole,
} from "@/lib/db/schema";

const userRoles = new Set<UserRole>(["instructor", "student"]);


export function isUserRole(value: string): value is UserRole {
  return userRoles.has(value as UserRole);
}

export function assertNonEmptyString(
  value: unknown,
  fieldName: string,
  minLength = 1,
) {
  if (typeof value !== "string" || value.trim().length < minLength) {
    throw new Error(`${fieldName} is required`);
  }

  return value.trim();
}

export function assertEmail(value: unknown) {
  const email = assertNonEmptyString(value, "Email");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    throw new Error("Email must be valid");
  }

  return email.toLowerCase();
}

export function assertPassword(value: unknown) {
  const password = assertNonEmptyString(value, "Password", 8);

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  return password;
}

export function assertUrl(value: unknown, fieldName = "URL") {
  const url = assertNonEmptyString(value, fieldName);

  try {
    const parsed = new URL(url);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("invalid protocol");
    }

    return parsed.toString();
  } catch {
    throw new Error(`${fieldName} must be a valid http or https URL`);
  }
}
