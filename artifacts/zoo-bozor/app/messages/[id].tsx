import React, { useState } from 'react';
import { FlatList, Linking, Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { Feather, Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Alert } from '@/components/AppAlert';
import { Text, TextInput } from '@/components/LocalizedText';
import { F } from '@/constants/colors';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { formatPrice, sellerKey } from '@/constants/data';
import { phoneHref } from '@/constants/input';
import { useApp } from '@/context/AppContext';
import { useLocale } from '@/context/LocaleContext';
import { go, src, useBottomInset, useTopInset } from '@/components/ui';
import { PopupMenu } from '@/components/PopupMenu';

/**
 * Figma "Shaxsiy yozishma". Sending is not connected, so every message is a local draft and says so;
 * the call button dials the listing's real number when it has one.
 */
export default function Conversation() {
  const { C } = useTheme();
  const st = useSt();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { conversations, addDraft, deleteDraft, getListing } = useApp();
  const { t } = useLocale();
  const top = useTopInset();
  const bottom = useBottomInset();
  const [text, setText] = useState('');
  const [menu, setMenu] = useState(false);
  const listing = getListing(String(id));
  const msgs = conversations.find((c) => c.listingId === id)?.messages ?? [];
  const reversed = [...msgs].reverse();
  const seller = sellerKey(listing ?? {});

  const save = () => {
    const v = text.trim();
    if (!v) return;
    addDraft(String(id), v);
    setText('');
  };

  const call = () => {
    const uri = listing ? phoneHref(listing.phone) : null;
    if (!uri) { Alert.alert('Raqam mavjud emas', 'Sotuvchi bu eʼlon uchun telefon raqamini kiritmagan.'); return; }
    Linking.openURL(uri).catch(() => Alert.alert('Qoʻngʻiroq oynasi ochilmadi', 'Qurilmada qoʻngʻiroq ilovasi borligini tekshiring.'));
  };

  const clearChat = () => Alert.alert('Suhbatni oʻchirish', 'Shu suhbatdagi barcha qoralamalar oʻchiriladi.', [
    { text: 'Bekor qilish', style: 'cancel' },
    { text: 'Oʻchirish', style: 'destructive', onPress: () => msgs.forEach((m) => deleteDraft(String(id), m.id)) },
  ]);

  return (
    <View style={{ flex: 1, backgroundColor: C.surface }}>
      <View style={[st.header, { paddingTop: top + 14 }]}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/messages' as never))} hitSlop={10} accessibilityRole="button" accessibilityLabel="Orqaga" testID="back">
          <Feather name="chevron-left" size={30} color={C.white} />
        </Pressable>
        <View style={st.av}>
          <Feather name="user" size={26} color={C.white} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={st.name} numberOfLines={1}>{listing?.sellerName || 'Sotuvchi'}</Text>
          <Text style={st.sub} numberOfLines={1}>{listing?.title ?? 'Eʼlon'}</Text>
        </View>
        <Pressable onPress={call} hitSlop={8} accessibilityRole="button" accessibilityLabel={t('Qoʻngʻiroq')} testID="chat-call">
          <Ionicons name="call" size={26} color={C.lime} />
        </Pressable>
        <Pressable onPress={() => setMenu(true)} hitSlop={8} accessibilityRole="button" accessibilityLabel={t('Menyu')} testID="chat-menu">
          <Feather name="more-vertical" size={26} color={C.white} />
        </Pressable>
      </View>

      <PopupMenu
        visible={menu}
        top={top + 82}
        onClose={() => setMenu(false)}
        items={[
          ...(seller ? [{ label: 'Profilni koʻrish', icon: <Ionicons name="person-circle-outline" size={26} color={C.text} />, onPress: () => go(`/seller/${seller}`), testID: 'menu-profile' }] : []),
          { label: 'Shikoyat qilish', icon: <Ionicons name="flag" size={24} color={C.dark ? C.mutedDark : C.navySoft} />, onPress: () => Alert.alert('Shikoyat', 'Shikoyatlar xizmati hali serverga ulanmagan.'), testID: 'menu-report' },
          { label: 'Bloklash', icon: <Ionicons name="person-remove" size={24} color={C.destructive} />, onPress: () => Alert.alert('Bloklash', 'Bloklash xabar almashish serverga ulanganidan keyin ishlaydi.'), testID: 'menu-block' },
          { label: 'Suhbatni oʻchirish', icon: <Ionicons name="trash" size={24} color={C.destructive} />, onPress: clearChat, testID: 'menu-delete' },
        ]}
      />

      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }} keyboardVerticalOffset={0}>
        <FlatList
          data={reversed}
          inverted={reversed.length > 0}
          keyExtractor={(m) => m.id}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 16, gap: 8, flexGrow: 1 }}
          ListEmptyComponent={
            <View style={st.empty} testID="chat-empty">
              <Ionicons name="chatbubbles-outline" size={96} color="#a3a9c2" />
              <Text style={st.emptyTitle}>Yozishmalar hozircha yoʻq</Text>
              <Text style={st.emptyText}>Xabar almashish hali serverga ulanmagan. Yozganingiz yuborilmaydi — qoralama sifatida shu qurilmada saqlanadi.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onLongPress={() =>
                Alert.alert('Qoralamani oʻchirish', undefined, [
                  { text: 'Bekor qilish', style: 'cancel' },
                  { text: 'Oʻchirish', style: 'destructive', onPress: () => deleteDraft(String(id), item.id) },
                ])
              }
              style={st.bubble}
            >
              <Text style={st.bubbleTxt}>{item.text}</Text>
              <View style={st.status}>
                <Feather name="edit-3" size={10} color={C.lime} />
                <Text style={st.statusTxt}>Qoralama · yuborilmagan</Text>
              </View>
            </Pressable>
          )}
        />

        {listing ? (
          <Pressable onPress={() => go(`/listing/${listing.id}`)} style={st.listing} accessibilityRole="button" testID="chat-listing">
            {listing.images[0] !== undefined
              ? <Image source={src(listing.images[0])} style={st.thumb} contentFit="cover" />
              : <View style={[st.thumb, { backgroundColor: C.secondary }]} />}
            <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
              <Text style={st.lTitle} numberOfLines={1}>{listing.title}</Text>
              <Text style={st.lDesc} numberOfLines={1}>{[listing.breed, listing.age, listing.weight].filter(Boolean).join(' · ')}</Text>
              <Text style={st.lPrice}>{formatPrice(listing.price)} soʻm</Text>
            </View>
          </Pressable>
        ) : null}

        <View style={[st.inputBar, { paddingBottom: Math.max(bottom, 12) }]}>
          <Pressable onPress={() => Alert.alert('Fayl biriktirish', 'Rasm va fayl yuborish xabar almashish serverga ulanganidan keyin ishlaydi.')} style={st.round} accessibilityRole="button" accessibilityLabel={t('Fayl biriktirish')} testID="attach">
            <Feather name="paperclip" size={22} color={C.white} />
          </Pressable>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Xabar yozing..."
            placeholderTextColor={C.mutedForeground}
            style={st.input}
            multiline
            numberOfLines={1}
            testID="draft-input"
          />
          <Pressable onPress={save} disabled={!text.trim()} style={[st.round, !text.trim() && { opacity: 0.45 }]} accessibilityRole="button" accessibilityLabel={t('Qoralamani saqlash')} testID="save-draft">
            <Ionicons name="paper-plane" size={22} color={C.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const useSt = makeStyles((C) => ({
  // Figma: navy header, 25px bottom radius, avatar + name, lime phone, white 3-dot menu.
  header: { backgroundColor: C.navy, borderBottomLeftRadius: 25, borderBottomRightRadius: 25, paddingHorizontal: 18, paddingBottom: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
  av: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#5b6074', alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: F.dBold, fontSize: 19, color: C.white },
  sub: { fontFamily: F.dMedium, fontSize: 12, color: '#7f88a6', marginTop: 2 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 24 },
  emptyTitle: { fontFamily: F.dBold, fontSize: 18, color: '#a3a9c2', textAlign: 'center' },
  emptyText: { fontFamily: F.regular, fontSize: 12, lineHeight: 18, color: C.mutedForeground, textAlign: 'center' },
  bubble: { alignSelf: 'flex-end', maxWidth: '82%', backgroundColor: '#272c3d', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 12 },
  bubbleTxt: { fontFamily: F.dMedium, fontSize: 15, color: C.white, lineHeight: 21 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, alignSelf: 'flex-end' },
  statusTxt: { fontFamily: F.medium, fontSize: 10, color: C.lime },
  listing: { flexDirection: 'row', alignItems: 'center', gap: 16, marginHorizontal: 48, marginBottom: 8, borderWidth: 1, borderColor: C.dark ? C.border : '#dedede', borderRadius: 18, padding: 5, paddingRight: 14, backgroundColor: C.dark ? C.card : C.surface },
  thumb: { width: 64, height: 64, borderRadius: 14 },
  lTitle: { fontFamily: F.dSemibold, fontSize: 14, color: C.text },
  lDesc: { fontFamily: F.dMedium, fontSize: 12, color: C.text },
  lPrice: { fontFamily: F.dMedium, fontSize: 12, color: C.text },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, paddingHorizontal: 16, paddingTop: 4 },
  round: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, minHeight: 44, maxHeight: 120, backgroundColor: C.card, borderWidth: 1, borderColor: C.dark ? C.border : '#d0d0d0', borderRadius: 22, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, fontFamily: F.dMedium, fontSize: 15, color: C.text },
}));
