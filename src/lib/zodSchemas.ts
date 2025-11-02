// Shared Zod schemas for validation
import { z } from "zod";
import { validatePasswordStrength } from "./passwordValidation";

// Email schema with normalization
export const emailSchema = z
  .string()
  .email("Invalid email address")
  .transform((email) => email.trim().toLowerCase());

// Password schema with strength validation
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be less than 128 characters")
  .superRefine((password, ctx) => {
    const validation = validatePasswordStrength(password);
    if (!validation.isValid) {
      validation.errors.forEach((error) => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: error
        });
      });
    }
  });

// Registration schema
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100)
    .optional(),
  email: emailSchema,
  password: passwordSchema
});

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required")
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema
});

// Reset password schema
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  email: emailSchema,
  password: passwordSchema
});

// Change password schema (when logged in)
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"]
  });

// Update profile schema
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100)
    .optional()
});

// Resend verification schema
export const resendVerificationSchema = z.object({
  email: emailSchema
});
