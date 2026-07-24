# Project Agents & Skills Guidelines (Gemini AI Engine)

This project integrates Gemini 3.5 Flash for server-side AI functionality, using specialized AI skills and subagent definitions.

## Directory Structure
```
.gemini/
├── skills/
│   └── article-editor/
│       └── SKILL.md       # Article drafting, editing & MCP database tool definitions
└── agents/
    └── cms-content-agent.md # Specialized Gemini AI Subagent for CMS operations
```

## Configured Subagents & Skills

### 1. Skill: `article-editor`
- **Location:** `.gemini/skills/article-editor/SKILL.md`
- **Purpose:** Defines functional parameters and tools (`get_articles`, `read_article`, `create_article`, `delete_article`, `refine_text`) for Gemini 3.5 Flash to interact safely with local JSON and Supabase storage.

### 2. Subagent: `cms-content-agent`
- **Location:** `.gemini/agents/cms-content-agent.md`
- **Purpose:** Automated editorial subagent that leverages Gemini 3.5 Flash server-side for blog management, proofreading, and natural language database operations.
