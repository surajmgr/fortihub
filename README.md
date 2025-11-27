# Auth Microservice

A centralized authentication microservice built with SvelteKit, designed to handle identity across multiple domains and applications seamlessly. This service supports various authentication methods including email/password, OTP, Google OAuth, and Passkeys, with robust cross-domain support.

## Features

-   **Centralized Authentication**: Single sign-on (SSO) capabilities across your ecosystem.
-   **Multiple Auth Methods**:
    -   Email & Password
    -   Email OTP
    -   Google OAuth
    -   Passkeys
    -   Anonymous Sign-in
-   **Security**:
    -   Cloudflare Turnstile integration for bot protection.
    -   Secure session management with HTTP-only cookies.
    -   Cross-domain token handling.
-   **User Management**:
    -   Sign up / Sign in
    -   Forgot / Reset Password flows
    -   Email Verification

## Project Structure

```
src/
├── lib/
│   ├── auth/           # Authentication handlers and client
│   ├── components/     # Reusable UI components (Auth forms, inputs)
│   ├── schema/         # Zod schemas for validation
│   └── utils/          # Utility functions (URL handling, API endpoints)
├── routes/
│   ├── +page.svelte        # Home / Guide page
│   ├── login/              # Login page
│   ├── forgot-password/    # Forgot password page
│   ├── reset-password/     # Reset password page
│   └── callback/           # Callback handler for cross-domain redirects
└── static/             # Static assets
```

## Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd auth
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Variables:**

    Create a `.env` file in the root directory based on `.env.example`.

    ```env
    PUBLIC_BETTER_AUTH_URL=http://localhost:5173 # URL of this auth service
    PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
    PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=your_turnstile_site_key
    ```

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

## Usage & Flow

### Authentication Flow

The service is designed to be redirected to from other applications. When a user needs to authenticate, your application should redirect them to the `/login` route with a `callbackUrl` parameter.

**Example URL:**
`http://localhost:5173/login?callbackUrl=http://myapp.com/dashboard`

1.  **User lands on Login Page**: They choose their preferred sign-in method.
2.  **Authentication**: The service validates credentials/OTP/OAuth.
3.  **Redirect**: Upon success, the user is redirected to the `/callback` route, which then redirects them back to the provided `callbackUrl`.

### Required Parameters

#### `callbackUrl`
-   **Description**: The URL where the user should be redirected after a successful action (login, signup, password reset).
-   **Usage**: Pass as a query parameter to auth routes.
-   **Example**: `?callbackUrl=https://example.com/dashboard`

#### `redirectTo`
-   **Description**: Similar to `callbackUrl`, specifically used in the "Request Password Reset" flow to indicate where the user should go after clicking the reset link in their email.

### Key Routes

| Route | Description | Params |
| :--- | :--- | :--- |
| `/` | Home page with documentation/guide. | None |
| `/login` | Main authentication page (Sign In / Sign Up). | `callbackUrl` (optional, defaults to `/`) |
| `/forgot-password` | Page to request a password reset link. | `callbackUrl` (optional) |
| `/reset-password` | Page to set a new password. | `token` (required), `error` (optional) |
| `/callback` | Handles post-auth redirection. | `redirectTo` (required) |

## Development

-   **Linting**: `npm run lint`
-   **Formatting**: `npm run format`
-   **Type Checking**: `npm run check`

## Tech Stack

-   **Framework**: SvelteKit
-   **Styling**: TailwindCSS
-   **Auth**: Better Auth
-   **Validation**: Zod
-   **Captcha**: Cloudflare Turnstile
-   **Icons**: Lucide Svelte
