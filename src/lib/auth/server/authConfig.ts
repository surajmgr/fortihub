import { sendOTPEmail } from "$lib/email/sendOTP";
import { generateUsername, getHostDomain, getRpId } from "$lib/utils";
import { expo } from "@better-auth/expo";
import type { BetterAuthOptions } from "better-auth";
import { admin, anonymous, captcha, emailOTP, oneTap, openAPI, twoFactor, username } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import { adminConfig } from "./adminConfig";
import { BETTER_AUTH_SECRET, CLOUDFLARE_TURNSTILE_SECRET_KEY, DISCORD_CLIENT_SECRET, ENABLE_DISCORD, ENABLE_FACEBOOK, ENABLE_GITHUB, ENABLE_GITLAB, ENABLE_GOOGLE, ENABLE_HUGGINGFACE, ENABLE_LINKEDIN, ENABLE_MICROSOFT, ENABLE_NOTION, ENABLE_REDDIT, ENABLE_SLACK, ENABLE_SPOTIFY, ENABLE_TWITCH, ENABLE_TWITTER, ENABLE_VERCEL, FACEBOOK_CLIENT_SECRET, GITHUB_CLIENT_SECRET, GITLAB_CLIENT_SECRET, GOOGLE_CLIENT_SECRET, HUGGINGFACE_CLIENT_SECRET, LINKEDIN_CLIENT_SECRET, MICROSOFT_CLIENT_SECRET, NODE_ENV, NOTION_CLIENT_SECRET, PASSKEY_ORIGIN, PASSKEY_RP_NAME, REDDIT_CLIENT_SECRET, SLACK_CLIENT_SECRET, SPOTIFY_CLIENT_SECRET, TRUSTED_ORIGINS, TWITCH_CLIENT_SECRET, TWITTER_CLIENT_SECRET, VERCEL_CLIENT_SECRET } from "$lib/utils/server/constants";
import { PUBLIC_AUTH_URL, GOOGLE_CLIENT_ID, GITHUB_CLIENT_ID, DISCORD_CLIENT_ID, MICROSOFT_CLIENT_ID, LINKEDIN_CLIENT_ID, FACEBOOK_CLIENT_ID, GITLAB_CLIENT_ID, HUGGINGFACE_CLIENT_ID, NOTION_CLIENT_ID, REDDIT_CLIENT_ID, SLACK_CLIENT_ID, SPOTIFY_CLIENT_ID, TWITTER_CLIENT_ID, TWITCH_CLIENT_ID, VERCEL_CLIENT_ID, GITLAB_ISSUER, ENABLE_ANONYMOUS, SLACK_CLIENT_TEAM } from "$lib/utils/publicConstants";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { getRequestEvent } from "$app/server";

