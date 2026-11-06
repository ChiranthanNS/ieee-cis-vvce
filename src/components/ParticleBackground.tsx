import React, { useEffect, useRef } from 'react';

export const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const dotCount = Math.min(Math.floor((width * height) / 18000), 70);
    const dots = Array.from({ length: dotCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2 + 1,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connection lines between nearby dots
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dist = Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y);
          if (dist < 120) {
            ctx.strokeStyle = `rgba(34, 211, 238, ${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw dots
      dots.forEach((dot) => {
        dot.x += dot.dx;
        dot.y += dot.dy;
        if (dot.x < 0 || dot.x > width) dot.dx *= -1;
        if (dot.y < 0 || dot.y > height) dot.dy *= -1;

        ctx.fillStyle = `rgba(103, 232, 249, ${dot.alpha})`;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      {/* Dynamic ambient radial gradients */}
      <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden">
        <div className="absolute w-[800px] h-[800px] bg-indigo-600/15 blur-[160px] top-[-250px] left-[-200px] rounded-full animate-pulse-subtle"></div>
        <div className="absolute w-[700px] h-[700px] bg-cyan-500/15 blur-[160px] bottom-[-200px] right-[-200px] rounded-full"></div>
        <div className="absolute w-[500px] h-[500px] bg-blue-600/10 blur-[130px] top-[40%] left-[30%] rounded-full"></div>
      </div>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none -z-10" />
    </>
  );
};
