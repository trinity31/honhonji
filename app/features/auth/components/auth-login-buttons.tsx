/**
 * Authentication Login Buttons Module
 *
 * This module provides reusable components for rendering various authentication options
 * in a consistent and styled manner. It supports multiple authentication methods including:
 * - Social logins (Google, GitHub, Apple, Kakao)
 * - Passwordless options (OTP, Magic Link)
 *
 * The components are designed to be used in both sign-in and sign-up flows, with
 * appropriate visual separation and consistent styling. Each button includes the
 * provider's logo and descriptive text to enhance usability.
 *
 * This modular approach allows for easy addition or removal of authentication methods
 * without modifying the main authentication screens.
 */
import { Link } from "react-router";

import { Button } from "~/core/components/ui/button";

import { AppleLogo } from "./logos/apple";
import { GoogleLogo } from "./logos/google";
import { KakaoLogo } from "./logos/kakao";

/**
 * Generic authentication button component
 * 
 * This component renders a consistent button for any authentication provider.
 * It includes the provider's logo and a standardized "Continue with [Provider]" text.
 * The button uses the outline variant for a clean look and links to the appropriate
 * authentication flow.
 * 
 * @param logo - React node representing the provider's logo
 * @param label - Provider name (e.g., "Google", "Apple")
 * @param href - URL path to the authentication flow for this provider
 */
import { useTranslation } from "react-i18next";

function AuthLoginButton({
  logo,
  label,
  href,
}: {
  logo: React.ReactNode;
  label: string;
  href: string;
}) {
  const { t } = useTranslation();
  return (
    <Button
      variant="outline"
      className="inline-flex items-center justify-center gap-2 hover:bg-primary/30 hover:border-primary/40 dark:hover:bg-primary/20 dark:hover:text-white transition-colors"
      asChild
    >
      <Link to={href}>
        <span>{logo}</span>
        <span>{t("login.continueWith", { provider: label })}</span>
      </Link>
    </Button>
  );
}

/**
 * Visual divider with "OR" text
 * 
 * This component creates a horizontal divider with the text "OR" centered between
 * two lines. It's used to visually separate different authentication method groups
 * (e.g., social logins from passwordless options).
 */
function Divider() {
  return (
    <div className="flex items-center gap-4">
      <span className="bg-input h-px w-full"></span>
      <span className="text-muted-foreground text-xs">OR</span>
      <span className="bg-input h-px w-full"></span>
    </div>
  );
}


/**
 * Social login authentication options
 * 
 * This component renders buttons for social authentication providers:
 * - Google
 * - GitHub
 * - Apple
 * - Kakao
 * 
 * Each button uses the provider's official logo and links to the appropriate
 * OAuth flow. The styling is consistent while respecting each provider's
 * brand guidelines for their logo presentation.
 */
function SocialLoginButtons() {
  return (
    <>
      <AuthLoginButton
        logo={<GoogleLogo className="size-4" />}
        label="Google"
        href="/auth/social/start/google"
      />
      <AuthLoginButton
        logo={<AppleLogo className="size-4 scale-150 dark:text-white" />}
        label="Apple"
        href="/auth/social/start/apple"
      />
      <AuthLoginButton
        logo={<KakaoLogo className="size-4 scale-125 dark:text-yellow-300" />}
        label="Kakao"
        href="/auth/social/start/kakao"
      />
    </>
  );
}

/**
 * Complete set of sign-in authentication options
 * 
 * This exported component provides all authentication options for the sign-in flow,
 * including both social logins and passwordless options, with a divider between them.
 * 
 * Usage:
 * ```tsx
 * <SignInButtons />
 * ```
 */
export function SignInButtons() {
  return (
    <SocialLoginButtons />
  );
}

/**
 * Authentication options for the sign-up flow
 * 
 * This exported component provides authentication options specifically for the sign-up flow.
 * It only includes social login options, as the passwordless options are typically
 * more relevant for returning users rather than new registrations.
 * 
 * Usage:
 * ```tsx
 * <SignUpButtons />
 * ```
 */
export function SignUpButtons() {
  return (
    <>
      <Divider />
      <SocialLoginButtons />
    </>
  );
}
