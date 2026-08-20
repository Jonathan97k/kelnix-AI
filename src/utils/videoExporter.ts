import { PhotoSlide, ReelConfig, AspectRatio } from '../types';

export interface RenderProgressCallback {
  (progress: number, currentSlideIndex: number, totalSlides: number, statusText: string): void;
}

export async function exportReelAsVideo(
  slides: PhotoSlide[],
  config: ReelConfig,
  onProgress?: RenderProgressCallback
): Promise<Blob> {
  // Dimensions based on aspect ratio
  let width = 1080;
  let height = 1920;

  if (config.aspectRatio === '1:1') {
    width = 1080;
    height = 1080;
  } else if (config.aspectRatio === '4:5') {
    width = 1080;
    height = 1350;
  } else if (config.aspectRatio === '16:9') {
    width = 1920;
    height = 1080;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Canvas 2D context not supported');
  }

  // Pre-load all slide media (Images or Videos)
  onProgress?.(0.05, 0, slides.length, 'Loading media assets...');
  const loadedMedia: (HTMLImageElement | HTMLVideoElement)[] = await Promise.all(
    slides.map((slide) => {
      if (slide.mediaType === 'video') {
        return new Promise<HTMLVideoElement>((resolve) => {
          const video = document.createElement('video');
          video.crossOrigin = 'anonymous';
          video.src = slide.url;
          video.muted = true;
          video.playsInline = true;
          video.onloadeddata = () => resolve(video);
          video.onerror = () => {
            // Fallback to placeholder image
            const img = new Image();
            img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" fill="%231e293b"><rect width="100%" height="100%"/><text x="50%" y="50%" fill="%23fff" font-size="48" font-family="sans-serif" text-anchor="middle">Video Clip</text></svg>';
            img.onload = () => resolve(img as any);
          };
        });
      }

      return new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => {
          // If image fails, create fallback canvas
          const fallback = document.createElement('canvas');
          fallback.width = 1080;
          fallback.height = 1920;
          const fCtx = fallback.getContext('2d');
          if (fCtx) {
            fCtx.fillStyle = '#1E293B';
            fCtx.fillRect(0, 0, 1080, 1920);
            fCtx.fillStyle = '#94A3B8';
            fCtx.font = 'bold 48px sans-serif';
            fCtx.textAlign = 'center';
            fCtx.fillText(slide.name || 'Photo', 540, 960);
          }
          const fImg = new Image();
          fImg.src = fallback.toDataURL();
          fImg.onload = () => resolve(fImg);
        };
        img.src = slide.url;
      });
    })
  );

  // Setup MediaRecorder
  const stream = canvas.captureStream(30); // 30 FPS
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : MediaRecorder.isTypeSupported('video/webm')
    ? 'video/webm'
    : 'video/mp4';

  const mediaRecorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 6000000, // 6 Mbps high quality
  });

  const chunks: Blob[] = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  return new Promise(async (resolve, reject) => {
    mediaRecorder.onstop = () => {
      const videoBlob = new Blob(chunks, { type: mimeType });
      resolve(videoBlob);
    };

    mediaRecorder.onerror = (err) => reject(err);
    mediaRecorder.start();

    // Compute timing and total frames
    const fps = 30;
    const totalDuration = slides.reduce((acc, s) => acc + s.duration, 0);
    const totalFrames = Math.floor(totalDuration * fps);

    let currentFrame = 0;
    let accumulatedTime = 0;

    for (let slideIdx = 0; slideIdx < slides.length; slideIdx++) {
      const slide = slides[slideIdx];
      const media = loadedMedia[slideIdx];
      const nextMedia = loadedMedia[(slideIdx + 1) % slides.length];
      const nextSlide = slides[(slideIdx + 1) % slides.length];
      const slideFrames = Math.floor(slide.duration * fps);
      const transitionFrames = Math.min(15, Math.floor(slideFrames * 0.3)); // 0.5s transition

      for (let f = 0; f < slideFrames; f++) {
        const slideProgress = f / slideFrames;
        const isTransitioning = f >= slideFrames - transitionFrames;
        const transitionProgress = isTransitioning ? (f - (slideFrames - transitionFrames)) / transitionFrames : 0;

        // Advance video current time if it's a video element
        if (media instanceof HTMLVideoElement && media.duration) {
          media.currentTime = (slideProgress * Math.min(slide.duration, media.duration)) % media.duration;
        }

        // 1. Draw Background / Base photo/video with motion & filters
        drawSlideFrame(ctx, width, height, media, slide, slideProgress);

        // 2. Draw Transition if in transition window
        if (isTransitioning && nextMedia && slideIdx < slides.length - 1) {
          drawTransitionFrame(ctx, width, height, nextMedia, nextSlide, slide.transition, transitionProgress);
        }

        // 3. Draw Global Overlay (film grain, light leak, VHS)
        drawOverlay(ctx, width, height, config.globalOverlay, currentFrame);

        // 4. Draw Kinetic Captions & Badges
        drawCaptionsAndStickers(ctx, width, height, slide, slideProgress);

        // 5. Draw Watermark / Branding
        drawBranding(ctx, width, height);

        currentFrame++;
        const overallProgress = currentFrame / totalFrames;
        onProgress?.(
          Math.min(0.98, overallProgress),
          slideIdx + 1,
          slides.length,
          `Rendering slide ${slideIdx + 1} of ${slides.length} (Frame ${currentFrame}/${totalFrames})...`
        );

        // Allow browser event loop to process frame
        await new Promise((r) => setTimeout(r, 1000 / fps));
      }
    }

    onProgress?.(1.0, slides.length, slides.length, 'Finalizing video packaging...');
    mediaRecorder.stop();
  });
}

function drawSlideFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  media: HTMLImageElement | HTMLVideoElement,
  slide: PhotoSlide,
  progress: number
) {
  ctx.save();
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, w, h);

  // Apply filters
  const adj = slide.filterAdjustments || { brightness: 1, contrast: 1, saturation: 1, blur: 0, warmth: 0, vignette: 0 };
  let filterStr = `brightness(${adj.brightness}) contrast(${adj.contrast}) saturate(${adj.saturation})`;
  if (adj.blur > 0) filterStr += ` blur(${adj.blur}px)`;
  if (slide.filter === 'bw-contrast') filterStr += ' grayscale(100%)';
  if (slide.filter === 'vintage-film') filterStr += ' sepia(35%)';
  if (slide.filter === 'cyberpunk') filterStr += ' hue-rotate(290deg) contrast(1.2)';
  if (slide.filter === 'golden-hour') filterStr += ' sepia(20%) saturate(1.3)';
  if (slide.filter === 'nordic-cool') filterStr += ' hue-rotate(180deg) saturate(0.85)';

  ctx.filter = filterStr;

  // Calculate Ken Burns Motion transform
  let scale = 1.0;
  let offsetX = 0;
  let offsetY = 0;

  switch (slide.motion) {
    case 'kenburns-zoom-in':
      scale = 1.0 + progress * 0.15;
      break;
    case 'kenburns-zoom-out':
      scale = 1.15 - progress * 0.15;
      break;
    case 'pan-left':
      scale = 1.12;
      offsetX = (0.5 - progress) * (w * 0.1);
      break;
    case 'pan-right':
      scale = 1.12;
      offsetX = (progress - 0.5) * (w * 0.1);
      break;
    case 'pulse-zoom':
      scale = 1.05 + Math.sin(progress * Math.PI * 4) * 0.04;
      break;
    case 'subtle-drift':
      scale = 1.08;
      offsetX = Math.sin(progress * Math.PI) * (w * 0.04);
      offsetY = Math.cos(progress * Math.PI) * (h * 0.03);
      break;
    case 'static':
    default:
      scale = 1.0;
      break;
  }

  // Draw media to cover canvas nicely
  const mediaW = media instanceof HTMLVideoElement ? (media.videoWidth || 1080) : (media.width || 1080);
  const mediaH = media instanceof HTMLVideoElement ? (media.videoHeight || 1920) : (media.height || 1920);
  const imgRatio = mediaW / mediaH;
  const canvasRatio = w / h;
  let drawW = w;
  let drawH = h;

  if (imgRatio > canvasRatio) {
    drawH = h;
    drawW = h * imgRatio;
  } else {
    drawW = w;
    drawH = w / imgRatio;
  }

  drawW *= scale;
  drawH *= scale;

  const centerX = w / 2 + offsetX;
  const centerY = h / 2 + offsetY;

  ctx.drawImage(media, centerX - drawW / 2, centerY - drawH / 2, drawW, drawH);

  // Vignette effect
  if (adj.vignette > 0) {
    ctx.filter = 'none';
    const gradient = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, Math.max(w, h) * 0.8);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, `rgba(0,0,0,${adj.vignette * 0.85})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  }

  ctx.restore();
}

function drawTransitionFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  nextMedia: HTMLImageElement | HTMLVideoElement,
  nextSlide: PhotoSlide,
  transition: string,
  progress: number
) {
  ctx.save();
  const ease = easeInOutCubic(progress);

  switch (transition) {
    case 'whip-left':
      ctx.translate(w * (1 - ease), 0);
      drawSlideFrame(ctx, w, h, nextMedia, nextSlide, 0);
      break;
    case 'whip-right':
      ctx.translate(-w * (1 - ease), 0);
      drawSlideFrame(ctx, w, h, nextMedia, nextSlide, 0);
      break;
    case 'slide-up':
      ctx.translate(0, h * (1 - ease));
      drawSlideFrame(ctx, w, h, nextMedia, nextSlide, 0);
      break;
    case 'flash':
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.sin(progress * Math.PI) * 0.9})`;
      ctx.fillRect(0, 0, w, h);
      break;
    case 'glitch':
      if (Math.random() > 0.4) {
        ctx.fillStyle = progress > 0.5 ? '#06b6d4' : '#ec4899';
        ctx.globalAlpha = 0.3;
        ctx.fillRect(0, Math.random() * h, w, Math.random() * 80);
      }
      break;
    case 'crossfade':
    default:
      ctx.globalAlpha = ease;
      drawSlideFrame(ctx, w, h, nextMedia, nextSlide, 0);
      break;
  }
  ctx.restore();
}

