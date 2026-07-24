import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";

interface Article {
  id: string;
  title: string;
  content: string;
  publishDate: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const ARTICLES_DIR = path.join(DATA_DIR, "articles");

// Standard seed articles matching the user wireframes
const SEED_ARTICLES: Article[] = [
  {
    id: "38",
    title: "My first article",
    publishDate: "2024-08-07",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
  },
  {
    id: "37",
    title: "Second article",
    publishDate: "2024-08-04",
    content: "Designing responsive layouts in React using Tailwind CSS is both a craft and a science. It's about proportion, visual rhythm, and elegant typography. By leveraging responsive screen modifiers, your personal blog fits naturally across smartphones, tablets, and wide desktop displays."
  },
  {
    id: "36",
    title: "Third article",
    publishDate: "2024-08-01",
    content: "A personal blog is the ultimate developer portfolio. It allows you to express your thoughts, share your technical journey, and document complex problem-solving. This blog demonstrates full-stack Node.js and React architecture with robust JSON filesystem persistence."
  },
  {
    id: "35",
    title: "Fourth article",
    publishDate: "2024-07-30",
    content: "Minimalism is not the lack of something. It's the perfect amount of something. In modern web design, utilizing generous negative space, high contrast, and crisp type combinations builds trust and helps users focus on the content itself."
  },
  {
    id: "34",
    title: "Fifth article",
    publishDate: "2024-07-21",
    content: "Typography is the voice of your brand. Selecting Inter for primary interface text paired with Space Grotesk for dramatic headings establishes a distinct aesthetic that elevates the visual quality of the personal blog layout."
  },
  {
    id: "33",
    title: "Sixth article",
    publishDate: "2024-07-15",
    content: "Creating seamless page transitions using motion makes your single-page applications feel fluid and native. When users navigate between the home page and individual articles, subtle fade effects guide their attention naturally."
  },
  {
    id: "32",
    title: "Seventh article",
    publishDate: "2024-07-08",
    content: "Full-stack development with React, Express, and Node.js remains one of the most productive tech stacks in the industry. It enables rapid prototyping with single-language consistency across both backend APIs and frontend user interfaces."
  },
  {
    id: "31",
    title: "Eighth article",
    publishDate: "2024-07-04",
    content: "Developing custom CMS dashboards doesn't have to be over-engineered. A clean, lightweight admin panel with instant create, update, and delete actions provides a clean workflows for content editors."
  },
  {
    id: "30",
    title: "Nineth Aritcle",
    publishDate: "2024-07-01",
    content: "We are continually refining our development practices to write modular, type-safe, and self-documenting code. This ensures software survives scale, remains easy to debug, and welcomes future feature additions gracefully."
  }
];


// Helper to ensure database structure and seed data exists
async function initializeDatabase() {
  try {
    await fs.mkdir(ARTICLES_DIR, { recursive: true });
    
    // Check if empty
    const files = await fs.readdir(ARTICLES_DIR);
    if (files.length === 0) {
      console.log("No articles found in data directory. Seeding default articles...");
      for (const article of SEED_ARTICLES) {
        const filePath = path.join(ARTICLES_DIR, `${article.id}.json`);
        await fs.writeFile(filePath, JSON.stringify(article, null, 2), "utf-8");
      }
      console.log("Seeding complete!");
    }
  } catch (error) {
    console.error("Failed to initialize filesystem database:", error);
  }
}

// Supabase Connection & Initialization
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI, Type } from "@google/genai";

let supabase: any = null;
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "";

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log("Supabase client initialized successfully!");
  } catch (err) {
    console.error("Error creating Supabase client:", err);
  }
} else {
  console.log("Supabase credentials not fully configured. Using local JSON files as primary database.");
}

// Database Helper Actions (Unified Interface with Fallbacks)
async function fetchAllArticlesInternal(): Promise<Article[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from("articles").select("*");
      if (error) throw error;
      if (data) {
        return data.map((item: any) => ({
          id: String(item.id),
          title: item.title,
          content: item.content,
          publishDate: item.publish_date
        }));
      }
    } catch (err: any) {
      console.warn("Supabase fetchAllArticles failed, falling back to local files:", err.message);
    }
  }

  // Filesystem fallback
  const files = await fs.readdir(ARTICLES_DIR);
  const articles: Article[] = [];
  for (const file of files) {
    if (file.endsWith(".json")) {
      const content = await fs.readFile(path.join(ARTICLES_DIR, file), "utf-8");
      try {
        articles.push(JSON.parse(content));
      } catch (e) {
        console.error(`Error parsing article file ${file}:`, e);
      }
    }
  }
  return articles;
}

