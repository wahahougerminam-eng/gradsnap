/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { OFFICIAL_FRAME, TransformState } from '../types';

export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Validates uploaded photo file
 */
export async function validatePhotoFile(file: File): Promise<{ valid: boolean; error?: string }> {
  if (!file) {
    return { valid: false, error: 'Aucun fichier sélectionné.' };
  }

  const isValidType =
    ALLOWED_FILE_TYPES.includes(file.type.toLowerCase()) ||
    /\.(jpe?g|png|webp)$/i.test(file.name);
  if (!isValidType) {
    return {
      valid: false,
      error: 'Format non pris en charge. Veuillez importer une photo JPEG, PNG ou WebP.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `La taille du fichier (${sizeInMb} Mo) dépasse la limite de 15 Mo.`,
    };
  }

  return new Promise((resolve) => {
    const tempUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(tempUrl);
      resolve({ valid: true });
    };
    img.onerror = () => {
      URL.revokeObjectURL(tempUrl);
      resolve({
        valid: false,
        error: 'Impossible de lire cette image. Le fichier semble corrompu ou illisible.',
      });
    };
    img.src = tempUrl;
  });
}

/**
 * Load image safely into HTMLImageElement
 */
export function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Erreur de chargement: ' + err));
    img.src = src;
  });
}

// Cached punched-out frame canvas to avoid recalculating destination-out on every frame
let cachedPunchedFrameCanvas: HTMLCanvasElement | null = null;
let cachedPunchedFrameSrc: string | null = null;

function getPunchedFrameCanvas(frameImg: HTMLImageElement): HTMLCanvasElement {
  if (cachedPunchedFrameCanvas && cachedPunchedFrameSrc === frameImg.src) {
    return cachedPunchedFrameCanvas;
  }

  const w = OFFICIAL_FRAME.width;
  const h = OFFICIAL_FRAME.height;
  const { cx, cy, radius } = OFFICIAL_FRAME.circleCutout;

  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  const octx = off.getContext('2d');
  if (!octx) return off;

  // Draw full frame image
  octx.drawImage(frameImg, 0, 0, w, h);

  // Punch out the circular opening (slightly inset by 3px to hide white JPEG artifacts behind the blue ring)
  octx.save();
  octx.globalCompositeOperation = 'destination-out';
  octx.beginPath();
  octx.arc(cx, cy, radius - 3, 0, Math.PI * 2);
  octx.fill();
  octx.restore();

  cachedPunchedFrameCanvas = off;
  cachedPunchedFrameSrc = frameImg.src;
  return off;
}

/**
 * Main render function
 */
