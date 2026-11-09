import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { C, F } from '@/constants/colors';
import { GeoPoint, distanceKm, formatPrice, mapsUrl } from '@/constants/data';
import { useApp } from '@/context/AppContext';
import { BrandHeader } from '@/components/BrandHeader';
import { Button, Notice, go, src } from '@/components/ui';

export default function MapScreen() {
  const { allListings } = useApp();
  const [me, setMe] = useState<GeoPoint | null>(null);
  const [loading, setLoading] = useState(false);
  const [perm, requestPerm] = Location.useForegroundPermissions();

  const locate = async () => {
    try {
      setLoading(true);
      let status = perm?.status;
      if (status !== 'granted') {
        if (perm && !perm.canAskAgain && Platform.OS !== 'web') {
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
      contentContainerStyle={{ paddingBottom: 120, gap: 10 }}
      ListHeaderComponent={
        <View style={{ gap: 12, marginBottom: 4 }}>
          <BrandHeader title="Xarita" icon="map-pin" />
          <View style={{ paddingHorizontal: 16, gap: 10 }}>
            <View style={st.hero}>
              <Text style={st.heroTitle}>Yaqin atrofdagi eʼlonlar</Text>
              <Text style={st.heroSub}>
                {me
                  ? `Joylashuvingiz: ${me.lat.toFixed(4)}, ${me.lng.toFixed(4)}. Eʼlonlar masofa boʻyicha saralandi.`
                  : 'Joylashuvingizni aniqlang — eʼlonlar sizga eng yaqinidan boshlab saralanadi.'}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <Button label={loading ? 'Aniqlanmoqda...' : me ? 'Yangilash' : 'Joylashuvimni aniqlash'} icon="navigation" onPress={locate} disabled={loading} style={{ flex: 1 }} testID="locate" />
                {me ? <Button label="Xarita" icon="map" variant="ghost" onPress={() => open(me, 'Men shu yerdaman')} /> : null}
              </View>
            </View>
            <Notice tone="light" text="Har bir eʼlon manzili Yandex Xaritalarda ochiladi. Ilova ichida interaktiv xarita hali mavjud emas." />
          </View>
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
  hero: { backgroundColor: C.white, borderRadius: 20, padding: 16 },
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
