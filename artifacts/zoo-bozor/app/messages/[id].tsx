import React, { useState } from 'react';
import { Alert, FlatList, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Text, TextInput } from '@/components/LocalizedText';
import { useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { C, F } from '@/constants/colors';
import { formatPrice } from '@/constants/data';
import { useApp } from '@/context/AppContext';
import { Notice, ScreenHeader, go, src, useBottomInset } from '@/components/ui';

export default function Conversation() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { conversations, addDraft, deleteDraft, getListing } = useApp();
  const bottom = useBottomInset();
  const [text, setText] = useState('');
  const listing = getListing(String(id));
  const msgs = conversations.find((c) => c.listingId === id)?.messages ?? [];
  const reversed = [...msgs].reverse();

  const save = () => {
    const t = text.trim();
    if (!t) return;
    addDraft(String(id), t);
    setText('');
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.surface }}>
      <ScreenHeader title={listing?.title ?? 'Qoralama'} />
      {listing ? (
        <Pressable onPress={() => go(`/listing/${listing.id}`)} style={st.listing}>
          {listing.images[0] !== undefined ? <Image source={src(listing.images[0])} style={st.thumb} /> : null}
          <View style={{ flex: 1 }}>
            <Text style={st.lTitle} numberOfLines={1}>{listing.title}</Text>
            <Text style={st.lPrice}>{formatPrice(listing.price)} soʻm</Text>
          </View>
          <Feather name="chevron-right" size={18} color={C.mutedForeground} />
        </Pressable>
      ) : null}
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }} keyboardVerticalOffset={0}>
        <FlatList
          data={reversed}
          inverted={reversed.length > 0}
          keyExtractor={(m) => m.id}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 16, gap: 8, flexGrow: 1 }}
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Notice text="Xabar almashish hali serverga ulanmagan. Yozganingiz yuborilmaydi — faqat qoralama sifatida shu qurilmada saqlanadi. Sotuvchi bilan qoʻngʻiroq orqali bogʻlaning." />
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
        <View style={[st.inputBar, { paddingBottom: Platform.OS === 'web' ? 34 : Math.max(bottom, 10) }]}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Qoralama yozing..."
            placeholderTextColor={C.mutedForeground}
            style={st.input}
            multiline
            testID="draft-input"
          />
          <Pressable onPress={save} disabled={!text.trim()} style={[st.send, !text.trim() && { opacity: 0.4 }]} accessibilityLabel="Qoralamani saqlash" testID="save-draft">
            <Feather name="save" size={18} color={C.navy} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const st = StyleSheet.create({
  listing: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.white, marginHorizontal: 16, borderRadius: 16, padding: 8 },
  thumb: { width: 44, height: 44, borderRadius: 12 },
  lTitle: { fontFamily: F.dBold, fontSize: 14, color: C.navy },
  lPrice: { fontFamily: F.semibold, fontSize: 12, color: C.mutedForeground },
  bubble: { alignSelf: 'flex-end', maxWidth: '82%', backgroundColor: C.navy, borderRadius: 18, borderBottomRightRadius: 6, padding: 12 },
  bubbleTxt: { fontFamily: F.regular, fontSize: 14, color: C.white, lineHeight: 20 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, alignSelf: 'flex-end' },
  statusTxt: { fontFamily: F.medium, fontSize: 10, color: C.lime },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 12, paddingTop: 10, backgroundColor: C.white, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  input: { flex: 1, minHeight: 44, maxHeight: 120, backgroundColor: C.surface, borderRadius: 14, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 12, fontFamily: F.regular, fontSize: 15, color: C.navy },
  send: { width: 44, height: 44, borderRadius: 14, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center' },
});
