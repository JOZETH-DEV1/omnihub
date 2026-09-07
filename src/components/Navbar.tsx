import Link from "next/link";
import { User, UploadCloud, Search, Menu, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, userProfile, logOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-500/10 bg-slate-950/40 backdrop-blur-md supports-[backdrop-filter]:bg-slate-950/20 transition-all duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.4)] group-hover:shadow-[0_0_25px_rgba(34,211,238,0.7)] transition-all">
              <span className="text-white font-bold text-sm tracking-tighter">OH</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-400 tracking-tight">Omnihub</span>
          </Link>
          
          <nav className="hidden md:flex gap-1">
            <Link href="/explore" className="px-4 py-2 rounded-full text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">Explore</Link>
            <Link href="/categories" className="px-4 py-2 rounded-full text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">Categories</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <div className="hidden md:flex items-center relative">
            <Search className="w-4 h-4 absolute left-3 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search depths..." 
              className="w-64 h-10 pl-9 pr-4 rounded-full bg-slate-900/50 border border-slate-700/50 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all placeholder:text-slate-500"
            />
          </div>

          {user && (
            <Link href="/upload" className="hidden md:flex items-center gap-2 h-10 px-4 rounded-full bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 hover:text-cyan-300 transition-all">
              <UploadCloud className="w-4 h-4" />
              <span className="text-sm font-medium">Upload</span>
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/profile" className="w-10 h-10 rounded-full overflow-hidden border border-cyan-500/50 hover:border-cyan-400 transition-colors shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                <img src={userProfile?.photoURL || user.photoURL || ""} alt="Avatar" className="w-full h-full object-cover" />
              </Link>
              <button onClick={logOut} className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-800/50 border border-slate-700 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-colors text-slate-400">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link href="/login" className="h-10 px-5 rounded-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              Acceder
            </Link>
          )}
          
          <button className="md:hidden w-10 h-10 rounded-full flex items-center justify-center bg-transparent border border-transparent hover:bg-slate-800/50 transition-colors">
            <Menu className="w-5 h-5 text-slate-300" />
          </button>
        </div>
      </div>
    </header>
  );
}
