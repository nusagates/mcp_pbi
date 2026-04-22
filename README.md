# Power BI Modeling MCP Server (Laravel Bridge)

This project is a customized bridge for the [Official Power BI Modeling MCP Server](https://github.com/microsoft/powerbi-modeling-mcp). It is designed to be hosted on **Ubuntu** or **Windows** and integrated with **Laravel** via SSE (Server-Sent Events).

## ✨ Key Features
- **Cross-Platform**: Automatically detects and runs the correct binary for Windows, Ubuntu, or macOS.
- **Service Principal Auth**: Pre-configured for headless server-to-server authentication.
- **Laravel Integration**: Accept context (Workspace/Dataset IDs) via URL query parameters.
- **SSE Bridge**: Makes the standard stdio MCP server accessible via a persistent URL.

## 🚀 Setup & Installation

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Credentials**:
   Edit the `.env` file with your Microsoft Power BI credentials:
   ```env
   MS_PBI_TENANT_ID=xxxx-xxxx-xxxx
   MS_PBI_CLIENT_ID=xxxx-xxxx-xxxx
   MS_PBI_CLIENT_SECRET=xxxx-xxxx-xxxx
   PORT=3000
   ```

3. **Start the Server**:
   ```bash
   npm start
   ```
   Server will be active at: `http://localhost:3000/sse`

---

## 🔗 Laravel Integration

To connect your Laravel application or AI agent, use the following SSE URL structure:

```php
// Build the connection URL in Laravel
$url = "http://localhost:3000/sse?" . http_build_query([
    'workspace_id' => $workspaceId,
    'dataset_id'   => $datasetId,
    'pbi_id'       => $pbiId // Optional
]);
```

### 🤖 AI Prompt Example
To help your AI agent connect immediately, include this in your system prompt:
> "You are a Power BI expert. Use the provided Workspace ID and Dataset ID to connect using the `connect_to_fabric_instance` tool upon initialization."

---

## 🛡️ Requirements & Permissions

For the connection to work via **Service Principal**, ensure the following:

1. **Azure Side**:
   - The App Registration must have `Tenant.Read.All` or specific Power BI permissions.
2. **Power BI Admin Portal**:
   - Go to **Tenant Settings** -> **Admin API settings**.
   - Enable **"Allow service principals to use Power BI APIs"**.
3. **Workspace Access**:
   - Add your App (by its name) as a **Member** or **Contributor** to the target Power BI Workspace.

## 🛠️ Deployment on Ubuntu

1. Install Node.js 18+.
2. Clone this project to your Ubuntu server.
3. Run `npm install`.
4. Setup a process manager like **PM2** to keep it running:
   ```bash
   pm2 start server.js --name pbi-mcp
   ```

---
*Developed for seamless AI-driven Power BI modeling.*
