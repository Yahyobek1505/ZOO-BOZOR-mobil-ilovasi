import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { C, F } from '@/constants/colors';
import { GeoPoint, distanceKm, formatPrice, mapsUrl } from '@/constants/data';
import { useApp } from '@/context/AppContext';
import { BrandHeader } from '@/components/BrandHeader';
import { go, src } from '@/components/ui';
import ListingMap from '@/components/ListingMap';

export default function MapScreen() {
  const { allListings } = useApp();
  const [me, setMe] = useState<GeoPoint | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [perm, requestPerm] = Location.useForegroundPermissions();
  const pins = useMemo(() => allListings.map((l) => ({
    ...l.geo,
    id: l.id,
    title: l.title,
    label: l.price >= 1000000
      ? `${(l.price / 1000000).toLocaleString('uz-UZ', { maximumFractionDigits: 1 })} mln`
      : `${formatPrice(l.price)} soʻm`,
  })), [allListings]);
  const selected = allListings.find((l) => l.id === selectedId);

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
        Alert.alert('Ruxsat berilmadi', 'Masofani hisoblash uchun joylashuvga ruxsat bering.');
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

  const data = useMemo(() => {
    const list = allListings.map((l) => ({ l, d: me ? distanceKm(me, l.geo) : null }));
    if (me) list.sort((a, b) => (a.d ?? 0) - (b.d ?? 0));
    return list;
  }, [allListings, me]);

  const open = (geo: GeoPoint, label?: string) =>
    Linking.openURL(mapsUrl(geo, label)).catch(() => Alert.alert('Xatolik', 'Xarita ilovasini ochib boʻlmadi.'));

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: C.surface }}
      data={data}
      keyExtractor={(x) => x.l.id}
      contentContainerStyle={{ paddingBottom: 170, gap: 10 }}
      ListHeaderComponent={
        <View style={{ gap: 12, marginBottom: 4 }}>
          <BrandHeader title="Xarita" icon="map-pin" />
          <View style={st.mapHeading}>
            <View style={{ flex: 1 }}>
              <Text style={st.heroTitle}>Yaqin atrofdagi eʼlonlar</Text>
              <Text style={st.heroSub}>{allListings.length} ta eʼlon · Narx ustiga bosing</Text>
            </View>
            <View style={st.live}><View style={st.liveDot} /><Text style={st.liveText}>Xarita</Text></View>
          </View>
          <View style={st.mapSurface}>
            <ListingMap pins={pins} me={me} onSelect={setSelectedId} />
            <Pressable
              onPress={locate}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Joylashuvimni aniqlash"
              testID="locate"
              style={st.locate}
            >
              <Feather name={loading ? 'loader' : 'navigation'} size={19} color={C.navy} />
              <Text style={st.locateText}>{loading ? 'Aniqlanmoqda…' : 'Joylashuvim'}</Text>
            </Pressable>
          </View>
          {selected ? (
            <Pressable style={st.selected} onPress={() => go(`/listing/${selected.id}`)} testID="selected-map-listing">
              <Image source={src(selected.images[0])} style={st.thumb} />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={st.title} numberOfLines={1}>{selected.title}</Text>
                <Text style={st.sub}>{selected.city}, {selected.district}</Text>
                <Text style={st.price}>{formatPrice(selected.price)} soʻm</Text>
              </View>
              <Feather name="arrow-up-right" size={22} color={C.navy} />
            </Pressable>
          ) : null}
          <Text style={st.listHeading}>{me ? 'Sizga eng yaqin eʼlonlar' : 'Xaritadagi eʼlonlar'}</Text>
        </View>
      }
      renderItem={({ item: { l, d } }) => (
        <View style={st.item}>
          <Pressable onPress={() => go(`/listing/${l.id}`)} style={{ flexDirection: 'row', flex: 1, gap: 12, alignItems: 'center' }}>
            {l.images[0] !== undefined ? <Image source={src(l.images[0])} style={st.thumb} /> : <View style={[st.thumb, { backgroundColor: C.secondary }]} />}
            <View style={{ flex: 1 }}>
              <Text style={st.title} numberOfLines={1}>{l.title}</Text>
              <Text style={st.sub} numberOfLines={1}>
                {l.city}, {l.district}
              </Text>
              <Text style={st.price}>{formatPrice(l.price)} soʻm</Text>
            </View>
          </Pressable>
          <Pressable onPress={() => open(l.geo, `${l.city}, ${l.district}`)} style={st.mapBtn} testID={`open-map-${l.id}`}>
            <Feather name="map" size={18} color={C.navy} />
            {d !== null ? <Text style={st.dist}>{d < 10 ? d.toFixed(1) : Math.round(d)} km</Text> : null}
          </Pressable>
        </View>
      )}
    />
  );
}

const st = StyleSheet.create({
  mapHeading: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16 },
  mapSurface: { height: 360, marginHorizontal: 12, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: C.border, backgroundColor: C.secondary },
  locate: { position: 'absolute', bottom: 28, left: 12, flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: C.white, borderRadius: 24, paddingHorizontal: 15, paddingVertical: 12, shadowColor: C.navy, shadowOpacity: 0.12, shadowRadius: 10, elevation: 3 },
  locateText: { fontFamily: F.bold, fontSize: 12, color: C.navy },
  live: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.lime, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 7 },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.navy },
  liveText: { fontFamily: F.bold, fontSize: 10, color: C.navy },
  selected: { marginHorizontal: 16, backgroundColor: C.white, borderRadius: 20, borderWidth: 1, borderColor: C.lime, padding: 10, flexDirection: 'row', gap: 12, alignItems: 'center' },
  listHeading: { fontFamily: F.dBold, fontSize: 16, color: C.navy, paddingHorizontal: 16, marginTop: 4 },
  heroTitle: { fontFamily: F.dExtra, fontSize: 18, color: C.navy },
  heroSub: { fontFamily: F.regular, fontSize: 13, color: C.mutedForeground, marginTop: 4, lineHeight: 19 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, marginHorizontal: 16, borderRadius: 18, padding: 8, gap: 10 },
  thumb: { width: 64, height: 64, borderRadius: 14 },
  title: { fontFamily: F.dBold, fontSize: 15, color: C.navy },
  sub: { fontFamily: F.regular, fontSize: 12, color: C.mutedForeground, marginTop: 2 },
  price: { fontFamily: F.dExtra, fontSize: 13, color: C.navy, marginTop: 3 },
  mapBtn: { width: 64, height: 56, borderRadius: 14, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center', gap: 2 },
  dist: { fontFamily: F.bold, fontSize: 10, color: C.navy },
});