function drawOverlay(ctx: CanvasRenderingContext2D, w: number, h: number, overlay: string, frame: number) {
  if (overlay === 'none') return;
  ctx.save();

  if (overlay === 'film-grain') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    for (let i = 0; i < 400; i++) {
      const gx = Math.random() * w;
      const gy = Math.random() * h;
      ctx.fillRect(gx, gy, 2, 2);
    }
  } else if (overlay === 'vhs-scanlines') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 1);
    }
    // Glitch line
    if (frame % 30 < 4) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(0, (frame * 17) % h, w, 10);
    }
  } else if (overlay === 'light-leak') {
    const leakX = (Math.sin(frame * 0.05) * 0.5 + 0.5) * w;
    const gradient = ctx.createRadialGradient(leakX, 0, 50, leakX, 200, w * 0.8);
    gradient.addColorStop(0, 'rgba(251, 146, 60, 0.35)');
    gradient.addColorStop(0.5, 'rgba(244, 63, 94, 0.15)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  }

  ctx.restore();
}

function drawCaptionsAndStickers(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  slide: PhotoSlide,
  progress: number
) {
  if (!slide.caption) return;
  ctx.save();

  const style = slide.textStyle;
  const fontSize = style.fontSize === 'xl' ? 56 : style.fontSize === 'lg' ? 44 : style.fontSize === 'md' ? 36 : 28;

  // Kinetic entrance animation calculation
  let alpha = 1.0;
  let translateY = 0;
  let scale = 1.0;

  if (style.animation === 'pop-in') {
    scale = progress < 0.2 ? Math.min(1.2, 0.7 + progress * 2.5) : 1.0;
    alpha = Math.min(1.0, progress * 5);
  } else if (style.animation === 'fade-up') {
    translateY = (1 - Math.min(1, progress * 4)) * 30;
    alpha = Math.min(1.0, progress * 4);
  } else if (style.animation === 'karaoke-bounce') {
    scale = 1.0 + Math.sin(progress * Math.PI * 3) * 0.08;
  }

  // Positioning
  let textY = h * 0.82;
  if (style.position === 'top') textY = h * 0.16;
  if (style.position === 'center') textY = h * 0.5;
  if (style.position === 'lower-third') textY = h * 0.72;

  textY += translateY;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Font setup
  let fontFace = 'system-ui, -apple-system, sans-serif';
  if (style.font === 'serif-editorial') fontFace = 'Georgia, "Playfair Display", serif';
  if (style.font === 'condensed-impact') fontFace = 'Impact, sans-serif';
  if (style.font === 'mono-clean') fontFace = 'monospace';
  if (style.font === 'neon-display') fontFace = 'system-ui, sans-serif';

  ctx.font = `bold ${fontSize}px ${fontFace}`;

  const text = slide.caption;
  const metrics = ctx.measureText(text);
  const textW = metrics.width;
  const boxPaddingX = 36;
  const boxPaddingY = 20;

  ctx.translate(w / 2, textY);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;

  // Background Badge
  if (style.hasBadge || style.backgroundColor !== 'transparent') {
    ctx.fillStyle = style.backgroundColor || 'rgba(0,0,0,0.6)';
    roundRect(ctx, -textW / 2 - boxPaddingX, -fontSize / 2 - boxPaddingY, textW + boxPaddingX * 2, fontSize + boxPaddingY * 2, 24);
    ctx.fill();
  }

  // Text Shadow / Neon Glow
  if (style.font === 'neon-display') {
    ctx.shadowColor = style.textColor;
    ctx.shadowBlur = 24;
  } else {
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 3;
  }

  // Text Render
  ctx.fillStyle = style.textColor || '#FFFFFF';
  ctx.fillText(text, 0, 0);

  // Subtitle
  if (slide.subCaption) {
    ctx.shadowBlur = 4;
    ctx.font = `500 ${Math.floor(fontSize * 0.55)}px ${fontFace}`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillText(slide.subCaption, 0, fontSize * 0.85 + 10);
  }

  ctx.restore();

  // Stickers / Badges
  if (slide.stickers && slide.stickers.length > 0) {
    slide.stickers.forEach((sticker) => {
      ctx.save();
      const sx = (sticker.x / 100) * w;
      const sy = (sticker.y / 100) * h;
      ctx.font = 'bold 22px system-ui, sans-serif';
      const sMetrics = ctx.measureText(sticker.text);
      const sW = sMetrics.width + 28;
      const sH = 40;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      roundRect(ctx, sx - sW / 2, sy - sH / 2, sW, sH, 20);
      ctx.fill();

      ctx.fillStyle = '#F8FAFC';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sticker.text, sx, sy);
      ctx.restore();
    });
  }
}

function drawBranding(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.textAlign = 'right';
  ctx.fillText('Kelnix AI', w - 40, h - 35);
  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
