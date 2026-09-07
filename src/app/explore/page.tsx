"use client";

import Navbar from "@/components/Navbar";
import { Filter, Flame, Clock, Sparkles } from "lucide-react";

export default function ExplorePage() {
  const categories = ["Todos", "Minecraft", "Android APKs", "Archivos ZIP", "Audio / Video"];

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 pt-10 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
              Explorar
            </h1>
            <p className="text-slate-400">Descubre los mejores aportes de la comunidad profunda.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-900/60 p-2 rounded-2xl border border-slate-700/50 backdrop-blur-md overflow-x-auto w-full md:w-auto">
            {categories.map((cat, i) => (
              <button 
                key={cat} 
                className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-all ${
                  i === 0 
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_15px_rgba(34,211,238,0.4)]" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 mb-8 text-sm">
          <button className="flex items-center gap-2 text-cyan-400 font-medium px-3 py-1.5 bg-cyan-950/50 rounded-lg border border-cyan-800">
            <Flame className="w-4 h-4" />
            Tendencias
          </button>
          <button className="flex items-center gap-2 text-slate-400 hover:text-slate-200 font-medium px-3 py-1.5 transition-colors">
            <Clock className="w-4 h-4" />
            Más Recientes
          </button>
          <button className="flex items-center gap-2 text-slate-400 hover:text-slate-200 font-medium px-3 py-1.5 transition-colors">
            <Sparkles className="w-4 h-4" />
            Destacados
          </button>
          
          <div className="flex-1"></div>
          
          <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <Filter className="w-4 h-4" />
            Filtros
          </button>
        </div>

        {/* Grid de contenido */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <PostCard key={i} index={i} />
          ))}
        </div>
      </div>
    </>
  );
}

function PostCard({ index }: { index: number }) {
  const images = [
    "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop"
  ];
  const image = images[index % 3];

  return (
    <div className="group relative rounded-2xl bg-slate-900/40 border border-slate-700/50 overflow-hidden backdrop-blur-md hover:border-cyan-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] hover:-translate-y-1">
      <div className="relative aspect-video overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10 opacity-60"></div>
        <img 
          src={image} 
          alt="Post thumbnail" 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
        />
      </div>
      
      <div className="p-5 relative z-20">
        <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-cyan-400 transition-colors">Digital Drop {index}</h3>
        <p className="text-sm text-slate-400 line-clamp-2 mb-4">
          Una increíble aportación a la plataforma de Omnihub. Descarga e interactúa con el mejor contenido exclusivo de nuestra comunidad.
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500"></div>
            <span className="text-xs font-medium text-slate-300">@usuario_pro</span>
          </div>
          <span className="text-xs text-cyan-400 bg-cyan-950/50 px-2 py-1 rounded-md font-semibold">Descargar</span>
        </div>
      </div>
    </div>
  );
}
