"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { ArrowRight, Sparkles, Layers } from "lucide-react";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import VerificationBadge from "@/components/VerificationBadge";

export default function Home() {
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(6));
        const querySnapshot = await getDocs(q);
        const postsData = querySnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        setRecentPosts(postsData);
      } catch (error) {
        console.error("Error loading posts:", error);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

  return (
    <>
      <Navbar />
      
      <div className="flex-1 flex flex-col pt-20 pb-32">
        {/* Hero Section */}
        <section className="container mx-auto px-4 flex flex-col items-center justify-center text-center max-w-4xl min-h-[50vh]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-900/30 border border-cyan-700/50 text-cyan-400 text-xs font-semibold mb-8 backdrop-blur-sm">
            <Sparkles className="w-3 h-3" />
            <span>Bienvenido a la nueva generación</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            Explora la <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
              Comunidad Profunda
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed">
            Omnihub es la plataforma premium para compartir archivos, mods, APKs e imágenes. Sumérgete en una experiencia fluida y futurista.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link href="/explore" className="h-12 px-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all">
              Explorar Contenido
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login" className="h-12 px-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium flex items-center justify-center transition-all backdrop-blur-md">
              Únete a Omnihub
            </Link>
          </div>
        </section>

        {/* Featured Posts Grid */}
        <section className="container mx-auto px-4 mt-32">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Layers className="w-6 h-6 text-cyan-500" />
              Aportes Recientes
            </h2>
            <Link href="/explore" className="text-sm font-medium text-cyan-400 hover:text-cyan-300">Ver todos</Link>
          </div>
          
          {loading ? (
             <div className="flex justify-center py-10">
               <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : recentPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPosts.map((post, i) => (
                <PostCard key={post.id} index={i} post={post} />
              ))}
            </div>
          ) : (
             <div className="text-center text-slate-500 py-10">
                Aún no hay publicaciones en la plataforma.
             </div>
          )}
        </section>
      </div>
    </>
  );
}

function PostCard({ index, post }: { index: number, post: any }) {
  const gradients = [
    "from-blue-600 to-cyan-400",
    "from-purple-600 to-blue-500",
    "from-emerald-500 to-teal-400",
    "from-rose-500 to-orange-400"
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
        <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-cyan-400 transition-colors">{post.title}</h3>
        <p className="text-sm text-slate-400 line-clamp-2 mb-4">
          {post.description}
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 overflow-hidden shrink-0">
               {post.authorPhoto && <img src={post.authorPhoto} className="w-full h-full object-cover" />}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-slate-300">@{post.authorUsername}</span>
              {post.isVerified && (
                <div className="scale-75 origin-left">
                  <VerificationBadge size="sm" />
                </div>
              )}
            </div>
          </div>
          <a href={post.fileUrl} target="_blank" className="text-xs text-cyan-400 font-bold hover:underline">Descargar</a>
        </div>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/0 via-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/5 group-hover:via-blue-500/5 group-hover:to-purple-500/10 pointer-events-none transition-all duration-500"></div>
    </div>
  );
}
