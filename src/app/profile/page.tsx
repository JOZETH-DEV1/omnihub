"use client";

import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import VerificationBadge from "@/components/VerificationBadge";
import { Settings, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

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
      <div className="container mx-auto px-4 pt-10 pb-20 max-w-4xl">
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
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#010A15] bg-slate-800 relative z-10">
                  <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                </div>
                {/* 3D Verification Badge placed right on the avatar */}
                {userProfile.isVerified && (
                  <div className="absolute bottom-1 right-1 z-20">
                    <VerificationBadge size="lg" />
                  </div>
                )}
              </div>
              
              <button className="px-6 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-full font-medium text-sm transition-colors flex items-center gap-2 shadow-lg">
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
      </div>
    </>
  );
}
