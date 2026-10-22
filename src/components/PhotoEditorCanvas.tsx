/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  FlipHorizontal,
  RefreshCcw,
  Move,
  Focus,
  Upload,
  Camera,
} from 'lucide-react';
import { OFFICIAL_FRAME, TransformState } from '../types';
import { renderOfficialFrameVisual } from '../utils/imageUtils';

interface PhotoEditorCanvasProps {
  frameImage: HTMLImageElement | null;
  photoImage: HTMLImageElement | null;
  transform: TransformState;
  onTransformChange: (updater: (prev: TransformState) => TransformState) => void;
  customText: string;
  topText?: string;
  onOpenPhotoPicker?: () => void;
}

export const PhotoEditorCanvas: React.FC<PhotoEditorCanvasProps> = ({
  frameImage,
  photoImage,
  transform,
  onTransformChange,
  customText,
  topText = "English department\nGraduation day 🎓",
  onOpenPhotoPicker,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activePointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const dragStartRef = useRef<{ x: number; y: number; initialTx: number; initialTy: number }>({
    x: 0,
    y: 0,
    initialTx: 0,
    initialTy: 0,
  });
  const initialPinchDistance = useRef<number | null>(null);
  const initialPinchScale = useRef<number>(1);
  const [isDragging, setIsDragging] = useState(false);

  // Re-render when any dependency changes
  useEffect(() => {
    if (!canvasRef.current) return;
    renderOfficialFrameVisual(
      canvasRef.current,
      frameImage,
      photoImage,
      transform,
      customText,
      topText
    );
  }, [frameImage, photoImage, transform, customText, topText]);

  // Touch & Pointer Down
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!photoImage) {
      // Tap on canvas when no photo opens the photo picker!
      if (onOpenPhotoPicker) {
        onOpenPhotoPicker();
      }
      return;
    }

    e.currentTarget.setPointerCapture(e.pointerId);
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointers.current.size === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        initialTx: transform.x,
        initialTy: transform.y,
      };
    } else if (activePointers.current.size === 2) {
      const points = Array.from(activePointers.current.values());
      const dist = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      initialPinchDistance.current = dist;
      initialPinchScale.current = transform.scale;
    }
  };

  // Pointer Move (Single pointer drag + pinch zoom)
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!activePointers.current.has(e.pointerId)) return;
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Multi-touch pinch zoom
    if (activePointers.current.size === 2 && initialPinchDistance.current !== null) {
      const points = Array.from(activePointers.current.values());
      const currentDist = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      const ratio = currentDist / initialPinchDistance.current;
      const nextScale = Math.min(Math.max(initialPinchScale.current * ratio, 0.5), 3.5);

      onTransformChange((prev) => ({
        ...prev,
        scale: Number(nextScale.toFixed(2)),
      }));
      return;
    }

    // Single pointer pan (drag photo)
    if (isDragging && activePointers.current.size === 1 && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleFactor = OFFICIAL_FRAME.width / rect.width;

      const deltaX = (e.clientX - dragStartRef.current.x) * scaleFactor;
      const deltaY = (e.clientY - dragStartRef.current.y) * scaleFactor;

      const maxOffset = OFFICIAL_FRAME.width * 0.7;
      const nextX = Math.min(Math.max(dragStartRef.current.initialTx + deltaX, -maxOffset), maxOffset);
      const nextY = Math.min(Math.max(dragStartRef.current.initialTy + deltaY, -maxOffset), maxOffset);

      onTransformChange((prev) => ({
        ...prev,
        x: Math.round(nextX),
        y: Math.round(nextY),
      }));
    }
  };

  // Pointer Up / Cancel
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    activePointers.current.delete(e.pointerId);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (activePointers.current.size === 0) {
      setIsDragging(false);
      initialPinchDistance.current = null;
    } else if (activePointers.current.size === 1) {
      const remaining = Array.from(activePointers.current.values())[0];
      dragStartRef.current = {
        x: remaining.x,
        y: remaining.y,
        initialTx: transform.x,
        initialTy: transform.y,
      };
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    onTransformChange((prev) => {
      const next = Math.min(Math.max(prev.scale + delta, 0.5), 3.5);
      return { ...prev, scale: Number(next.toFixed(2)) };
    });
  };

  const handleZoom = (delta: number) => {
    onTransformChange((prev) => {
      const next = Math.min(Math.max(prev.scale + delta, 0.5), 3.5);
      return { ...prev, scale: Number(next.toFixed(2)) };
    });
  };

  const handleRotate = () => {
    onTransformChange((prev) => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360,
    }));
  };

  const handleFlip = () => {
    onTransformChange((prev) => ({
      ...prev,
      flipH: !prev.flipH,
    }));
  };

  const handleReset = () => {
    onTransformChange(() => ({
      x: 0,
      y: 0,
      scale: 1.0,
      rotation: 0,
      flipH: false,
    }));
  };

  const handleCenterFace = () => {
    onTransformChange((prev) => ({
      ...prev,
      x: 0,
      y: -20,
      scale: 1.15,
    }));
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      {/* Visual Canvas Viewport */}
      <div
        onClick={() => {
          if (!photoImage && onOpenPhotoPicker) {
            onOpenPhotoPicker();
          }
        }}
        className={`relative w-full max-w-[380px] sm:max-w-[420px] aspect-[736/981] bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-800 touch-canvas select-none ${
          !photoImage ? 'cursor-pointer hover:border-blue-500 hover:shadow-blue-500/10 transition-all' : ''
        }`}
      >
        <canvas
          ref={canvasRef}
          width={OFFICIAL_FRAME.width}
          height={OFFICIAL_FRAME.height}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
          className={`w-full h-full object-contain ${
            photoImage ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
          }`}
          title={photoImage ? "Glissez avec un doigt pour déplacer la photo dans le cercle" : "Cliquez ou touchez pour importer votre photo"}
        />

        {/* Live Touch Feedback Badge */}
        {photoImage && (
          <div className="absolute top-3 left-3 bg-slate-950/75 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[11px] font-medium text-white border border-white/10 pointer-events-none flex items-center gap-1.5 shadow-md">
            <Move className="w-3.5 h-3.5 text-blue-400" />
            <span>Glissez pour ajuster le visage</span>
          </div>
        )}

        {/* Interactive Overlay when no photo is loaded */}
        {!photoImage && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenPhotoPicker) onOpenPhotoPicker();
            }}
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto cursor-pointer p-4 group"
          >
            {/* Pulsing button right in the center of the circle */}
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xl group-hover:scale-110 active:scale-95 transition-transform">
              <Camera className="w-8 h-8" />
            </div>
            <span className="mt-3 px-3.5 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-sm text-xs font-bold text-white shadow-md border border-white/10 group-hover:bg-blue-600 transition-colors">
              Toucher pour importer votre photo
            </span>
          </div>
        )}
      </div>

      {/* Touch & Click Adjustment Controls Bar */}
      {photoImage && (
        <div className="w-full max-w-[420px] bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-lg">
          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleZoom(-0.15)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 active:scale-95 transition-all"
              title="Dézoomer"
            >
              <ZoomOut className="w-5 h-5" />
            </button>

            <div className="flex-1 flex flex-col px-1">
              <div className="flex justify-between text-[11px] text-slate-400 font-medium mb-1">
                <span>Zoom</span>
                <span className="tabular-nums font-mono text-blue-400 font-semibold">
                  {Math.round(transform.scale * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.05"
                value={transform.scale}
                onChange={(e) =>
                  onTransformChange((prev) => ({
                    ...prev,
                    scale: parseFloat(e.target.value),
                  }))
                }
                className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
              />
            </div>

            <button
              type="button"
              onClick={() => handleZoom(0.15)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 active:scale-95 transition-all"
              title="Zoomer"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Adjustment Buttons */}
          <div className="grid grid-cols-4 gap-2 pt-1 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleCenterFace}
              className="min-h-[44px] flex flex-col items-center justify-center gap-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-blue-300 active:scale-95 transition-all text-[11px] font-medium"
              title="Centrer le portrait"
            >
              <Focus className="w-4 h-4 text-blue-400" />
              <span>Centrer</span>
            </button>

            <button
              type="button"
              onClick={handleRotate}
              className="min-h-[44px] flex flex-col items-center justify-center gap-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white active:scale-95 transition-all text-[11px] font-medium"
              title="Pivoter de 90°"
            >
              <RotateCw className="w-4 h-4" />
              <span>Pivoter 90°</span>
            </button>

            <button
              type="button"
              onClick={handleFlip}
              className="min-h-[44px] flex flex-col items-center justify-center gap-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white active:scale-95 transition-all text-[11px] font-medium"
              title="Effet miroir"
            >
              <FlipHorizontal className="w-4 h-4" />
              <span>Miroir</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="min-h-[44px] flex flex-col items-center justify-center gap-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white active:scale-95 transition-all text-[11px] font-medium"
              title="Réinitialiser"
            >
              <RefreshCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