export function renderOfficialFrameVisual(
  canvas: HTMLCanvasElement,
  frameImg: HTMLImageElement | null,
  photoImg: HTMLImageElement | null,
  transform: TransformState,
  customText: string,
  topText: string = "Journée de graduation 🎓"
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = OFFICIAL_FRAME.width;
  const h = OFFICIAL_FRAME.height;
  const { cx, cy, radius } = OFFICIAL_FRAME.circleCutout;

  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }

  ctx.clearRect(0, 0, w, h);

  // Background base
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, w, h);

  // 1. LAYER 1: User Photo clipped strictly to the circular frame
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();

  // Circle background
  ctx.fillStyle = '#F1F5F9';
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

  if (photoImg && photoImg.width > 0 && photoImg.height > 0) {
    ctx.save();
    ctx.translate(cx + transform.x, cy + transform.y);

    if (transform.rotation !== 0) {
      ctx.rotate((transform.rotation * Math.PI) / 180);
    }

    if (transform.flipH) {
      ctx.scale(-1, 1);
    }

    const isRotated90 = transform.rotation === 90 || transform.rotation === 270;
    const effImgW = isRotated90 ? photoImg.height : photoImg.width;
    const effImgH = isRotated90 ? photoImg.width : photoImg.height;

    // Minimum scale to completely cover the circular area
    const diameter = radius * 2;
    const baseScale = Math.max(diameter / effImgW, diameter / effImgH);
    const finalScale = baseScale * transform.scale;

    const drawW = photoImg.width * finalScale;
    const drawH = photoImg.height * finalScale;

    ctx.drawImage(photoImg, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  } else {
    // Empty state guide inside circle
    ctx.fillStyle = '#334155';
    ctx.font = '600 20px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Cliquez sur « Importer »', cx, cy - 14);
    ctx.font = '500 16px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText('pour placer votre photo', cx, cy + 16);
  }

  ctx.restore();

  // 2. LAYER 2: Frame Image with punched-out circle placed on top
  if (frameImg && frameImg.width > 0) {
    const punched = getPunchedFrameCanvas(frameImg);
    ctx.drawImage(punched, 0, 0, w, h);
  }

  // 3. LAYER 3: Top Header "English department\nGraduation day 🎓"
  const defaultTop = "English department\nGraduation day 🎓";
  const displayTop = (topText !== undefined && topText.trim() !== '' ? topText : defaultTop).trim();
  if (displayTop) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = OFFICIAL_FRAME.topTextPlacement.color;

    // Soft drop shadow for clean contrast
    ctx.shadowColor = 'rgba(7, 30, 98, 0.15)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 1;

    const lines = displayTop.split('\n').map((l) => l.trim()).filter(Boolean);

    if (lines.length >= 2) {
      // 2 lines: Line 1 department subtitle, Line 2 graduation day title with 🎓 behind
      ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = '2.5px';
      ctx.fillText(lines[0].toUpperCase(), cx, 132);

      let line2 = lines[1];
      // Strip any leading 🎓 symbol if user had it in front
      line2 = line2.replace(/^🎓\s*/, '').trim();
      // Ensure 🎓 is placed behind if line 2 mentions graduation
      if (line2.toLowerCase().includes('graduation') && !line2.includes('🎓')) {
        line2 = `${line2} 🎓`;
      }

      ctx.font = '900 34px "Plus Jakarta Sans", "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
      ctx.letterSpacing = '1.5px';
      if (ctx.measureText(line2.toUpperCase()).width > w - 120) {
        ctx.font = '900 28px "Plus Jakarta Sans", "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
      }
      ctx.fillText(line2.toUpperCase(), cx, 174);
    } else {
      let singleLine = displayTop;
      singleLine = singleLine.replace(/^🎓\s*/, '').trim();
      if (singleLine.toLowerCase().includes('graduation') && !singleLine.includes('🎓')) {
        singleLine = `${singleLine} 🎓`;
      }
      ctx.font = '800 30px "Plus Jakarta Sans", "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
      ctx.letterSpacing = '1px';
      if (ctx.measureText(singleLine).width > w - 160) {
        ctx.font = '800 24px "Plus Jakarta Sans", "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
      }
      ctx.fillText(singleLine, cx, OFFICIAL_FRAME.topTextPlacement.y);
    }

    ctx.restore();
  }

  // 4. LAYER 4: Bottom Text "J'y serai" on the blue area
  const displayText = (customText || "J'y serai").trim();
  if (displayText) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textY = OFFICIAL_FRAME.textPlacement.y;

    // Outer subtle glow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;

    // Typography
    ctx.font = '900 44px Plus Jakarta Sans, sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillStyle = '#FFFFFF';

    // Auto-scale if text is longer
    if (ctx.measureText(displayText).width > w - 160) {
      ctx.font = '800 34px Plus Jakarta Sans, sans-serif';
    }

    ctx.fillText(displayText, cx, textY);

    ctx.restore();
  }
}

/**
 * Export high-definition PNG or JPEG with dataUrl return for instant preview/saving
 */
export async function downloadOfficialVisualPng(
  canvas: HTMLCanvasElement,
  filename = "visuel-graduation-j-y-serai.png",
  format: 'png' | 'jpeg' = 'png'
): Promise<{ success: boolean; dataUrl?: string; error?: string }> {
  try {
    const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), mime, format === 'jpeg' ? 0.95 : 1.0);
    });

    if (!blob) {
      return { success: false, error: 'Impossible de générer le fichier image.' };
    }

    const dataUrl = canvas.toDataURL(mime, format === 'jpeg' ? 0.95 : 1.0);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 10000);

    return { success: true, dataUrl };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erreur inattendue.',
    };
  }
}

/**
 * Mobile Native share
 */
export async function shareOfficialVisualPng(
  canvas: HTMLCanvasElement
): Promise<{ shared: boolean; supported: boolean; error?: string }> {
  if (!navigator.share) {
    return { shared: false, supported: false };
  }

  try {
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/png', 1.0);
    });

    if (!blob) return { shared: false, supported: true, error: 'Fichier invalide' };

    const file = new File([blob], 'visuel-j-y-serai.png', { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: "Mon visuel - J'y serai !",
        text: "Voici mon visuel officiel : J'y serai ! 🎉",
      });
      return { shared: true, supported: true };
    } else {
      await navigator.share({
        title: "Mon visuel - J'y serai !",
        text: "Voici mon visuel officiel : J'y serai ! 🎉",
      });
      return { shared: true, supported: true };
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { shared: false, supported: true };
    }
    return { shared: false, supported: true, error: err.message };
  }
}
