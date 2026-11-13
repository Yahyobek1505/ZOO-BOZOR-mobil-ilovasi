import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, View } from 'react-native';
import { Text, TextInput } from '@/components/LocalizedText';
import { Alert } from '@/components/AppAlert';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSession } from '@/context/AuthContext';
import { F } from '@/constants/colors';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { CATEGORIES, CITIES, GeoPoint, Listing, formatPrice, timeAgo } from '@/constants/data';
import { decimalOnly, digitsOnly, displayPhone, normalizePhone } from '@/constants/input';
import { newId, useApp } from '@/context/AppContext';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { go, src, useBottomInset, useTopInset } from '@/components/ui';
import { Field } from '@/components/Field';
import { CurvedHeader, HeaderAction, Hint, Label, PillButton, Select, StepDots, Tile, useKit } from '@/components/FormKit';
import { assetUrl } from '@/lib/listing-images';
import { ImageFileInput } from '@/components/ImageFileInput';

type Form = {
  images: string[]; title: string; category: string; count: string; breed: string; color: string;
  gender: Listing['gender']; ageNum: string; ageUnit: string; vaccinated: string; weight: string; documents: string; description: string;
  price: string; negotiable: string; delivery: boolean; city: string; district: string; phone: string; geo: GeoPoint | null; geoExact: boolean;
};
type Errors = Partial<Record<keyof Form, string>>;

const AGE_UNITS = [{ value: 'haftalik', label: 'Hafta' }, { value: 'oylik', label: 'Oy' }, { value: 'yosh', label: 'Yosh' }];
const DOCS = ['Veterinar pasporti bor', 'Nasl hujjati bor', 'Pasport va nasl hujjati bor', 'Hujjatsiz'].map((d) => ({ value: d, label: d }));

type Extra = { count?: number; documents?: string };

function fromListing(l: (Listing & Extra) | undefined, region: string): Form {
  const age = /^(\d+)\s*(haftalik|oylik|yosh)/i.exec(l?.age ?? '');
  const w = decimalOnly((l?.weight ?? '').replace(/kg/i, '').trim());
  return {
    images: (l?.images.filter((x) => typeof x === 'string') as string[]) ?? [],
    title: l?.title ?? '', category: l?.category ?? '', count: l?.count ? String(l.count) : '1',
    breed: l?.breed ?? '', color: l?.color ?? '', gender: l?.gender ?? '',
    ageNum: age?.[1] ?? '', ageUnit: age?.[2]?.toLowerCase() ?? 'oylik',
    vaccinated: l ? (l.vaccinated ? 'ha' : 'yoq') : '', weight: w, documents: l?.documents ?? '', description: l?.description ?? '',
    price: l ? String(l.price) : '', negotiable: l ? (l.negotiable ? 'ha' : 'yoq') : 'ha', delivery: l?.delivery ?? false,
    city: l?.city ?? (CITIES.some((c) => c.name === region) ? region : ''), district: l?.district ?? '',
    phone: digitsOnly(l?.phone ?? '').slice(0, 12), geo: l?.geo ?? null, geoExact: false,
  };
}

const fmtPrice = (v: string) => v.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const ART_TYPE = require('@/assets/figma/post-type.png');
const ART_ANIMAL = require('@/assets/figma/post-animal.png');
const ART_GOODS = require('@/assets/figma/post-goods.png');
const ART_DONE = require('@/assets/figma/post-done.png');

