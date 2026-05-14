#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";
import os from "os";

const SERVER_NAME = "obsidian-brain-mcp";
const ANTIGRAVITY_TYPE = "exa.cascade_plugins_pb.CascadePluginCommandTemplate";

const appData = process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming");
const home = os.homedir();

const AGENTS = {
  antigravity: {
    label: "Antigravity",
    configPath: path.join(home, ".gemini", "antigravity", "mcp_config.json"),
    typeName: ANTIGRAVITY_TYPE
  },
  "claude-desktop": {
    label: "Claude Desktop",
    configPath: path.join(appData, "Claude", "claude_desktop_config.json")
  },
  "cline-roo": {
    label: "Cline/Roo",
    configPath: path.join(
      appData,
      "Code",
      "User",
      "globalStorage",
      "rooveterinaryinc.roo-cline",
      "settings",
      "cline_mcp_settings.json"
    )
  },
  cursor: {
    label: "Cursor",
    configPath: path.join(home, ".cursor", "mcp.json")
  }
};

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith("--")) {
      continue;
    }

    const key = item.slice(2);
    const next = argv[index + 1];
    if (next && !next.startsWith("--")) {
      parsed[key] = next;
      index += 1;
    } else {
      parsed[key] = true;
    }
  }

  return parsed;
}

function usage() {
  return [
    "Uso:",
    "  node tools/brain-init.mjs --brain-root \"C:\\\\caminho\\\\Obsidian-LD\" --agent antigravity",
    "  node tools/brain-init.mjs --brain-root \"C:\\\\caminho\\\\Obsidian-LD\" --agent auto",
    "  node tools/brain-init.mjs --brain-root \"C:\\\\caminho\\\\Obsidian-LD\" --config \"C:\\\\caminho\\\\mcp.json\"",
    "  node tools/brain-init.mjs --brain-root \"C:\\\\caminho\\\\Obsidian-LD\" --agent cursor --print",
    "",
    "Agentes conhecidos: auto, antigravity, claude-desktop, cline-roo, cursor",
    "Use --print para gerar o JSON sem gravar arquivo."
  ].join("\n");
}

function buildServerConfig(brainRoot, agentKey) {
  const server = {
    command: "node",
    args: [path.join(brainRoot, "mcp-server", "index.js")],
    env: {
      OBSIDIAN_BRAIN_ROOT: brainRoot
    }
  };

  if (AGENTS[agentKey]?.typeName) {
    server.$typeName = AGENTS[agentKey].typeName;
  }

  return server;
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function detectAgentConfig() {
  for (const [agentKey, agent] of Object.entries(AGENTS)) {
    if (await exists(agent.configPath)) {
      return { agentKey, configPath: agent.configPath };
    }
  }

  return null;
}

function hasLegacySymlinkConfig(serverConfig) {
  if (!serverConfig) {
    return false;
  }

  return JSON.stringify(serverConfig).toLowerCase().includes(".brain");
}

function timestamp() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "-");
}

async function readJsonOrEmpty(configPath) {
  if (!(await exists(configPath))) {
    return {};
  }

  const raw = await fs.readFile(configPath, "utf8");
  if (!raw.trim()) {
    return {};
  }

  return JSON.parse(raw);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || args.h) {
    console.log(usage());
    return;
  }

  if (!args["brain-root"]) {
    console.error("Informe --brain-root com o caminho absoluto do Obsidian Brain.\n");
    console.error(usage());
    process.exitCode = 1;
    return;
  }

  const brainRoot = path.resolve(String(args["brain-root"]));
  const agentArg = String(args.agent || "auto").toLowerCase();

  if (agentArg !== "auto" && !AGENTS[agentArg] && !args.config) {
    console.error(`Agente desconhecido: ${agentArg}\n`);
    console.error(usage());
    process.exitCode = 1;
    return;
  }

  let agentKey = AGENTS[agentArg] ? agentArg : "cursor";
  let configPath = args.config ? path.resolve(String(args.config)) : null;

  if (!configPath && agentArg === "auto") {
    const detected = await detectAgentConfig();
    if (!detected) {
      console.error("Nao encontrei um arquivo MCP conhecido para atualizar automaticamente.");
      console.error("Informe --agent antigravity|claude-desktop|cline-roo|cursor ou use --config.");
      process.exitCode = 1;
      return;
    }

    agentKey = detected.agentKey;
    configPath = detected.configPath;
  }

  if (!configPath) {
    configPath = AGENTS[agentKey].configPath;
  }

  const serverConfig = buildServerConfig(brainRoot, agentKey);

  if (args.print) {
    console.log(JSON.stringify({ mcpServers: { [SERVER_NAME]: serverConfig } }, null, 2));
    return;
  }

  await fs.mkdir(path.dirname(configPath), { recursive: true });
  const existingConfig = await readJsonOrEmpty(configPath);
  const previousServer = existingConfig.mcpServers?.[SERVER_NAME];
  const wasLegacy = hasLegacySymlinkConfig(previousServer);

  if (await exists(configPath)) {
    const backupPath = `${configPath}.${timestamp()}.backup.json`;
    await fs.copyFile(configPath, backupPath);
    console.log(`Backup criado: ${backupPath}`);
  }

  existingConfig.mcpServers = existingConfig.mcpServers || {};
  existingConfig.mcpServers[SERVER_NAME] = serverConfig;

  await fs.writeFile(configPath, `${JSON.stringify(existingConfig, null, 2)}\n`, "utf8");

  console.log("Obsidian Brain MCP configurado.");
  console.log(`Agente: ${AGENTS[agentKey]?.label || agentKey}`);
  console.log(`BRAIN_ROOT: ${brainRoot}`);
  console.log(`Arquivo MCP: ${configPath}`);
  console.log(`Servidor atualizado: ${SERVER_NAME}`);
  console.log(`Configuracao legada por symlink detectada: ${wasLegacy ? "sim" : "nao"}`);
  console.log("Reinicie a IDE/agente e valide com a ferramenta brain_status.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
