# Project Agents & Skills Guidelines (Claude AI Engine)

This project integrates Claude for server-side AI functionality, using specialized AI skills and subagent definitions.

## Directory Structure
```
.claude/
├── skills/
│   └── article-editor/
│       └── SKILL.md       # Article drafting, editing & MCP database tool definitions
└── agents/
    └── cms-content-agent.md # Specialized Claude AI Subagent for CMS operations
```

## Configured Subagents & Skills

### 1. Skill: `article-editor`
- **Location:** `.claude/skills/article-editor/SKILL.md`
- **Purpose:** Defines functional parameters and tools (`get_articles`, `read_article`, `create_article`, `delete_article`, `refine_text`) for Claude to interact safely with local JSON and Supabase storage.

### 2. Subagent: `cms-content-agent`
- **Location:** `.claude/agents/cms-content-agent.md`
- **Purpose:** Automated editorial subagent that leverages Claude server-side for blog management, proofreading, and natural language database operations.
