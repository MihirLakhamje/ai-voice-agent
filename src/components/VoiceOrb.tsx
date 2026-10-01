import React, { useEffect, useRef } from 'react';
import { VoiceStatus } from '../hooks/useLiveVoice';

interface VoiceOrbProps {
  status: VoiceStatus;
  userVolume: number;
  counselorVolume: number;
  counselorName: string;
  isMuted: boolean;
  onClick?: () => void;
}

export const VoiceOrb: React.FC<VoiceOrbProps> = ({
  status,
  userVolume,
  counselorVolume,
  counselorName,
  isMuted,
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let phase = 0;

    const render = () => {
      phase += 0.03;
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Determine active intensity and color palettes based on state
      const isSpeaking = status === 'speaking';
      const isListening = status === 'listening';
      const isConnecting = status === 'connecting';

      // Base radius
      const baseRadius = 80;
      const activeVolume = isSpeaking ? counselorVolume : isListening && !isMuted ? userVolume : 0;
      const dynamicMultiplier = Math.min(activeVolume * 140, 60);

      // Background ambient glow
      const glowGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        baseRadius * 0.4,
        centerX,
        centerY,
        baseRadius * 2.2 + dynamicMultiplier
      );

      if (isSpeaking) {
        // Vibrant Indigo / Amber / Cyan for Counselor Speech
        glowGrad.addColorStop(0, 'rgba(99, 102, 241, 0.45)');
        glowGrad.addColorStop(0.5, 'rgba(139, 92, 246, 0.25)');
        glowGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
      } else if (isListening) {
        // Emerald / Teal for User Listening
        glowGrad.addColorStop(0, 'rgba(16, 185, 129, 0.45)');
        glowGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.25)');
        glowGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
      } else if (isConnecting) {
        // Amber for Connecting
        glowGrad.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
        glowGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      } else {
        // Idle subtle deep slate glow
        glowGrad.addColorStop(0, 'rgba(148, 163, 184, 0.12)');
        glowGrad.addColorStop(1, 'rgba(148, 163, 184, 0)');
      }

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 2.2 + dynamicMultiplier, 0, Math.PI * 2);
      ctx.fill();

      // Draw multi-layered organic wave rings
      const layers = isSpeaking ? 4 : isListening ? 3 : 2;

      for (let l = 0; l < layers; l++) {
        ctx.beginPath();
        const layerOffset = l * (Math.PI / 3);
        const layerRadius = baseRadius + (l * 12) + dynamicMultiplier * (0.4 + l * 0.2);

        for (let angle = 0; angle <= Math.PI * 2; angle += 0.05) {
          const distortion =
            Math.sin(angle * (3 + l) + phase + layerOffset) * (4 + dynamicMultiplier * 0.3) +
            Math.cos(angle * 2 - phase * 1.5) * (3 + dynamicMultiplier * 0.2);

          const r = layerRadius + distortion;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;

          if (angle === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();

        if (isSpeaking) {
          ctx.strokeStyle = `rgba(168, 85, 247, ${0.7 - l * 0.15})`;
          ctx.lineWidth = 2.5 - l * 0.5;
        } else if (isListening) {
          ctx.strokeStyle = `rgba(52, 211, 153, ${0.75 - l * 0.2})`;
          ctx.lineWidth = 2.5 - l * 0.5;
        } else if (isConnecting) {
          ctx.strokeStyle = `rgba(251, 191, 36, ${0.6 - l * 0.2})`;
          ctx.lineWidth = 2;
        } else {
          ctx.strokeStyle = `rgba(148, 163, 184, ${0.25 - l * 0.08})`;
          ctx.lineWidth = 1.5;
        }
        ctx.stroke();
      }

      // Central core orb
      const coreGrad = ctx.createRadialGradient(
        centerX - 15,
        centerY - 15,
        5,
        centerX,
        centerY,
        baseRadius * 0.75
      );

      if (isSpeaking) {
        coreGrad.addColorStop(0, '#c084fc');
        coreGrad.addColorStop(0.5, '#7c3aed');
        coreGrad.addColorStop(1, '#4338ca');
      } else if (isListening) {
        coreGrad.addColorStop(0, '#6ee7b7');
        coreGrad.addColorStop(0.5, '#059669');
        coreGrad.addColorStop(1, '#0f766e');
      } else if (isConnecting) {
        coreGrad.addColorStop(0, '#fde68a');
        coreGrad.addColorStop(0.6, '#d97706');
        coreGrad.addColorStop(1, '#92400e');
      } else {
        coreGrad.addColorStop(0, '#475569');
        coreGrad.addColorStop(0.8, '#1e293b');
        coreGrad.addColorStop(1, '#0f172a');
      }

      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 0.72 + dynamicMultiplier * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.shadowColor = isSpeaking ? '#a855f7' : isListening ? '#10b981' : 'transparent';
      ctx.shadowBlur = isSpeaking || isListening ? 25 : 0;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Inner highlight sparkle
      ctx.beginPath();
      ctx.arc(centerX - 18, centerY - 18, 14, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.fill();

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [status, userVolume, counselorVolume, isMuted]);

  return (
    <div
      onClick={onClick}
      className="relative flex flex-col items-center justify-center cursor-pointer select-none group"
      role="button"
      tabIndex={0}
      aria-label={`${counselorName} Voice Visualizer, status: ${status}`}
    >
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.02]">
        <canvas
          ref={canvasRef}
          width={360}
          height={360}
          className="w-full h-full pointer-events-none drop-shadow-2xl"
        />

        {/* Central Overlay Indicator Icon / Counselor Initial */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {status === 'disconnected' && (
            <div className="flex flex-col items-center space-y-2 text-slate-400">
              <div className="w-14 h-14 rounded-full bg-slate-800/80 border border-slate-700/80 flex items-center justify-center shadow-lg group-hover:bg-slate-700/80 transition-colors">
                <svg
                  className="w-6 h-6 text-slate-200 ml-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </div>
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400/90">
                Tap to Connect
              </span>
            </div>
          )}

          {status === 'connecting' && (
            <div className="flex flex-col items-center space-y-2 text-amber-200">
              <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium tracking-wide">Connecting...</span>
            </div>
          )}

          {status === 'speaking' && (
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-6 bg-white/90 rounded-full animate-pulse" />
              <span className="w-1.5 h-10 bg-white/90 rounded-full animate-pulse [animation-delay:150ms]" />
              <span className="w-1.5 h-8 bg-white/90 rounded-full animate-pulse [animation-delay:300ms]" />
              <span className="w-1.5 h-4 bg-white/90 rounded-full animate-pulse [animation-delay:450ms]" />
            </div>
          )}

          {status === 'listening' && (
            <div className="flex flex-col items-center space-y-1">
              <div className="flex items-center space-x-1">
                <span className="w-1 h-3 bg-emerald-200/90 rounded-full animate-ping" />
                <span className="w-1 h-5 bg-emerald-200/90 rounded-full animate-ping [animation-delay:200ms]" />
                <span className="w-1 h-3 bg-emerald-200/90 rounded-full animate-ping [animation-delay:400ms]" />
              </div>
              <span className="text-[11px] font-medium text-emerald-200/90 tracking-wide mt-1">
                Listening...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
