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

// Registration schema
export const registrationSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "First Name is required")
      .min(2, "First Name must be at least 2 characters")
      .max(20, "First Name must not exceed 20 characters"),
    lastName: z
      .string()
      .min(1, "Last Name is required")
      .max(20, "Last Name must not exceed 20 characters"),
    legalBusinessName: z
      .string()
      .min(1, "Legal Business Name is required")
      .min(2, "Legal Business Name must be at least 2 characters")
      .max(50, "Legal Business Name must not exceed 50 characters"),
    industry: z.string().min(1, "Industry is required"),
    zipCode: z
      .string()
      .min(1, "Zip Code is required")
      .regex(/^\d{5}$/, "Zip Code must be exactly 5 digits"),
    businessEmail: z
      .string()
      .min(1, "Business Email Address is required")
      .email("Enter a valid email address"),
    businessPhone: z
      .string()
      .min(1, "Business Phone is required")
      .refine(
        (value) => /^\d{10}$/.test(value.replace(/\D/g, "")),
        "Phone number must be exactly 10 digits",
      ),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character",
      ),
    confirmPassword: z.string().min(1, "Confirm password is required"),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and privacy policies",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Sign-in form validation schema
export const signInSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

// Type exports
export type RegistrationFormData = z.infer<typeof registrationSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
