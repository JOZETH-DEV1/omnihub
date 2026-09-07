"use client";

import React, { useEffect, useRef } from "react";

export default function WaterBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let waves: Wave[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    class Wave {
      y: number;
      length: number;
      amplitude: number;
      speed: number;
      offset: number;
      color: string;

      constructor(y: number, length: number, amplitude: number, speed: number, color: string) {
        this.y = y;
        this.length = length;
        this.amplitude = amplitude;
        this.speed = speed;
        this.offset = Math.random() * 100;
        this.color = color;
      }

      draw(ctx: CanvasRenderingContext2D, time: number) {
        ctx.beginPath();
        ctx.moveTo(0, canvas!.height);
        
        for (let i = 0; i < canvas!.width; i++) {
          const y = Math.sin(i * this.length + time * this.speed + this.offset) * this.amplitude + this.y;
          ctx.lineTo(i, y);
        }
        
        ctx.lineTo(canvas!.width, canvas!.height);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
      }
    }

    class Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = canvas!.height + Math.random() * 100;
        this.size = Math.random() * 3 + 1;
        this.speedY = -(Math.random() * 1.5 + 0.5);
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.1;
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        
        if (this.y < 0) {
          this.y = canvas!.height + 10;
          this.x = Math.random() * canvas!.width;
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      waves = [];
      
      for (let i = 0; i < 50; i++) {
        particles.push(new Particle());
      }
      
      const height = canvas.height;
      waves.push(new Wave(height * 0.7, 0.005, 30, 0.001, "rgba(10, 50, 100, 0.3)"));
      waves.push(new Wave(height * 0.8, 0.003, 40, 0.0015, "rgba(5, 30, 80, 0.4)"));
      waves.push(new Wave(height * 0.9, 0.004, 50, 0.002, "rgba(0, 15, 40, 0.6)"));
    };

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#010A15");
      gradient.addColorStop(1, "#021A30");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.update();
        p.draw(ctx);
      });

      waves.forEach(w => {
        w.draw(ctx, time);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resize);
    resize();
    init();
    animate(0);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-[-1] pointer-events-none"
    />
  );
}
