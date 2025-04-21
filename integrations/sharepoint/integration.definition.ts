import { z, IntegrationDefinition } from "@botpress/sdk";
import { integrationName } from "./package.json";

export default new IntegrationDefinition({
  name: integrationName,
  version: "2.2.0",
  title: "SharePoint",
  description:
    "Sync one or many SharePoint document libraries with one or more Botpress knowledge bases.",
  readme: "hub.md",
  icon: "icon.svg",

  /******************************************************************
   * CONFIGURATION (user‑visible)
   ******************************************************************/
  configuration: {
    schema: z.object({
      clientId: z.string().min(1).describe("Azure AD application client ID"),
      tenantId: z.string().min(1).describe("Azure AD tenant ID"),
      thumbprint: z.string().min(1).describe("Certificate thumbprint"),
      privateKey: z.string().min(1).describe("PEM‑formatted certificate private key"),
      primaryDomain: z.string().min(1).describe("SharePoint primary domain (e.g. contoso)"),
      siteName: z.string().min(1).describe("SharePoint site name"),

      /* ──────────────────────────────────────────────────────────
       * NEW  ▸ MULTI‑LIBRARY SUPPORT
       * ────────────────────────────────────────────────────────── */
      documentLibraryNames: z
        .string()
        .optional()
        .describe(
          "Comma‑separated list **or** JSON array of Document Libraries to sync " +
            '(e.g. "Policies,Procedures" or \'["Policies","Procedures"]\').'
        ),

      /* Backwards‑compat: keep the old single‑value key optional */
      documentLibraryName: z
        .string()
        .optional()
        .describe("(Legacy) Single document library to sync"),

      /* KB routing */
      kbId: z.string().optional().describe(
                "Optional default KB. " +
                "If omitted, every file must match a folderKbMap entry or it’s ignored."
              ),

      folderKbMap: z
        .string()
        .optional()
        .describe(
          "Optional JSON map of kbId → array of folder prefixes used for routing.\n" +
            'Example: {"kb‑marketing":["Campaigns"],"kb‑policies":["HR","Legal"]}'
        ),
    }),
  },

  /******************************************************************
   * STATE (stored per installation)
   ******************************************************************/
  states: {
    configuration: {
      type: "integration",
      schema: z.object({
        /* key = documentLibraryName, value = {webhookSubscriptionId,changeToken} */
        subscriptions: z.record(
          z.object({
            webhookSubscriptionId: z.string().min(1),
            changeToken: z.string().min(1),
          })
        ),
      }),
    },
  },

  /******************************************************************
   * NO UI‑ACTIONS
   ******************************************************************/
  actions: {},
});
