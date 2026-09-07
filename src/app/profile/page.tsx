"use client";

import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import VerificationBadge from "@/components/VerificationBadge";
import { Settings, Image as ImageIcon, X, Save, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { updateUserProfile } from "@/lib/db";

export default function ProfilePage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: "",
    username: "",
    bio: "",
    photoURL: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (userProfile) {
      setEditForm({
        displayName: userProfile.displayName,
        username: userProfile.username,
        bio: userProfile.bio || "",
        photoURL: userProfile.photoURL
      });
    }
  }, [userProfile]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateUserProfile(user.uid, editForm);
      // Actualización visual instantánea sin recargar la página (optimistic UI)
      if (userProfile) {
        userProfile.displayName = editForm.displayName;
        userProfile.username = editForm.username;
        userProfile.bio = editForm.bio;
        userProfile.photoURL = editForm.photoURL;
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Hubo un error al guardar el perfil.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !user || !userProfile) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 pt-10 pb-20 max-w-4xl relative">
        {/* Profile Header */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900/60 border border-slate-700/50 backdrop-blur-md mb-8">
          {/* Banner */}
          <div className="h-48 bg-gradient-to-r from-cyan-900/40 via-blue-900/40 to-purple-900/40 relative">
            <button className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-full hover:bg-black/60 transition-colors">
              <ImageIcon className="w-4 h-4 text-white" />
            </button>
          </div>
          
          {/* Avatar & Info */}
          <div className="px-8 pb-8 relative">
            <div className="flex justify-between items-end -mt-16 mb-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#010A15] bg-slate-800 relative z-10 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                  <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                </div>
                {/* 3D Verification Badge placed right on the avatar */}
                {userProfile.isVerified && (
                  <div className="absolute bottom-1 right-1 z-20">
                    <VerificationBadge size="lg" />
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-full font-medium text-sm transition-colors flex items-center gap-2 shadow-lg hover:shadow-cyan-500/20"
              >
                <Settings className="w-4 h-4" />
                Editar Perfil
              </button>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                {userProfile.displayName}
                {userProfile.isVerified && <VerificationBadge size="sm" />}
              </h1>
              <p className="text-cyan-400 font-medium mb-4">@{userProfile.username}</p>
              
              <p className="text-slate-300 max-w-2xl leading-relaxed mb-6">
                {userProfile.bio}
              </p>
              
              <div className="flex gap-6 border-t border-slate-800 pt-6">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-white">{userProfile.followersCount}</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Seguidores</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-white">{userProfile.followingCount}</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Siguiendo</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-white">0</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Aportes</span>
                </div>
              </div>
            </div>
          </div>
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
                          
                          // Subida directa a Cloudinary (requiere NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME y un upload preset)
                          const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                          if (!cloudName) {
                            alert("Configura NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME en tu panel de Cloudflare.");
                            return;
                          }
                          
                          setIsSaving(true);
                          const formData = new FormData();
                          formData.append("file", file);
                          formData.append("upload_preset", "omnihub_preset"); // Asegúrate de crear este preset en Cloudinary como 'unsigned'
                          
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
