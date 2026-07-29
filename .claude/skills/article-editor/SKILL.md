---
name: article-editor
description: Guidelines and tool definitions for drafting, refining, formatting, and managing articles in the Personal Blog CMS.
---

# Article Editor Skill

This skill defines the operational standards and tool execution patterns for managing blog posts and editorial content in the Personal Blog Journal & CMS.

## Overview
The Article Editor skill enables intelligent assistance for content creators through function calling capabilities. It provides standardized routines for:
1. **Article Generation & Drafting**: Formatting Markdown content with clear headings, concise introductions, and clean metadata (title, category, tags, read time).
2. **Editorial Refinement**: Polishing existing drafts for tone, clarity, grammar, and conciseness while preserving the author's original voice.
3. **Database & Schema Operations**: Interacting with backend storage engines (Local JSON / Supabase PostgreSQL) via structured tools (`get_articles`, `read_article`, `create_article`, `delete_article`, `refine_text`).

## Tool Definitions & API Handlers

### 1. `get_articles`
- **Purpose**: Retrieves all articles from the database.
- **Usage**: Use to inspect current articles, search titles, or check database inventory.

### 2. `read_article`
- **Parameters**: `id` (number or string)
- **Purpose**: Fetches full text content and metadata for a specific article.

### 3. `create_article`
- **Parameters**: `title` (string), `content` (string), `category` (string), `excerpt` (string)
- **Purpose**: Saves a new article entry into the CMS.

### 4. `refine_text`
- **Parameters**: `id` (number), `action` ("summarize" | "fix_grammar" | "editorial_polish" | "expand")
- **Purpose**: Processes an article's body text and updates stored content.

### 5. `delete_article`
- **Parameters**: `id` (number or string)
- **Purpose**: Removes an article entry from the active database.

## Quality & Editorial Guidelines
- **Typography & Formatting**: Always format body text using clean Markdown. Use `##` and `###` headers for logical structure.
- **Tone**: Maintain an engaging, concise, and professional tone suitable for tech, design, and personal journals.
- **Data Safety**: Ensure operations are executed server-side to maintain data security and consistency.
