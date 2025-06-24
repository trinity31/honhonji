import type { Translation } from "./types";

const en: Translation = {
  home: {
    title: "HonHonji",
    midtitle: "Discover",
    subtitle: "Eat & Walk alone",
  },
  navigation: {
    en: "English",
    kr: "Korean",
    es: "Spanish",
  },
  login: {
    title: "Login",
    description: "Sign in to your account",
    form: {
      email: "Email",
      emailPlaceholder: "Enter your email",
      password: "Password",
      passwordPlaceholder: "Enter your password",
      forgotPassword: "Forgot password?",
      submit: "Sign In",
    },
    noAccount: "Don't have an account?",
    signUp: "Sign up",
    continueWith: "Continue with",
  },
  join: {
    title: "Join",
    description: "Create your account",
    name: "Name",
    email: "Email",
    password: "Password",
    passwordConfirm: "Confirm Password",
    submit: "Create Account",
    loginLink: "Sign in",
    errors: {
      required: "This field is required",
      invalidEmail: "Please enter a valid email",
      passwordShort: "Password must be at least 8 characters",
      passwordMismatch: "Passwords must match",
      alreadyExists: "Account already exists",
      unknown: "An error occurred",
    },
    success: "Account created successfully",
    namePlaceholder: "Enter your name",
    emailPlaceholder: "Enter your email",
    marketing: "I agree to receive marketing emails",
    termsPrefix: "By signing up, you agree to our",
    termsOfService: "Terms of Service",
    and: "and",
    privacyPolicy: "Privacy Policy",
    successDescription: "Welcome to HonHonji!",
    loginLinkPrefix: "Already have an account?",
  },
};

export default en;