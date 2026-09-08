"use client";

import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import VerificationBadge from "@/components/VerificationBadge";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Camera, Settings, X, Save, Edit3, LogOut, CheckCircle, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { doc, updateDoc, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import Link from "next/link";

export default function ProfilePage() {
  const { user, userProfile, loading, logOut } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Real stats
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  // Estados del formulario
  const [editForm, setEditForm] = useState({
    displayName: "",
    username: "",
    bio: "",
    photoURL: ""
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (userProfile) {
      setEditForm({
        displayName: userProfile.displayName || "",
        username: userProfile.username || "",
        bio: userProfile.bio || "",
        photoURL: userProfile.photoURL || ""
      });
      fetchUserPosts();
    }
  }, [userProfile, user]);

  const fetchUserPosts = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, "posts"), where("authorId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserPosts(posts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handleDeletePost = async (postId: string, fileUrl: string, thumbnailUrl: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta publicación? Esto borrará también los archivos de la nube.")) return;
    
    try {
      // 1. Borrar documento de Firebase
      await deleteDoc(doc(db, "posts", postId));
      
      // 2. Borrar archivos usando el Worker
      const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL || "https://tiny-pond-a740.jozethperez5.workers.dev";
      fetch(`${workerUrl}/api/secure/delete-files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          driveUrl: fileUrl, 
          cloudinaryUrl: thumbnailUrl || (fileUrl?.includes('res.cloudinary') ? fileUrl : null) 
        })
      }).catch(e => console.error("Error en limpieza de archivos:", e));
      
      // Actualizar UI
      setUserPosts(prev => prev.filter(p => p.id !== postId));
    } catch (error) {
      alert("Error al eliminar la publicación.");
      console.error(error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    
    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName: editForm.displayName,
        username: editForm.username,
        bio: editForm.bio,
        photoURL: editForm.photoURL,
        updatedAt: new Date()
      });
      setIsEditing(false);
      window.location.reload();
    } catch (error) {
      alert("Error al guardar perfil");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !user || !userProfile) return null;

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 pt-8 pb-24 max-w-4xl">
        
        {/* Profile Header Card */}
        <div className="bg-slate-900/60 border border-slate-700/50 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-[0_0_40px_rgba(0,0,0,0.4)] relative overflow-hidden mb-8">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-cyan-900/40 to-blue-900/40 opacity-50"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar & Badge */}
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-slate-800 bg-slate-900 overflow-hidden shadow-2xl relative z-10">
                <img 
                  src={userProfile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 z-20">
                <VerificationBadge />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                  <h1 className="text-3xl font-extrabold text-white mb-1 flex items-center justify-center md:justify-start gap-2">
                    {userProfile.displayName || "Usuario"}
                    <CheckCircle className="w-5 h-5 text-cyan-400" />
                  </h1>
                  <p className="text-cyan-400 font-medium">@{userProfile.username}</p>
                </div>
                
                <div className="flex items-center justify-center gap-3">
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-medium transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    Editar Perfil
                  </button>
                  <button 
                    onClick={() => logOut()}
                    className="p-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded-full transition-colors"
                    title="Cerrar Sesión"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <p className="text-slate-400 mt-4 max-w-lg leading-relaxed">
                {userProfile.bio || "Este usuario aún no ha escrito una biografía. ¡Seguro es una persona genial!"}
              </p>

              {/* Stats */}
              <div className="flex items-center justify-center md:justify-start gap-8 mt-6 pt-6 border-t border-slate-800/50">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-white">{isLoadingPosts ? "-" : userPosts.length}</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Aportes</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-white">{userProfile.followersCount || 0}</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Seguidores</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Posts List */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Tus Aportes</h2>
          {isLoadingPosts ? (
            <p className="text-slate-500">Cargando publicaciones...</p>
          ) : userPosts.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-10 text-center">
              <p className="text-slate-400 mb-4">Aún no has publicado nada.</p>
              <Link href="/upload" className="text-cyan-400 hover:text-cyan-300 font-medium">
                ¡Haz tu primera subida!
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userPosts.map(post => (
                <div key={post.id} className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                    {(post.thumbnailUrl || (post.fileType === 'image' && post.fileUrl)) ? (
                      <img src={post.thumbnailUrl || post.fileUrl} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-slate-500 text-xs">Archivo</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate">{post.title}</h3>
                    <p className="text-xs text-slate-400 truncate">{post.description}</p>
                    <div className="text-xs text-cyan-400 mt-1 capitalize">{post.fileType}</div>
                  </div>
                  <button 
                    onClick={() => handleDeletePost(post.id, post.fileUrl, post.thumbnailUrl)}
                    className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded-xl transition-all"
                    title="Eliminar publicación"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Profile Modal */}
        <AnimatePresence>
          {isEditing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] max-h-[90vh]"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-800 shrink-0">
                  <h2 className="text-xl font-bold text-white">Modificar Perfil</h2>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors bg-slate-800/50 md:bg-transparent"
                    title="Cerrar"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-4 md:p-6 space-y-5 overflow-y-auto flex-1">
                  <div className="flex flex-col items-center mb-6">
                    <label className="relative group cursor-pointer">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-600 bg-slate-800 group-hover:border-cyan-500 transition-colors">
                        <img src={editForm.photoURL} alt="Preview" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-6 h-6 text-white drop-shadow-md" />
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                          if (!cloudName) {
                            alert("Configura NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME en tu panel de Cloudflare.");
                            return;
                          }
                          
                          setIsSaving(true);
                          const formData = new FormData();
                          formData.append("file", file);
                          formData.append("upload_preset", "omnihub_preset"); 
                          
                          try {
                            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                              method: "POST",
                              body: formData
                            });
                            const data = await res.json();
                            if (data.secure_url) {
                              setEditForm({...editForm, photoURL: data.secure_url});
                            } else {
                              alert("Error al subir a Cloudinary. Revisa tu upload preset.");
                            }
                          } catch (err) {
                            console.error(err);
                            alert("Error de conexión al subir la imagen.");
                          } finally {
                            setIsSaving(false);
                          }
                        }}
                      />
                    </label>
                    <span className="text-xs text-slate-500 mt-3 text-center px-4">Toca la imagen para subir una nueva (Vía Cloudinary)</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Nombre a mostrar</label>
                    <input 
                      type="text" 
                      value={editForm.displayName}
                      onChange={(e) => setEditForm({...editForm, displayName: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Nombre de usuario</label>
                    <input 
                      type="text" 
                      value={editForm.username}
                      onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Biografía</label>
                    <textarea 
                      value={editForm.bio}
                      onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all resize-none"
                    ></textarea>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2.5 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium rounded-xl transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] disabled:opacity-50"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {isSaving ? "Guardando..." : "Guardar Cambios"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
