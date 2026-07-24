import { motion } from "motion/react";
import { Article, ViewType } from "../types";
import { formatDate } from "../utils";
import { ChevronRight } from "lucide-react";

interface GuestHomeProps {
  articles: Article[];
  onNavigate: (view: ViewType) => void;
}

export default function GuestHome({ articles, onNavigate }: GuestHomeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="max-w-4xl mx-auto py-8 px-4 sm:px-6"
    >
      {/* Editorial Masthead / Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b-2 border-black pb-5 mb-10 gap-4">
        <div className="flex flex-col">
          <span className="micro-caps text-stone-500 font-bold tracking-[0.18em]">Full-Stack Architecture</span>
          <h1 className="font-serif text-5xl sm:text-6xl font-black tracking-tight text-stone-900 mt-1">
            THE JOURNAL
          </h1>
        </div>
        <div className="text-left sm:text-right flex sm:flex-col justify-between w-full sm:w-auto border-t sm:border-t-0 border-stone-200 pt-3 sm:pt-0">
          <div>
            <span className="micro-caps text-stone-500 font-bold tracking-[0.18em]">Publication Index</span>
            <p className="text-xs font-serif italic mt-0.5 text-stone-600">Volume IV / Issue 2026</p>
          </div>
          <div className="sm:mt-2">
            <span className="micro-caps text-stone-400">Status</span>
            <div className="flex items-center sm:justify-end gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-800">Operational</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Column Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Welcome Message & Quick Insights */}
        <section className="md:col-span-4 flex flex-col justify-between border-b md:border-b-0 md:border-r border-black pb-8 md:pb-0 md:pr-8">
          <div>
            <span className="micro-caps text-stone-500 font-bold tracking-[0.18em]">Editorial</span>
            <h2 className="serif italic text-3xl font-semibold leading-tight text-stone-900 mt-2">
              Perspectives on design, state & servers.
            </h2>
            <div className="my-6 border-t border-stone-300"></div>
            <p className="text-sm leading-relaxed text-stone-700 font-light">
              Welcome to our personal blog and system core interface. Here, we document high-throughput system design, optimal react component architectures, and minimalistic layout implementations.
            </p>
          </div>

          <div className="mt-8 bg-black text-[#F8F7F2] p-5 border border-black">
            <span className="micro-caps text-stone-400">Metrics Core</span>
            <h4 className="text-lg mt-1 mb-3 font-serif italic">Blog Stats</h4>
            <div className="grid grid-cols-2 gap-4 border-t border-stone-800 pt-3">
              <div>
                <span className="block text-[9px] text-stone-400 uppercase font-mono tracking-wider">Articles</span>
                <span className="text-xl font-bold font-serif">{articles.length}</span>
              </div>
              <div>
                <span className="block text-[9px] text-stone-400 uppercase font-mono tracking-wider">Engine</span>
                <span className="text-xs font-bold font-mono tracking-tighter block mt-1">VITE+EXPRESS</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: List of Published Articles */}
        <div className="md:col-span-8 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-stone-300">
              <span className="micro-caps text-stone-900 font-bold tracking-[0.15em]">Published Chronicles</span>
              <span className="text-[11px] font-mono text-stone-500">{articles.length} entries total</span>
            </div>

            {articles.length === 0 ? (
              <div className="text-center py-16 bg-white border border-black p-8">
                <p className="text-stone-500 italic font-serif text-base">The printing press is quiet.</p>
                <p className="text-xs text-stone-400 font-mono mt-2 uppercase tracking-wider">No articles have been written yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-200">
                {articles.map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.3 }}
                    className="group py-5 first:pt-0 last:pb-0"
                  >
                    <button
                      id={`article-link-${article.id}`}
                      onClick={() => onNavigate({ name: "article", articleId: article.id })}
                      className="w-full text-left flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 transition-all"
                    >
                      <div className="flex-1">
                        <span className="font-serif text-xl font-bold text-stone-950 group-hover:text-stone-600 transition-colors block">
                          {article.title}
                        </span>
                        <span className="text-xs text-stone-500 font-serif line-clamp-2 mt-1.5 leading-relaxed">
                          {article.content.substring(0, 160)}...
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 self-start sm:self-start mt-1.5 sm:mt-0">
                        <span className="text-stone-500 font-mono text-xs font-semibold uppercase tracking-wider whitespace-nowrap bg-stone-200/60 px-2 py-0.5 border border-stone-300">
                          {formatDate(article.publishDate)}
                        </span>
                        <div className="hidden sm:flex w-6 h-6 border border-black group-hover:bg-black group-hover:text-[#F8F7F2] items-center justify-center text-stone-900 transition-all">
                          <ChevronRight size={13} className="stroke-[2.5]" />
                        </div>
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Aesthetic Footer Signoff */}
      <footer className="mt-16 pt-6 border-t border-black flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono tracking-widest text-stone-500 uppercase gap-4">
        <span>© {new Date().getFullYear()} THE JOURNAL PERSISTENCE CORE</span>
        <div className="flex gap-6 font-semibold">
          <span className="hover:text-black cursor-pointer">NODE PERSIST</span>
          <span className="hover:text-black cursor-pointer">HYBRID FRAMEWORK</span>
        </div>
      </footer>
    </motion.div>
  );
}
