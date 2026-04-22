# Power BI Modeling MCP SSE Bridge

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-blue)](https://github.com/microsoft/powerbi-modeling-mcp)
[![MCP](https://img.shields.io/badge/protocol-MCP-orange)](https://modelcontextprotocol.io)

This project is a high-performance **SSE (Server-Sent Events) Bridge** for the [Official Microsoft Power BI Modeling MCP Server](https://github.com/microsoft/powerbi-modeling-mcp). It enables seamless, URL-based interaction with Power BI semantic models from any language (Laravel, Python, Go) without the need for local `stdio` piping.

## 🔥 Key Innovations
- **Auto-Auth (Token Injection)**: Automatically performs an Azure ROPC flow using your Admin credentials to inject an Access Token. **Result: Zero browser popups** on your server.
- **Dynamic Binary Resolution**: Automatically detects your OS and CPU architecture to spawn the correct Microsoft MCP binary.
- **Laravel Context Injection**: Pass Workspace and Dataset IDs via URL query parameters to maintain session-specific contexts.
- **Web-Ready**: Perfect for building custom AI Chat interfaces for Power BI.

---

## 🛠️ Installation & Quick Start

### 1. Requirements
- Node.js v18 or higher.
- Power BI Admin account (Master User) or Service Principal.

### 2. Setup
```bash
git clone https://github.com/nusagates/mcp_pbi.git
cd mcp_pbi
npm install
```

### 3. Configuration
Create a `.env` file from the template:
```bash
cp .env.example .env
```
Fill in your `MS_PBI_...` credentials. **Important**: For the password-based login to work without a browser, enable **"Allow public client flows"** in your Azure App Registration -> Authentication settings.

### 4. Run
```bash
npm start
```
The bridge will be live at `http://localhost:3000/sse`.

---

## 🔗 Laravel Integration Example

Using Laravel's `Http` facade to interact with the bridge:

```php
use Illuminate\Support\Facades\Http;

// 1. Establish connection context (via Browser/SSE Client)
// URL: http://localhost:3000/sse?workspace_id=abc&dataset_id=123

// 2. Execute a Tool through the bridge
$response = Http::post("http://localhost:3000/messages?sessionId=YOUR_SESSION_ID", [
    "jsonrpc" => "2.0",
    "id" => 1,
    "method" => "tools/call",
    "params" => [
        "name" => "execute_dax_query",
        "arguments" => [
            "query" => "EVALUATE TOPN(10, 'YourTable')"
        ]
    ]
]);

return $response->json();
```

---

## 🛡️ Power BI Permissions Checklist
- [ ] **Azure Portal**: App Registration exists with `Tenant.Read.All`.
- [ ] **Power BI Admin**: "Allow service principals to use Power BI APIs" is **ON**.
- [ ] **Workspace**: App or User is added as a **Member/Contributor**.

## 🤝 Credits
This bridge uses the [Microsoft Power BI Modeling MCP Server](https://github.com/microsoft/powerbi-modeling-mcp) as its core engine. Special thanks to the Microsoft team for the protocol implementation.

## 📄 License
MIT License. Feel free to use and contribute!
