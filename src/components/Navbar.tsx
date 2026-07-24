import { BookOpen, Settings, Globe } from "lucide-react";
import { ViewType } from "../types";

interface NavbarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
}

export default function Navbar({ currentView, onNavigate }: NavbarProps) {
  const isAdminSection = ["admin", "new", "edit"].includes(currentView.name);

  return (
    <nav className="border-b border-black bg-[#F8F7F2] sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo / Branding */}
          <button
            onClick={() => onNavigate({ name: "home" })}
            className="flex items-center space-x-3 text-left group"
          >
            <div className="w-10 h-10 bg-black text-[#F8F7F2] flex items-center justify-center transition-transform group-hover:scale-105 border border-black">
              <BookOpen size={18} className="stroke-[2]" />
            </div>
            <div>
              <span className="font-serif text-xl font-bold tracking-tight text-stone-900 block leading-tight">
                Personal Blog
              </span>
              <span className="text-[9px] font-mono tracking-[0.15em] text-stone-500 uppercase block font-semibold">
                Journal & CMS
              </span>
            </div>
          </button>

          {/* Controls */}
          <div className="flex items-center space-x-3">
            
            {/* Guest Section Toggle Button */}
            <button
              id="nav-guest-btn"
              onClick={() => onNavigate({ name: "home" })}
              className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition-all border ${
                !isAdminSection
                  ? "bg-black text-[#F8F7F2] border-black"
                  : "bg-transparent border-transparent text-stone-600 hover:border-stone-400 hover:text-stone-950"
              }`}
            >
              <Globe size={13} />
              <span>Guest View</span>
            </button>

            {/* Admin Section Toggle Button */}
            <button
              id="nav-admin-btn"
              onClick={() => onNavigate({ name: "admin" })}
              className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition-all border ${
                isAdminSection
                  ? "bg-black text-[#F8F7F2] border-black"
                  : "bg-transparent border-transparent text-stone-600 hover:border-stone-400 hover:text-stone-950"
              }`}
            >
              <Settings size={13} />
              <span>Admin Panel</span>
            </button>

          </div>
        </div>
      </div>
    </nav>
  );
}
