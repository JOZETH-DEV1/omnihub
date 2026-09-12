"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Download, Share2, Heart, MessageSquare, AlertTriangle, CheckCircle } from "lucide-react";
import VerificationBadge from "@/components/VerificationBadge";
import Link from "next/link";

function PostContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();
  
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("No se proporcionó un ID de publicación válido.");
      setLoading(false);
      return;
    }

    async function fetchPost() {
      try {
        const docRef = doc(db, "posts", id as string);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("La publicación que buscas no existe o fue erradicada.");
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Error al cargar la publicación.");
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [id]);

  const handleShare = async () => {
    // Generate the share URL pointing to the Cloudflare Worker OG proxy
    // For example, if worker is at tiny-pond-a740.jozethperez5.workers.dev
    const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL || "https://tiny-pond-a740.jozethperez5.workers.dev";
    const shareUrl = `${workerUrl}/share/${id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.description,
          url: shareUrl
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <div className="flex justify-center items-center h-[70vh]">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <div className="flex flex-col justify-center items-center h-[70vh] px-4 text-center">
          <AlertTriangle className="w-20 h-20 text-red-500 mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">Error 404</h1>
          <p className="text-slate-400 mb-8">{error}</p>
          <button onClick={() => router.push("/explore")} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all">
            Volver a Explorar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      
      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <button 
          onClick={() => router.push("/explore")}
          className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-8 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>

        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl flex flex-col md:flex-row">
          
          {/* Media Section */}
          <div className="w-full md:w-1/2 lg:w-3/5 bg-slate-950 flex items-center justify-center relative min-h-[300px]">
            {post.thumbnailUrl || (post.fileType === "image" && post.fileUrl) ? (
              <img 
                src={post.thumbnailUrl || post.fileUrl} 
                alt={post.title}
                className="w-full h-full object-contain max-h-[600px] bg-slate-900"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-slate-800 flex items-center justify-center">
                <Download className="w-12 h-12 text-slate-500" />
              </div>
            )}
            
            <div className="absolute top-4 left-4">
              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase backdrop-blur-md border ${
                post.fileType === 'image' 
                  ? 'bg-purple-900/50 text-purple-300 border-purple-500/30' 
                  : 'bg-orange-900/50 text-orange-300 border-orange-500/30'
              }`}>
                {post.fileType}
              </span>
            </div>
            {post.category && (
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-900/50 text-cyan-300 border border-cyan-500/30 backdrop-blur-md">
                  {post.category}
                </span>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="w-full md:w-1/2 lg:w-2/5 p-6 md:p-8 flex flex-col">
            <h1 className="text-3xl font-extrabold text-white mb-4 leading-tight">{post.title}</h1>
            
            <div className="flex items-center gap-3 mb-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-700">
                {post.authorPhoto && <img src={post.authorPhoto} alt="Author" className="w-full h-full object-cover" />}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-slate-200">@{post.authorUsername}</span>
                  {post.isVerified && <div className="scale-75 origin-left"><VerificationBadge size="sm" /></div>}
                </div>
                <span className="text-xs text-slate-500">
                  {post.createdAt ? new Date(post.createdAt.toDate()).toLocaleDateString() : 'Desconocido'}
                </span>
              </div>
            </div>

            <div className="prose prose-invert prose-sm text-slate-300 mb-8 flex-1">
              <p className="whitespace-pre-wrap">{post.description}</p>
            </div>

            <div className="flex items-center gap-4 mt-auto pt-6 border-t border-slate-800">
              <a 
                href={post.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)]"
              >
                <Download className="w-5 h-5" />
                Descargar Archivo
              </a>
              
              <button 
                onClick={handleShare}
                className="h-12 w-12 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl transition-colors border border-slate-700 relative"
                title="Compartir (Genera miniatura en WhatsApp/Telegram)"
              >
                {copied ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Share2 className="w-5 h-5" />}
                {copied && (
                  <span className="absolute -top-10 bg-slate-800 text-xs px-2 py-1 rounded text-white whitespace-nowrap">
                    ¡Enlace copiado!
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PostPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex justify-center items-center"><div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div></div>}>
      <PostContent />
    </Suspense>
  );
}