export const authConfig: BetterAuthOptions = {
  secret: BETTER_AUTH_SECRET,
  logger: {
    disabled: NODE_ENV !== "development",
    level: "debug",
  },
  rateLimit: {
    enabled: true,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }: { user: { email: string }; url: string }) => {
      await sendOTPEmail({
        email: user.email,
        otp: url,
        type: "forget-password",
      });
    },
  },
  plugins: [
    openAPI(),
    username(),
    ...(ENABLE_ANONYMOUS ? [anonymous()] : []),
    passkey({
      rpID: getRpId() || "",
      rpName: PASSKEY_RP_NAME,
      origin: [...PASSKEY_ORIGIN, PUBLIC_AUTH_URL!],
    }),
    oneTap(),
    twoFactor(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        await sendOTPEmail({ email, otp, type });
      },
      otpLength: 6,
      expiresIn: 300,
      sendVerificationOnSignUp: false,
      disableSignUp: false,
      allowedAttempts: 5,
      storeOTP: "hashed",
    }),
    captcha({
      provider: "cloudflare-turnstile",
      secretKey: CLOUDFLARE_TURNSTILE_SECRET_KEY || "",
      endpoints: ["/sign-in/email-otp", "/email-otp/send-verification-otp"],
    }),
    expo(),
    admin(adminConfig),
    sveltekitCookies(getRequestEvent)
  ],
  socialProviders: {
    ...(ENABLE_GITHUB ? {
      github: {
        prompt: "select_account" as const,
        clientId: GITHUB_CLIENT_ID!,
        clientSecret: GITHUB_CLIENT_SECRET!,
      },
    } : {}),
    ...(ENABLE_GOOGLE ? {
      google: {
        prompt: "select_account" as const,
        clientId: GOOGLE_CLIENT_ID!,
        clientSecret: GOOGLE_CLIENT_SECRET!,
      },
    } : {}),
    ...(ENABLE_DISCORD ? {
      discord: {
        clientId: DISCORD_CLIENT_ID!,
        clientSecret: DISCORD_CLIENT_SECRET!,
      },
    } : {}),
    ...(ENABLE_MICROSOFT ? {
      microsoft: {
        clientId: MICROSOFT_CLIENT_ID!,
        clientSecret: MICROSOFT_CLIENT_SECRET!,
        tenantId: 'common',
        authority: "https://login.microsoftonline.com",
        prompt: "select_account",
      },
    } : {}),
    ...(ENABLE_LINKEDIN ? {
      linkedin: {
        clientId: LINKEDIN_CLIENT_ID!,
        clientSecret: LINKEDIN_CLIENT_SECRET!,
      },
    } : {}),
    ...(ENABLE_FACEBOOK ? {
      facebook: {
        clientId: FACEBOOK_CLIENT_ID!,
        clientSecret: FACEBOOK_CLIENT_SECRET!,
      },
    } : {}),
    ...(ENABLE_GITLAB ? {
      gitlab: {
        clientId: GITLAB_CLIENT_ID!,
        clientSecret: GITLAB_CLIENT_SECRET!,
        issuer: GITLAB_ISSUER!,
      },
    } : {}),
    ...(ENABLE_HUGGINGFACE ? {
      huggingface: {
        clientId: HUGGINGFACE_CLIENT_ID!,
        clientSecret: HUGGINGFACE_CLIENT_SECRET!,
      },
    } : {}),
    ...(ENABLE_NOTION ? {
      notion: {
        clientId: NOTION_CLIENT_ID!,
        clientSecret: NOTION_CLIENT_SECRET!,
      },
    } : {}),
    ...(ENABLE_REDDIT ? {
      reddit: {
        clientId: REDDIT_CLIENT_ID!,
        clientSecret: REDDIT_CLIENT_SECRET!,
      },
    } : {}),
    ...(ENABLE_SLACK ? {
      slack: {
        clientId: SLACK_CLIENT_ID!,
        clientSecret: SLACK_CLIENT_SECRET!,
      },
    } : {}),
    ...(ENABLE_SPOTIFY ? {
      spotify: {
        clientId: SPOTIFY_CLIENT_ID!,
        clientSecret: SPOTIFY_CLIENT_SECRET!,
      },
    } : {}),
    ...(ENABLE_TWITTER ? {
      twitter: {
        clientId: TWITTER_CLIENT_ID!,
        clientSecret: TWITTER_CLIENT_SECRET!,
      },
    } : {}),
    ...(ENABLE_TWITCH ? {
      twitch: {
        clientId: TWITCH_CLIENT_ID!,
        clientSecret: TWITCH_CLIENT_SECRET!,
      },
    } : {}),
    ...(ENABLE_VERCEL ? {
      vercel: {
        clientId: VERCEL_CLIENT_ID!,
        clientSecret: VERCEL_CLIENT_SECRET!,
      },
    } : {}),
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user: { email: string; name: string }) => {
          const usernameVal = await generateUsername(user.email);
          const name = user.name === "User" ? user.email.split("@")[0] : user.name;
          return {
            data: {
              ...user,
              name,
              username: usernameVal,
              displayUsername: usernameVal,
            },
          };
        },
      },
    },
  },
  user: {
    modelName: "users"
  },
  session: {
    modelName: "sessions"
  },
  account: {
    modelName: "accounts"
  },
  verification: {
    modelName: "verifications"
  },
  trustedOrigins: [...TRUSTED_ORIGINS, PUBLIC_AUTH_URL!],
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: `.${getHostDomain(PUBLIC_AUTH_URL!)}`,
    },
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
      partitioned: true,
    },
  },
};
