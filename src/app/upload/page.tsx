"use client";

import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UploadCloud, File, Image as ImageIcon, CheckCircle, Save } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function UploadPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  
  const [fileMode, setFileMode] = useState<"image" | "file">("file");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userProfile) return;
    if (!title || !description || !selectedFile) {
      alert("Por favor completa todos los campos y selecciona un archivo.");
      return;
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      alert("Falta configurar NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");
      return;
    }

    setIsPublishing(true);
    let finalFileUrl = "";
    let finalThumbnailUrl = null;

    try {
      // Si es imagen, usamos Cloudinary
      if (fileMode === "image") {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("upload_preset", "omnihub_preset");
        
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: formData
        });
        
        const data = await res.json();
        if (!data.secure_url) throw new Error(data.error?.message || "Error al subir imagen.");
        finalFileUrl = data.secure_url;
      } 
      // Si es archivo pesado, usamos Google Drive a través del Worker y subimos la miniatura a Cloudinary
      else {
        // Primero subir la miniatura (si existe)
        if (thumbnailFile) {
          const formData = new FormData();
          formData.append("file", thumbnailFile);
          formData.append("upload_preset", "omnihub_preset");
          
          const thumbRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: formData
          });
          const thumbData = await thumbRes.json();
          if (thumbData.secure_url) {
            finalThumbnailUrl = thumbData.secure_url;
          }
        }

        const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL || "https://tiny-pond-a740.jozethperez5.workers.dev";
        
        // 1. Pedirle permiso (Access Token) al Worker
        const tokenRes = await fetch(`${workerUrl}/api/secure/drive-token`);
        
        if (!tokenRes.ok) {
          let errorMsg = `Falló la conexión al Worker en: ${workerUrl}/api/secure/drive-token. `;
          try {
            const errorData = await tokenRes.json();
            if (errorData.error) errorMsg += `(Detalle: ${errorData.error})`;
          } catch(e) {
            errorMsg += `(El worker devolvió un error que no es JSON, revisa que el link sea correcto).`;
          }
          throw new Error(errorMsg);
        }
        
        const { token, folderId } = await tokenRes.json();
        
        // 2. Subir directamente a Google Drive desde el navegador (bypasseando límites)
        const metadata = {
          name: selectedFile.name,
          parents: [folderId || "root"], // Usa el folderId configurado en el worker
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', selectedFile);

        const driveRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: form
        });

        const driveData = await driveRes.json();
        if (!driveData.webViewLink) throw new Error("Error al subir a Google Drive: " + JSON.stringify(driveData));
        finalFileUrl = driveData.webViewLink; // Guardamos el link de Google Drive
      }

      // 2. Guardar en Firestore
      await addDoc(collection(db, "posts"), {
        title,
        description,
        fileUrl: finalFileUrl,
        thumbnailUrl: finalThumbnailUrl, // Guardamos la URL de la miniatura si existe
        fileType: fileMode,
        authorId: user.uid,
        authorUsername: userProfile.username,
        authorPhoto: userProfile.photoURL,
        likesCount: 0,
        commentsCount: 0,
        createdAt: serverTimestamp()
      });

      // 3. Redirigir al explorador
      router.push("/explore");

    } catch (error: any) {
      console.error(error);
      alert("Ocurrió un error: " + error.message);
    } finally {
      setIsPublishing(false);
    }
  };

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
              onClick={() => { setFileMode("file"); setSelectedFile(null); setThumbnailFile(null); }}
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
              onClick={() => { setFileMode("image"); setSelectedFile(null); setThumbnailFile(null); }}
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
          <form className="space-y-6" onSubmit={handlePublish}>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Título de la publicación</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={fileMode === "file" ? "Ej. Increíble mod de texturas" : "Ej. Captura de pantalla épica"}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Descripción</label>
              <textarea 
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe qué hace especial a este archivo..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all resize-none"
              ></textarea>
            </div>

            {/* Zona de Input de Miniatura (Solo si es archivo pesado) */}
            {fileMode === "file" && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Miniatura (Opcional pero recomendada)</label>
                <label className="border border-slate-700 bg-slate-950 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-cyan-500 transition-all">
                  <input 
                    type="file" 
                    accept="image/*"
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setThumbnailFile(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center shrink-0">
                    {thumbnailFile ? <CheckCircle className="w-6 h-6 text-green-400" /> : <ImageIcon className="w-6 h-6 text-slate-500" />}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-white truncate">
                      {thumbnailFile ? thumbnailFile.name : "Seleccionar miniatura (Cloudinary)"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Esta imagen se mostrará en Explorar
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* Zona de Input (Disfrazada de Drag & Drop) */}
            <label className="border-2 border-dashed border-cyan-800/50 hover:border-cyan-500 bg-cyan-950/10 rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer group">
              <input 
                type="file" 
                required
                accept={fileMode === "image" ? "image/*" : ".zip,.apk,.rar,.mcpack"}
                className="hidden" 
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
              />
              <div className="w-16 h-16 bg-cyan-900/50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {selectedFile ? <CheckCircle className="w-8 h-8 text-green-400" /> : <UploadCloud className="w-8 h-8 text-cyan-400" />}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {selectedFile ? selectedFile.name : "Toca para seleccionar tu archivo"}
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : "Explora tus carpetas locales"}
              </p>
              
              <div className="px-6 py-2 bg-slate-800 text-slate-300 rounded-full text-sm font-medium hover:bg-slate-700 hover:text-white transition-colors">
                {selectedFile ? "Cambiar archivo" : `Seleccionar ${fileMode === "image" ? "imagen" : "archivo"}`}
              </div>
            </label>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button 
                type="submit"
                disabled={isPublishing}
                className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] flex items-center gap-2 disabled:opacity-50"
              >
                {isPublishing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {isPublishing ? "Subiendo archivo..." : "Publicar Ahora"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
