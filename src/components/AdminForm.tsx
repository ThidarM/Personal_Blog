import React, { useState, useEffect, FormEvent } from "react";
import { motion } from "motion/react";
import { Article, ViewType } from "../types";
import { ArrowLeft, Save } from "lucide-react";

interface AdminFormProps {
  mode: "new" | "edit";
  articleId?: string;
  onNavigate: (view: ViewType) => void;
  onSubmit: (articleData: Omit<Article, "id">, id?: string) => Promise<boolean>;
}

export default function AdminForm({ mode, articleId, onNavigate, onSubmit }: AdminFormProps) {
  const [title, setTitle] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [content, setContent] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    title?: string;
    publishDate?: string;
    content?: string;
  }>({});

  // Fetch article if in Edit mode
  useEffect(() => {
    if (mode === "edit" && articleId) {
      setFetching(true);
      fetch(`/api/articles/${articleId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to load article data");
          }
          return res.json();
        })
        .then((data: Article) => {
          setTitle(data.title);
          setPublishDate(data.publishDate);
          setContent(data.content);
          setFetching(false);
        })
        .catch((err) => {
          setError(err.message || "Failed to load article");
          setFetching(false);
        });
    } else {
      // In Create mode, default the publish date to today in YYYY-MM-DD format
      const today = new Date().toISOString().split("T")[0];
      setPublishDate(today);
      setTitle("");
      setContent("");
      setError(null);
    }
  }, [mode, articleId]);

  const validate = () => {
    const errors: typeof validationErrors = {};
    if (!title.trim()) errors.title = "Article title is required";
    if (!publishDate) errors.publishDate = "Publishing date is required";
    if (!content.trim()) errors.content = "Article content is required";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError(null);

    const success = await onSubmit({ title, content, publishDate }, articleId);
    setLoading(false);

    if (success) {
      onNavigate({ name: "admin" });
    } else {
      setError(`Failed to ${mode === "edit" ? "update" : "publish"} article. Please try again.`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="max-w-2xl mx-auto py-8 px-4"
    >
      {/* Return link */}
      <button
        onClick={() => onNavigate({ name: "admin" })}
        className="inline-flex items-center space-x-2 text-stone-500 hover:text-stone-900 font-semibold text-xs uppercase tracking-wider transition-colors mb-8 group"
      >
        <div className="w-8 h-8 border border-stone-300 flex items-center justify-center group-hover:border-black transition-colors bg-white">
          <ArrowLeft size={13} />
        </div>
        <span>Back to Dashboard</span>
      </button>

      {/* Main card */}
      <div className="bg-white border border-black p-6 sm:p-12">
        
        {/* Header */}
        <div className="mb-8 pb-4 border-b border-stone-300">
          <span className="micro-caps text-stone-500 font-bold tracking-[0.18em]">Editor Console</span>
          <h1 className="font-serif text-3xl font-black text-stone-900 mt-1">
            {mode === "edit" ? "Update Article" : "New Chronicle"}
          </h1>
          <p className="text-xs text-stone-400 font-mono mt-1">
            {mode === "edit" ? `Modifying Article ID: ${articleId}` : "Compose and publish a journal post"}
          </p>
        </div>

        {fetching ? (
          <div className="space-y-6 py-8 animate-pulse">
            <div className="h-10 bg-stone-100 w-full" />
            <div className="h-10 bg-stone-100 w-1/2" />
            <div className="h-40 bg-stone-100 w-full" />
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="space-y-6">
            
            {/* Global Error Banner */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold uppercase tracking-wider">
                {error}
              </div>
            )}

            {/* Article Title Field */}
            <div>
              <label htmlFor="article-title" className="block text-xs font-mono uppercase tracking-widest text-stone-800 font-bold mb-2">
                Article Title
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="article-title"
                  placeholder="Enter article title..."
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (validationErrors.title) {
                      setValidationErrors({ ...validationErrors, title: undefined });
                    }
                  }}
                  className={`w-full px-4 py-3 bg-stone-50/30 border rounded-none text-sm font-serif placeholder-stone-400 focus:outline-none focus:border-black focus:bg-white transition-all ${
                    validationErrors.title
                      ? "border-red-400"
                      : "border-stone-300"
                  }`}
                />
              </div>
              {validationErrors.title && (
                <p className="text-red-500 text-[11px] mt-1.5 font-bold uppercase tracking-wider">{validationErrors.title}</p>
              )}
            </div>

            {/* Publishing Date Field */}
            <div>
              <label htmlFor="article-date" className="block text-xs font-mono uppercase tracking-widest text-stone-800 font-bold mb-2">
                Publishing Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="article-date"
                  value={publishDate}
                  onChange={(e) => {
                    setPublishDate(e.target.value);
                    if (validationErrors.publishDate) {
                      setValidationErrors({ ...validationErrors, publishDate: undefined });
                    }
                  }}
                  className={`w-full px-4 py-3 bg-stone-50/30 border rounded-none text-sm font-mono focus:outline-none focus:border-black focus:bg-white transition-all ${
                    validationErrors.publishDate
                      ? "border-red-400"
                      : "border-stone-300"
                  }`}
                />
              </div>
              {validationErrors.publishDate && (
                <p className="text-red-500 text-[11px] mt-1.5 font-bold uppercase tracking-wider">{validationErrors.publishDate}</p>
              )}
            </div>

            {/* Content Field */}
            <div>
              <label htmlFor="article-content" className="block text-xs font-mono uppercase tracking-widest text-stone-800 font-bold mb-2">
                Content
              </label>
              <textarea
                id="article-content"
                rows={12}
                placeholder="Write your article body here... Use double Line Breaks to separate paragraphs."
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (validationErrors.content) {
                    setValidationErrors({ ...validationErrors, content: undefined });
                  }
                }}
                className={`w-full px-4 py-4 bg-stone-50/30 border rounded-none text-sm font-sans leading-relaxed placeholder-stone-400 focus:outline-none focus:border-black focus:bg-white transition-all resize-y min-h-[250px] font-light ${
                  validationErrors.content
                    ? "border-red-400"
                    : "border-stone-300"
                }`}
              />
              {validationErrors.content && (
                <p className="text-red-500 text-[11px] mt-1.5 font-bold uppercase tracking-wider">{validationErrors.content}</p>
              )}
            </div>

            {/* Form actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-stone-200">
              <button
                type="button"
                id="form-cancel-btn"
                onClick={() => onNavigate({ name: "admin" })}
                className="px-5 py-2.5 bg-transparent border border-stone-300 hover:border-black text-stone-800 rounded-none text-xs font-bold uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                id="form-submit-btn"
                disabled={loading}
                className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-black border border-black text-[#F8F7F2] hover:bg-stone-800 disabled:opacity-50 rounded-none text-xs font-bold uppercase tracking-wider transition-all"
              >
                <Save size={13} />
                <span>{loading ? "Saving..." : mode === "edit" ? "Update" : "Publish"}</span>
              </button>
            </div>

          </form>
        )}
      </div>
    </motion.div>
  );
}
