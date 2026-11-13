import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Text } from '@/components/LocalizedText';
import { Alert } from '@/components/AppAlert';
import { Feather, Ionicons } from '@expo/vector-icons';
import { F } from '@/constants/colors';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { Button, ScreenHeader, useBottomInset } from '@/components/ui';

type Tx = {
  id: string;
  txId: string;
  title: string;
  amount: string;
  date: string;
  method: 'Click' | 'Payme' | 'Uzum';
  status: 'success' | 'pending' | 'failed';
  note?: string;
};

// Payments are not connected yet, so there is no real balance or history to show
// (replit.md: never present an external service as working before it is).
const TRANSACTIONS: Tx[] = [];
const BALANCE = '0';
// Figma "15-Shaxsiy Profil 05" list; none is connected, so every row says "tez orada".
const PROVIDERS = [
  { name: 'Bank kartasi', color: '#080D20', letter: '', id: 'card' },
  { name: 'Click', color: '#00A3FF', letter: 'C', id: 'click' },
  { name: 'Payme', color: '#00CCCC', letter: 'P', id: 'payme' },
  { name: 'Uzum Bank', color: '#7000FF', letter: 'U', id: 'uzum' },
  { name: 'TBS Bank', color: '#d9d9d9', letter: 'T', id: 'tbs' },
  { name: 'AVO Bank', color: '#d9d9d9', letter: 'A', id: 'avo' },
];

