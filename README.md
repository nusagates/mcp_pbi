# Power BI Modeling MCP SSE Bridge

[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-blue)](https://github.com/microsoft/powerbi-modeling-mcp)
[![MCP](https://img.shields.io/badge/protocol-MCP-orange)](https://modelcontextprotocol.io)

A robust SSE (Server-Sent Events) bridge for the [Official Microsoft Power BI Modeling MCP Server](https://github.com/microsoft/powerbi-modeling-mcp). This bridge allows you to access Power BI modeling capabilities via a standard HTTP/URL connection, making it perfect for **Laravel**, **Python**, or **Web-based AI agents**.

## 🚀 Why this Bridge?
- **No Browser Popups**: Uses an automated Token Injection mechanism (ROPC Flow) to authenticate via Username/Password without triggering interactive browser logins.
- **URL Accessible**: Converts the standard `stdio` MCP server into an `SSE` endpoint accessible via simple HTTP requests.
- **Cross-Platform**: Intelligent binary resolution for Windows (local PBI Desktop) and Linux/Ubuntu (PBI Service/Fabric).
- **Stateless-Ready**: Designed to handle session management for multiple concurrent AI chat sessions.

---

## 🛠️ Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/mcp_pbi.git
   cd mcp_pbi
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Copy the example env and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

---

## ⚙️ Configuration (.env)

| Variable | Description |
| :--- | :--- |
| `MS_PBI_TENANT_ID` | Your Azure Tenant ID. |
| `MS_PBI_CLIENT_ID` | Your Azure App Registration Client ID. |
| `MS_PBI_CLIENT_SECRET` | (Optional) Client Secret for Service Principal mode. |
| `MS_PBI_USERNAME` | Power BI Admin/Master User email. |
| `MS_PBI_PASSWORD` | Power BI Admin/Master User password. |

> [!IMPORTANT]
> To avoid browser popups using Username/Password, ensure **"Allow public client flows"** is set to **Yes** in your Azure App Registration -> Authentication settings.

---

## 🔗 Usage with Laravel / HTTP Clients

### 1. Establish SSE Connection
Connect to the server to start a session. You can pass context parameters in the URL:
`GET http://localhost:3000/sse?workspace_id=YOUR_ID&dataset_id=YOUR_ID`

### 2. Send MCP Commands (JSON-RPC)
Send a POST request to the message endpoint provided in the SSE `endpoint` event:
`POST http://localhost:3000/messages?sessionId=YOUR_SESSION_ID`

**Example: Connect to a Semantic Model**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "connect_to_fabric_instance",
    "arguments": {
      "workspace_name": "My Workspace",
      "semantic_model_name": "My Dataset"
    }
  }
}
```

---

## 🛡️ Power BI Permissions

For Cloud/Fabric access, your App Registration must:
1. Have **Tenant.Read.All** (or equivalent) API permissions in Azure AD.
2. Be enabled for Service Principals in the **Power BI Admin Portal**.
3. Be added as a **Member/Contributor** in the target Power BI Workspace.

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
*(Note: The underlying Power BI MCP binary is subject to Microsoft's own licensing terms)*
