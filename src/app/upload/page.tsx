"use client";

import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UploadCloud, File, Image as ImageIcon, CheckCircle, AlertCircle } from "lucide-react";

export default function UploadPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [fileMode, setFileMode] = useState<"image" | "file">("file");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 pt-10 pb-20 max-w-3xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
            Subir Contenido
          </h1>
          <p className="text-slate-400">Comparte tus mejores aportes con la comunidad Omnihub.</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-700/50 backdrop-blur-xl rounded-3xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.4)]">
          {/* Toggles de tipo de archivo */}
          <div className="flex gap-4 mb-8 bg-slate-950 p-2 rounded-2xl">
            <button 
              type="button"
              onClick={() => setFileMode("file")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                fileMode === "file" 
                  ? "bg-cyan-600 text-white shadow-lg" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <File className="w-5 h-5" />
              Archivo Pesado (.zip, .apk)
            </button>
            <button 
              type="button"
              onClick={() => setFileMode("image")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                fileMode === "image" 
                  ? "bg-cyan-600 text-white shadow-lg" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ImageIcon className="w-5 h-5" />
              Imagen Ligera
            </button>
          </div>

          {/* Formulario */}
          <form className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Título de la publicación</label>
              <input 
                type="text" 
                placeholder={fileMode === "file" ? "Ej. Increíble mod de texturas" : "Ej. Captura de pantalla épica"}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Descripción</label>
              <textarea 
                rows={4}
                placeholder="Describe qué hace especial a este archivo..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all resize-none"
              ></textarea>
            </div>

            {/* Zona de Drag & Drop */}
            <div className="border-2 border-dashed border-cyan-800/50 hover:border-cyan-500 bg-cyan-950/10 rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer group">
              <div className="w-16 h-16 bg-cyan-900/50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Arrastra tu archivo aquí</h3>
              <p className="text-sm text-slate-400 mb-6">o haz clic para explorar tus carpetas</p>
              
              <button type="button" className="px-6 py-2 bg-slate-800 text-slate-300 rounded-full text-sm font-medium hover:bg-slate-700 hover:text-white transition-colors">
                Seleccionar {fileMode === "image" ? "imagen" : "archivo"}
              </button>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button 
                type="button"
                className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] flex items-center gap-2"
              >
                Publicar Ahora
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
