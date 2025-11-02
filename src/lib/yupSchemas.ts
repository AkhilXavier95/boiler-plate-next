// Shared Yup schemas for Formik validation
import * as yup from "yup";
import { validatePasswordStrength } from "./passwordValidation";

// Email schema with normalization
export const emailSchema = yup
  .string()
  .required("Email is required")
  .email("Invalid email address")
  .transform((value) => (value ? value.trim().toLowerCase() : value));

// Password schema with strength validation
export const passwordSchema = yup
  .string()
  .required("Password is required")
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be less than 128 characters")
  .test("password-strength", function (value) {
    if (!value) return true; // Required check is handled above
    
    const validation = validatePasswordStrength(value);
    if (!validation.isValid) {
      return this.createError({
        message: validation.errors[0] || "Password does not meet strength requirements"
      });
    }
    return true;
  });

// Registration schema
export const registerSchema = yup.object({
  name: yup
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords don't match")
});

// Login schema
export const loginSchema = yup.object({
  email: emailSchema,
  password: yup.string().required("Password is required")
});

// Forgot password schema
export const forgotPasswordSchema = yup.object({
  email: emailSchema
});

// Reset password schema (for form, token/email come from URL)
export const resetPasswordSchema = yup.object({
  password: passwordSchema,
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords don't match")
});

// Change password schema (when logged in)
export const changePasswordSchema = yup.object({
  currentPassword: yup.string().required("Current password is required"),
  newPassword: passwordSchema.test(
    "different-password",
    "New password must be different from current password",
    function (value) {
      return value !== this.parent.currentPassword;
    }
  ),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("newPassword")], "Passwords don't match")
});

// Update profile schema
export const updateProfileSchema = yup.object({
  name: yup
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .optional()
});

// Resend verification schema
export const resendVerificationSchema = yup.object({
  email: emailSchema
});

