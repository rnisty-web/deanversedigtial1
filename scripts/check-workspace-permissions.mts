/**
 * Parity check for the unified permission engine.
 *
 * Confirms that every legacy role resolves to the same access it had under the
 * split admin/client permission system. Run with:
 *   npx tsx scripts/check-workspace-permissions.mts
 */

import { DEFAULT_ROLE_CATALOG } from "../src/lib/roles/catalog";
import { getEffectiveAdminPermissions } from "../src/lib/roles/permissions";
import { getEffectiveClientPermissions } from "../src/lib/roles/client-permissions";
import {
  getDataScope,
  getVisibleModules,
  hasWorkspacePermission,
} from "../src/lib/workspace/permissions";
import { getWorkspaceModule } from "../src/lib/workspace/modules";

const catalog = DEFAULT_ROLE_CATALOG;

type Case = {
  name: string;
  profile: {
    role: string;
    roles: string[];
    admin_permissions?: string[] | null;
    client_permissions?: string[] | null;
  };
};

const cases: Case[] = [
  { name: "Founder (admin)", profile: { role: "admin", roles: ["admin"] } },
  { name: "Lead Developer", profile: { role: "lead_developer", roles: ["lead_developer"] } },
  { name: "Lead Web Designer", profile: { role: "lead_web_designer", roles: ["lead_web_designer"] } },
  { name: "Customer", profile: { role: "customer", roles: ["customer"] } },
  {
    name: "Custom staff role (no catalog perms)",
    profile: { role: "custom_support", roles: ["custom_support"] },
  },
  {
    name: "Staff with narrowed override",
    profile: {
      role: "lead_developer",
      roles: ["lead_developer"],
      admin_permissions: ["dashboard", "projects"],
    },
  },
  {
    name: "Client with narrowed override",
    profile: {
      role: "customer",
      roles: ["customer"],
      client_permissions: ["dashboard", "invoices"],
    },
  },
  {
    name: "Client with empty override (locked down)",
    profile: { role: "customer", roles: ["customer"], client_permissions: [] },
  },
  {
    name: "Staff who is also a customer",
    profile: { role: "lead_web_designer", roles: ["lead_web_designer", "customer"] },
  },
];

let failures = 0;

function fail(message: string) {
  failures += 1;
  console.log(`   FAIL  ${message}`);
}

for (const testCase of cases) {
  const profile = testCase.profile;
  const isFounder = profile.roles.includes("admin");

  const legacyAdmin = getEffectiveAdminPermissions(profile as never, catalog, { isFounder });
  const legacyClient = getEffectiveClientPermissions(profile as never, catalog);
  const visible = getVisibleModules(profile as never, catalog, { isFounder });
  const scope = getDataScope(profile as never, catalog, { isFounder });

  console.log(`\n${testCase.name}`);
  console.log(`   legacy admin : ${legacyAdmin.join(", ") || "(none)"}`);
  console.log(`   legacy client: ${legacyClient.join(", ") || "(none)"}`);
  console.log(`   modules      : ${visible.map((m) => m.id).join(", ") || "(none)"}`);
  console.log(`   data scope   : ${scope}`);

  // Every legacy admin section must still be viewable as a module.
  for (const key of legacyAdmin) {
    const match = [...visible].find((m) => m.legacyAdminKey === key);
    if (!match) {
      fail(`legacy admin "${key}" is no longer viewable`);
    }
  }

  // Every legacy client section must still be viewable for non-staff accounts.
  // Staff keep the permission for scoped APIs, but Files is hidden from their
  // nav (they manage deliverables under Projects).
  const staffAccount =
    testCase.profile.roles.some((role) => role !== "customer") ||
    testCase.profile.roles.includes("admin");
  for (const key of legacyClient) {
    if (staffAccount && key === "files") continue;
    const match = visible.find((m) => m.legacyClientKey === key);
    if (!match) fail(`legacy client "${key}" is no longer viewable`);
  }

  // A non-staff account must never hold a staff-only module.
  if (!isFounder && profile.roles.every((r) => r === "customer")) {
    for (const item of visible) {
      if (item.staffOnly) fail(`customer can see staff-only module "${item.id}"`);
    }
    if (scope !== "own") fail(`customer data scope should be "own", got "${scope}"`);
  }

  // Nobody should ever be locked out of the home screen or their own account.
  if (!hasWorkspacePermission(profile as never, "workspace", "view", catalog, { isFounder })) {
    fail("no access to the workspace home");
  }
  if (!hasWorkspacePermission(profile as never, "account", "edit", catalog, { isFounder })) {
    fail("cannot edit own account");
  }
}

// Action-level spot checks.
const customer = { role: "customer", roles: ["customer"] };
if (hasWorkspacePermission(customer as never, "projects", "delete", catalog)) {
  fail("customer should not be able to delete projects");
}
if (!hasWorkspacePermission(customer as never, "projects", "view", catalog)) {
  fail("customer should be able to view their projects");
}
if (!hasWorkspacePermission(customer as never, "files", "create", catalog)) {
  fail("customer should be able to upload files");
}
if (hasWorkspacePermission(customer as never, "users", "view", catalog)) {
  fail("customer should never see the users module");
}

const designer = { role: "lead_web_designer", roles: ["lead_web_designer"] };
if (!hasWorkspacePermission(designer as never, "files", "view", catalog)) {
  fail("staff with projects access should inherit file access");
}
if (hasWorkspacePermission(designer as never, "invoices", "view", catalog)) {
  fail("lead web designer never had invoices access");
}
if (!hasWorkspacePermission(designer as never, "portfolio", "create", catalog)) {
  fail("lead web designer should keep portfolio create rights");
}

// The dotted format must round-trip alongside legacy keys.
const matrixUser = {
  role: "lead_developer",
  roles: ["lead_developer"],
  admin_permissions: ["leads.view", "leads.export", "messages"],
};
if (!hasWorkspacePermission(matrixUser as never, "leads", "export", catalog)) {
  fail("explicit leads.export was not granted");
}
if (hasWorkspacePermission(matrixUser as never, "leads", "delete", catalog)) {
  fail("leads.delete should not be implied by leads.view");
}
if (!hasWorkspacePermission(matrixUser as never, "messages", "create", catalog)) {
  fail("legacy bare key should still grant its full action set");
}
if (!getWorkspaceModule("leads")) fail("module lookup broken");

// Staff-only modules are a hard floor: an explicit grant cannot reach a client.
const smuggler = {
  role: "customer",
  roles: ["customer"],
  client_permissions: ["dashboard", "users.view", "leads.export"],
};
if (hasWorkspacePermission(smuggler as never, "users", "view", catalog)) {
  fail("staff-only module leaked to a customer via an explicit grant");
}
if (hasWorkspacePermission(smuggler as never, "leads", "export", catalog)) {
  fail("staff-only module leaked to a customer via an explicit grant");
}

console.log(
  failures === 0
    ? "\nAll permission parity checks passed."
    : `\n${failures} permission check(s) failed.`,
);

process.exit(failures === 0 ? 0 : 1);
