"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useState } from "react";

export default function VerificationBadge({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const [isHovered, setIsHovered] = useState(false);

  const dimensions = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  };

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center ${dimensions[size]} cursor-pointer perspective-1000`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      title="Cuenta Oficial Verificada"
    >
      {/* Glow background effect */}
      <motion.div 
        className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 blur-md opacity-60"
        animate={{ 
          rotate: isHovered ? 180 : 0,
          scale: isHovered ? 1.2 : 1
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      
      {/* 3D Coin/Badge Body */}
      <motion.div
        className="absolute inset-0 rounded-full shadow-[inset_0_-2px_10px_rgba(0,0,0,0.5),0_5px_15px_rgba(34,211,238,0.5)] bg-gradient-to-br from-[#0a1930] to-[#040d1a] border border-cyan-400/50 flex items-center justify-center overflow-hidden"
        animate={{
          rotateY: isHovered ? [0, 15, -15, 0] : 0,
          rotateX: isHovered ? [0, 15, -15, 0] : 0,
        }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Holographic reflection line */}
        <motion.div
          className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
          initial={{ x: "-150%" }}
          animate={{ x: isHovered ? "150%" : "-150%" }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />

        {/* Inner core metallic layer */}
        <div className="absolute inset-[2px] rounded-full bg-gradient-to-tr from-cyan-600 via-blue-500 to-indigo-600 flex items-center justify-center shadow-[inset_0_2px_5px_rgba(255,255,255,0.4)]">
          <Check className={`${iconSizes[size]} text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]`} strokeWidth={3} />
        </div>
      </motion.div>
      
      {/* Sparkles effect when hovered */}
      {isHovered && (
        <>
          <motion.div 
            className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full blur-[1px]"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: [0, 1.5, 0], opacity: [1, 0] }}
            transition={{ duration: 0.6 }}
          />
          <motion.div 
            className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-cyan-200 rounded-full blur-[1px]"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: [0, 1.5, 0], opacity: [1, 0] }}
            transition={{ duration: 0.6, delay: 0.2 }}
          />
        </>
      )}
    </motion.div>
  );
}
