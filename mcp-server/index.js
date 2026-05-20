import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configuredBrainRoot = process.env.OBSIDIAN_BRAIN_ROOT;
const BRAIN_ROOT = configuredBrainRoot
    ? path.resolve(configuredBrainRoot)
    : path.resolve(__dirname, "../");

const KNOWLEDGE_DIRS = ["Skills", "Docks", "ADRs", "Workflows", "Plans"];
const TOOL_NAMES = ["brain_status", "read_file", "read_section", "search_brain"];

const fileCache = new Map();

const server = new McpServer({
    name: "obsidian-brain-mcp",
    version: "1.1.0"
});

async function readFileCached(filePath) {
    const stat = await fs.stat(filePath);
    const cached = fileCache.get(filePath);
    if (cached && cached.mtimeMs === stat.mtimeMs) {
        return cached.content;
    }
    const content = await fs.readFile(filePath, "utf-8");
    fileCache.set(filePath, { mtimeMs: stat.mtimeMs, content });
    return content;
}

async function findMarkdownFiles(dir) {
    let results = [];
    try {
        const list = await fs.readdir(dir, { withFileTypes: true });
        for (const file of list) {
            const filePath = path.join(dir, file.name);
            if (file.isDirectory()) {
                if (!file.name.startsWith(".")) {
                    results = results.concat(await findMarkdownFiles(filePath));
                }
            } else if (file.name.endsWith(".md")) {
                results.push(filePath);
            }
        }
    } catch (e) {
        // Ignore if directory doesn't exist
    }
    return results;
}

async function collectBrainFiles() {
    const groups = await Promise.all(
        KNOWLEDGE_DIRS.map(async (dirName) => {
            const dirPath = path.join(BRAIN_ROOT, dirName);
            const files = await findMarkdownFiles(dirPath);
            return { dirName, dirPath, files };
        })
    );
    return groups;
}

function formatBrainPath(filePath) {
    return path.relative(BRAIN_ROOT, filePath).replace(/\\/g, "/");
}

function resolveBrainPath(filePath) {
    const fullPath = path.resolve(BRAIN_ROOT, filePath);
    const isInsideRoot = fullPath === BRAIN_ROOT || fullPath.startsWith(BRAIN_ROOT + path.sep);
    return { fullPath, isInsideRoot };
}

