"use client";

import Navbar from "@/components/Navbar";
import { Gamepad2, Smartphone, FileArchive, Music, Video, Code, Palette, Book } from "lucide-react";

export default function CategoriesPage() {
  const categories = [
    { name: "Minecraft Mods", icon: <Gamepad2 className="w-8 h-8" />, color: "from-green-500 to-emerald-700", count: 124 },
    { name: "Android APKs", icon: <Smartphone className="w-8 h-8" />, color: "from-cyan-500 to-blue-700", count: 85 },
    { name: "Archivos ZIP", icon: <FileArchive className="w-8 h-8" />, color: "from-purple-500 to-indigo-700", count: 342 },
    { name: "Audio", icon: <Music className="w-8 h-8" />, color: "from-pink-500 to-rose-700", count: 56 },
    { name: "Video", icon: <Video className="w-8 h-8" />, color: "from-red-500 to-orange-700", count: 21 },
    { name: "Scripts", icon: <Code className="w-8 h-8" />, color: "from-slate-500 to-slate-800", count: 12 },
    { name: "Recursos Gráficos", icon: <Palette className="w-8 h-8" />, color: "from-yellow-400 to-amber-600", count: 43 },
    { name: "Documentos", icon: <Book className="w-8 h-8" />, color: "from-teal-400 to-cyan-700", count: 9 },
  ];

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 pt-10 pb-20">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
            Categorías
          </h1>
          <p className="text-slate-400">Navega por todos los ecosistemas de nuestra comunidad.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <div 
              key={i}
              className="group cursor-pointer relative bg-slate-900/40 border border-slate-700/50 rounded-3xl p-6 backdrop-blur-md overflow-hidden hover:-translate-y-2 transition-transform duration-300"
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white mb-6 shadow-lg shadow-black/50`}>
                {cat.icon}
              </div>
              
              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">{cat.name}</h3>
              <p className="text-sm text-slate-500 font-medium">{cat.count} aportes</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
