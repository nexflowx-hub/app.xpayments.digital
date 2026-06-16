// ─────────────────────────────────────────────────────────────────────────────
// XPayments.Digital — Auth Validation Schemas (Zod v4)
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";

// ─── Merchant Registration ──────────────────────────────────────────────────

export const registerSchema = z.object({
  storeName: z
    .string()
    .min(2, "Store name must be at least 2 characters")
    .max(60, "Store name must be under 60 characters"),
  email: z.email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// ─── Merchant Login ─────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ─── Admin Login ────────────────────────────────────────────────────────────

export const adminLoginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  mfaCode: z
    .string()
    .length(6, "MFA code must be exactly 6 digits")
    .regex(/^\d{6}$/, "MFA code must contain only digits"),
});

export type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

// ─── API Response Types ─────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  storeName: string;
  role: "merchant" | "admin";
  tierLevel?: string;
  publicKey?: string;
}

export interface RegisterResponse {
  token: string;
  user: AuthUser;
  publicKey: string;
  secretKey: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface AdminLoginResponse {
  token: string;
  user: AuthUser;
}