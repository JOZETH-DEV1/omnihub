"use client";

import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { Trash2, ShieldAlert, FileWarning, Search, ShieldCheck } from "lucide-react";

export default function AdminPanel() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const role = userProfile?.role || "user";
  const isAuthorized = role === "owner" || role === "mod";

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && userProfile) {
      if (isAuthorized) {
        fetchAllPosts();
      } else {
        router.push("/explore");
      }
    }
  }, [userProfile, loading, isAuthorized, router]);

  const fetchAllPosts = async () => {
    try {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      setAllPosts(querySnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (postId: string, fileUrl: string, thumbnailUrl: string, authorRole: string) => {
    // Si es mod, no puede borrar cosas de owners ni de otros mods
    if (role === "mod") {
      if (authorRole === "owner" || authorRole === "mod") {
        alert("⚠️ Permiso Denegado: Como moderador, no puedes eliminar publicaciones de otros moderadores o del dueño.");
        return;
      }
    }

    if (!confirm("⚠️ ACCIÓN DE ADMIN: ¿Estás seguro de que quieres erradicar esta publicación de la base de datos y destruir los archivos en la nube?")) return;
    
    try {
      // 1. Borrar de Firebase
      await deleteDoc(doc(db, "posts", postId));
      
      // 2. Destruir en nube (Cloudinary/Drive)
      const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL || "https://tiny-pond-a740.jozethperez5.workers.dev";
      fetch(`${workerUrl}/api/secure/delete-files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          driveUrl: fileUrl, 
          cloudinaryUrl: thumbnailUrl || (fileUrl?.includes('res.cloudinary') ? fileUrl : null),
          adminEmail: user?.email // Pasamos el correo para que el worker también lo valide
        })
      }).catch(e => console.error("Error en Worker Admin:", e));
      
      // UI
      setAllPosts(prev => prev.filter(p => p.id !== postId));
      alert("Publicación erradicada con éxito.");
    } catch (error) {
      alert("Error al erradicar publicación.");
    }
  };

  if (loading || !user || !userProfile) return null;
  
  if (!isAuthorized) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <ShieldAlert className="w-20 h-20 text-red-500 mb-4 animate-pulse" />
        <h1 className="text-3xl font-bold text-white mb-2">Acceso Denegado</h1>
        <p className="text-slate-400">Esta zona está clasificada. Tus credenciales no son válidas.</p>
      </div>
    );
  }

  const filteredPosts = allPosts.filter(p => 
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.authorUsername?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="container mx-auto px-4 pt-10 pb-20 max-w-6xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4 border-b border-red-900/50 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-2 flex items-center gap-3">
              <ShieldCheck className="w-10 h-10 text-red-500" />
              Panel de Control (Owner)
            </h1>
            <p className="text-red-400/80 font-medium">
              Conectado como {role === 'owner' ? 'Supremo (Owner)' : 'Moderador'}: {user.email}
            </p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Buscar publicación o usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-700">
                  <th className="p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Publicación</th>
                  <th className="p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Autor</th>
                  <th className="p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Rol de Autor</th>
                  <th className="p-4 text-sm font-semibold text-slate-400 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-500">Cargando base de datos global...</td></tr>
                ) : filteredPosts.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-500">No hay resultados.</td></tr>
                ) : (
                  filteredPosts.map(post => (
                    <tr key={post.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-slate-800 shrink-0 overflow-hidden">
                            {(post.thumbnailUrl || (post.fileType === 'image' && post.fileUrl)) ? (
                              <img src={post.thumbnailUrl || post.fileUrl} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FileWarning className="w-5 h-5 text-slate-500" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium max-w-[200px] md:max-w-[300px] truncate">{post.title}</p>
                            <a href={post.fileUrl} target="_blank" className="text-xs text-blue-400 hover:underline">Ver Archivo</a>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-cyan-400 text-sm font-medium">@{post.authorUsername}</p>
                        <p className="text-slate-500 text-xs truncate max-w-[150px]">{post.authorId}</p>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${post.authorRole === 'owner' ? 'bg-red-900/30 text-red-400 border border-red-800' : post.authorRole === 'mod' ? 'bg-orange-900/30 text-orange-400 border border-orange-800' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                          {post.authorRole || 'user'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleDeletePost(post.id, post.fileUrl, post.thumbnailUrl, post.authorRole || 'user')}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-red-900/20 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-colors border border-red-900/50 hover:border-red-500 font-medium text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          Erradicar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