async function fetchArticleByIdInternal(id: string): Promise<Article | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from("articles").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (data) {
        return {
          id: String(data.id),
          title: data.title,
          content: data.content,
          publishDate: data.publish_date
        };
      }
    } catch (err: any) {
      console.warn(`Supabase fetchArticleById (${id}) failed, falling back to local file:`, err.message);
    }
  }

  // Filesystem fallback
  const filePath = path.join(ARTICLES_DIR, `${id}.json`);
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    return null;
  }
}

async function createArticleInternal(title: string, content: string, publishDate: string): Promise<Article> {
  // Generate a new sequential ID
  let maxId = 0;
  try {
    const files = await fs.readdir(ARTICLES_DIR);
    for (const file of files) {
      if (file.endsWith(".json")) {
        const idNum = parseInt(file.replace(".json", ""), 10);
        if (!isNaN(idNum) && idNum > maxId) {
          maxId = idNum;
        }
      }
    }
  } catch (e) {}

  const newId = String(maxId + 1);
  const newArticle: Article = {
    id: newId,
    title,
    content,
    publishDate
  };

  // 1. Write to local filesystem as solid backup
  const filePath = path.join(ARTICLES_DIR, `${newId}.json`);
  await fs.writeFile(filePath, JSON.stringify(newArticle, null, 2), "utf-8");

  // 2. Write to Supabase if connected
  if (supabase) {
    try {
      const { error } = await supabase.from("articles").insert({
        id: newId,
        title,
        content,
        publish_date: publishDate
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Failed to write to Supabase during create:", err.message);
    }
  }

  return newArticle;
}

async function updateArticleInternal(id: string, title: string, content: string, publishDate: string): Promise<Article> {
  const updatedArticle: Article = {
    id,
    title,
    content,
    publishDate
  };

  // 1. Update filesystem
  const filePath = path.join(ARTICLES_DIR, `${id}.json`);
  await fs.writeFile(filePath, JSON.stringify(updatedArticle, null, 2), "utf-8");

  // 2. Update Supabase
  if (supabase) {
    try {
      const { error } = await supabase.from("articles").update({
        title,
        content,
        publish_date: publishDate
      }).eq("id", id);
      if (error) throw error;
    } catch (err: any) {
      console.error(`Failed to write to Supabase during update of article ${id}:`, err.message);
    }
  }

  return updatedArticle;
}

async function deleteArticleInternal(id: string): Promise<void> {
  // 1. Delete local file
  const filePath = path.join(ARTICLES_DIR, `${id}.json`);
  try {
    await fs.unlink(filePath);
  } catch (e) {}

  // 2. Delete Supabase
  if (supabase) {
    try {
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (error) throw error;
    } catch (err: any) {
      console.error(`Failed to delete from Supabase during delete of article ${id}:`, err.message);
    }
  }
}

async function startServer() {
  await initializeDatabase();

  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Endpoints
  
  // Get Supabase Configuration and connection status
  app.get("/api/supabase/status", async (req, res) => {
    const configured = !!(supabaseUrl && supabaseKey);
    let tableExists = false;
    let errorMsg = "";

    if (configured && supabase) {
      try {
        const { error } = await supabase.from("articles").select("id").limit(1);
        if (error) {
          errorMsg = error.message;
          if (error.code === "PGRST116" || error.code === "PGRST204" || error.message.includes("does not exist")) {
            tableExists = false;
          } else {
            tableExists = true; // exists but has some other warning/empty
          }
        } else {
          tableExists = true;
        }
      } catch (err: any) {
        errorMsg = err.message || "Unknown connection error";
        tableExists = false;
      }
    }

    res.json({
      configured,
      url: supabaseUrl ? supabaseUrl.substring(0, 15) + "..." : null,
      tableExists,
      error: errorMsg
    });
  });

  // Sync Local data to Supabase
  app.post("/api/supabase/sync", async (req, res) => {
    if (!supabase) {
      res.status(400).json({ error: "Supabase credentials are not configured on the server." });
      return;
    }

    try {
      const files = await fs.readdir(ARTICLES_DIR);
      const localArticles: Article[] = [];
      for (const file of files) {
        if (file.endsWith(".json")) {
          const content = await fs.readFile(path.join(ARTICLES_DIR, file), "utf-8");
          try {
            localArticles.push(JSON.parse(content));
          } catch (e) {}
        }
      }

      if (localArticles.length === 0) {
        res.json({ success: true, count: 0, message: "No local articles to sync." });
        return;
      }

      const supabasePayload = localArticles.map(a => ({
        id: a.id,
        title: a.title,
        content: a.content,
        publish_date: a.publishDate
      }));

      const { error } = await supabase.from("articles").upsert(supabasePayload);
      if (error) throw error;

      res.json({ success: true, count: localArticles.length });
    } catch (error: any) {
      console.error("Failed to sync database to Supabase:", error);
      res.status(500).json({ error: error.message || "Failed to sync to Supabase" });
    }
  });

  // 1. Get all articles
  app.get("/api/articles", async (req, res) => {
    try {
      const articles = await fetchAllArticlesInternal();
      
      // Sort descending by date, and then by id
      articles.sort((a, b) => {
        const dateCompare = b.publishDate.localeCompare(a.publishDate);
        if (dateCompare !== 0) return dateCompare;
        return Number(b.id) - Number(a.id);
      });
      
      res.json(articles);
    } catch (error) {
      console.error("Failed to fetch articles:", error);
      res.status(500).json({ error: "Failed to fetch articles" });
    }
  });

  // 2. Get a single article by ID
  app.get("/api/articles/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const article = await fetchArticleByIdInternal(id);
      if (article) {
        res.json(article);
      } else {
        res.status(404).json({ error: `Article with ID ${id} not found` });
      }
    } catch (error: any) {
      console.error(`Failed to fetch article ${id}:`, error);
      res.status(500).json({ error: "Failed to fetch article" });
    }
  });

  // 3. Create a new article
  app.post("/api/articles", async (req, res) => {
    try {
      const { title, content, publishDate } = req.body;
      
      if (!title || !content || !publishDate) {
        res.status(400).json({ error: "Title, content, and publishing date are required" });
        return;
      }
      
      const newArticle = await createArticleInternal(title, content, publishDate);
      res.status(201).json(newArticle);
    } catch (error) {
      console.error("Failed to create article:", error);
      res.status(500).json({ error: "Failed to create article" });
    }
  });

  // 4. Update an existing article
  app.put("/api/articles/:id", async (req, res) => {
    const { id } = req.params;
    const { title, content, publishDate } = req.body;
    
    try {
      const existing = await fetchArticleByIdInternal(id);
      if (!existing) {
        res.status(404).json({ error: `Article with ID ${id} not found` });
        return;
      }
      
      if (!title || !content || !publishDate) {
        res.status(400).json({ error: "Title, content, and publishing date are required" });
        return;
      }
      
      const updated = await updateArticleInternal(id, title, content, publishDate);
      res.json(updated);
    } catch (error: any) {
      console.error(`Failed to update article ${id}:`, error);
      res.status(500).json({ error: "Failed to update article" });
    }
  });

  // 5. Delete an article
  app.delete("/api/articles/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const existing = await fetchArticleByIdInternal(id);
      if (!existing) {
        res.status(404).json({ error: `Article with ID ${id} not found` });
        return;
      }
      await deleteArticleInternal(id);
      res.json({ message: `Article ${id} deleted successfully`, id });
    } catch (error: any) {
      console.error(`Failed to delete article ${id}:`, error);
      res.status(500).json({ error: "Failed to delete article" });
    }
  });

  // 6. MCP Server / AI Agent Playground Query Endpoint
  app.post("/api/agent/mcp-query", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ error: "Prompt is required." });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server. Please add it to your secrets panel." });
      return;
    }

    const mcpTools = [
      {
        functionDeclarations: [
          {
            name: "get_articles",
            description: "Get the complete list of journal articles with their ID, title, and publish date.",
            parameters: { type: Type.OBJECT, properties: {} }
          },
          {
            name: "read_article",
            description: "Read the full body text and details of a specific article by its ID.",
            parameters: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "The ID of the article to read." }
              },
              required: ["id"]
            }
          },
          {
            name: "create_article",
            description: "Create and publish a new article in the journal.",
            parameters: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "The title of the article." },
                content: { type: Type.STRING, description: "The body content of the article." },
                publishDate: { type: Type.STRING, description: "The publish date in YYYY-MM-DD format." }
              },
              required: ["title", "content", "publishDate"]
            }
          },
          {
            name: "delete_article",
            description: "Delete an article permanently from the database.",
            parameters: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "The ID of the article to delete." }
              },
              required: ["id"]
            }
          },
          {
            name: "refine_text",
            description: "Refine or write a high-quality paragraph on a topic using specific tones (minimal, academic, editorial).",
            parameters: {
              type: Type.OBJECT,
              properties: {
                topic: { type: Type.STRING, description: "The topic or outline to expand or rewrite." },
                tone: { type: Type.STRING, description: "The tone style: 'minimal', 'academic', or 'editorial'." }
              },
              required: ["topic", "tone"]
            }
          }
        ]
      }
    ];

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const trace: any[] = [];
      trace.push({ sender: "Client", type: "request", message: prompt });

      let messages: any[] = [
        { role: "user", parts: [{ text: prompt }] }
      ];

      let loopCount = 0;
      const maxLoops = 3;
      let finalMessage = "";

      while (loopCount < maxLoops) {
        loopCount++;
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: messages,
          config: {
            systemInstruction: "You are 'The Journal Agent', an elite full-stack editorial assistant operating an MCP Server to manage a journal database. You have direct database tools. Use them to answer questions, write drafts, delete entries, or summarize the journal index. Always answer concisely, elegantly, and professionally. Keep technical jargon clean.",
            tools: mcpTools,
            toolConfig: { includeServerSideToolInvocations: true }
          }
        });

        const functionCalls = response.functionCalls;
        const replyText = response.text;

        if (functionCalls && functionCalls.length > 0) {
          const call = functionCalls[0];
          trace.push({
            sender: "MCP Server",
            type: "tool_call",
            name: call.name,
            arguments: call.args
          });

          let toolResult: any;
          try {
            if (call.name === "get_articles") {
              const list = await fetchAllArticlesInternal();
              toolResult = list.map(a => ({ id: a.id, title: a.title, publishDate: a.publishDate }));
            } else if (call.name === "read_article") {
              const { id } = call.args as any;
              const article = await fetchArticleByIdInternal(id);
              toolResult = article || { error: `Article ${id} not found` };
            } else if (call.name === "create_article") {
              const { title, content, publishDate } = call.args as any;
              const created = await createArticleInternal(title, content, publishDate);
              toolResult = { success: true, article: created };
            } else if (call.name === "delete_article") {
              const { id } = call.args as any;
              await deleteArticleInternal(id);
              toolResult = { success: true, message: `Article ${id} deleted` };
            } else if (call.name === "refine_text") {
              const { topic, tone } = call.args as any;
              const refineRes = await ai.models.generateContent({
                model: "gemini-3.5-flash",
                contents: `Write a beautiful, highly polished blog post body paragraph about: "${topic}". Tone style: "${tone}". Keep it extremely elegant and engaging. Do not include markdown headers or title, just 1-2 paragraphs of body text.`,
              });
              toolResult = { text: refineRes.text };
            } else {
              toolResult = { error: `Tool ${call.name} not supported` };
            }
          } catch (err: any) {
            toolResult = { error: err.message || "Execution error" };
          }

          trace.push({
            sender: "MCP Server",
            type: "tool_response",
            name: call.name,
            result: toolResult
          });

          // Feed result back to Gemini
          messages.push(response.candidates?.[0]?.content);
          messages.push({
            role: "user",
            parts: [{
              functionResponse: {
                name: call.name,
                response: toolResult
              }
            }]
          });
        } else {
          if (replyText) {
            finalMessage = replyText;
            trace.push({
              sender: "Journal Agent",
              type: "response",
              message: replyText
            });
          }
          break;
        }
      }

      res.json({
        success: true,
        response: finalMessage || "Agent finished execution.",
        trace
      });

    } catch (err: any) {
      console.error("AI Agent query failed:", err);
      res.status(500).json({ error: err.message || "Failed to query the AI Agent" });
    }
  });

  // Serve Frontend and Setup Vite Middleware
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite server middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving production static assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express Backend with Vite running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

