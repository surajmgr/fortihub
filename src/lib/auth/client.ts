import { createAuthClient } from "better-auth/client";
import { adminClient } from "better-auth/client/plugins";
import { passkeyClient } from "@better-auth/passkey/client";
import {
    anonymousClient,
    inferAdditionalFields,
    oneTapClient,
    twoFactorClient,
    usernameClient,
} from "better-auth/client/plugins";
import type { auth } from "./server/index";
import { PUBLIC_AUTH_URL, GOOGLE_CLIENT_ID } from "$lib/utils/publicConstants";

export const authClient = createAuthClient({
    baseURL: PUBLIC_AUTH_URL || "",
    plugins: [
        adminClient(),
        passkeyClient(),
        twoFactorClient({}),
        oneTapClient({
            clientId: GOOGLE_CLIENT_ID || "",
        }),
        anonymousClient(),
        usernameClient(),
        inferAdditionalFields<typeof auth>(),
    ],
});
