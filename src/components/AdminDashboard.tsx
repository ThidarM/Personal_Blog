import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Article, ViewType } from "../types";
import { formatDate } from "../utils";
import { 
  Plus, Edit2, Trash2, Search, AlertCircle, CheckCircle2, 
  Database, Bot, Terminal, BookOpen, ArrowRight, RefreshCw, 
  Copy, Check, FileText, Sparkles 
} from "lucide-react";

interface AdminDashboardProps {
  articles: Article[];
  onNavigate: (view: ViewType) => void;
  onDeleteArticle: (id: string) => Promise<boolean>;
}

interface SupabaseStatus {
  configured: boolean;
  url: string | null;
  tableExists: boolean;
  error: string;
}

interface TraceItem {
  sender: string;
  type: string;
  name?: string;
  message?: string;
  arguments?: any;
  result?: any;
}

export default function AdminDashboard({ articles, onNavigate, onDeleteArticle }: AdminDashboardProps) {
  // Tabs: "articles" | "mcp" | "supabase"
  const [activeTab, setActiveTab] = useState<"articles" | "mcp" | "supabase">("articles");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Supabase Sync states
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseStatus | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);

  // Agent / MCP states
  const [agentInput, setAgentInput] = useState("");
  const [agentTrace, setAgentTrace] = useState<TraceItem[]>([
    {
      sender: "Journal Agent",
      type: "response",
      message: "Hello! I am your Journal Agent. I run on an MCP (Model Context Protocol) Server, meaning I have direct access to database tools like list, read, write, and refine. Try asking me to: 'List all my articles', 'Write a short blog post about React and save it', or 'Read article 38'."
    }
  ]);
  const [agentLoading, setAgentLoading] = useState(false);
  const traceEndRef = useRef<HTMLDivElement>(null);

  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchSupabaseStatus();
  }, []);

  useEffect(() => {
    if (traceEndRef.current) {
      traceEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [agentTrace, agentLoading]);

  const fetchSupabaseStatus = async () => {
    try {
      const res = await fetch("/api/supabase/status");
      if (res.ok) {
        const data = await res.json();
        setSupabaseStatus(data);
      }
    } catch (e) {
      console.error("Failed to fetch Supabase status:", e);
    }
  };

  const handleSyncToSupabase = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/supabase/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSyncResult({
          text: `Success! Synchronized ${data.count} articles to your Supabase articles table.`,
          type: "success"
        });
        fetchSupabaseStatus();
      } else {
        setSyncResult({
          text: `Sync Failed: ${data.error || "Unknown server error."}`,
          type: "error"
        });
      }
    } catch (err: any) {
      setSyncResult({
        text: `Sync Failed: ${err.message || "Network failure."}`,
        type: "error"
      });
    } finally {
      setSyncing(false);
    }
  };

  const copySqlSchema = () => {
    const sql = `CREATE TABLE articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  publish_date TEXT NOT NULL
);`;
    navigator.clipboard.writeText(sql);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const handleDeleteClick = (id: string) => {
    setIsDeletingId(id);
  };

  const confirmDelete = async (id: string) => {
    const success = await onDeleteArticle(id);
    if (success) {
      setMessage({ text: "Article deleted successfully", type: "success" });
      setTimeout(() => setMessage(null), 3500);
    } else {
      setMessage({ text: "Failed to delete article", type: "error" });
      setTimeout(() => setMessage(null), 3500);
    }
    setIsDeletingId(null);
  };

  const handleAgentQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentInput.trim() || agentLoading) return;

    const userInput = agentInput;
    setAgentInput("");
    setAgentLoading(true);

    // Append client input to trace immediately
    setAgentTrace((prev) => [
      ...prev,
      { sender: "Client", type: "request", message: userInput }
    ]);

    try {
      const res = await fetch("/api/agent/mcp-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userInput })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.trace) {
          setAgentTrace(data.trace);
        }
      } else {
        setAgentTrace((prev) => [
          ...prev,
          { sender: "System", type: "error", message: data.error || "Model request error." }
        ]);
      }
    } catch (err: any) {
      setAgentTrace((prev) => [
        ...prev,
        { sender: "System", type: "error", message: err.message || "Failed to contact agent." }
      ]);
    } finally {
      setAgentLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="max-w-4xl mx-auto py-8 px-4 sm:px-6"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`fixed top-20 right-4 sm:right-10 z-50 flex items-center space-x-2 px-4 py-3 rounded-none border border-black bg-white shadow-md font-semibold text-xs uppercase tracking-wider ${
              message.type === "success"
                ? "bg-stone-900 text-[#F8F7F2] border-stone-800"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 size={14} className="text-emerald-400 stroke-[2.5]" />
            ) : (
              <AlertCircle size={14} className="text-red-500" />
            )}
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-2 border-black pb-5 mb-6 gap-4">
        <div>
          <span className="micro-caps text-stone-500 font-bold tracking-[0.18em]">Control Center</span>
          <h1 className="font-serif text-4xl font-black text-stone-900 mt-1">
            CMS Dashboard
          </h1>
        </div>

        <button
          id="add-article-btn"
          onClick={() => onNavigate({ name: "new" })}
          className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-black border border-black text-[#F8F7F2] hover:bg-stone-800 rounded-none text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
        >
          <Plus size={13} className="stroke-[2.5]" />
          <span>New Article</span>
        </button>
      </div>

      {/* Elegant Tab Controls */}
      <div className="flex border-b border-stone-300 mb-8 font-mono text-xs uppercase tracking-wider gap-2">
        <button
          onClick={() => setActiveTab("articles")}
          className={`px-4 py-2.5 flex items-center space-x-2 border-b-2 -mb-[1px] transition-all cursor-pointer font-semibold ${
            activeTab === "articles"
              ? "border-black text-black font-black"
              : "border-transparent text-stone-500 hover:text-black"
          }`}
        >
          <BookOpen size={13} />
          <span>Chronicles Catalog</span>
        </button>

        <button
          onClick={() => setActiveTab("mcp")}
          className={`px-4 py-2.5 flex items-center space-x-2 border-b-2 -mb-[1px] transition-all cursor-pointer font-semibold ${
            activeTab === "mcp"
              ? "border-black text-black font-black"
              : "border-transparent text-stone-500 hover:text-black"
          }`}
        >
          <Bot size={13} />
          <span className="flex items-center gap-1">
            MCP Agent Console
            <Sparkles size={11} className="text-purple-600 fill-purple-600" />
          </span>
        </button>

        <button
          onClick={() => setActiveTab("supabase")}
          className={`px-4 py-2.5 flex items-center space-x-2 border-b-2 -mb-[1px] transition-all cursor-pointer font-semibold ${
            activeTab === "supabase"
              ? "border-black text-black font-black"
              : "border-transparent text-stone-500 hover:text-black"
          }`}
        >
          <Database size={13} />
          <span>Supabase Sync</span>
        </button>
      </div>

      {/* Tab Contents */}
      <AnimatePresence mode="wait">
        {activeTab === "articles" && (
          <motion.div
            key="articles-tab"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {/* Stats Cards & Search */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="bg-white border border-black p-4 flex flex-col justify-between">
                <span className="micro-caps text-stone-500 font-bold">Total Chronicles</span>
                <span className="text-3xl font-serif font-bold text-stone-900 mt-2">{articles.length}</span>
              </div>
              <div className="bg-white border border-black p-4 sm:col-span-2 flex items-center">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={14} />
                  <input
                    type="text"
                    placeholder="Search published articles by title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-none text-xs font-sans placeholder-stone-400 focus:outline-none focus:border-black focus:bg-white transition-all font-light"
                  />
                </div>
              </div>
            </div>

            {/* Main CMS Card Table */}
            <div className="bg-white border border-black overflow-hidden">
              <div className="p-4 bg-stone-100 border-b border-black flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-stone-800 font-bold">
                <span>Article title</span>
                <span className="hidden sm:inline">Actions</span>
              </div>

              {filteredArticles.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <p className="text-stone-500 italic font-serif text-base">
                    {searchTerm ? "No matching articles found." : "No articles published yet."}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={() => onNavigate({ name: "new" })}
                      className="mt-4 text-xs text-stone-900 font-bold uppercase tracking-wider underline hover:text-stone-700 cursor-pointer"
                    >
                      Create your first article
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-stone-200">
                  {filteredArticles.map((article) => (
                    <div
                      key={article.id}
                      className="p-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-[#F8F7F2]/50 transition-all"
                    >
                      {/* Left Side: Text Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h2 className="font-serif text-lg font-bold text-stone-950 truncate">
                            {article.title}
                          </h2>
                          <span className="text-[9px] font-mono text-stone-500 bg-stone-100 border border-stone-300 px-1.5 py-0.5 font-bold uppercase">
                            ID: {article.id}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 font-mono mt-1 font-semibold uppercase tracking-wider">
                          Published: {formatDate(article.publishDate)}
                        </p>
                      </div>

                      {/* Right Side: Action Buttons */}
                      <div className="flex items-center space-x-2 self-end sm:self-center">
                        <AnimatePresence mode="wait">
                          {isDeletingId === article.id ? (
                            <motion.div
                              key="confirm"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="flex items-center space-x-2 bg-red-50 border border-red-200 p-1"
                            >
                              <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider px-2">Delete permanently?</span>
                              <button
                                onClick={() => confirmDelete(article.id)}
                                className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setIsDeletingId(null)}
                                className="bg-stone-200 hover:bg-stone-300 text-stone-700 text-[10px] font-bold uppercase tracking-wider px-2 py-1 cursor-pointer"
                              >
                                Cancel
                              </button>
                            </motion.div>
                          ) : (
                            <motion.div key="normal" className="flex items-center space-x-2">
                              <button
                                id={`edit-article-${article.id}`}
                                onClick={() => onNavigate({ name: "edit", articleId: article.id })}
                                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 border border-stone-300 hover:border-black text-stone-800 hover:bg-stone-50 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                              >
                                <Edit2 size={11} />
                                <span>Edit</span>
                              </button>

                              <button
                                id={`delete-article-${article.id}`}
                                onClick={() => handleDeleteClick(article.id)}
                                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 border border-transparent hover:border-red-200 text-stone-400 hover:text-red-600 hover:bg-red-50 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                              >
                                <Trash2 size={11} />
                                <span>Delete</span>
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "mcp" && (
          <motion.div
            key="mcp-tab"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Info Banner */}
            <div className="bg-purple-50/50 border border-purple-200 p-4 text-stone-850 flex items-start space-x-3">
              <Bot className="text-purple-600 stroke-[2] shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-purple-950">Model Context Protocol (MCP) Simulated Server</h4>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  This console demonstrates a complete **MCP Server / Client** architecture. The Journal Agent is powered by the server-side **Gemini API** and operates tools connected to your data engine. When you request actions, you can watch the trace of the model coordinating tool calls and executing SQL/database actions dynamically.
                </p>
              </div>
            </div>

            {/* Simulated Terminal Screen */}
            <div className="bg-stone-900 border border-black flex flex-col h-[420px]">
              {/* Terminal Header */}
              <div className="bg-stone-800 border-b border-black px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                  <span className="font-mono text-[10px] text-stone-400 uppercase tracking-widest pl-2 flex items-center gap-1.5">
                    <Terminal size={11} />
                    MCP-JOURNAL-SERVER://v1.0.0
                  </span>
                </div>
                <span className="font-mono text-[9px] text-purple-400 font-semibold uppercase bg-purple-950/80 px-2 py-0.5 rounded-none border border-purple-900">
                  Gemini-3.5-Flash
                </span>
              </div>

              {/* Terminal Logs/Trace */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 font-mono scrollbar-thin">
                {agentTrace.map((item, idx) => {
                  if (item.sender === "Client") {
                    return (
                      <div key={idx} className="flex justify-end">
                        <div className="bg-stone-800 text-stone-100 max-w-[85%] p-3 border border-stone-700 text-xs font-sans">
                          <span className="font-mono text-[9px] text-stone-400 block mb-1 uppercase font-semibold">User Query:</span>
                          {item.message}
                        </div>
                      </div>
                    );
                  }

                  if (item.type === "tool_call") {
                    return (
                      <div key={idx} className="bg-purple-950/40 border border-purple-900/50 p-3 max-w-[90%] text-[11px] text-purple-200">
                        <span className="text-purple-400 font-bold uppercase text-[9px] tracking-wider block mb-1">
                          [MCP CLIENT] → Call Tool: {item.name}()
                        </span>
                        <div className="bg-purple-950/80 border border-purple-900 p-1.5 text-[10px] text-purple-300 font-mono rounded-none">
                          arguments: {JSON.stringify(item.arguments, null, 2)}
                        </div>
                      </div>
                    );
                  }

                  if (item.type === "tool_response") {
                    return (
                      <div key={idx} className="bg-stone-950 border border-stone-800 p-3 max-w-[90%] text-[11px] text-stone-300 ml-4">
                        <span className="text-emerald-400 font-bold uppercase text-[9px] tracking-wider block mb-1">
                          [MCP SERVER] ← Tool Response: {item.name}()
                        </span>
                        <div className="bg-stone-900/80 p-1.5 text-[10px] text-emerald-300 font-mono rounded-none border border-stone-800 max-h-36 overflow-auto">
                          result: {JSON.stringify(item.result, null, 2)}
                        </div>
                      </div>
                    );
                  }

                  if (item.type === "error") {
                    return (
                      <div key={idx} className="bg-red-950/40 border border-red-900 text-red-200 p-3 text-xs">
                        <span className="text-red-400 font-bold uppercase text-[9px] block mb-1">[SYSTEM ERROR]</span>
                        {item.message}
                      </div>
                    );
                  }

                  // Standard response
                  return (
                    <div key={idx} className="flex justify-start">
                      <div className="bg-amber-50/5 text-stone-200 max-w-[90%] p-3.5 border border-amber-900/40 text-xs font-sans leading-relaxed">
                        <span className="font-mono text-[9px] text-amber-400 block mb-1 uppercase font-bold tracking-wider">
                          The Journal Agent:
                        </span>
                        {item.message}
                      </div>
                    </div>
                  );
                })}

                {agentLoading && (
                  <div className="flex items-center space-x-2 text-stone-400 text-xs font-mono">
                    <RefreshCw className="animate-spin text-purple-400" size={12} />
                    <span>Journal Agent is thinking and executing MCP tools...</span>
                  </div>
                )}
                <div ref={traceEndRef} />
              </div>

              {/* Terminal Form Input */}
              <form onSubmit={handleAgentQuery} className="border-t border-black bg-stone-950 p-2 flex gap-2">
                <div className="flex-1 relative flex items-center">
                  <span className="absolute left-3 font-mono text-purple-400 text-xs font-bold">$</span>
                  <input
                    type="text"
                    disabled={agentLoading}
                    value={agentInput}
                    onChange={(e) => setAgentInput(e.target.value)}
                    placeholder="Command the Journal Agent (e.g. 'Write an article on Supabase DB and save it')..."
                    className="w-full bg-stone-900 border border-stone-800 pl-7 pr-3 py-2 text-xs font-mono text-[#F8F7F2] placeholder-stone-500 focus:outline-none focus:border-purple-600"
                  />
                </div>
                <button
                  type="submit"
                  disabled={agentLoading || !agentInput.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-[#F8F7F2] px-4 py-2 font-mono text-xs uppercase font-bold tracking-wider border border-purple-500 disabled:opacity-40 transition-all cursor-pointer flex items-center space-x-1"
                >
                  <span>Query</span>
                  <ArrowRight size={12} />
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {activeTab === "supabase" && (
          <motion.div
            key="supabase-tab"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Status Panel */}
            <div className="bg-white border border-black p-6">
              <h3 className="font-serif text-lg font-bold text-stone-900 mb-4 flex items-center justify-between">
                <span>Supabase Connection Health Check</span>
                <span className="font-mono text-xs text-stone-500 uppercase">Status Panel</span>
              </h3>

              {!supabaseStatus ? (
                <div className="flex items-center space-x-2 text-stone-500 py-4 font-mono text-xs">
                  <RefreshCw className="animate-spin" size={14} />
                  <span>Checking database environment configuration...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Status Badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border border-stone-200 p-3 bg-stone-50 flex items-center justify-between">
                      <span className="text-xs font-mono uppercase text-stone-500 font-bold">Environment Keys</span>
                      {supabaseStatus.configured ? (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono text-[10px] font-bold px-2 py-0.5 uppercase">
                          CONFIGURED
                        </span>
                      ) : (
                        <span className="bg-red-50 text-red-800 border border-red-200 font-mono text-[10px] font-bold px-2 py-0.5 uppercase">
                          MISSING
                        </span>
                      )}
                    </div>

                    <div className="border border-stone-200 p-3 bg-stone-50 flex items-center justify-between">
                      <span className="text-xs font-mono uppercase text-stone-500 font-bold">Articles Table Connection</span>
                      {supabaseStatus.tableExists ? (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono text-[10px] font-bold px-2 py-0.5 uppercase">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="bg-red-50 text-red-800 border border-red-200 font-mono text-[10px] font-bold px-2 py-0.5 uppercase">
                          NOT FOUND / INACTIVE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Subtitle Details */}
                  {supabaseStatus.configured ? (
                    <div className="bg-emerald-50/40 border border-emerald-200 p-4 text-xs space-y-2">
                      <div className="font-mono text-emerald-950 font-bold uppercase flex items-center gap-1.5 text-[10px]">
                        <CheckCircle2 size={13} className="text-emerald-500 stroke-[2.5]" />
                        Supabase credentials successfully loaded.
                      </div>
                      <p className="text-stone-600 leading-relaxed font-light">
                        The backend database client is initialized pointing to **{supabaseStatus.url}**. New edits and journal additions will propagate immediately to your Supabase host.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-yellow-50/50 border border-yellow-200 p-4 text-xs space-y-2">
                      <div className="font-mono text-yellow-950 font-bold uppercase flex items-center gap-1.5 text-[10px]">
                        <AlertCircle size={13} className="text-yellow-600 stroke-[2.5]" />
                        Running in Filesystem Backup Fallback Mode
                      </div>
                      <p className="text-stone-600 leading-relaxed font-light">
                        To activate Supabase cloud persistence, configure the following secrets via Settings → Secrets in the AI Studio UI:
                      </p>
                      <ul className="list-disc pl-5 font-mono text-[10px] text-stone-700 space-y-1 mt-1 font-semibold">
                        <li>SUPABASE_URL</li>
                        <li>SUPABASE_ANON_KEY</li>
                      </ul>
                      <p className="text-stone-600 leading-relaxed font-light mt-1">
                        *Note: Until credentials are provided, your chronicles are fully safe and persisted locally in JSON format.*
                      </p>
                    </div>
                  )}

                  {/* Schema Missing Instruction */}
                  {supabaseStatus.configured && !supabaseStatus.tableExists && (
                    <div className="bg-red-50/50 border border-red-200 p-4 text-xs space-y-2">
                      <div className="font-mono text-red-950 font-bold uppercase flex items-center gap-1.5 text-[10px]">
                        <AlertCircle size={13} className="text-red-500 stroke-[2.5]" />
                        Supabase Relation Articles Missing
                      </div>
                      <p className="text-stone-600 leading-relaxed font-light">
                        We can connect to your Supabase URL, but the **`articles`** table does not exist in your schema. Paste the SQL script below into your **Supabase SQL Editor** to bootstrap it:
                      </p>

                      <div className="relative mt-2 font-mono text-[11px] bg-stone-950 text-stone-100 p-3 overflow-auto border border-stone-800">
                        <pre>{`CREATE TABLE articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  publish_date TEXT NOT NULL
);`}</pre>
                        <button
                          onClick={copySqlSchema}
                          className="absolute right-2 top-2 p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition-all cursor-pointer"
                          title="Copy to Clipboard"
                        >
                          {copiedSchema ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sync Manager */}
            {supabaseStatus?.configured && supabaseStatus?.tableExists && (
              <div className="bg-white border border-black p-6">
                <h3 className="font-serif text-lg font-bold text-stone-900 mb-3">
                  Synchronize Local Backups
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed mb-4">
                  If you started this project using the local JSON files and now want to propagate all pre-seeded articles (including customized entries) up to your Supabase Cloud Database, run the sync operator below.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 border-t border-stone-100">
                  <div className="flex items-center space-x-2 text-stone-500 text-xs font-mono font-semibold">
                    <FileText size={14} />
                    <span>{articles.length} Chronicles locally cached</span>
                  </div>

                  <button
                    onClick={handleSyncToSupabase}
                    disabled={syncing}
                    className="inline-flex items-center justify-center space-x-2 bg-black hover:bg-stone-800 disabled:bg-stone-300 text-[#F8F7F2] font-mono text-xs uppercase font-bold tracking-wider px-4 py-2.5 transition-all cursor-pointer"
                  >
                    <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
                    <span>{syncing ? "Syncing..." : "Sync to Supabase"}</span>
                  </button>
                </div>

                {/* Sync Toast Result */}
                {syncResult && (
                  <div className={`mt-4 p-3 border text-xs font-mono ${
                    syncResult.type === "success" 
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                      : "bg-red-50 text-red-800 border-red-200"
                  }`}>
                    {syncResult.text}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
