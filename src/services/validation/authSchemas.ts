import { z } from "zod";

// Industry enum schema
export const industrySchema = z.enum([
  "Manufacturing",
  "Retail",
  "Healthcare",
  "Technology",
  "Finance",
  "Construction",
  "Education",
  "Hospitality",
  "Transportation",
  "Other",
]);

// Password validation schema
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[!@#$%^&*(),.?":{}|<>]/,
    "Password must contain at least one special character",
  );

// Email validation schema
const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email format");

// Phone number validation schema (10 digits)
const phoneNumberSchema = z
  .string()
  .min(1, "Phone number is required")
  .regex(/^\d{10}$/, "Phone number must be exactly 10 digits");

// Zip code validation schema (5 digits)
const zipCodeSchema = z
  .string()
  .min(1, "Zip code is required")
  .regex(/^\d{5}$/, "Zip code must be exactly 5 digits");

// Registration form validation schema
export const registrationSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .min(2, "First name must be at least 2 characters"),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .min(2, "Last name must be at least 2 characters"),
    businessName: z
      .string()
      .min(1, "Business name is required")
      .min(2, "Business name must be at least 2 characters"),
    email: emailSchema,
    phoneNumber: phoneNumberSchema,
    industry: industrySchema,
    zipCode: zipCodeSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Sign-in form validation schema
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean(),
});

// Business info form validation schema (for Google SSO users)
export const businessInfoSchema = z.object({
  businessName: z
    .string()
    .min(1, "Business name is required")
    .min(2, "Business name must be at least 2 characters"),
  phoneNumber: phoneNumberSchema,
  industry: industrySchema,
  zipCode: zipCodeSchema,
});

// Export types inferred from schemas
export type RegistrationFormData = z.infer<typeof registrationSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type BusinessInfoFormData = z.infer<typeof businessInfoSchema>;
