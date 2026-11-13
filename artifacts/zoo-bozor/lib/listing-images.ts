import { requestListingUpload } from '@workspace/api-client-react';
import { Platform } from 'react-native';
import { apiUrl } from './api-origin';

export const assetUrl = (uri: string) =>
  uri.startsWith('/api/') ? apiUrl(uri) : uri;

export async function persistListingImages(images: string[]): Promise<string[]> {
  const saved: string[] = [];
  for (const uri of images) {
    if (/^\/api\/storage\/images\/[a-f0-9-]{36}$/.test(uri)) {
      saved.push(uri);
      continue;
    }
    // Browser blobs/data URLs and native gallery URIs are read locally, then sent
    // directly to App Storage. File bytes never pass through the API or database.
    let body: Blob;
    let nativeFile: import('expo-file-system').File | undefined;
    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      if (!response.ok) throw new Error('Rasmni oʻqib boʻlmadi. Galereyadan qayta tanlang.');
      body = await response.blob();
    } else {
      const { File } = await import('expo-file-system');
      nativeFile = new File(uri);
      if (!nativeFile.exists) throw new Error('Rasmni oʻqib boʻlmadi. Galereyadan qayta tanlang.');
      // Expo File implements Blob and expo/fetch streams it without a base64 copy.
      body = nativeFile;
    }
    const contentType = body.type as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/heic' | 'image/heif';
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'].includes(contentType)) {
      throw new Error('JPEG, PNG, WebP yoki HEIC rasm tanlang.');
    }
    const { uploadURL, objectPath } = await requestListingUpload({ contentType, size: body.size });
    const uploadFetch = nativeFile ? (await import('expo/fetch')).fetch : fetch;
    const result = await uploadFetch(uploadURL, { method: 'PUT', headers: { 'Content-Type': contentType }, body });
    if (!result.ok) throw new Error('Rasmni serverga yuklab boʻlmadi. Qoralamani saqlab, qayta urinib koʻring.');
    saved.push(objectPath);
  }
  return saved;
}