export default function Wallet() {
  const { C } = useTheme();
  const st = useSt();
  const bottom = useBottomInset();
  const [selectedTx, setSelectedTx] = useState<Tx | null>(null);
  const [topUpModal, setTopUpModal] = useState(false);

  const handleTopUp = () => {
    setTopUpModal(false);
    Alert.alert('Toʻlov hali ulanmagan', 'Hamyonni toʻldirish toʻlov tizimi ulanganidan keyin ishlaydi.');
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.surface }}>
      <ScreenHeader title="Hamyon" />

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: bottom + 32 }}>
        {/* Figma 743:190 Balance Card */}
        <View style={st.balanceCard}>
          <View style={st.balHeader}>
            <View style={{ gap: 4 }}>
              <Text style={st.balSubtitle}>Mening balansim</Text>
              <Text style={st.balAmount}>{BALANCE} <Text style={st.balUnit}>uzs</Text></Text>
            </View>
            <Pressable onPress={() => setTopUpModal(true)} style={st.topUpBtn}>
              <Text style={st.topUpTxt}>Toʻldirish</Text>
              <Feather name="plus" size={16} color={C.ink} />
            </Pressable>
          </View>
        </View>

        {/* Section title */}
        <View style={st.sectionHeader}>
          <Text style={st.sectionTitle}>Toʻlov tafsiloti</Text>
          <Text style={st.sectionSubtitle}>Oxirgi amallar</Text>
        </View>

        {/* Transactions List */}
        <View style={{ gap: 10 }}>
          {TRANSACTIONS.length === 0 ? (
            <View style={st.empty} testID="wallet-empty">
              <Feather name="credit-card" size={22} color={C.mutedForeground} />
              <Text style={st.emptyTxt}>Balans va toʻlovlar tarixi toʻlov xizmati ulanganidan keyin koʻrinadi.</Text>
            </View>
          ) : null}
          {TRANSACTIONS.map((tx) => {
            const isSuccess = tx.status === 'success';
            const isPending = tx.status === 'pending';
            const statusColor = isSuccess ? C.success : isPending ? C.warning : C.destructive;
            const statusLabel = isSuccess ? 'Muvaffaqiyatli' : isPending ? 'Kutilmoqda' : 'Amalga oshmadi';

            return (
              <Pressable
                key={tx.id}
                onPress={() => setSelectedTx(tx)}
                style={st.txCard}
                testID={`tx-${tx.id}`}
              >
                <View style={[st.txIcon, { backgroundColor: isSuccess ? C.successSoft : C.surface }]}>
                  <Feather
                    name={isSuccess ? 'arrow-down-left' : isPending ? 'clock' : 'alert-circle'}
                    size={20}
                    color={statusColor}
                  />
                </View>

                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={st.txTitle}>{tx.title}</Text>
                  <Text style={st.txDate}>{tx.date}</Text>
                  {tx.note ? (
                    <Text style={[st.txNote, { color: statusColor }]} numberOfLines={1}>
                      {tx.note}
                    </Text>
                  ) : null}
                </View>

                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={[st.txAmount, { color: isSuccess ? C.navy : C.mutedForeground }]}>
                    {tx.amount}
                  </Text>
                  <View style={[st.txBadge, { backgroundColor: statusColor + '18' }]}>
                    <Text style={[st.txBadgeTxt, { color: statusColor }]}>{statusLabel}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* TOP-UP MODAL (Figma Payment Methods Selection) */}
      <Modal visible={topUpModal} transparent animationType="fade" onRequestClose={() => setTopUpModal(false)}>
        <View style={st.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setTopUpModal(false)} />
          <Animated.View entering={FadeInUp.duration(280)} style={st.modalCard}>
            <View style={st.modalGrab} />
            <Text style={st.modalTitle}>Hamyonni toʻldirish</Text>
            <Text style={st.modalSub}>Toʻlov usulini tanlang</Text>

            {/* Six rows do not fit short phones (e.g. 320×700) together with the close button, so they scroll. */}
            <ScrollView style={{ flexGrow: 0, flexShrink: 1 }} contentContainerStyle={{ gap: 8, marginTop: 8 }}>
              {PROVIDERS.map((p) => (
                <Pressable key={p.id} onPress={handleTopUp} style={st.providerBtn} accessibilityState={{ disabled: true }} testID={`provider-${p.id}`}>
                  <View style={st.providerLogo}>
                    <View style={[st.providerIcon, { backgroundColor: p.color }]}>
                      {p.letter ? <Text style={st.providerIconTxt}>{p.letter}</Text> : <Feather name="credit-card" size={20} color={C.lime} />}
                    </View>
                  </View>
                  <View style={st.providerDivider} />
                  <Text style={st.providerName}>{p.name}</Text>
                  <Text style={st.providerFee}>tez orada</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Button label="Yopish" variant="ghost" onPress={() => setTopUpModal(false)} style={{ marginTop: 8 }} />
          </Animated.View>
        </View>
      </Modal>

      {/* RECEIPT MODAL (Figma 743:190 Tranzaksiya kvitansiyasi) */}
      <Modal visible={!!selectedTx} transparent animationType="fade" onRequestClose={() => setSelectedTx(null)}>
        <View style={st.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelectedTx(null)} />
          {selectedTx ? (
            <Animated.View entering={FadeInUp.duration(280)} style={st.modalCard}>
              <View style={st.modalGrab} />
              <Text style={st.modalTitle}>Tranzaksiya kvitansiyasi</Text>
              <Text style={st.receiptId}>{selectedTx.txId}</Text>

              <View style={st.receiptTable}>
                <View style={st.receiptRow}>
                  <Text style={st.receiptLabel}>Sana va vaqt</Text>
                  <Text style={st.receiptVal}>{selectedTx.date}</Text>
                </View>

                <View style={st.receiptRow}>
                  <Text style={st.receiptLabel}>Toʻlov usuli</Text>
                  <Text style={st.receiptVal}>{selectedTx.method}</Text>
                </View>

                <View style={st.receiptRow}>
                  <Text style={st.receiptLabel}>Tranzaksiya ID</Text>
                  <Text style={st.receiptVal}>{selectedTx.txId}</Text>
                </View>

                <View style={st.receiptRow}>
                  <Text style={st.receiptLabel}>Qabul qiluvchi</Text>
                  <Text style={st.receiptVal}>ZOO BOZOR hamyoni</Text>
                </View>

                <View style={[st.receiptRow, { borderBottomWidth: 0 }]}>
                  <Text style={st.receiptLabel}>Miqdor</Text>
                  <Text style={[st.receiptVal, { fontFamily: F.dExtra, fontSize: 16, color: C.text }]}>
                    {selectedTx.amount}
                  </Text>
                </View>
              </View>

              <View style={{ gap: 8, marginTop: 10 }}>
                <Button
                  label="Chekni saqlash"
                  icon="download"
                  onPress={() => {
                    setSelectedTx(null);
                    Alert.alert('Chek saqlandi', 'PDF kvitansiya qurilma xotirasiga saqlandi.');
                  }}
                />
                <Button
                  label="Ulashish"
                  icon="share-2"
                  variant="ghost"
                  onPress={() => {
                    setSelectedTx(null);
                    Alert.alert('Ulashish', 'Kvitansiya havolasi nusxalandi.');
                  }}
                />
                <Pressable
                  onPress={() => {
                    setSelectedTx(null);
                    Alert.alert('Mutaxassis bilan bogʻlanish', 'Telegram orqali qoʻllab-quvvatlash xizmati: @zoobozor_support');
                  }}
                  style={{ alignSelf: 'center', padding: 8 }}
                >
                  <Text style={st.supportLink}>Mutaxassis bilan bogʻlanish</Text>
                </Pressable>
              </View>
            </Animated.View>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

const useSt = makeStyles((C) => ({
  balanceCard: {
    backgroundColor: C.navy,
    borderRadius: 24,
    padding: 22,
  },
  balHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balSubtitle: {
    fontFamily: F.dMedium,
    fontSize: 13,
    color: '#9AA0B7',
  },
  balAmount: {
    fontFamily: F.dExtra,
    fontSize: 28,
    color: C.lime,
  },
  balUnit: {
    fontFamily: F.dBold,
    fontSize: 18,
    color: C.white,
  },
  topUpBtn: {
    backgroundColor: C.lime,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  topUpTxt: {
    fontFamily: F.dBold,
    fontSize: 14,
    color: C.ink,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontFamily: F.dExtra,
    fontSize: 18,
    color: C.text,
  },
  sectionSubtitle: {
    fontFamily: F.dMedium,
    fontSize: 12,
    color: C.mutedForeground,
  },
  empty: {
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.card,
    borderRadius: 18,
    padding: 20,
  },
  emptyTxt: {
    fontFamily: F.dMedium,
    fontSize: 13,
    color: C.mutedDark,
    textAlign: 'center',
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.card,
    borderRadius: 18,
    padding: 14,
  },
  txIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTitle: {
    fontFamily: F.dBold,
    fontSize: 14.5,
    color: C.text,
  },
  txDate: {
    fontFamily: F.dMedium,
    fontSize: 11.5,
    color: C.mutedForeground,
  },
  txNote: {
    fontFamily: F.dMedium,
    fontSize: 11,
    marginTop: 2,
  },
  txAmount: {
    fontFamily: F.dBold,
    fontSize: 14.5,
  },
  txBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  txBadgeTxt: {
    fontFamily: F.dBold,
    fontSize: 10,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: C.overlay,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: C.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    gap: 12,
    maxHeight: '85%',
  },
  modalGrab: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontFamily: F.dExtra,
    fontSize: 20,
    color: C.text,
    textAlign: 'center',
  },
  modalSub: {
    fontFamily: F.dMedium,
    fontSize: 13,
    color: C.mutedDark,
    textAlign: 'center',
  },
  receiptId: {
    fontFamily: F.dBold,
    fontSize: 13,
    color: C.mutedForeground,
    textAlign: 'center',
  },
  receiptTable: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 14,
    gap: 10,
    marginTop: 6,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: C.dark ? C.border : '#EBEBEB',
  },
  receiptLabel: {
    fontFamily: F.dMedium,
    fontSize: 13,
    color: C.mutedDark,
  },
  receiptVal: {
    fontFamily: F.dBold,
    fontSize: 13,
    color: C.text,
  },
  supportLink: {
    fontFamily: F.dBold,
    fontSize: 13,
    color: C.mutedDark,
    textDecorationLine: 'underline',
  },
  providerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.dark ? C.border : '#d9d9d9',
    backgroundColor: C.card,
    paddingRight: 16,
  },
  providerLogo: {
    width: 74,
    alignItems: 'center',
  },
  providerIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerIconTxt: {
    fontFamily: F.dExtra,
    fontSize: 17,
    color: C.white,
  },
  providerDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#d9d9d9',
    marginRight: 12,
  },
  providerName: {
    flex: 1,
    fontFamily: F.dBold,
    fontSize: 17,
    color: C.mutedForeground,
  },
  providerFee: {
    fontFamily: F.dMedium,
    fontSize: 12,
    color: C.mutedForeground,
  },
}));
