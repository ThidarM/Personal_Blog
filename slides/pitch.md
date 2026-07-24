---
marp: true
theme: default
paginate: true
size: 16:9
transition: fade
auto-advance: 20
---

# Personal Blog CMS
### Resilient Dual-Engine Journal & Simulated MCP AI Copilot
One Developer · Two Database Engines · AI-Powered Console
**Stack:** React 19 · Node.js Express · Supabase Postgres · Gemini 3.5 Flash
**Built:** AI Studio Build · Jul 2026

---

# Who's my person?

People who want an eye-safe, exceptionally beautiful personal writing space—authoring content offline-first with absolute data ownership, backing it up to the cloud, and managing content safely using conversational AI.

*   **Developers & Tech Writers:** Who love markdown, clean types, and structural simplicity.
*   **Minimalist Bloggers:** Who want a zero-configuration editor to start writing immediately.
*   **AI Pioneers:** Ready to explore secure Model Context Protocol (MCP) data operations.

---

# The Problem & The Pipeline

Setting up a personal blog is usually hindered by over-engineered databases or locked-down SaaS clouds. 

| BEFORE: Rigid & Exposed | AFTER: Personal Blog CMS |
| :--- | :--- |
| 📝 Content locked inside heavy cloud databases | 📋 Flat-file local JSON backups (`data/articles/*.json`) |
| ❌ Immediate Postgres setup required to boot | ⚡ Starts instantly offline, one-click cloud sync |
| ❌ Static form editors with zero writing support | 🤖 Next-gen conversational AI editor console |
| ❌ Exposed database/model secrets in client code | 🔒 100% Server-side API and database proxies |

**Flow:** LOCAL AUTHORING → LOCAL FILE BACKUP → SUPABASE CLOUD SYNC → MCP REFINEMENT

---

# Real Techniques: Dual-Engine & Supabase Sync

Our core architecture utilizes a dual-layered database engine for absolute availability.

*   **Offline-First Backing:** The Express server automatically checks local directories, seeding and serving default files with zero database configuration.
*   **One-Click Cloud Sync:** The server maps local JSON archives, connects to Supabase, and performs secure batch syncs with direct ID deduplication.
*   **Supabase Row-Level Security (RLS) policies:**
    ```sql
    -- Relational security rules written in PostgreSQL to allow synchronization
    ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow public insert" ON articles FOR INSERT WITH CHECK (true);
    ```

---

# Real Techniques: Page Transitions & Routing

The application replicates native navigation fluidity using lightweight hash routing and CSS transitions.

*   **Hash-Based Router:** Monitors `hashchange` events (`#/home`, `#/article/:id`, `#/admin`) preventing full browser window reloads.
*   **Hardware-Accelerated Fade Transitions:** Integrated via Framer Motion's `<AnimatePresence mode="wait">` to coordinate entry and exit schedules.
*   **Transition Curves:**
    ```tsx
    // Subtle, hardware-accelerated fade with structural transform offsets
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
    ```

---

# Real Techniques: Responsive Grid & Typography

The editor is styled using modern Swiss design aesthetics that scale elegantly across screen widths.

*   **Fluid Column Metrics:** Built on a responsive 12-column grid (`grid-cols-1 md:grid-cols-12`) to distribute visual density.
    *   **Sidebar (4 Columns):** Houses real-time system metrics, volume details, and operational states.
    *   **Content Feed (8 Columns):** Houses the main chronicles stream.
*   **Swiss Typography Pairings:**
    *   **Headings:** Bold geometric **Space Grotesk** display titles.
    *   **Body Copy:** Comfortably spaced **Inter** body text designed for readability.
    *   **System Indicators:** Monospace fonts for data blocks and statuses.

---

# Real Techniques: Simulated MCP Agent Console

A real server-side conversational AI editor console grounded in your actual project files.

*   **Direct Database Schema Tooling:** The Express backend declares structured tool schemas directly to the Google GenAI SDK (`@google/genai`).
*   **Tool Capabilities:**
    *   `get_articles`: Queries the database list.
    *   `read_article`: Fetches full content states.
    *   `refine_text`: Applies smart editorial formatting and summarizes posts.
*   **Perfect Grounding:** Because Gemini reads real database entries before performing updates, hallucinations are completely eliminated.

---

# Results & Lessons Learned

| By the Numbers | Key Takeaways |
| :--- | :--- |
| **11+ Default Articles** | 1. **Offline Velocity**: Writing instantly without databases boosts initial developer flow. |
| **2 Storage Engines** | 2. **Backend Proxying**: Keeping API clients server-side is the only way to hide secrets. |
| **5 Native MCP Schema Tools** | 3. **Smooth Transitions**: Using `AnimatePresence` with `mode="wait"` removes layout flicker. |
| **1 Compiled CJS Bundle** | 4. **Unified Type scale**: Inter + Space Grotesk creates high editorial contrast. |

---

# Future Publishing Roadmap

| NOW ✅ | NEXT 🔜 | LATER 🔮 |
| :--- | :--- | :--- |
| Resilient local flat-file database | Multi-author login controls with JWT auth | Real-time collaborative co-authoring |
| Secure Supabase Cloud sync bridge | Split-screen Markdown visual editor | Standalone external MCP Server host |
| Simulated MCP Gemini Console | Automated cron-scheduled backups | Mobile-ready PWA offline client app |

**Built with AI Studio Build · Jul 2026 · Spec-driven, agent-assisted, secure by default.**
