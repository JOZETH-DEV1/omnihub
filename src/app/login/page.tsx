"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/explore"); // Redirect to explore or profile when logged in
    }
  }, [user, loading, router]);

  if (loading || user) return null; // Avoid rendering login if already authenticated

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      {/* Dynamic ambient background specifically for login */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#010A15] to-[#041225] z-[-2]" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Link href="/" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-medium mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
          Volver a la superficie
        </Link>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
              Sumérgete
            </h1>
            <p className="text-slate-400 text-sm">
              Inicia sesión para descubrir y compartir.
            </p>
          </div>

          <form className="space-y-4 mb-6">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="email" 
                placeholder="Correo electrónico" 
                className="w-full h-12 pl-12 pr-4 bg-slate-950/50 border border-slate-700/50 rounded-xl focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-white placeholder:text-slate-600"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="password" 
                placeholder="Contraseña" 
                className="w-full h-12 pl-12 pr-4 bg-slate-950/50 border border-slate-700/50 rounded-xl focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-white placeholder:text-slate-600"
              />
            </div>
            
            <button 
              type="button"
              className="w-full h-12 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]"
            >
              Iniciar Sesión
            </button>
          </form>

          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <span className="relative px-4 bg-[#0a1526] text-xs text-slate-500 font-medium">O CONTINÚA CON</span>
          </div>

          <button 
            onClick={signInWithGoogle}
            className="w-full h-12 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Acceder con Google
          </button>
        </div>
      </motion.div>
    </div>
  );
}
