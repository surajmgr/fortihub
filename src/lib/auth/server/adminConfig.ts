import type { AdminOptions } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";

type AppStatements = {
  readonly user: readonly [
    "create",
    "list",
    "set-role",
    "ban",
    "impersonate",
    "delete",
    "set-password",
    "get",
    "update",
  ];
  readonly session: readonly ["list", "revoke", "delete"];
};

const ac = createAccessControl<AppStatements>({
  user: ["create", "list", "set-role", "ban", "impersonate", "delete", "set-password", "get", "update"],
  session: ["list", "revoke", "delete"],
});

export const adminConfig: AdminOptions = {
  defaultRole: "user",
  adminRoles: ["admin", "superadmin"],
  defaultBanReason: "Violation of terms of service",
  defaultBanExpiresIn: 30 * 24 * 60 * 60,
  impersonationSessionDuration: 3600,
  bannedUserMessage: "Your account has been suspended. Contact support for details.",
  ac,
  roles: {
    user: ac.newRole({
      user: ["get"],
    }),
    admin: ac.newRole({
      user: ["get", "list", "update", "set-role"],
      session: ["list", "revoke"],
    }),
    superadmin: ac.newRole({
      user: ["create", "list", "set-role", "ban", "impersonate", "delete", "set-password", "get", "update"],
      session: ["list", "revoke", "delete"],
    }),
  },
};
