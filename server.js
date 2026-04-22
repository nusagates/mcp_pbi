import express from "express";
import { spawn } from "child_process";
import path from "path";
import os from "os";
import fs from "fs";
import { fileURLToPath } from 'url';
import { createRequire } from "module";
import "dotenv/config";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

// Resolve MCP Executable
function getExecutablePath() {
    const platform = os.platform();
    const arch = os.arch();
    const platformPackageName = `@microsoft/powerbi-modeling-mcp-${platform}-${arch}`;
    try {
        const pkgJsonPath = require.resolve(`${platformPackageName}/package.json`);
        const pkgDir = path.dirname(pkgJsonPath);
        const pkgJson = require(pkgJsonPath);
        const execName = Object.values(pkgJson.bin || {})[0];
        const fullPath = path.resolve(pkgDir, execName);
        if (fs.existsSync(fullPath)) return fullPath;
    } catch (err) {}
    const fallbackPath = path.resolve(__dirname, "node_modules", `@microsoft/powerbi-modeling-mcp-${platform}-${arch}`, "dist", 
        platform === "win32" ? "powerbi-modeling-mcp.exe" : "powerbi-modeling-mcp");
    return fs.existsSync(fallbackPath) ? fallbackPath : null;
}

const exePath = getExecutablePath();

/**
 * Function to get Access Token using Username/Password (ROPC Flow)
 */
async function getPBIAccessToken() {
    console.log(`\n[Auth] Meminta token untuk ${process.env.MS_PBI_USERNAME}...`);
    
    const tenantId = process.env.MS_PBI_TENANT_ID;
    const clientId = process.env.MS_PBI_CLIENT_ID || "1b08e755-990a-440e-be5b-ecb8b3aad2aa"; // Fallback to provided client id
    const username = process.env.MS_PBI_USERNAME;
    const password = process.env.MS_PBI_PASSWORD;

    const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('client_id', clientId);
    params.append('username', username);
    params.append('password', password);
    // Kita minta scope penuh agar binary tidak minta login lagi
    params.append('scope', 'https://analysis.windows.net/powerbi/api/.default');

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: params,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const data = await response.json();
        if (data.access_token) {
            console.log("\x1b[32m[Auth] Token berhasil didapatkan! ✅\x1b[0m");
            return data.access_token;
        } else {
            console.error("\x1b[31m[Auth Error]\x1b[0m", data.error_description || data.error);
            return null;
        }
    } catch (err) {
        console.error("\x1b[31m[Auth Error]\x1b[0m", err.message);
        return null;
    }
}

const sessions = new Map();

app.get("/sse", async (req, res) => {
    const sessionId = Math.random().toString(36).substring(2, 10);
    
    // 1. Dapatkan Token
    const token = await getPBIAccessToken();
    
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    if (!token) {
        console.error("[SSE] Login gagal, koneksi dibatalkan.");
        res.write(`event: error\ndata: Auth Failed\n\n`);
        return res.end();
    }

    console.log(`[\x1b[34m${new Date().toLocaleTimeString()}\x1b[0m] Sesi Baru: \x1b[33m${sessionId}\x1b[0m`);
    res.write(`event: endpoint\ndata: /messages?sessionId=${sessionId}\n\n`);

    // KUNCI: Kita hanya mengirim PBI_MODELING_MCP_ACCESS_TOKEN. 
    // Kita HAPUS AZURE_CLIENT_ID dsb agar binary terpaksa pakai token ini.
    const cleanEnv = { 
        PORT: process.env.PORT,
        PATH: process.env.PATH,
        PBI_MODELING_MCP_ACCESS_TOKEN: token 
    };

    const child = spawn(exePath, ["--start", "--skipconfirmation"], {
        stdio: ["pipe", "pipe", "pipe"],
        env: cleanEnv
    });

    sessions.set(sessionId, { res, child });

    let buffer = "";
    child.stdout.on("data", (data) => {
        buffer += data.toString();
        let lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (let line of lines) {
            const msg = line.trim();
            if (msg) {
                console.log(`\x1b[36m[PBI -> Laravel]\x1b[0m ${msg}`);
                res.write(`event: message\ndata: ${msg}\n\n`);
            }
        }
    });

    child.stderr.on("data", (data) => {
        console.error(`\x1b[31m[PBI Binary Error]\x1b[0m ${data.toString()}`);
    });

    child.on("close", (code) => {
        console.log(`[Sesi ${sessionId}] Selesai (Code: ${code})`);
        res.end();
    });

    req.on("close", () => {
        child.kill();
        sessions.delete(sessionId);
    });
});

app.post("/messages", (req, res) => {
    const session = sessions.get(req.query.sessionId);
    if (session) {
        session.child.stdin.write(JSON.stringify(req.body) + "\n");
        res.sendStatus(202);
    } else {
        res.status(404).send("Sesi tidak ditemukan");
    }
});

app.listen(port, "0.0.0.0", () => {
    console.log(`\x1b[32m\n🚀 Server MCP Power BI (Token Injection Mode) Aktif\x1b[0m`);
    console.log(`Siap menerima request dari Laravel Anda.\n`);
});
