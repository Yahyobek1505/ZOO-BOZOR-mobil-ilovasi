import React from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/LocalizedText';
import { F } from '@/constants/colors';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import type { GeoPoint } from '@/constants/data';

const TILE = 256;

/**
 * Static map preview for the listing "Joylashuv" card (Figma 11-Tanlangan hayvon).
 * Stitches the few OpenStreetMap tiles around the point — the same tile server the map tab uses —
 * so no map SDK is needed for a picture.
 */
export function MiniMap({ geo, width, height, zoom = 14 }: { geo: GeoPoint; width: number; height: number; zoom?: number }) {
  const { C } = useTheme();
  const st = useSt();
  const scale = TILE * 2 ** zoom;
  const latRad = (geo.lat * Math.PI) / 180;
  const px = ((geo.lng + 180) / 360) * scale;
  const py = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * scale;
  const left = px - width / 2;
  const top = py - height / 2;
  const tiles: { key: string; x: number; y: number; uri: string }[] = [];
  for (let tx = Math.floor(left / TILE); tx <= Math.floor((left + width) / TILE); tx++) {
    for (let ty = Math.floor(top / TILE); ty <= Math.floor((top + height) / TILE); ty++) {
      tiles.push({ key: `${tx}-${ty}`, x: tx * TILE - left, y: ty * TILE - top, uri: `https://tile.openstreetmap.org/${zoom}/${tx}/${ty}.png` });
    }
  }
  return (
    <View style={[st.wrap, { width, height }]} accessibilityLabel="Xarita" testID="mini-map">
      {tiles.map((t) => (
        <Image key={t.key} source={{ uri: t.uri }} style={{ position: 'absolute', left: t.x, top: t.y, width: TILE, height: TILE }} />
      ))}
      <View pointerEvents="none" style={[st.pin, { left: width / 2 - 16, top: height / 2 - 32 }]}>
        <Ionicons name="location" size={32} color={C.ink} />
      </View>
      <Text style={st.attr}>© OpenStreetMap</Text>
    </View>
  );
}

const useSt = makeStyles((C) => ({
  wrap: { overflow: 'hidden', borderRadius: 10, borderWidth: 1, borderColor: C.dark ? C.border : '#d9d9d9', backgroundColor: '#eef0f3' },
  pin: { position: 'absolute', width: 32, height: 32 },
  attr: { position: 'absolute', right: 4, bottom: 2, fontFamily: F.medium, fontSize: 8, color: '#555', backgroundColor: 'rgba(255,255,255,0.7)', paddingHorizontal: 3, borderRadius: 3 },
}));
