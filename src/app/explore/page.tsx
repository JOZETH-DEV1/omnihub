"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Filter, Flame, Clock, Sparkles, Inbox } from "lucide-react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ExplorePage() {
  const categories = ["Todos", "Minecraft", "Android APKs", "Archivos ZIP", "Audio / Video"];
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [activeFilter, setActiveFilter] = useState("Tendencias");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(20));
        const querySnapshot = await getDocs(q);
        const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPosts(postsData);
      } catch (error) {
        console.error("Error loading posts:", error);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, [activeCategory, activeFilter]); // Dependencias para futuro filtrado

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
          
          <div className="flex items-center gap-4 bg-slate-900/60 p-2 rounded-2xl border border-slate-700/50 backdrop-blur-md overflow-x-auto w-full md:w-auto scrollbar-hide">
            {categories.map((cat) => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_15px_rgba(34,211,238,0.4)]" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-8 text-sm">
          <button 
            onClick={() => setActiveFilter("Tendencias")}
            className={`flex items-center gap-2 font-medium px-4 py-2 rounded-xl transition-all ${
              activeFilter === "Tendencias" ? "text-cyan-400 bg-cyan-950/50 border border-cyan-800" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Flame className="w-4 h-4" />
            Tendencias
          </button>
          
          <button 
            onClick={() => setActiveFilter("Recientes")}
            className={`flex items-center gap-2 font-medium px-4 py-2 rounded-xl transition-all ${
              activeFilter === "Recientes" ? "text-cyan-400 bg-cyan-950/50 border border-cyan-800" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Clock className="w-4 h-4" />
            Más Recientes
          </button>
          
          <button 
            onClick={() => setActiveFilter("Destacados")}
            className={`flex items-center gap-2 font-medium px-4 py-2 rounded-xl transition-all ${
              activeFilter === "Destacados" ? "text-cyan-400 bg-cyan-950/50 border border-cyan-800" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Destacados
          </button>
          
          <div className="flex-1 min-w-[20px]"></div>
          
          <button className="flex items-center gap-2 text-slate-400 hover:text-white bg-slate-900/50 hover:bg-slate-800 px-4 py-2 rounded-xl border border-slate-800 transition-all">
            <Filter className="w-4 h-4" />
            Filtros
          </button>
        </div>

        {/* Grid de contenido de Firestore */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <PostCard key={post.id} index={i} post={post} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-900/20 rounded-3xl border border-slate-800 border-dashed">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Aún no hay exploraciones</h3>
            <p className="text-slate-400 max-w-md">Sé el primero en subir un aporte y tu contenido aparecerá aquí para toda la comunidad.</p>
          </div>
        )}
      </div>
    </>
  );
}

function PostCard({ index, post }: { index: number, post: any }) {
  // Generar gradientes dinámicos en base al index para diferenciarlos visualmente
  const gradients = [
    "from-blue-600 to-cyan-400",
    "from-purple-600 to-blue-500",
    "from-emerald-500 to-teal-400",
    "from-rose-500 to-orange-400",
    "from-indigo-600 to-purple-500",
    "from-cyan-700 to-blue-800"
  ];
  const bgGradient = gradients[index % gradients.length];

  return (
    <div className="group relative rounded-2xl bg-slate-900/40 border border-slate-700/50 overflow-hidden backdrop-blur-md hover:border-cyan-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] hover:-translate-y-1 cursor-pointer">
      <div className={`relative aspect-video overflow-hidden bg-gradient-to-br ${bgGradient} flex items-center justify-center`}>
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500 z-10"></div>
        
        {post?.thumbnailUrl ? (
          <img src={post.thumbnailUrl} alt={post.title} className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
        ) : post?.fileType === "image" && post?.fileUrl ? (
          <img src={post.fileUrl} alt={post.title} className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl transform group-hover:scale-110 transition-transform duration-500 z-20">
            <svg className="w-8 h-8 text-white opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
        )}
      </div>
      
      <div className="p-5 relative z-20">
        <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-cyan-400 transition-colors">
          {post?.title || `Digital Drop ${index}`}
        </h3>
        <p className="text-sm text-slate-400 line-clamp-2 mb-4">
          {post?.description || "Una increíble aportación a la plataforma de Omnihub. Descarga e interactúa con el mejor contenido exclusivo de nuestra comunidad."}
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 overflow-hidden">
              {post?.authorPhoto ? <img src={post.authorPhoto} className="w-full h-full object-cover" /> : null}
            </div>
            <span className="text-xs font-medium text-slate-300">
              @{post?.authorUsername || "usuario_pro"}
            </span>
          </div>
          <a 
            href={post?.fileUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cyan-400 bg-cyan-950/50 hover:bg-cyan-900 transition-colors px-4 py-1.5 rounded-lg font-bold border border-cyan-800/50 flex items-center gap-2"
          >
            Descargar
          </a>
        </div>
      </div>
    </div>
  );
}
