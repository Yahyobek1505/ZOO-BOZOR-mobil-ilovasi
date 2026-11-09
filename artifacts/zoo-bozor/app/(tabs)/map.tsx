import React, { useMemo, useState } from 'react';
import { Alert, Image as NativeImage, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, F } from '@/constants/colors';
import { GeoPoint, formatPrice } from '@/constants/data';
import { useApp } from '@/context/AppContext';
import { go, src } from '@/components/ui';
import ListingMap from '@/components/ListingMap';

function absolute(uri: string): string {
  if (/^(https?:|data:|file:|content:|asset:|blob:)/i.test(uri)) return uri;
  try {
    const base = Platform.OS === 'web' && typeof window !== 'undefined'
      ? window.location.origin
      : `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
    return new URL(uri, base).toString();
  } catch {
    return uri;
  }
}

function resolveImageUrl(img: unknown): string | undefined {
  if (img === undefined || img === null) return undefined;
  if (typeof img === 'string') return absolute(img);
  if (typeof img === 'object' && 'uri' in (img as object) && typeof (img as { uri: unknown }).uri === 'string') {
    return absolute((img as { uri: string }).uri);
  }
  try {
    const r = NativeImage.resolveAssetSource(img as number);
    return r?.uri ? absolute(r.uri) : undefined;
  } catch {
    return undefined;
  }
}

export default function MapScreen() {
  const { allListings } = useApp();
  const insets = useSafeAreaInsets();
  const [me, setMe] = useState<GeoPoint | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [perm, requestPerm] = Location.useForegroundPermissions();

  const pins = useMemo(() => allListings.map((l) => ({
    ...l.geo,
    id: l.id,
    title: l.title,
    imageUrl: resolveImageUrl(l.images[0]),
    label: l.price >= 1000000
      ? `${(l.price / 1000000).toLocaleString('uz-UZ', { maximumFractionDigits: 1 })} mln`
      : `${formatPrice(l.price)} soʻm`,
  })), [allListings]);
  const selected = allListings.find((l) => l.id === selectedId);

  const topPad = (Platform.OS === 'web' ? 67 : insets.top) + 8;
  const bottomBar = (Platform.OS === 'web' ? 34 : Math.max(insets.bottom, 10)) + 122;

  const locate = async () => {
    try {
      setLoading(true);
      if (Platform.OS === 'web') {
        if (!navigator.geolocation) throw new Error('Geolocation unavailable');
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 15000, maximumAge: 60000 }),
        );
        setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        return;
      }
      let status = perm?.status;
      if (status !== 'granted') {
        if (perm && !perm.canAskAgain) {
          Alert.alert('Ruxsat kerak', 'Joylashuvga ruxsat sozlamalarda oʻchirilgan.', [
            { text: 'Bekor qilish', style: 'cancel' },
            { text: 'Sozlamalarni ochish', onPress: () => Linking.openSettings() },
          ]);
          return;
        }
        const r = await requestPerm();
        status = r.status;
      }
      if (status !== 'granted') {
        Alert.alert('Ruxsat berilmadi', 'Yaqin eʼlonlarni koʻrish uchun joylashuvga ruxsat bering.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    } catch {
      Alert.alert('Xatolik', 'Joylashuvni aniqlab boʻlmadi. Qayta urinib koʻring.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={st.root}>
      <View style={StyleSheet.absoluteFill}>
        <ListingMap pins={pins} me={me} onSelect={setSelectedId} />
      </View>

      <View pointerEvents="box-none" style={[st.topWrap, { top: topPad }]}>
        <View style={st.pill}>
          <Feather name="map-pin" size={14} color={C.lime} />
          <Text style={st.pillText}>Xarita</Text>
          <Text style={st.pillCount}>{allListings.length} ta eʼlon</Text>
        </View>
      </View>

      <Pressable
        onPress={locate}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel="Joylashuvimni aniqlash"
        testID="locate"
        style={[st.locate, { bottom: bottomBar + (selected ? 104 : 0) }]}
      >
        <Feather name={loading ? 'loader' : 'crosshair'} size={22} color={C.navy} />
      </Pressable>

      {selected ? (
        <View style={[st.cardWrap, { bottom: bottomBar }]}>
          <Pressable style={st.card} onPress={() => go(`/listing/${selected.id}`)} testID="selected-map-listing">
            {selected.images[0] !== undefined
              ? <Image source={src(selected.images[0])} style={st.thumb} />
              : <View style={[st.thumb, { backgroundColor: C.secondary }]} />}
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={st.title} numberOfLines={1}>{selected.title}</Text>
              <Text style={st.sub} numberOfLines={1}>{selected.city}, {selected.district}</Text>
              <Text style={st.price}>{formatPrice(selected.price)} soʻm</Text>
            </View>
            <Feather name="arrow-up-right" size={20} color={C.navy} />
          </Pressable>
          <Pressable
            onPress={() => setSelectedId(null)}
            hitSlop={10}
            accessibilityLabel="Yopish"
            testID="close-selected"
            style={st.close}
          >
            <Feather name="x" size={14} color={C.navy} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.secondary },
  topWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: C.navy, borderRadius: 22, paddingHorizontal: 14, paddingVertical: 9, shadowColor: C.navy, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
  pillText: { fontFamily: F.dBold, fontSize: 14, color: C.white },
  pillCount: { fontFamily: F.bold, fontSize: 11, color: C.lime },
  locate: { position: 'absolute', right: 16, width: 50, height: 50, borderRadius: 16, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center', shadowColor: C.navy, shadowOpacity: 0.16, shadowRadius: 12, elevation: 5 },
  cardWrap: { position: 'absolute', left: 16, right: 16 },
  card: { backgroundColor: C.white, borderRadius: 20, borderWidth: 2, borderColor: C.lime, padding: 8, flexDirection: 'row', gap: 12, alignItems: 'center', shadowColor: C.navy, shadowOpacity: 0.16, shadowRadius: 14, elevation: 6 },
  close: { position: 'absolute', top: -8, right: -6, width: 26, height: 26, borderRadius: 13, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center' },
  thumb: { width: 64, height: 64, borderRadius: 14 },
  title: { fontFamily: F.dBold, fontSize: 15, color: C.navy },
  sub: { fontFamily: F.regular, fontSize: 12, color: C.mutedForeground },
  price: { fontFamily: F.dExtra, fontSize: 13, color: C.navy },
});
