import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Text } from '@/components/LocalizedText';
import { Alert } from '@/components/AppAlert';
import { router } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { F } from '@/constants/colors';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { ScreenHeader, useBottomInset } from '@/components/ui';

type BidEvent = {
  id: string;
  user: string;
  amount: string;
  action: string;
  time: string;
};

const INITIAL_EVENTS: BidEvent[] = [
  { id: '1', user: 'Azizbek', amount: '73 400 000 soʻm', action: 'Narxni +100 000 soʻm oshirdi', time: '12:16:38' },
  { id: '2', user: 'Sardor', amount: '73 300 000 soʻm', action: 'Narxni +200 000 soʻm oshirdi', time: '12:16:10' },
  { id: '3', user: 'Ulugʻbek', amount: '73 100 000 soʻm', action: 'Narxni +100 000 soʻm oshirdi', time: '12:15:45' },
  { id: '4', user: 'Jasur', amount: '73 000 000 soʻm', action: 'Boshlangʻich narx bilan kirdi', time: '12:15:20' },
];

export default function AuctionScreen() {
  const { C } = useTheme();
  const st = useSt();
  const bottom = useBottomInset();
  const [currentBid, setCurrentBid] = useState(73400000);
  const [turnSeconds, setTurnSeconds] = useState(30);
  const [events, setEvents] = useState<BidEvent[]>(INITIAL_EVENTS);

  useEffect(() => {
    const timer = setInterval(() => {
      setTurnSeconds((prev) => (prev > 0 ? prev - 1 : 30));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const addBid = (inc: number) => {
    const nextBid = currentBid + inc;
    setCurrentBid(nextBid);
    const newEvent: BidEvent = {
      id: String(Date.now()),
      user: 'Siz',
      amount: `${nextBid.toLocaleString()} soʻm`,
      action: `Narxni +${inc.toLocaleString()} soʻm oshirdi`,
      time: new Date().toLocaleTimeString(),
    };
    setEvents([newEvent, ...events]);
    Alert.alert('Stavka qabul qilindi', `${nextBid.toLocaleString()} so'm stavkangiz peshqadamlik qilmoqda!`);
  };

  const skipTurn = () => {
    setTurnSeconds(30);
    Alert.alert('Navbat oʻtkazildi', 'Siz oʻz navbatingizni keyingi ishtirokchiga oʻtkazdingiz.');
  };

  const leaveAuction = () => {
    Alert.alert('Ishtirokni tark etish', 'Haqiqatan ham jonli savdoni tark etmoqchimisiz?', [
      { text: 'Qolish', style: 'cancel' },
      { text: 'Tark etish', style: 'destructive', onPress: () => router.back() },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.surface }}>
      <ScreenHeader
        title="Jonli savdo"
        right={
          <View style={st.liveBadge}>
            <View style={st.liveDot} />
            <Text style={st.liveTxt}>470 tomoshabin</Text>
          </View>
        }
      />

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: bottom + 32 }}>
        {/* Lot Header Card (Figma 381:326) */}
        <View style={st.lotCard}>
          <View style={st.lotTop}>
            <View style={st.lotPill}>
              <Text style={st.lotPillTxt}>LOT №024</Text>
            </View>
            <View style={st.timerWrap}>
              <Text style={st.timerLabel}>Savdo tugashiga</Text>
              <Text style={st.timerVal}>20:18</Text>
            </View>
          </View>

          <View style={{ gap: 4, marginTop: 4 }}>
            <Text style={st.lotTitle}>Qir lochini 1 yosh 8,5 kg</Text>
            <Text style={st.lotSeller}>Hayvon egasi • Alisher Zokirov</Text>
          </View>

          <View style={st.priceCard}>
            <Text style={st.priceHeader}>SAVDO (ENG YUQORI NARX)</Text>
            <Text style={st.bidAmount}>
              {currentBid.toLocaleString()} <Text style={st.bidCur}>soʻm</Text>
            </Text>
          </View>

          {/* Turn timer */}
          <View style={st.turnBanner}>
            <Ionicons name="timer-outline" size={18} color={C.ink} />
            <Text style={st.turnText}>
              Azizbek: sizga berilgan vaqt • 00:{turnSeconds < 10 ? `0${turnSeconds}` : turnSeconds}
            </Text>
          </View>
        </View>

        {/* Bidding Controls (Figma 381:326) */}
        <View style={st.actionCard}>
          <Text style={st.actionHeader}>STAVKA QOʻSHISH</Text>
          <View style={st.bidRow}>
            <Pressable onPress={() => addBid(100000)} style={st.bidBtn}>
              <Text style={st.bidBtnTxt}>+100 000</Text>
            </Pressable>
            <Pressable onPress={() => addBid(200000)} style={st.bidBtn}>
              <Text style={st.bidBtnTxt}>+200 000</Text>
            </Pressable>
            <Pressable onPress={() => addBid(350000)} style={[st.bidBtn, st.bidBtnHighlight]}>
              <Text style={[st.bidBtnTxt, { color: C.ink }]}>+350 000</Text>
            </Pressable>
          </View>

          <View style={st.turnControls}>
            <Pressable onPress={skipTurn} style={st.secondaryControl}>
              <Feather name="skip-forward" size={15} color={C.text} />
              <Text style={st.secondaryControlTxt}>Navbatni oʻtkazib yuborish</Text>
            </Pressable>
            <Pressable onPress={leaveAuction} style={[st.secondaryControl, { backgroundColor: '#FEE2E2' }]}>
              <Feather name="log-out" size={15} color={C.destructive} />
              <Text style={[st.secondaryControlTxt, { color: C.destructive }]}>Ishtirokni tark etish</Text>
            </Pressable>
          </View>
        </View>

        {/* Live Event Feed */}
        <View style={st.feedCard}>
          <Text style={st.feedTitle}>Jonli savdo qatnashchilari</Text>
          <View style={{ gap: 10, marginTop: 8 }}>
            {events.map((ev) => (
              <View key={ev.id} style={st.feedItem}>
                <View style={st.userAv}>
                  <Text style={st.userAvTxt}>{ev.user.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={st.userName}>{ev.user}</Text>
                    <Text style={st.eventTime}>{ev.time}</Text>
                  </View>
                  <Text style={st.eventAction}>{ev.action}</Text>
                </View>
                <Text style={st.eventAmount}>{ev.amount}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const useSt = makeStyles((C) => ({
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: C.destructive,
  },
  liveTxt: {
    fontFamily: F.dBold,
    fontSize: 11,
    color: C.destructive,
  },
  lotCard: {
    backgroundColor: C.navy,
    borderRadius: 24,
    padding: 20,
    gap: 12,
  },
  lotTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lotPill: {
    backgroundColor: C.lime,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  lotPillTxt: {
    fontFamily: F.dBold,
    fontSize: 13,
    color: C.ink,
  },
  timerWrap: {
    alignItems: 'flex-end',
  },
  timerLabel: {
    fontFamily: F.dMedium,
    fontSize: 10,
    color: '#9AA0B7',
  },
  timerVal: {
    fontFamily: F.dExtra,
    fontSize: 18,
    color: C.white,
  },
  lotTitle: {
    fontFamily: F.dExtra,
    fontSize: 18,
    color: C.white,
  },
  lotSeller: {
    fontFamily: F.dMedium,
    fontSize: 12,
    color: '#9AA0B7',
  },
  priceCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  priceHeader: {
    fontFamily: F.dBold,
    fontSize: 11,
    color: C.lime,
    letterSpacing: 1.2,
  },
  bidAmount: {
    fontFamily: F.dExtra,
    fontSize: 32,
    color: C.white,
  },
  bidCur: {
    fontFamily: F.dBold,
    fontSize: 18,
    color: C.lime,
  },
  turnBanner: {
    backgroundColor: C.lime,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  turnText: {
    fontFamily: F.dBold,
    fontSize: 13,
    color: C.ink,
  },
  actionCard: {
    backgroundColor: C.card,
    borderRadius: 22,
    padding: 18,
    gap: 12,
  },
  actionHeader: {
    fontFamily: F.dBold,
    fontSize: 12,
    color: C.mutedDark,
    letterSpacing: 0.8,
  },
  bidRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bidBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: C.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bidBtnHighlight: {
    backgroundColor: C.lime,
  },
  bidBtnTxt: {
    fontFamily: F.dBold,
    fontSize: 14,
    color: C.white,
  },
  turnControls: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  secondaryControl: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.surface,
  },
  secondaryControlTxt: {
    fontFamily: F.dBold,
    fontSize: 11,
    color: C.text,
  },
  feedCard: {
    backgroundColor: C.card,
    borderRadius: 22,
    padding: 18,
    gap: 6,
  },
  feedTitle: {
    fontFamily: F.dExtra,
    fontSize: 16,
    color: C.text,
    marginBottom: 4,
  },
  feedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  userAv: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvTxt: {
    fontFamily: F.dBold,
    fontSize: 14,
    color: C.text,
  },
  userName: {
    fontFamily: F.dBold,
    fontSize: 13,
    color: C.text,
  },
  eventTime: {
    fontFamily: F.dMedium,
    fontSize: 10.5,
    color: C.mutedForeground,
  },
  eventAction: {
    fontFamily: F.dMedium,
    fontSize: 11,
    color: C.mutedDark,
  },
  eventAmount: {
    fontFamily: F.dBold,
    fontSize: 12.5,
    color: C.text,
  },
}));