// Tool: brain_status — inventário completo (substitui list_skills)
server.tool(
    "brain_status",
    "Show the active Obsidian Brain root, indexed folders, available tools, and the full list of readable Markdown files (grouped by folder).",
    {},
    async () => {
        const groups = await collectBrainFiles();
        const lines = [
            `Brain root: ${BRAIN_ROOT}`,
            `Root source: ${configuredBrainRoot ? "OBSIDIAN_BRAIN_ROOT env" : "mcp-server relative fallback"}`,
            `Available tools: ${TOOL_NAMES.join(", ")}`,
            "",
            "Indexed folders:"
        ];
        for (const group of groups) {
            lines.push(`- ${group.dirName}: ${group.files.length} markdown file(s)`);
        }
        lines.push("", "Readable files (relative paths):");
        for (const group of groups) {
            if (group.files.length === 0) continue;
            lines.push(`\n# ${group.dirName}`);
            for (const f of group.files) {
                lines.push(`  ${formatBrainPath(f)}`);
            }
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
    }
);

// Tool: read_file — leitura completa de um arquivo
server.tool(
    "read_file",
    "Read the full content of a specific file from the Obsidian Brain (e.g., 'Skills/dev/skill-layers.md').",
    {
        filePath: z.string().describe("Relative path to the file (e.g., Skills/dev/skill-layers.md)")
    },
    async ({ filePath }) => {
        try {
            const { fullPath, isInsideRoot } = resolveBrainPath(filePath);
            if (!isInsideRoot) {
                return { content: [{ type: "text", text: "Error: Invalid path. Access denied." }], isError: true };
            }
            const content = await readFileCached(fullPath);
            return { content: [{ type: "text", text: content }] };
        } catch (error) {
            return { content: [{ type: "text", text: `Error reading file: ${error.message}` }], isError: true };
        }
    }
);

// Tool: read_section — leitura parcial (por heading ## ou ###)
server.tool(
    "read_section",
    "Read only one section of a Markdown file, delimited by a heading (## or ###). Saves tokens vs reading the full file. Heading match is case-insensitive substring.",
    {
        filePath: z.string().describe("Relative path to the file (e.g., Skills/dev/skill-layers.md)"),
        headingName: z.string().describe("Heading text to locate, without the leading ## or ### prefix. Case-insensitive substring match.")
    },
    async ({ filePath, headingName }) => {
        try {
            const { fullPath, isInsideRoot } = resolveBrainPath(filePath);
            if (!isInsideRoot) {
                return { content: [{ type: "text", text: "Error: Invalid path. Access denied." }], isError: true };
            }
            const content = await readFileCached(fullPath);
            const lines = content.split("\n");
            const needle = headingName.toLowerCase();
            let startIdx = -1;
            let startLevel = 0;
            for (let i = 0; i < lines.length; i++) {
                const m = lines[i].match(/^(#{2,6})\s+(.*)$/);
                if (m && m[2].toLowerCase().includes(needle)) {
                    startIdx = i;
                    startLevel = m[1].length;
                    break;
                }
            }
            if (startIdx === -1) {
                return { content: [{ type: "text", text: `Section matching "${headingName}" not found in ${filePath}.` }], isError: true };
            }
            let endIdx = lines.length;
            for (let i = startIdx + 1; i < lines.length; i++) {
                const m = lines[i].match(/^(#{1,6})\s+/);
                if (m && m[1].length <= startLevel) {
                    endIdx = i;
                    break;
                }
            }
            const section = lines.slice(startIdx, endIdx).join("\n");
            return { content: [{ type: "text", text: section }] };
        } catch (error) {
            return { content: [{ type: "text", text: `Error reading section: ${error.message}` }], isError: true };
        }
    }
);

// Tool: search_brain — grep with optional regex / case sensitivity / per-file cap
server.tool(
    "search_brain",
    "Search across all Markdown files in the Obsidian Brain. Defaults to case-insensitive substring; pass regex=true for full regex or caseSensitive=true to enforce case. Returns ranked excerpts capped per file.",
    {
        query: z.string().describe("Search term (substring by default, regex if regex=true)"),
        regex: z.boolean().optional().default(false).describe("Treat query as a JavaScript regex pattern"),
        caseSensitive: z.boolean().optional().default(false).describe("Enforce case sensitivity"),
        maxPerFile: z.number().int().positive().optional().default(3).describe("Maximum matches reported per file (default 3)")
    },
    async ({ query, regex, caseSensitive, maxPerFile }) => {
        try {
            const groups = await collectBrainFiles();
            const allFiles = groups.flatMap((g) => g.files);

            let matcher;
            if (regex) {
                try {
                    matcher = new RegExp(query, caseSensitive ? "" : "i");
                } catch (e) {
                    return { content: [{ type: "text", text: `Invalid regex: ${e.message}` }], isError: true };
                }
            } else {
                const needle = caseSensitive ? query : query.toLowerCase();
                matcher = {
                    test: (line) => (caseSensitive ? line : line.toLowerCase()).includes(needle)
                };
            }

            const results = [];
            for (const file of allFiles) {
                const content = await readFileCached(file);
                const lines = content.split("\n");
                const excerpts = [];
                for (let i = 0; i < lines.length && excerpts.length < maxPerFile; i++) {
                    if (matcher.test(lines[i])) {
                        const start = Math.max(0, i - 1);
                        const end = Math.min(lines.length - 1, i + 1);
                        const block = lines.slice(start, end + 1).join("\n");
                        excerpts.push(`--- Line ${i + 1} ---\n${block}`);
                    }
                }
                if (excerpts.length > 0) {
                    results.push(`### File: ${formatBrainPath(file)}\n${excerpts.join("\n\n")}`);
                }
            }

            if (results.length === 0) {
                return { content: [{ type: "text", text: `No results found for "${query}"` }] };
            }
            return { content: [{ type: "text", text: `Search results for "${query}" (regex=${regex}, caseSensitive=${caseSensitive}):\n\n${results.join("\n\n====================\n\n")}` }] };
        } catch (error) {
            return { content: [{ type: "text", text: `Error searching brain: ${error.message}` }], isError: true };
        }
    }
);

async function startServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Obsidian Brain MCP Server v1.1.0 running on stdio");
}

startServer().catch(console.error);
