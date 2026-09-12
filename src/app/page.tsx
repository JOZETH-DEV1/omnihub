"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { ArrowRight, Sparkles, Layers } from "lucide-react";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import VerificationBadge from "@/components/VerificationBadge";
import { useRouter } from "next/navigation";

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
            
            <div className="flex items-center gap-4">
              <a href="https://discord.gg/MdHn35tHJ" target="_blank" rel="noopener noreferrer" className="h-12 px-6 rounded-full bg-[#5865F2]/20 border border-[#5865F2]/40 hover:bg-[#5865F2]/40 text-white font-medium flex items-center justify-center transition-all backdrop-blur-md gap-2 shadow-[0_0_15px_rgba(88,101,242,0.3)]">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
                Discord
              </a>
              <a href="https://t.me/+bUmDG9PuRYU2MWFh" target="_blank" rel="noopener noreferrer" className="h-12 px-6 rounded-full bg-[#0088cc]/20 border border-[#0088cc]/40 hover:bg-[#0088cc]/40 text-white font-medium flex items-center justify-center transition-all backdrop-blur-md gap-2 shadow-[0_0_15px_rgba(0,136,204,0.3)]">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.18-.08-.05-.19-.02-.27 0-.11.02-1.89 1.2-5.32 3.52-.5.35-.95.52-1.36.51-.45-.01-1.31-.25-1.95-.46-.78-.26-1.4-.4-1.35-.85.03-.23.36-.47 1-.72 3.91-1.7 6.52-2.82 7.82-3.36 3.73-1.56 4.5-1.83 5.01-1.84.11 0 .36.03.52.16.13.11.17.26.19.37.03.1.03.22.02.32z"/></svg>
                Telegram
              </a>
            </div>
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

  const router = useRouter();

  return (
    <div 
      onClick={() => router.push(`/post?id=${post.id}`)}
      className="group relative rounded-2xl bg-slate-900/40 border border-slate-700/50 overflow-hidden backdrop-blur-md hover:border-cyan-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] hover:-translate-y-1 cursor-pointer"
    >
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
          <button 
            onClick={(e) => { e.stopPropagation(); window.open(post?.fileUrl || "#", "_blank"); }}
            className="text-xs text-cyan-400 font-bold hover:underline"
          >
            Descargar
          </button>
        </div>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/0 via-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/5 group-hover:via-blue-500/5 group-hover:to-purple-500/10 pointer-events-none transition-all duration-500"></div>
    </div>
  );
}
