import React, { useCallback, useMemo, useState } from 'react';
import { Image as NativeImage, Linking, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Alert } from '@/components/AppAlert';
import { Text } from '@/components/LocalizedText';
import { Image } from 'expo-image';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { F } from '@/constants/colors';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { CITIES, GeoPoint, formatPrice } from '@/constants/data';
import { useApp } from '@/context/AppContext';
import { go, src } from '@/components/ui';
import { MailIcon, MapTabIcon } from '@/components/FigmaIcons';
import type { MapView } from '@/components/map-document';
import ListingMap from '@/components/ListingMap';
import { apiOrigin } from '@/lib/api-origin';

function absolute(uri: string): string {
  if (/^(https?:|data:|file:|content:|asset:|blob:)/i.test(uri)) return uri;
  try {
    const base = Platform.OS === 'web' && typeof window !== 'undefined'
      ? window.location.origin
      : apiOrigin() ?? 'https://localhost';
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

type Kind = 'all' | 'animals';
type Center = 'me' | 'tashkent';
type Radius = 3 | 5 | 20 | null;
type Filter = { kind: Kind; center: Center; radius: Radius };
const DEFAULT_FILTER: Filter = { kind: 'all', center: 'tashkent', radius: null };
const RADII: Radius[] = [3, 5, 20, null];
// Leaflet zoom that keeps the whole search circle on a phone screen.
const ZOOM: Record<string, number> = { '3': 13, '5': 12, '20': 10, null: 7 };
const spaced = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

function km(a: GeoPoint, b: GeoPoint) {
  const r = Math.PI / 180;
  const h = Math.sin(((b.lat - a.lat) * r) / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(((b.lng - a.lng) * r) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

export default function MapScreen() {
  const { C } = useTheme();
  const st = useSt();
  const { allListings } = useApp();
  const insets = useSafeAreaInsets();
  const [me, setMe] = useState<GeoPoint | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapOpened, setMapOpened] = useState(false);
  useFocusEffect(useCallback(() => {
    setMapOpened(true);
  }, []));
  const [perm, requestPerm] = Location.useForegroundPermissions();
  const [filter, setFilter] = useState<Filter>(DEFAULT_FILTER);
  const [draft, setDraft] = useState<Filter>(DEFAULT_FILTER);
  const [filterOpen, setFilterOpen] = useState(false);

  const center = filter.center === 'me' && me ? me : CITIES[0].geo;
  const visible = useMemo(
    () => (filter.radius === null ? allListings : allListings.filter((l) => km(center, l.geo) <= (filter.radius as number))),
    [allListings, filter.radius, center],
  );
  const view = useMemo<MapView | undefined>(
    () => (filter === DEFAULT_FILTER ? undefined : { center, zoom: ZOOM[String(filter.radius)] }),
    [filter, center],
  );
  // Figma pin label: the full price with spaces, e.g. "1 530 000 soʻm".
  const pins = useMemo(() => visible.map((l) => ({
    ...l.geo,
    id: l.id,
    title: l.title,
    imageUrl: resolveImageUrl(l.images[0]),
    label: `${spaced(l.price)} soʻm`,
  })), [visible]);
  const selected = visible.find((l) => l.id === selectedId);

  const topPad = (Platform.OS === 'web' ? Math.max(insets.top, 20) : insets.top) + 8;
  const bottomBar = (Platform.OS === 'web' ? Math.max(insets.bottom, 12) : Math.max(insets.bottom, 10)) + 86; // tab bar (9 + 64) + 13px gap

  const locate = async (): Promise<boolean> => {
    try {
      setLoading(true);
      if (Platform.OS === 'web') {
        if (!navigator.geolocation) throw new Error('Geolocation unavailable');
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 15000, maximumAge: 60000 }),
        );
        setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        return true;
      }
      let status = perm?.status;
      if (status !== 'granted') {
        if (perm && !perm.canAskAgain) {
          Alert.alert('Ruxsat kerak', 'Joylashuvga ruxsat sozlamalarda oʻchirilgan.', [
            { text: 'Bekor qilish', style: 'cancel' },
            { text: 'Sozlamalarni ochish', onPress: () => Linking.openSettings() },
          ]);
          return false;
        }
        const r = await requestPerm();
        status = r.status;
      }
      if (status !== 'granted') {
        Alert.alert('Ruxsat berilmadi', 'Yaqin eʼlonlarni koʻrish uchun joylashuvga ruxsat bering.');
        return false;
      }
      const pos = await Location.getCurrentPositionAsync({});
      setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      return true;
    } catch {
      Alert.alert('Xatolik', 'Joylashuvni aniqlab boʻlmadi. Qayta urinib koʻring.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={st.root}>
      <View style={StyleSheet.absoluteFill}>
        {mapOpened ? <ListingMap pins={pins} me={me} onSelect={setSelectedId} view={view} /> : null}
      </View>

      {/* Figma 9-Yandex Karta: navy header with the map glyph, mail and the filter button. */}
      <View style={[st.header, { paddingTop: topPad + 8 }]}>
        <View style={st.brand}>
          <MapTabIcon size={34} color={C.lime} />
          <Text style={st.headerTitle}>Karta</Text>
          <Text style={st.count}>{visible.length} ta eʼlon</Text>
        </View>
        <View style={st.headerActions}>
          <Pressable onPress={() => go('/messages')} hitSlop={8} accessibilityRole="button" accessibilityLabel="Xabarlar" testID="map-messages">
            <MailIcon size={28} color={C.white} />
          </Pressable>
          <Pressable onPress={() => { setDraft(filter); setFilterOpen(true); }} hitSlop={8} accessibilityRole="button" accessibilityLabel="Xarita filtrlari" testID="map-filter">
            <MaterialCommunityIcons name="text-search" size={28} color={filterOpen || filter !== DEFAULT_FILTER ? C.lime : C.white} />
          </Pressable>
        </View>
      </View>

      <Modal visible={filterOpen} transparent animationType="fade" onRequestClose={() => setFilterOpen(false)}>
        <View style={st.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setFilterOpen(false)} accessibilityLabel="Yopish" />
          <View style={st.sheet} testID="map-filter-sheet">
            <View style={st.sheetHead}>
              <MaterialCommunityIcons name="text-search" size={26} color={C.text} />
              <Text style={st.sheetTitle}>Xarita filtrlari</Text>
              <Pressable onPress={() => setFilterOpen(false)} hitSlop={8} style={st.closeRound} accessibilityLabel="Yopish" testID="filter-close">
                <Feather name="x" size={20} color={C.text} />
              </Pressable>
            </View>

            <Text style={st.label}>Nimani koʻrsatamiz?</Text>
            <View style={st.kindGrid}>
              <KindChip icon="apps" label="Barchasi" active={draft.kind === 'all'} onPress={() => setDraft({ ...draft, kind: 'all' })} testID="kind-all" />
              <KindChip icon="paw" label="Hayvonlar" active={draft.kind === 'animals'} onPress={() => setDraft({ ...draft, kind: 'animals' })} testID="kind-animals" />
              {/* There is no shop or vet directory yet, so these stay visible but disabled. */}
              <KindChip icon="storefront-outline" label="Doʻkonlar" soon testID="kind-shops" />
              <KindChip icon="medkit-outline" label="Veterinar" soon testID="kind-vets" />
            </View>

            <Text style={st.label}>Qidiruv markazi</Text>
            <View style={st.centerRow}>
              {(['me', 'tashkent'] as const).map((c) => (
                <Pressable key={c} onPress={() => setDraft({ ...draft, center: c })} style={[st.centerBtn, draft.center === c && st.centerActive]} accessibilityRole="radio" accessibilityState={{ selected: draft.center === c }} testID={`center-${c}`}>
                  <Ionicons name={c === 'me' ? 'locate' : 'location'} size={18} color={draft.center === c ? C.ink : C.text} />
                  <Text style={[st.centerTxt, draft.center === c && { color: C.ink }]}>{c === 'me' ? 'Turgan joyim' : 'Toshkent markazi'}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={st.label}>Qidiruv radiusi</Text>
            <View style={st.radiusRow}>
              {RADII.map((r) => (
                <Pressable key={String(r)} onPress={() => setDraft({ ...draft, radius: r })} style={[st.radiusBtn, draft.radius === r && st.radiusActive]} accessibilityRole="radio" accessibilityState={{ selected: draft.radius === r }} accessibilityLabel={r === null ? 'Cheksiz' : `${r} km`} testID={`radius-${r ?? 'all'}`}>
                  {r === null ? <Ionicons name="infinite" size={22} color={draft.radius === r ? C.ink : C.text} /> : <Text style={[st.radiusTxt, draft.radius === r && { color: C.ink }]}>{r} km</Text>}
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={async () => {
                setFilterOpen(false);
                // "Turgan joyim" needs a position; fall back to Tashkent if the user declines.
                if (draft.center === 'me' && !me && !(await locate())) {
                  setFilter({ ...draft, center: 'tashkent' });
                  return;
                }
                setFilter(draft);
              }}
              style={st.apply}
              accessibilityRole="button"
              testID="filter-apply"
            >
              <Text style={st.applyTxt}>Filtrni qoʻllash</Text>
            </Pressable>
            <Pressable onPress={() => { setDraft(DEFAULT_FILTER); setFilter(DEFAULT_FILTER); setFilterOpen(false); }} style={{ alignSelf: 'center', padding: 8 }} accessibilityRole="button" testID="filter-clear">
              <Text style={st.clear}>Tozalash</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Pressable
        onPress={locate}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel="Joylashuvimni aniqlash"
        testID="locate"
        style={[st.locate, { bottom: bottomBar + (selected ? 104 : 0) }]}
      >
        <Feather name={loading ? 'loader' : 'crosshair'} size={22} color={C.text} />
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
            <Feather name="arrow-up-right" size={20} color={C.text} />
          </Pressable>
          <Pressable
            onPress={() => setSelectedId(null)}
            hitSlop={10}
            accessibilityLabel="Yopish"
            testID="close-selected"
            style={st.close}
          >
            <Feather name="x" size={14} color={C.ink} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const useSt = makeStyles((C) => ({
  root: { flex: 1, backgroundColor: C.secondary },
  header: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: C.navy, borderBottomLeftRadius: 25, borderBottomRightRadius: 25, paddingHorizontal: 28, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 },
  headerTitle: { fontFamily: F.dBold, fontSize: 24, color: C.white },
  count: { fontFamily: F.bold, fontSize: 11, color: C.lime, marginTop: 4 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 28 },
  backdrop: { flex: 1, backgroundColor: 'rgba(8,13,32,0.25)', justifyContent: 'center', padding: 20 },
  sheet: { backgroundColor: C.card, borderRadius: 30, padding: 26, paddingBottom: 12, width: '100%', maxWidth: 420, alignSelf: 'center', shadowColor: C.navy, shadowOpacity: 0.2, shadowRadius: 20, elevation: 8 },
  sheetHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  sheetTitle: { flex: 1, fontFamily: F.dMedium, fontSize: 20, color: C.text },
  closeRound: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.dark ? C.secondary : '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: F.dBold, fontSize: 15, color: C.text, marginTop: 16, marginBottom: 10 },
  kindGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kind: { width: '47%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 10, height: 46, borderRadius: 10, borderWidth: 1, borderColor: C.dark ? C.border : '#e0e0e8', paddingHorizontal: 14 },
  kindActive: { backgroundColor: C.lime, borderColor: C.lime },
  kindTxt: { fontFamily: F.dMedium, fontSize: 15, color: C.text },
  soon: { fontFamily: F.medium, fontSize: 9, color: C.mutedForeground },
  centerRow: { flexDirection: 'row', gap: 8 },
  centerBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, height: 46, borderRadius: 10, borderWidth: 1, borderColor: C.dark ? C.border : '#e0e0e8', backgroundColor: C.dark ? C.subtle : '#fafafa', paddingHorizontal: 12 },
  centerActive: { backgroundColor: C.lime, borderColor: C.lime },
  centerTxt: { flexShrink: 1, fontFamily: F.dBold, fontSize: 13, color: C.text },
  radiusRow: { flexDirection: 'row', gap: 6 },
  radiusBtn: { flex: 1, height: 32, borderRadius: 10, borderWidth: 1, borderColor: C.dark ? C.border : '#e0e0e8', alignItems: 'center', justifyContent: 'center' },
  radiusActive: { backgroundColor: C.lime, borderColor: C.lime },
  radiusTxt: { fontFamily: F.dMedium, fontSize: 14, color: C.text },
  apply: { height: 48, borderRadius: 14, backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  applyTxt: { fontFamily: F.dBold, fontSize: 17, color: C.lime },
  clear: { fontFamily: F.dBold, fontSize: 16, color: C.text, textDecorationLine: 'underline' },
  locate: { position: 'absolute', right: 16, width: 50, height: 50, borderRadius: 16, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', shadowColor: C.navy, shadowOpacity: 0.16, shadowRadius: 12, elevation: 5 },
  cardWrap: { position: 'absolute', left: 16, right: 16 },
  card: { backgroundColor: C.card, borderRadius: 20, borderWidth: 2, borderColor: C.lime, padding: 8, flexDirection: 'row', gap: 12, alignItems: 'center', shadowColor: C.navy, shadowOpacity: 0.16, shadowRadius: 14, elevation: 6 },
  close: { position: 'absolute', top: -8, right: -6, width: 26, height: 26, borderRadius: 13, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center' },
  thumb: { width: 64, height: 64, borderRadius: 14 },
  title: { fontFamily: F.dBold, fontSize: 15, color: C.text },
  sub: { fontFamily: F.regular, fontSize: 12, color: C.mutedForeground },
  price: { fontFamily: F.dExtra, fontSize: 13, color: C.text },
}));

function KindChip({ icon, label, active, onPress, soon, testID }: { icon: keyof typeof Ionicons.glyphMap; label: string; active?: boolean; onPress?: () => void; soon?: boolean; testID: string }) {
  const { C } = useTheme();
  const st = useSt();
  return (
    <Pressable onPress={onPress} disabled={soon} style={[st.kind, active && st.kindActive, soon && { opacity: 0.45 }]} accessibilityRole="radio" accessibilityState={{ selected: !!active, disabled: !!soon }} testID={testID}>
      <Ionicons name={icon} size={20} color={active ? C.ink : C.text} />
      <View style={{ flexShrink: 1 }}>
        <Text style={[st.kindTxt, active && { color: C.ink }]}>{label}</Text>
        {soon ? <Text style={st.soon}>Tez orada</Text> : null}
      </View>
    </Pressable>
  );
}
