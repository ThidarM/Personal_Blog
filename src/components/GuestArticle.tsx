import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Article, ViewType } from "../types";
import { formatDate } from "../utils";
import { ArrowLeft, Calendar, Clock } from "lucide-react";

interface GuestArticleProps {
  articleId: string;
  onNavigate: (view: ViewType) => void;
}

export default function GuestArticle({ articleId, onNavigate }: GuestArticleProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    fetch(`/api/articles/${articleId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Article not found");
        }
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setArticle(data);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Failed to load the article");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [articleId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="max-w-3xl mx-auto py-8 px-4"
    >
      {/* Back navigation */}
      <button
        id="back-to-home-btn"
        onClick={() => onNavigate({ name: "home" })}
        className="inline-flex items-center space-x-2 text-stone-500 hover:text-stone-900 font-semibold text-xs uppercase tracking-wider transition-colors mb-8 group"
      >
        <div className="w-8 h-8 border border-stone-300 flex items-center justify-center group-hover:border-black transition-colors bg-white">
          <ArrowLeft size={13} />
        </div>
        <span>Back to Chronicles</span>
      </button>

      {/* Loading State */}
      {loading && (
        <div className="bg-white border border-black p-8 sm:p-12 animate-pulse">
          <div className="h-4 bg-stone-200 w-1/4 mb-4" />
          <div className="h-8 bg-stone-200 w-3/4 mb-6" />
          <div className="space-y-3">
            <div className="h-4 bg-stone-200 w-full" />
            <div className="h-4 bg-stone-200 w-11/12" />
            <div className="h-4 bg-stone-200 w-10/12" />
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-red-50 border border-black p-8 text-center">
          <p className="text-red-800 font-serif font-bold text-lg">Error Loading Post</p>
          <p className="text-stone-600 text-xs mt-1 font-mono">{error}</p>
          <button
            onClick={() => onNavigate({ name: "home" })}
            className="mt-6 px-4 py-2 bg-black text-[#F8F7F2] text-xs font-bold uppercase tracking-wider hover:bg-stone-800 transition-all"
          >
            Return to Home
          </button>
        </div>
      )}

      {/* Article Content */}
      {!loading && article && (
        <article className="bg-white border border-black p-6 sm:p-12 relative">
          
          {/* Header */}
          <header className="mb-8 pb-6 border-b border-stone-300">
            <div className="flex items-center space-x-3.5 text-stone-500 text-xs font-mono mb-4">
              <span className="flex items-center space-x-1 font-semibold uppercase tracking-wider">
                <Calendar size={12} />
                <span>{formatDate(article.publishDate)}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1 font-semibold uppercase tracking-wider">
                <Clock size={12} />
                <span>{Math.max(1, Math.ceil(article.content.split(/\s+/).length / 200))} min read</span>
              </span>
            </div>
            
            <h1 className="font-serif text-3xl sm:text-4xl font-black tracking-tight text-stone-900 leading-tight">
              {article.title}
            </h1>
          </header>

          {/* Body content with beautiful typography and paragraph separation */}
          <div className="prose prose-stone max-w-none">
            {article.content.split("\n\n").map((para, i) => {
              if (!para.trim()) return null;
              return (
                <p 
                  key={i} 
                  className="font-sans text-[#1a1a1a] text-base leading-relaxed mb-6 last:mb-0 text-justify font-light"
                >
                  {para}
                </p>
              );
            })}
          </div>

          {/* Editorial Watermark */}
          <div className="mt-12 pt-6 border-t border-stone-200 flex justify-between items-center">
            <span className="text-[10px] font-mono tracking-widest text-stone-400 uppercase">THE JOURNAL STANDARD</span>
            <span className="text-[10px] font-serif italic text-stone-400">Section Alpha / Core</span>
          </div>

        </article>
      )}
    </motion.div>
  );
}
