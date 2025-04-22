# Sharepoint Document Library Connector

## Overview

The sharepoint library connector integration allows you to setup a connector between a document library in a sharepoint site and a KB in botpress.

## Configuration

To setup the connector you need need an App registration with the correct API permissions in Microsoft Entra admin center and the following details (If you have questions regarding where to obtain this information, check out the how to's section below):

- Client ID: This is the Application (client) ID of your App registration.
- Tenant ID: This is the Directory (tenant) ID of your App registration.
- Thumbprint: This is the thumbprint of your certificate you uploaded to your App registration.
- Private key: This is the content of your private key that you used to sign the certification. ( The content between the "-----BEGIN PRIVATE KEY-----" and "-----END PRIVATE KEY-----")
- Site Name: The name of the Sharepoint site.
- Document Library Name: The name of the Document Library that you want to sync a Botpress KB with.
- KB ID: The ID of the KB that you want to store the synced Documents from the Document Library.

## How to's

### How to register a app on Microsoft Entra admin center

- From the Home page of Microsoft Entra admin center, Open App registrations ( This is under Applications in the Left Nav )
- Add a new registration by clicking on “+ New registration”
- Give your app an appropriate name, and click register.
- Open the App registration and take note of the following:
  - `Application (client) ID`
  - `Directory (tenant) ID`

### How to create a certificate for your app registration

- We will be using a self signed certificate to authenticate, to create a self signed certificate run the following commands in order
- `openssl genrsa -out myPrivateKey.key 2048` → This will generate a 2048-bit private key and save it as myPrivateKey.key.
- `openssl req -new -key myPrivateKey.key -out myCertificate.csr` → This will create a CSR cert. You will be prompted to enter some information, fill as needed.
- `openssl x509 -req -days 365 -in myCertificate.csr -signkey myPrivateKey.key -out myCertificate.crt` → This will create a certificate file named myCertificate.crt that is valid for 365 days.

### How to add your certificate to your app registration

- Navigate to the Azure portal and go to your Azure AD app registration.
- Under “Certificates & secrets,” choose “Certificates” and click “Upload certificate.”
- Upload your .crt

### How to update API permissions for your app registration

- Go to “API Permissions” it should be under the Manage Group, in your App Registration "
- Click “Add a permissions”
- click on "Microsoft Graph".
- Select “Application permissions” as the type of permission.
- Check `Sites.FullControl.All`  , `Sites.Manage.All` , `Sites.Read.All` , `Sites.ReadWrite.All`, `Sites.Selected.All`, `Files.Read.All` and `Files.ReadWriteAll`
- Click “Add a permissions again.”
- Click the “Add a permission” button again
- Scroll till you find Sharepoint and click on it.
- Select “Application permissions” as the type of permission.
- Check `Sites.FullControl.All`  , `Sites.Manage.All` , `Sites.Read.All` , `Sites.ReadWrite.All` and `Sites.Selected.All`
- Click “Add permissions.”
- You should see All the permissions you added in the permissions list.
- Click on “Grant admin consent for <your_org_name>”

---

## Folder‑to‑KB Mapping (`folderKbMap`)

*This is an **optional** advanced feature. If you skip it, every file in the document library will go to the single KB you specified above.*

### Why use it?
Sometimes one SharePoint document library contains several distinct collections of content—HR procedures, Legal policies, Marketing campaigns, etc.—but you want each collection to live in its **own** Botpress KB for cleaner search results and permissions.  
`folderKbMap` lets you do exactly that.

### How it works
* `folderKbMap` is a **JSON object** whose keys are **KB IDs** and whose values are **arrays of folder prefixes** (relative paths) to watch.  
* During sync, the integration checks each file’s server‑relative path.  
  * If the path **starts with** one of the prefixes you listed, that file is routed to the corresponding KB.  
  * If no prefix matches, the file falls back to the default KB for the library.

### Configuration syntax
```jsonc
// Example: route folders within the libraries
"folderKbMap": {
  "kb-id-1": ["doclib1","doclib1/ExampleFolder/2025"],
  "kb-id-2":  ["doclib2/HR","doclib2/ExampleFolder"]
}
```
*Prefixes are **case‑insensitive** and may include simple wildcards (`*`).*

### Rules & limitations
1. **No KB sharing across libraries.** A single KB **cannot** receive content from two different libraries—even via folder mapping.  
2. **Create KBs first.** All KB IDs used in `folderKbMap` must already exist in Botpress before you save the configuration.
3. **Recursive files** Every file within a document library, regardles whether it is in a nested folder - will be recursively copied.

### Quick checklist
| ✔ | Step |
|---|------|
| Create a **separate KB** for each content group you want. |
| Identify folder (or folder‑prefix) boundaries inside the SharePoint library. |
| Build a `folderKbMap` JSON object mapping **kbId → [prefixes]**. |
| Add the JSON to your integration configuration. |
| Save & verify: upload a test file in each folder and confirm it appears in the expected KB. |

---
