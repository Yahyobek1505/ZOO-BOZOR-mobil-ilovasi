import React, { useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from '@/components/LocalizedText';
import { Alert } from '@/components/AppAlert';
import { F } from '@/constants/colors';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { timeAgo } from '@/constants/data';
import { useApp } from '@/context/AppContext';
import { useLocale } from '@/context/LocaleContext';
import { Button, SearchBar, go, useBottomInset, useTopInset } from '@/components/ui';
import { PopupMenu } from '@/components/PopupMenu';

/**
 * Figma "Habarlar". Messaging is not connected to a server, so the list only holds the drafts this
 * device saved per listing — no sample conversations, unread counters or delivery ticks.
 */
export default function Messages() {
  const { C } = useTheme();
  const st = useSt();
  const { conversations, getListing } = useApp();
  const { t } = useLocale();
  const top = useTopInset();
  const bottom = useBottomInset();
  const [q, setQ] = useState('');
  const [menu, setMenu] = useState(false);

  const chats = conversations
    .map((c) => {
      const l = getListing(c.listingId);
      const last = c.messages[c.messages.length - 1];
      return { id: c.listingId, name: l?.sellerName || 'Sotuvchi', title: l?.title || 'Eʼlon', last: last?.text ?? '', at: last?.at ?? 0 };
    })
    .sort((a, b) => b.at - a.at);
  const needle = q.trim().toLowerCase();
  const filtered = needle ? chats.filter((c) => [c.name, c.title, c.last].join(' ').toLowerCase().includes(needle)) : chats;

  return (
    <View style={{ flex: 1, backgroundColor: C.dark ? C.surface : C.card }}>
      <View style={[st.header, { paddingTop: top + 14 }]}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/' as never))} hitSlop={10} style={st.headLeft} accessibilityRole="button" accessibilityLabel="Orqaga" testID="back">
          <Feather name="chevron-left" size={28} color={C.white} />
          <Text style={st.headTitle}>Xabarlar</Text>
        </Pressable>
        <View style={st.headActions}>
          <Pressable onPress={() => Alert.alert('Xabarlar', 'Oʻqilmagan xabarlar yoʻq.')} hitSlop={8} accessibilityRole="button" accessibilityLabel={t('Hammasini oʻqilgan qilish')} testID="mark-read">
            <Ionicons name="checkmark-done" size={30} color={C.lime} />
          </Pressable>
          <Pressable onPress={() => setMenu(true)} hitSlop={8} accessibilityRole="button" accessibilityLabel={t('Menyu')} testID="messages-menu">
            <Feather name="more-vertical" size={26} color={C.white} />
          </Pressable>
        </View>
      </View>

      <PopupMenu
        visible={menu}
        top={top + 62}
        onClose={() => setMenu(false)}
        items={[
          { label: 'Arxivlangan suhbatlar', icon: <MaterialCommunityIcons name="archive-outline" size={24} color={C.text} />, onPress: () => Alert.alert('Arxivlangan suhbatlar', 'Arxivda suhbatlar yoʻq.'), testID: 'menu-archive' },
          { label: 'Xabar sozlamalari', icon: <Ionicons name="settings-outline" size={24} color={C.text} />, onPress: () => go('/settings'), testID: 'menu-settings' },
        ]}
      />

      <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
        <SearchBar value={q} onChangeText={setQ} placeholder="Ism yoki xabarni qidirish" />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: bottom + 24, flexGrow: 1 }}
        ListEmptyComponent={
          <View style={st.empty} testID="messages-empty">
            <Ionicons name="chatbubbles-outline" size={96} color="#a3a9c2" />
            <Text style={st.emptyTitle}>{needle ? 'Hech narsa topilmadi' : 'Yozishmalar hozircha yoʻq'}</Text>
            <Text style={st.emptyText}>Xabar almashish hali serverga ulanmagan. Eʼlon sahifasida yozgan qoralamalaringiz shu yerda saqlanadi.</Text>
            {!needle ? <Button label="Eʼlonlarni koʻrish" onPress={() => go('/listings')} /> : null}
          </View>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => go(`/messages/${item.id}`)} style={({ pressed }) => [st.row, pressed && { opacity: 0.85 }]} testID={`chat-${item.id}`}>
            <View style={st.av}>
              <Feather name="user" size={26} color={C.white} />
            </View>
            <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                <Text style={st.name} numberOfLines={1}>{item.name}</Text>
                {item.at ? <Text style={st.time}>{timeAgo(item.at)}</Text> : null}
              </View>
              <Text style={st.listing} numberOfLines={1}>{item.title}</Text>
              <Text style={st.last} numberOfLines={2}>{item.last}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const useSt = makeStyles((C) => ({
  // Figma: navy bar with a 25px bottom radius, lime double tick and a white 3-dot menu.
  header: { backgroundColor: C.navy, borderBottomLeftRadius: 25, borderBottomRightRadius: 25, paddingHorizontal: 22, paddingBottom: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headTitle: { fontFamily: F.dBold, fontSize: 22, color: C.white },
  headActions: { flexDirection: 'row', alignItems: 'center', gap: 26 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: C.dark ? C.card : '#f0f0f0', borderRadius: 20, padding: 14 },
  av: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center' },
  name: { flexShrink: 1, fontFamily: F.dBold, fontSize: 15, color: C.text },
  time: { fontFamily: F.dMedium, fontSize: 11, color: '#737373' },
  listing: { fontFamily: F.dSemibold, fontSize: 12, color: C.mutedDark },
  last: { fontFamily: F.dMedium, fontSize: 13, lineHeight: 16, color: '#737373' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 20, paddingBottom: 40 },
  emptyTitle: { fontFamily: F.dBold, fontSize: 18, color: '#a3a9c2', textAlign: 'center' },
  emptyText: { fontFamily: F.regular, fontSize: 13, lineHeight: 19, color: C.mutedForeground, textAlign: 'center', marginBottom: 6 },
}));
