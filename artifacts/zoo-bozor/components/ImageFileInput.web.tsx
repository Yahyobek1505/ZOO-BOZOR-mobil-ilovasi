import React, { useState } from 'react';

async function persistentImage(file: File): Promise<string> {
  if (file.size > 20 * 1024 * 1024) throw new Error('Rasm hajmi 20 MB dan oshmasin.');
  const url = URL.createObjectURL(file);
  try {
    const image = new window.Image();
    image.src = url;
    await image.decode();
    const ratio = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Rasmni tayyorlab boʻlmadi.');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.78);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** A real browser input keeps file selection inside the user's click gesture. */
export function ImageFileInput({ remaining, onImages, onError }: {
  remaining: number;
  onImages: (images: string[]) => void;
  onError: (message: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  return <input
    type="file"
    accept="image/*"
    multiple
    disabled={busy || remaining <= 0}
    aria-label={busy ? 'Rasmlar tayyorlanmoqda' : 'Rasm qoʻshish'}
    data-testid="listing-image-input"
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
    onChange={async (event) => {
      const input = event.currentTarget;
      const files = Array.from(input.files ?? []).slice(0, remaining);
      if (!files.length) return;
      setBusy(true);
      try {
        onImages(await Promise.all(files.map(persistentImage)));
      } catch (error) {
        onError(error instanceof Error && error.message.includes('MB')
          ? error.message : 'Rasmni ochib boʻlmadi. JPG, PNG yoki WebP rasm tanlang.');
      } finally {
        input.value = '';
        setBusy(false);
      }
    }}
  />;
}
