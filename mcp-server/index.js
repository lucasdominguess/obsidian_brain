import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BRAIN_ROOT = path.resolve(__dirname, "../");
const SKILLS_DIR = path.join(BRAIN_ROOT, "Skills");
const DOCKS_DIR = path.join(BRAIN_ROOT, "Docks");

// Create the MCP Server
const server = new McpServer({
    name: "obsidian-brain-mcp",
    version: "1.0.0"
});

/**
 * Helper: Recursively find markdown files in a directory
 */
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

// Tool: list_skills
server.tool(
    "list_skills",
    "List all available skills and documents in the Obsidian Brain",
    {},
    async () => {
        const skillsFiles = await findMarkdownFiles(SKILLS_DIR);
        const docksFiles = await findMarkdownFiles(DOCKS_DIR);

        const formatPath = (p) => path.relative(BRAIN_ROOT, p).replace(/\\/g, "/");

        const items = [
            ...skillsFiles.map(formatPath),
            ...docksFiles.map(formatPath)
        ];

        return {
            content: [{ type: "text", text: `Available Brain files:\n${items.join("\n")}` }]
        };
    }
);

// Tool: read_file
server.tool(
    "read_file",
    "Read the content of a specific file from the Obsidian Brain (e.g., 'Skills/skill-front.md').",
    {
        filePath: z.string().describe("Relative path to the file (e.g., Skills/skill-front.md)")
    },
    async ({ filePath }) => {
        try {
            const fullPath = path.join(BRAIN_ROOT, filePath);
            // Security check: prevent directory traversal outside BRAIN_ROOT
            if (!fullPath.startsWith(BRAIN_ROOT)) {
                return {
                    content: [{ type: "text", text: "Error: Invalid path. Access denied." }],
                    isError: true
                };
            }

            const content = await fs.readFile(fullPath, "utf-8");
            return {
                content: [{ type: "text", text: content }]
            };
        } catch (error) {
            return {
                content: [{ type: "text", text: `Error reading file: ${error.message}` }],
                isError: true
            };
        }
    }
);

// Tool: search_brain
server.tool(
    "search_brain",
    "Search for a keyword or phrase across all Markdown files in the Obsidian Brain. Returns excerpts.",
    {
        query: z.string().describe("Keyword or phrase to search for")
    },
    async ({ query }) => {
        try {
            const allFiles = [
                ...(await findMarkdownFiles(SKILLS_DIR)),
                ...(await findMarkdownFiles(DOCKS_DIR))
            ];

            const lowerQuery = query.toLowerCase();
            let results = [];

            for (const file of allFiles) {
                const content = await fs.readFile(file, "utf-8");
                const lines = content.split("\n");
                let matchFound = false;
                let excerpts = [];

                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].toLowerCase().includes(lowerQuery)) {
                        matchFound = true;
                        // Get excerpt (2 lines before, 2 lines after)
                        const start = Math.max(0, i - 2);
                        const end = Math.min(lines.length - 1, i + 2);
                        const block = lines.slice(start, end + 1).join("\n");
                        excerpts.push(`--- Line ${i + 1} ---\n${block}`);
                    }
                }

                if (matchFound) {
                    const relPath = path.relative(BRAIN_ROOT, file).replace(/\\/g, "/");
                    results.push(`### File: ${relPath}\n${excerpts.join("\n\n")}`);
                }
            }

            if (results.length === 0) {
                return {
                    content: [{ type: "text", text: `No results found for "${query}"` }]
                };
            }

            return {
                content: [{ type: "text", text: `Search results for "${query}":\n\n${results.join("\n\n====================\n\n")}` }]
            };

        } catch (error) {
            return {
                content: [{ type: "text", text: `Error searching brain: ${error.message}` }],
                isError: true
            };
        }
    }
);

// Start the server
async function startServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Obsidian Brain MCP Server is running on stdio");
}

startServer().catch(console.error);
