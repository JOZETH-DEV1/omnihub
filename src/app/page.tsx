import Navbar from "@/components/Navbar";
import Link from "next/link";
import { ArrowRight, Sparkles, Layers } from "lucide-react";

export default function Home() {
  return (
    <>
      <Navbar />
      
      <div className="flex-1 flex flex-col pt-20 pb-32">
        {/* Hero Section */}
        <section className="container mx-auto px-4 flex flex-col items-center justify-center text-center max-w-4xl min-h-[50vh]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-900/30 border border-cyan-700/50 text-cyan-400 text-xs font-semibold mb-8 backdrop-blur-sm">
            <Sparkles className="w-3 h-3" />
            <span>Welcome to the next generation of sharing</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            Dive into the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
              Deep Web Community
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed">
            Omnihub is a premium platform for sharing files, images, and content. Immerse yourself in a fluid, futuristic experience designed for creators.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link href="/explore" className="h-12 px-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all">
              Explore Content
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login" className="h-12 px-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium flex items-center justify-center transition-all backdrop-blur-md">
              Join Omnihub
            </Link>
          </div>
        </section>

        {/* Featured Posts Grid */}
        <section className="container mx-auto px-4 mt-32">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Layers className="w-6 h-6 text-cyan-500" />
              Trending Drops
            </h2>
            <Link href="/explore" className="text-sm font-medium text-cyan-400 hover:text-cyan-300">View all</Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <PostCard key={i} index={i} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function PostCard({ index }: { index: number }) {
  const images = [
    "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop"
  ];
  const image = images[index % 3];

  return (
    <div className="group relative rounded-2xl bg-slate-900/40 border border-slate-700/50 overflow-hidden backdrop-blur-md hover:border-cyan-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] hover:-translate-y-1">
      <div className="relative aspect-video overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10 opacity-60"></div>
        <img 
          src={image} 
          alt="Post thumbnail" 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute bottom-3 left-3 right-3 z-20 flex justify-between items-end">
          <div className="flex gap-2">
            <span className="px-2 py-1 rounded bg-black/50 backdrop-blur-sm border border-white/10 text-xs font-medium text-cyan-300">App</span>
            <span className="px-2 py-1 rounded bg-black/50 backdrop-blur-sm border border-white/10 text-xs font-medium text-slate-300">New</span>
          </div>
        </div>
      </div>
      
      <div className="p-5 relative z-20">
        <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-cyan-400 transition-colors">Amazing Digital Asset {index}</h3>
        <p className="text-sm text-slate-400 line-clamp-2 mb-4">
          Download the latest files and tools for your workflow. Experience seamless integration and premium quality.
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500"></div>
            <span className="text-xs font-medium text-slate-300">@creator_ocean</span>
          </div>
          <span className="text-xs text-slate-500">2h ago</span>
        </div>
      </div>
      
      {/* Ripple/Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/0 via-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/5 group-hover:via-blue-500/5 group-hover:to-purple-500/10 pointer-events-none transition-all duration-500"></div>
    </div>
  );
}
