import React, { useState } from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { C, F } from '@/constants/colors';
import { CATEGORIES, CITIES, GeoPoint, Listing } from '@/constants/data';
import { newId, useApp } from '@/context/AppContext';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { Button, Chip, ScreenHeader, useBottomInset } from '@/components/ui';
import { Field, ToggleRow, fieldStyles } from '@/components/Field';

type Errors = Partial<Record<'images' | 'title' | 'category' | 'price' | 'city' | 'description' | 'phone', string>>;

export default function EditListing() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { getListing, saveListing, profile } = useApp();
  const bottom = useBottomInset();
  const existing = id ? getListing(String(id)) : undefined;
  const editing = !!existing?.own;

  const [images, setImages] = useState<string[]>((existing?.images.filter((x) => typeof x === 'string') as string[]) ?? []);
  const [title, setTitle] = useState(existing?.title ?? '');
  const [category, setCategory] = useState(existing?.category ?? '');
  const [price, setPrice] = useState(existing ? String(existing.price) : '');
  const [negotiable, setNegotiable] = useState(existing?.negotiable ?? true);
  const [breed, setBreed] = useState(existing?.breed ?? '');
  const [age, setAge] = useState(existing?.age ?? '');
  const [gender, setGender] = useState<Listing['gender']>(existing?.gender ?? '');
  const [weight, setWeight] = useState(existing?.weight ?? '');
  const [color, setColor] = useState(existing?.color ?? '');
  const [city, setCity] = useState(existing?.city ?? (CITIES.some((c) => c.name === profile.region) ? profile.region : ''));
  const [district, setDistrict] = useState(existing?.district ?? '');
  const [geo, setGeo] = useState<GeoPoint | null>(existing?.geo ?? null);
  const [geoExact, setGeoExact] = useState(false);
  const [description, setDescription] = useState(existing?.description ?? '');
  const [phone, setPhone] = useState(existing?.phone ?? profile.phone);
  const [delivery, setDelivery] = useState(existing?.delivery ?? false);
  const [vaccinated, setVaccinated] = useState(existing?.vaccinated ?? false);
  const [errors, setErrors] = useState<Errors>({});
  const [locating, setLocating] = useState(false);

  const pick = async () => {
    if (images.length >= 6) {
      Alert.alert('Chegara', 'Eng koʻpi bilan 6 ta rasm qoʻshish mumkin.');
      return;
    }
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
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 6 - images.length,
      quality: 0.7,
    });
    if (!res.canceled) setImages((prev) => [...prev, ...res.assets.map((a) => a.uri)].slice(0, 6));
  };

  const locate = async () => {
    try {
      setLocating(true);
      const p = await Location.requestForegroundPermissionsAsync();
      if (!p.granted) {
        Alert.alert('Ruxsat berilmadi', 'Shahar markazi koordinatalari ishlatiladi.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setGeoExact(true);
    } catch {
      Alert.alert('Xatolik', 'Joylashuvni aniqlab boʻlmadi.');
    } finally {
      setLocating(false);
    }
  };

  const submit = () => {
    const e: Errors = {};
    const priceNum = Number(price.replace(/[^\d]/g, ''));
    if (!images.length) e.images = 'Kamida bitta rasm qoʻshing';
    if (title.trim().length < 3) e.title = 'Sarlavha kamida 3 ta belgidan iborat boʻlsin';
    if (!category) e.category = 'Kategoriyani tanlang';
    if (!priceNum || priceNum < 1000) e.price = 'Narxni soʻmda kiriting (kamida 1.000)';
    if (!city) e.city = 'Shaharni tanlang';
    if (description.trim().length < 10) e.description = 'Tavsif kamida 10 ta belgidan iborat boʻlsin';
    const digits = phone.replace(/[^\d]/g, '');
    if (digits.length < 9) e.phone = 'Telefon raqamini toʻliq kiriting';
    setErrors(e);
    if (Object.keys(e).length) {
      Alert.alert('Formani tekshiring', Object.values(e)[0]);
      return;
    }
    const cityGeo = CITIES.find((c) => c.name === city)?.geo ?? CITIES[0].geo;
    const listing: Listing = {
      id: existing?.own ? existing.id : newId(),
      title: title.trim(),
      category,
      price: priceNum,
      negotiable,
      images,
      breed: breed.trim(),
      age: age.trim(),
      gender,
      weight: weight.trim(),
      color: color.trim(),
      city,
      district: district.trim() || 'Markaz',
      geo: geo ?? cityGeo,
      description: description.trim(),
      phone: phone.trim(),
      sellerName: profile.name || 'Siz',
      delivery,
      vaccinated,
      createdAt: existing?.own ? existing.createdAt : Date.now(),
      rating: existing?.rating ?? 0,
      views: existing?.views ?? 0,
      own: true,
    };
    saveListing(listing);
    if (editing) router.back();
    else router.replace(`/listing/${listing.id}` as never);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.surface }}>
      <ScreenHeader title={editing ? 'Eʼlonni tahrirlash' : 'Yangi eʼlon'} />
      <KeyboardAwareScrollViewCompat contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: bottom + 40 }} bottomOffset={40}>
        <View style={fieldStyles.group}>
          <Text style={fieldStyles.groupTitle}>Rasmlar ({images.length}/6)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            <Pressable onPress={pick} style={[st.add, errors.images ? { borderColor: C.destructive } : null]} testID="pick-image">
              <Feather name="camera" size={24} color={C.navy} />
              <Text style={st.addTxt}>Galereya</Text>
            </Pressable>
            {images.map((uri, i) => (
              <View key={uri + i}>
                <Image source={{ uri }} style={st.thumb} />
                {i === 0 ? (
                  <View style={st.cover}>
                    <Text style={st.coverTxt}>Muqova</Text>
                  </View>
                ) : null}
                <Pressable onPress={() => setImages((p) => p.filter((_, j) => j !== i))} style={st.remove} accessibilityLabel="Rasmni oʻchirish">
                  <Feather name="x" size={14} color={C.white} />
                </Pressable>
              </View>
            ))}
          </ScrollView>
          {errors.images ? <Text style={st.err}>{errors.images}</Text> : null}
        </View>

        <View style={fieldStyles.group}>
          <Field label="Sarlavha" value={title} onChangeText={setTitle} placeholder="Masalan: Britan mushugi" error={errors.title} testID="title" />
          <View style={{ gap: 6 }}>
            <Text style={st.label}>Kategoriya</Text>
            <View style={st.wrap}>
              {CATEGORIES.map((c) => (
                <Chip key={c.id} label={c.label} active={category === c.id} onPress={() => setCategory(c.id)} testID={`ecat-${c.id}`} />
              ))}
            </View>
            {errors.category ? <Text style={st.err}>{errors.category}</Text> : null}
          </View>
          <Field label="Narx (soʻm)" value={price} onChangeText={setPrice} keyboardType="number-pad" placeholder="1530000" error={errors.price} testID="price" />
          <ToggleRow label="Kelishiladi" sub="Narx boʻyicha savdolashish mumkin" value={negotiable} onChange={setNegotiable} />
        </View>

        <View style={fieldStyles.group}>
          <Text style={fieldStyles.groupTitle}>Hayvon haqida</Text>
          <Field label="Zoti" value={breed} onChangeText={setBreed} placeholder="Scottish Fold" />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Field label="Yoshi" value={age} onChangeText={setAge} placeholder="4,5 oylik" />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Vazni" value={weight} onChangeText={setWeight} placeholder="10 kg" />
            </View>
          </View>
          <Field label="Rangi" value={color} onChangeText={setColor} placeholder="Kulrang" />
          <View style={{ gap: 6 }}>
            <Text style={st.label}>Jinsi</Text>
            <View style={st.wrap}>
              <Chip label="Erkak" active={gender === 'erkak'} onPress={() => setGender('erkak')} />
              <Chip label="Urgʻochi" active={gender === 'urgochi'} onPress={() => setGender('urgochi')} />
              <Chip label="Bilmayman" active={gender === ''} onPress={() => setGender('')} />
            </View>
          </View>
          <ToggleRow label="Emlangan" sub="Veterinar pasporti bor" value={vaccinated} onChange={setVaccinated} />
          <Field label="Tavsif" value={description} onChangeText={setDescription} multiline placeholder="Fe'l-atvori, parvarishi, hujjatlari..." error={errors.description} testID="description" />
        </View>

        <View style={fieldStyles.group}>
          <Text style={fieldStyles.groupTitle}>Joylashuv va aloqa</Text>
          <View style={{ gap: 6 }}>
            <Text style={st.label}>Shahar</Text>
            <View style={st.wrap}>
              {CITIES.map((c) => (
                <Chip key={c.name} label={c.name} active={city === c.name} onPress={() => setCity(c.name)} />
              ))}
            </View>
            {errors.city ? <Text style={st.err}>{errors.city}</Text> : null}
          </View>
          <Field label="Tuman / mahalla" value={district} onChangeText={setDistrict} placeholder="Yunusobod" />
          <Button
            label={locating ? 'Aniqlanmoqda...' : geoExact ? 'Aniq joylashuv olindi' : 'Joriy joylashuvni olish'}
            icon={geoExact ? 'check' : 'navigation'}
            variant="ghost"
            onPress={locate}
            disabled={locating}
          />
          <Text style={st.hint}>
            {geoExact && geo ? `Koordinatalar: ${geo.lat.toFixed(4)}, ${geo.lng.toFixed(4)}` : 'Aks holda tanlangan shahar markazi xaritada koʻrsatiladi.'}
          </Text>
          <Field label="Telefon raqami" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+998 90 123 45 67" error={errors.phone} testID="phone" />
          <ToggleRow label="Yetkazib berish" sub="Xaridorga yetkazib bera olaman" value={delivery} onChange={setDelivery} />
        </View>

        <Button label={editing ? 'Saqlash' : 'Eʼlonni joylash'} icon="check" onPress={submit} testID="submit-listing" />
        <Text style={st.hint}>Eʼlon hozircha faqat shu qurilmada saqlanadi va boshqa foydalanuvchilarga koʻrinmaydi — server ulanmagan.</Text>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const st = StyleSheet.create({
  add: { width: 92, height: 92, borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed', borderColor: C.navy, alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: C.lime },
  addTxt: { fontFamily: F.semibold, fontSize: 11, color: C.navy },
  thumb: { width: 92, height: 92, borderRadius: 16 },
  cover: { position: 'absolute', left: 6, bottom: 6, backgroundColor: C.navy, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  coverTxt: { fontFamily: F.semibold, fontSize: 10, color: C.lime },
  remove: { position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11, backgroundColor: C.overlay, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: F.semibold, fontSize: 12, color: C.mutedForeground },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  err: { fontFamily: F.medium, fontSize: 12, color: C.destructive },
  hint: { fontFamily: F.regular, fontSize: 12, color: C.mutedForeground, lineHeight: 17, textAlign: 'center' },
});
