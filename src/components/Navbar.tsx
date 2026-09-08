"use client";

import Link from "next/link";
import { Menu, LogOut, Settings, User as UserIcon, X, Search, Compass, PlusCircle, ShieldCheck, UploadCloud } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function Navbar() {
  const { user, userProfile, logOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-cyan-500/10 bg-slate-950/40 backdrop-blur-md supports-[backdrop-filter]:bg-slate-950/20 transition-all duration-300">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.4)] group-hover:shadow-[0_0_25px_rgba(34,211,238,0.7)] transition-all">
                <span className="text-white font-bold text-sm tracking-tighter">OH</span>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-400 tracking-tight">Omnihub</span>
            </Link>
            
            <nav className="hidden md:flex gap-4 items-center">
              <Link href="/explore" className="flex items-center gap-2 text-slate-300 hover:text-white font-medium transition-colors">
                <Compass className="w-5 h-5" />
                Explorar
              </Link>
              
              {userProfile?.role && ["owner", "mod"].includes(userProfile.role) && (
                <Link href="/admin" className="flex items-center gap-2 text-red-400 hover:text-red-300 font-bold transition-colors">
                  <ShieldCheck className="w-5 h-5" />
                  Owner Panel
                </Link>
              )}
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
              <div className="flex items-center gap-2 md:gap-3">
                <Link href="/profile" className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border border-cyan-500/50 hover:border-cyan-400 transition-colors shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                  <img src={userProfile?.photoURL || user.photoURL || ""} alt="Avatar" className="w-full h-full object-cover" />
                </Link>
                <button onClick={logOut} className="hidden md:flex w-10 h-10 rounded-full items-center justify-center bg-slate-800/50 border border-slate-700 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-colors text-slate-400">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="hidden md:flex h-10 px-5 rounded-full items-center justify-center bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                Acceder
              </Link>
            )}
            
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-full flex items-center justify-center bg-transparent border border-transparent hover:bg-slate-800/50 transition-colors z-[60]"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-slate-300" /> : <Menu className="w-5 h-5 text-slate-300" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-xl flex flex-col pt-24 px-6 pb-6">
          <div className="flex flex-col gap-6 text-lg font-medium">
            <Link href="/explore" onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-cyan-400">Explore</Link>
            <Link href="/categories" onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-cyan-400">Categories</Link>
            
            <div className="w-full h-px bg-slate-800 my-2"></div>
            
            {user ? (
              <>
                <Link href="/upload" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-cyan-400">
                  <UploadCloud className="w-5 h-5" /> Subir Aporte
                </Link>
                <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-white">
                  <img src={userProfile?.photoURL || user.photoURL || ""} className="w-6 h-6 rounded-full" />
                  Mi Perfil
                </Link>
                <button onClick={() => { logOut(); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 text-red-400 text-left">
                  <LogOut className="w-5 h-5" /> Cerrar sesión
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center py-3 bg-cyan-600 rounded-xl text-white font-bold shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
