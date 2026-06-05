# @tinyidp/n8n-nodes-tinyidp

This is an n8n community node for [Tiny IDP](https://tiny-idp.com). It allows you to extract structured data from identity documents such as Passports, Spanish DNIs, EU Driver Licenses, and Proof of Address using Tiny IDP's powerful extraction API.

[n8n](https://n8n.io/) is a fair-code licensed workflow automation platform.

---

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation:

1. Go to **Settings** > **Community Nodes** in your n8n instance.
2. Click on **Install a node**.
3. Enter `@tinyidp/n8n-nodes-tinyidp` as the npm package name.
4. Agree to the risks and click **Install**.

---

## Credentials

To use this node, you need to authenticate with the Tiny IDP API.

1. Sign up or log in to your account at [Tiny IDP](https://tiny-idp.com).
2. Obtain your API Key from the developer dashboard.
3. In n8n, create a new credential for **Tiny IDP API**.
4. Paste your API Key into the **API Key** field and save.

---

## Usage & Examples

The Tiny IDP node supports two input modes for processing documents: **Public URL** and **File (Binary)**.

### 1. Public URL Mode (Default)

Use this mode when your document images are hosted publicly (e.g., on AWS S3, Cloudinary, or any public URL).

- **Document Type**: Select the type of document (e.g., `Passport`, `Spanish DNI`, `EU Driver License`, `Proof of Address`).
- **Input Type**: `Public URL`
- **URL**: Enter the public URL of the document image (e.g., `https://example.com/passport.jpg`).

### 2. File (Binary) Mode

Use this mode when you want to upload a document file directly from previous nodes in your workflow (e.g., from an email attachment, HTTP Request download, or Read Binary File node).

- **Document Type**: Select the type of document.
- **Input Type**: `File (Binary)`
- **Binary Property**: Enter the name of the binary property that contains the file (defaults to `data`).

---

## Compatibility

- Minimum n8n version: `1.0.0`
- Tested against: `1.0.0+`

---

## Resources

* [Tiny IDP Website](https://tiny-idp.com)
* [Tiny IDP Documentation](https://tiny-idp.com/docs)
* [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