/** Figma "Yangi eʼlon": choose what to post before the form. */
function TypeStep({ onBack, onAnimal }: { onBack: () => void; onAnimal: () => void }) {
  const { C } = useTheme();
  const st = useSt();
  const top = useTopInset();
  return (
    <View style={{ flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center', backgroundColor: C.dark ? C.surface : C.card }}>
      <View style={[st.plainHead, { paddingTop: top + 14 }]}>
        <Pressable onPress={onBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Orqaga" testID="header-back" style={{ width: 40 }}>
          <Feather name="chevron-left" size={28} color={C.text} />
        </Pressable>
        <Text style={st.plainTitle}>Yangi eʼlon</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={{ alignItems: 'center', paddingHorizontal: 20 }}>
        <Image source={ART_TYPE} style={{ width: 175, height: 122, marginTop: 24 }} contentFit="contain" />
        <Text style={st.typeTitle}>Nima joylamoqchisiz?</Text>
        <Text style={st.typeSub}>Eʼlon turini tanlang!</Text>
      </View>
      <View style={{ paddingHorizontal: 20, gap: 12, marginTop: 30 }}>
        <Pressable onPress={onAnimal} style={({ pressed }) => [st.typeCard, pressed && { opacity: 0.85 }]} accessibilityRole="button" testID="type-animal">
          <Image source={ART_ANIMAL} style={st.typeArt} contentFit="cover" />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={st.typeCardTitle}>Hayvon eʼloni</Text>
            <Text style={st.typeCardSub}>Mushuk, it, qush va boshqa hayvonlar.</Text>
          </View>
          <Feather name="chevron-right" size={24} color={C.mutedDark} />
        </Pressable>
        {/* Goods listings have no backend model yet; the card stays so the Figma choice is visible. */}
        <Pressable
          onPress={() => Alert.alert('Tez orada', 'Ozuqa va buyumlar eʼlonlari hali qoʻshilmagan. Hozircha hayvon eʼlonini joylash mumkin.')}
          style={({ pressed }) => [st.typeCard, { opacity: pressed ? 0.6 : 0.7 }]}
          accessibilityRole="button"
          accessibilityState={{ disabled: true }}
          testID="type-goods"
        >
          <Image source={ART_GOODS} style={st.typeArt} contentFit="cover" />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={st.typeCardTitle}>Ozuqa va Buyumlar</Text>
            <Text style={st.typeCardSub}>Ozuqa, aksessuar va boshqa buyumlar.</Text>
            <View style={st.soon}><Text style={st.soonTxt}>Tez orada</Text></View>
          </View>
          <Feather name="chevron-right" size={24} color={C.mutedDark} />
        </Pressable>
      </View>
    </View>
  );
}

/**
 * Figma "Tekshiruvda" layout. Listings are published straight away (there is no moderation queue),
 * so the copy says the listing is live instead of "sent for review".
 */
function DoneStep({ listing }: { listing: Listing }) {
  const { C } = useTheme();
  const st = useSt();
  const bottom = useBottomInset();
  return (
    <View style={{ flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center', backgroundColor: C.dark ? C.surface : C.card }}>
      <CurvedHeader title="Eʼlon joylandi" onBack={() => router.replace(`/listing/${listing.id}` as never)} />
      <View style={{ flex: 1, paddingHorizontal: 14, paddingBottom: bottom + 24 }}>
        <View style={{ alignItems: 'center' }}>
          <Image source={ART_DONE} style={{ width: 140, height: 140, marginTop: 32 }} contentFit="contain" />
          <Text style={st.doneTitle}>Eʼlon joylandi</Text>
          <Text style={st.doneSub}>Eʼloningiz endi barcha foydalanuvchilarga koʻrinadi.</Text>
        </View>
        <Pressable onPress={() => router.replace(`/listing/${listing.id}` as never)} style={st.doneCard} accessibilityRole="button" testID="done-open-listing">
          {listing.images[0] !== undefined
            ? <Image source={src(listing.images[0])} style={st.doneImg} contentFit="cover" />
            : <View style={[st.doneImg, { backgroundColor: C.secondary }]} />}
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={st.doneCardTitle} numberOfLines={1}>{listing.title}</Text>
            <Text style={st.donePrice}>{formatPrice(listing.price)} soʻm</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Feather name="map-pin" size={11} color={C.text} />
              <Text style={st.doneMeta} numberOfLines={1}>{listing.city}, {listing.district}</Text>
            </View>
            <Text style={st.doneMeta}>{timeAgo(listing.createdAt)}</Text>
          </View>
          <Feather name="chevron-right" size={22} color={C.mutedDark} />
        </Pressable>
        <View style={{ flex: 1 }} />
        <PillButton label="Eʼlonlarim" variant="navy" icon="list" onPress={() => { router.replace('/my-listings' as never); }} testID="done-my-listings" />
        <Text style={[st.note, { marginTop: 16 }]}>Holatni “Eʼlonlarim” boʻlimida kuzatishingiz mumkin.</Text>
      </View>
    </View>
  );
}

export default function EditListing() {
  const { C } = useTheme();
  const st = useSt();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { getListing, listingsLoading } = useApp();
  const existing = id ? getListing(String(id)) : undefined;
  if (id && !existing && listingsLoading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.dark ? C.surface : C.card }}><ActivityIndicator color={C.text} /></View>;
  if (id && !existing?.own) return <View style={{ flex: 1, backgroundColor: C.dark ? C.surface : C.card }}>
    <CurvedHeader title="Eʼlonni tahrirlash" onBack={() => router.back()} />
    <Text style={{ padding: 24, color: C.text }}>Eʼlon topilmadi yoki uni tahrirlash huquqingiz yoʻq.</Text>
  </View>;
  return <ListingForm key={id ?? 'new'} existing={existing} />;
}

function ListingForm({ existing }: { existing?: Listing & Extra }) {
  const { C } = useTheme();
  const st = useSt();
  const kit = useKit();
  const { saveListing, profile } = useApp();
  const { accountId: userId } = useSession();
  const bottom = useBottomInset();
  const editing = !!existing?.own;
  const draftKey = `zoo-bozor:listing-draft:${userId ?? 'guest'}:${editing ? existing?.id : 'new'}`;

  const [f, setF] = useState<Form>(() => fromListing(editing ? existing : undefined, profile.region));
  const [step, setStep] = useState(0);
  const [stage, setStage] = useState<'type' | 'form'>(editing ? 'form' : 'type');
  const [done, setDone] = useState<Listing | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [locating, setLocating] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const listingId = useRef(existing?.id ?? newId());
  const set = <K extends keyof Form>(k: K, v: Form[K]) => { setF((x) => ({ ...x, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(draftKey).then(async (accountRaw) => {
      const raw = accountRaw ?? (userId && !editing ? await AsyncStorage.getItem('zoo-bozor:listing-draft:guest:new') : null);
      if (!alive || !raw) return;
      try {
        const d = JSON.parse(raw) as { form: Form; step: number; at: number; listingId?: string };
        Alert.alert('Qoralama topildi', `${new Date(d.at).toLocaleString()} da saqlangan qoralamani tiklaysizmi?`, [
          { text: 'Yoʻq', style: 'cancel' },
          { text: 'Tiklash', onPress: () => {
            if (!editing && d.listingId) listingId.current = d.listingId;
            setF({ ...d.form, geoExact: false }); setStep(Math.min(2, d.step)); setSavedAt(d.at); setStage('form');
          } },
        ]);
      } catch { /* corrupted draft is ignored, never deleted silently */ }
    }).catch(() => undefined);
    return () => { alive = false; };
  }, [draftKey]);

  const saveDraft = async () => {
    try {
      const at = Date.now();
      await AsyncStorage.setItem(draftKey, JSON.stringify({ form: f, step, at, listingId: listingId.current }));
      setSavedAt(at);
      Alert.alert('Saqlandi', 'Qoralama shu qurilmada saqlandi. Keyinroq davom ettirishingiz mumkin.');
      return true;
    } catch {
      Alert.alert('Xatolik', 'Qoralamani saqlab boʻlmadi.');
      return false;
    }
  };

  const pick = async () => {
    if (f.images.length >= 8) { Alert.alert('Chegara', 'Eng koʻpi bilan 8 ta rasm qoʻshish mumkin.'); return; }
    if (Platform.OS !== 'web') {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Ruxsat kerak', 'Rasm tanlash uchun galereyaga ruxsat bering.', [
          { text: 'Bekor qilish', style: 'cancel' },
          ...(perm.canAskAgain ? [] : [{ text: 'Sozlamalar', onPress: () => Linking.openSettings() }]),
        ]);
        return;
      }
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: 8 - f.images.length, quality: 0.7 });
    if (!res.canceled) set('images', [...f.images, ...res.assets.map((a) => a.uri)].slice(0, 8));
  };

  const makeCover = (i: number) => set('images', [f.images[i], ...f.images.filter((_, j) => j !== i)]);
  const removeImage = (i: number) => Alert.alert('Rasmni oʻchirish', 'Bu rasm eʼlondan olib tashlansinmi?', [
    { text: 'Bekor qilish', style: 'cancel' },
    { text: 'Oʻchirish', style: 'destructive', onPress: () => set('images', f.images.filter((_, j) => j !== i)) },
  ]);

  const locate = async () => {
    try {
      setLocating(true);
      const p = await Location.requestForegroundPermissionsAsync();
      if (!p.granted) { Alert.alert('Ruxsat berilmadi', 'Tanlangan shahar markazi koordinatalari ishlatiladi.'); return; }
      const pos = await Location.getCurrentPositionAsync({});
      setF((x) => ({ ...x, geo: { lat: pos.coords.latitude, lng: pos.coords.longitude }, geoExact: true }));
    } catch {
      Alert.alert('Xatolik', 'Joylashuvni aniqlab boʻlmadi.');
    } finally {
      setLocating(false);
    }
  };

  const validate = (s: number): Errors => {
    const e: Errors = {};
    if (s === 0) {
      if (!f.category) e.category = 'Hayvon turini tanlang';
      const n = Number(f.count);
      if (!Number.isInteger(n) || n < 1 || n > 999) e.count = '1–999';
      if (f.title.trim().length < 3) e.title = 'Sarlavha kamida 3 ta belgidan iborat boʻlsin';
      if (!f.breed.trim()) e.breed = 'Zotini kiriting';
      if (!f.color.trim()) e.color = 'Rangini kiriting';
      if (!f.images.length) e.images = 'Kamida bitta rasm qoʻshing';
    } else if (s === 1) {
      const a = Number(f.ageNum);
      if (!f.ageNum || !a || a > 600) e.ageNum = 'Yoshini raqamda kiriting';
      if (!f.vaccinated) e.vaccinated = 'Tanlang';
      const w = Number(f.weight);
      if (!f.weight || !(w > 0) || w > 5000) e.weight = 'Vaznni kg da kiriting';
      if (!f.documents) e.documents = 'Hujjat holatini tanlang';
      if (f.description.trim().length < 10) e.description = 'Tavsif kamida 10 ta belgidan iborat boʻlsin';
    } else {
      const p = Number(f.price);
      if (!p || p < 1000) e.price = 'Narxni soʻmda kiriting (kamida 1 000)';
      if (!f.city) e.city = 'Hududni tanlang';
      if (!normalizePhone(f.phone)) e.phone = 'Raqamni 9 xonali yoki 998 bilan 12 xonali kiriting';
    }
    return e;
  };

  const next = () => {
    const e = step === 2 ? { ...validate(0), ...validate(1), ...validate(2) } : validate(step);
    setErrors(e);
    if (Object.keys(e).length) {
      if (step === 2) setStep(Object.keys(validate(0)).length ? 0 : Object.keys(validate(1)).length ? 1 : 2);
      return;
    }
    if (step < 2) { setStep(step + 1); return; }
    void submit();
  };

  const submit = async () => {
    if (submittingRef.current) return;
    if (!userId) {
      try {
        await AsyncStorage.setItem(draftKey, JSON.stringify({ form: f, step, at: Date.now(), listingId: listingId.current }));
        Alert.alert('Hisobingizga kiring', 'Qoralamangiz shu qurilmada saqlandi. Kirganingizdan keyin uni tiklab, eʼlonni hammaga koʻrsatishingiz mumkin.', [
          { text: 'Keyinroq', style: 'cancel' }, { text: 'Kirish', onPress: () => router.push('/login?next=/listing/edit') },
        ]);
      } catch { Alert.alert('Saqlanmadi', 'Qoralamani saqlab boʻlmadi. Ilovani yopmay, qayta urinib koʻring.'); }
      return;
    }
    const phone = normalizePhone(f.phone);
    if (!phone) return;
    const cityGeo = CITIES.find((c) => c.name === f.city)?.geo ?? CITIES[0].geo;
    const extra: Extra = { count: Number(f.count), documents: f.documents };
    const base: Listing = {
      id: listingId.current,
      title: f.title.trim(),
      category: f.category,
      price: Number(f.price),
      negotiable: f.negotiable === 'ha',
      images: f.images,
      breed: f.breed.trim(),
      age: `${Number(f.ageNum)} ${f.ageUnit}`,
      gender: f.gender,
      weight: `${f.weight.replace(/\.$/, '')} kg`,
      color: f.color.trim(),
      city: f.city,
      district: f.district.trim() || 'Markaz',
      geo: f.geo ?? cityGeo,
      description: f.description.trim(),
      phone,
      sellerName: profile.name || 'Siz',
      delivery: f.delivery,
      vaccinated: f.vaccinated === 'ha',
      createdAt: editing && existing ? existing.createdAt : Date.now(),
      rating: existing?.rating ?? 0,
      views: existing?.views ?? 0,
      own: true,
      ownerId: existing?.ownerId,
      localOnly: existing?.localOnly,
    };
    const listing: Listing = { ...base, ...extra };
    submittingRef.current = true;
    setSubmitting(true);
    try {
      await AsyncStorage.setItem(draftKey, JSON.stringify({ form: f, step, at: Date.now(), listingId: listingId.current }));
      const saved = await saveListing(listing);
      await AsyncStorage.removeItem(draftKey).catch(() => undefined);
      if (editing) router.replace(`/listing/${saved.id}` as never);
      else setDone(saved);
    } catch (err) {
      Alert.alert('Saqlanmadi', `${err instanceof Error ? err.message : 'Eʼlonni saqlab boʻlmadi.'} Qoralama oʻchirilmagan.`);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const back = () => {
    if (step > 0) { setStep(step - 1); return; }
    Alert.alert('Chiqish', 'Saqlanmagan oʻzgarishlar yoʻqolishi mumkin. Avval qoralamani saqlang yoki chiqing.', [
      { text: 'Qolish', style: 'cancel' },
      { text: 'Saqlab chiqish', onPress: () => { void saveDraft().then((saved) => { if (saved) router.back(); }); } },
      { text: 'Chiqish', style: 'destructive', onPress: () => router.back() },
    ]);
  };

  if (done) return <DoneStep listing={done} />;
  if (stage === 'type') return <TypeStep onBack={() => router.back()} onAnimal={() => setStage('form')} />;

  return (
    <View style={{ flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center', backgroundColor: C.dark ? C.surface : C.card }}>
      <CurvedHeader title={editing ? 'Eʼlonni tahrirlash' : 'Eʼlon joylash'} onBack={back} right={<HeaderAction label="Saqlash" onPress={saveDraft} testID="save-draft" />} />
      <StepDots step={step} />
      <KeyboardAwareScrollViewCompat
        key={step}
        contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: bottom + 30 }}
        bottomOffset={40}
      >
        {step === 0 ? (
          <>
            <Text style={st.h1}>Eʼlon maʼlumotlari</Text>
            <View style={st.row}>
              <View style={{ flex: 2.4 }}>
                <Select label="Hayvon turi" required value={f.category} onChange={(v) => set('category', v)} options={CATEGORIES.map((c) => ({ value: c.id, label: c.label }))} error={errors.category} testID="category" />
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Soni *" value={f.count} onChangeText={(v) => set('count', v.slice(0, 3))} keyboardType="number-pad" maxLength={3} placeholder="1" error={errors.count} testID="count" style={[kit.input, { textAlign: 'center' }]} />
              </View>
            </View>
            <Field label="Sarlavha *" value={f.title} onChangeText={(v) => set('title', v)} placeholder="Masalan: Britan mushugi" error={errors.title} testID="title" style={kit.input} />
            <Field label="Zoti *" value={f.breed} onChangeText={(v) => set('breed', v)} placeholder="Britan Scottish Fold" error={errors.breed} testID="breed" style={kit.input} />
            <Field label="Rangi *" value={f.color} onChangeText={(v) => set('color', v)} placeholder="Kulrang" error={errors.color} testID="color" style={kit.input} />
            <View style={{ gap: 10, marginTop: 6 }}>
              <Text style={st.h2}>Suratlar * <Text style={st.counter}>({f.images.length}/8)</Text></Text>
              <View style={st.grid}>
                <Pressable onPress={Platform.OS === 'web' ? undefined : pick} style={[st.cell, st.add, errors.images ? { borderWidth: 2, borderColor: C.destructive } : null]} testID="pick-image" accessibilityRole="button" accessibilityLabel="Rasm qoʻshish">
                  <Feather name="image" size={30} color={C.ink} />
                  <View style={st.plus}><Feather name="plus" size={12} color={C.lime} /></View>
                  <ImageFileInput remaining={8 - f.images.length} onImages={(images) => set('images', [...f.images, ...images].slice(0, 8))} onError={(message) => setErrors((old) => ({ ...old, images: message }))} />
                </Pressable>
                {f.images.map((uri, i) => (
                  <Pressable key={uri + i} onPress={() => makeCover(i)} style={st.cell} accessibilityLabel={i === 0 ? 'Asosiy surat' : 'Asosiy surat qilish'} testID={`image-${i}`}>
                    <Image source={{ uri: assetUrl(uri) }} style={st.img} contentFit="cover" />
                    {i === 0 ? <View style={st.cover}><Text style={st.coverTxt}>Asosiy</Text></View> : null}
                    <Pressable onPress={() => removeImage(i)} style={st.remove} hitSlop={6} accessibilityRole="button" accessibilityLabel="Rasmni oʻchirish" testID={`remove-image-${i}`}>
                      <Feather name="x" size={12} color={C.ink} />
                    </Pressable>
                  </Pressable>
                ))}
              </View>
              <Hint text="Asosiy suratni tanlang (rasmga bosing). Hayvon aniq koʻrinsin." error={errors.images} />
            </View>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <Label text="Jinsi" required />
            <View style={st.row}>
              <Tile label="Erkak" icon="arrow-up-right" active={f.gender === 'erkak'} onPress={() => set('gender', 'erkak')} testID="gender-erkak" />
              <Tile label="Urgʻochi" icon="plus-circle" active={f.gender === 'urgochi'} onPress={() => set('gender', 'urgochi')} testID="gender-urgochi" />
            </View>
            <View style={st.row}>
              <Tile label="Aralash" icon="users" active={f.gender === 'aralash'} onPress={() => set('gender', 'aralash')} testID="gender-aralash" />
              <Tile label="Nomaʼlum" icon="help-circle" active={f.gender === ''} onPress={() => set('gender', '')} testID="gender-unknown" />
            </View>
            <View style={st.row}>
              <View style={{ flex: 1 }}>
                <Field label="Yoshi *" value={f.ageNum} onChangeText={(v) => set('ageNum', v.slice(0, 3))} keyboardType="number-pad" maxLength={3} placeholder="5" error={errors.ageNum} testID="age" style={[kit.input, { textAlign: 'center' }]} />
              </View>
              <Select label="Oy/Yil" required value={f.ageUnit} onChange={(v) => set('ageUnit', v)} options={AGE_UNITS} testID="age-unit" center />
            </View>
            <View style={st.row}>
              <Select label="Emlanganligi" required value={f.vaccinated} onChange={(v) => set('vaccinated', v)} options={[{ value: 'ha', label: 'Emlangan' }, { value: 'yoq', label: 'Emlanmagan' }]} error={errors.vaccinated} testID="vaccinated" />
              <View style={{ flex: 1, gap: 6 }}>
                <Label text="Ogʻirligi" required />
                <View style={[st.unitWrap, errors.weight ? { borderColor: C.destructive } : null]}>
                  <TextInput value={f.weight} onChangeText={(v) => set('weight', decimalOnly(v).slice(0, 7))} keyboardType="decimal-pad" inputMode="decimal" placeholder="15" placeholderTextColor={C.mutedForeground} style={st.unitInput} accessibilityLabel="Ogʻirligi, kilogramm" testID="weight" />
                  <Text style={st.unit}>kg</Text>
                </View>
                <Hint error={errors.weight} />
              </View>
            </View>
            <Select label="Hujjatlari" required value={f.documents} onChange={(v) => set('documents', v)} options={DOCS} error={errors.documents} testID="documents" />
            <Field label="Tavsif *" value={f.description} onChangeText={(v) => set('description', v)} multiline placeholder="Feʼl-atvori, parvarishi, odatlari..." error={errors.description} testID="description" style={kit.input} />
            {!errors.description ? <Hint text="Muhim xususiyatlari va parvarish shartlarini yozing!" /> : null}
          </>
        ) : null}

        {step === 2 ? (
          <>
            <View style={st.row}>
              <View style={{ flex: 1, gap: 6 }}>
                <Label text="Narx turi" required />
                <View style={st.fixed}><Text style={st.fixedTxt}>Belgilangan narx</Text></View>
              </View>
              <Select label="Kelishiladimi" required value={f.negotiable} onChange={(v) => set('negotiable', v)} options={[{ value: 'ha', label: 'Kelishiladi' }, { value: 'yoq', label: 'Qatʼiy' }]} testID="negotiable" />
            </View>
            <View style={{ gap: 6 }}>
              <Label text="Narx" required />
              <View style={[st.unitWrap, errors.price ? { borderColor: C.destructive } : null]}>
                <TextInput value={fmtPrice(f.price)} onChangeText={(v) => set('price', digitsOnly(v).slice(0, 12))} keyboardType="number-pad" inputMode="numeric" placeholder="1 530 000" placeholderTextColor={C.mutedForeground} style={[st.unitInput, { textAlign: 'center' }]} accessibilityLabel="Narx, soʻm" testID="price" />
                <Text style={st.unit}>soʻm</Text>
              </View>
              <Hint text={Number(f.count) > 1 ? `${f.count} dona uchun umumiy narx` : '1 dona uchun'} error={errors.price} />
            </View>
            <Select label="Hudud" required value={f.city} onChange={(v) => set('city', v)} options={CITIES.map((c) => ({ value: c.name, label: c.name }))} error={errors.city} testID="city" />
            <Field label="Tuman / mahalla" value={f.district} onChangeText={(v) => set('district', v)} placeholder="Yunusobod" testID="district" style={kit.input} />
            <Label text="Topshirish" required />
            <View style={st.row}>
              <Tile label="Olib ketish" icon="shopping-bag" active={!f.delivery} onPress={() => set('delivery', false)} testID="pickup" />
              <Tile label="Yetkazib berish" icon="truck" active={f.delivery} onPress={() => set('delivery', true)} testID="delivery" />
            </View>
            <Field label="Aloqa raqami *" value={f.phone} onChangeText={(v) => set('phone', digitsOnly(v).slice(0, 12))} keyboardType="phone-pad" placeholder="998901234567" error={errors.phone} testID="phone" style={kit.input} />
            {!errors.phone ? <Hint text={normalizePhone(f.phone) ? `Xaridorlar koʻradi: ${displayPhone(f.phone)}` : 'Shu eʼlon uchun sotuvchi raqami. Tasdiqlanmaydi.'} /> : null}
            <Label text="Hozirgi joylashuv" />
            <Pressable onPress={locate} disabled={locating} style={st.locate} accessibilityRole="button" testID="locate">
              <Feather name={f.geoExact ? 'check-circle' : 'map-pin'} size={20} color={C.text} />
              <Text style={st.locateTxt}>{locating ? 'Aniqlanmoqda...' : f.geoExact ? 'Aniq joylashuv olindi' : 'Joriy joylashuvni olish'}</Text>
              <View style={st.locArrow}><Feather name="arrow-right" size={13} color={C.white} /></View>
            </Pressable>
            <Hint text={f.geoExact && f.geo ? `Koordinatalar: ${f.geo.lat.toFixed(4)}, ${f.geo.lng.toFixed(4)}` : 'Aks holda tanlangan shahar markazi xaritada koʻrsatiladi.'} />
          </>
        ) : null}

        <View style={[st.row, { marginTop: 16 }]}>
          {step > 0 ? <PillButton label="Ortga" variant="outline" icon="arrow-left" onPress={() => setStep(step - 1)} flex testID="step-back" /> : null}
          <PillButton
            label={submitting ? 'Rasmlar va eʼlon yuklanmoqda...' : step < 2 ? 'Davom etish' : existing?.localOnly ? 'Hammaga koʻrsatish' : editing ? 'Saqlash' : 'Eʼlonni joylash'}
            variant={step === 2 ? 'green' : 'navy'}
            icon={step === 2 ? 'check' : 'arrow-right'}
            onPress={submitting ? () => undefined : next}
            flex
            testID={step === 2 ? 'submit-listing' : 'step-next'}
          />
        </View>
        {step === 2 ? <Text style={st.note}>Joylangan eʼlon va uning aloqa raqami barcha foydalanuvchilarga koʻrinadi. Qoralama esa shu qurilmada qoladi.{existing?.localOnly ? ' Eski mahalliy nusxa oʻchirilmaydi.' : ''}</Text> : null}
        {savedAt ? <Text style={st.note}>Qoralama saqlangan: {new Date(savedAt).toLocaleTimeString()}</Text> : null}
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const useSt = makeStyles((C) => ({
  h1: { fontFamily: F.dExtra, fontSize: 22, color: C.text, marginBottom: 4 },
  h2: { fontFamily: F.dExtra, fontSize: 16, color: C.text },
  counter: { fontFamily: F.medium, fontSize: 12, color: C.mutedForeground },
  row: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cell: { width: '23%', aspectRatio: 1, borderRadius: 14, overflow: 'hidden' },
  add: { backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center' },
  plus: { position: 'absolute', right: '26%', bottom: '24%', width: 18, height: 18, borderRadius: 9, backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center' },
  img: { width: '100%', height: '100%' },
  cover: { position: 'absolute', left: 4, top: 4, backgroundColor: C.navy, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1 },
  coverTxt: { fontFamily: F.semibold, fontSize: 9, color: C.lime },
  remove: { position: 'absolute', right: 5, bottom: 5, width: 20, height: 20, borderRadius: 10, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center' },
  unitWrap: { height: 48, borderRadius: 12, borderWidth: 1, borderColor: C.dark ? C.border : '#d9dce3', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 },
  unitInput: { flex: 1, height: '100%', fontFamily: F.dBold, fontSize: 15, color: C.text },
  unit: { fontFamily: F.dBold, fontSize: 14, color: C.text, marginLeft: 8 },
  fixed: { height: 48, borderRadius: 12, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center' },
  fixedTxt: { fontFamily: F.dBold, fontSize: 14, color: C.ink },
  locate: { height: 56, borderRadius: 14, backgroundColor: C.dark ? C.secondary : '#ececee', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, gap: 12 },
  locateTxt: { flex: 1, fontFamily: F.dBold, fontSize: 14, color: C.text },
  locArrow: { width: 22, height: 22, borderRadius: 11, backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center' },
  plainHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 8 },
  plainTitle: { fontFamily: F.dBold, fontSize: 18, color: C.text },
  typeTitle: { fontFamily: F.dExtra, fontSize: 24, color: C.text, marginTop: 18, textAlign: 'center' },
  typeSub: { fontFamily: F.dMedium, fontSize: 15, color: C.text, marginTop: 4 },
  typeCard: { flexDirection: 'row', alignItems: 'center', gap: 18, borderWidth: 1, borderColor: C.dark ? C.border : '#e2e2e2', borderRadius: 22, padding: 7, paddingRight: 18, backgroundColor: C.card },
  typeArt: { width: 103, height: 101, borderRadius: 18 },
  typeCardTitle: { fontFamily: F.dExtra, fontSize: 16, color: C.text },
  typeCardSub: { fontFamily: F.dMedium, fontSize: 12, color: C.text, lineHeight: 17 },
  soon: { alignSelf: 'flex-start', backgroundColor: C.secondary, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, marginTop: 2 },
  soonTxt: { fontFamily: F.dBold, fontSize: 10, color: C.mutedDark },
  doneTitle: { fontFamily: F.dExtra, fontSize: 22, color: C.text, marginTop: 16, textAlign: 'center' },
  doneSub: { fontFamily: F.dMedium, fontSize: 13, color: C.text, marginTop: 6, textAlign: 'center', lineHeight: 18 },
  doneCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: C.dark ? C.border : '#ececec', borderRadius: 10, padding: 7, paddingRight: 14, marginTop: 40 },
  doneImg: { width: 86, height: 86, borderRadius: 8 },
  doneCardTitle: { fontFamily: F.dMedium, fontSize: 13, color: C.text },
  donePrice: { fontFamily: F.dExtra, fontSize: 17, color: C.text },
  doneMeta: { fontFamily: F.dMedium, fontSize: 11, color: C.mutedForeground },
  note: { fontFamily: F.regular, fontSize: 12, color: C.mutedForeground, textAlign: 'center', lineHeight: 17 },
}));
