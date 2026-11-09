import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C, F } from '@/constants/colors';
import { Button, Notice, ScreenHeader, go, useBottomInset } from '@/components/ui';

export default function Wallet() {
  const bottom = useBottomInset();
  return (
    <View style={{ flex: 1, backgroundColor: C.surface }}>
      <ScreenHeader title="Hamyon" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: bottom + 24 }}>
        <View style={st.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Feather name="credit-card" size={14} color={C.mutedForeground} />
            <Text style={st.label}>Mening balansim</Text>
          </View>
          <Text style={st.val}>Ulanmagan</Text>
          <Text style={st.sub}>Balans va toʻlovlar tarixi toʻlov xizmati ulanganidan keyin koʻrinadi.</Text>
        </View>
        <Notice text="Toʻlov xizmati (Click, Payme va boshqalar) hali ulanmagan. Ilova hech qanday pul yechmaydi va toʻlovni amalga oshirmaydi." />
        <View style={st.box}>
          <Text style={st.h}>Toʻlov tarixi</Text>
          <Text style={st.sub}>Hozircha toʻlovlar yoʻq.</Text>
        </View>
        <Button label="Savatga qaytish" icon="shopping-cart" variant="navy" onPress={() => go('/cart')} />
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  card: { backgroundColor: C.navy, borderRadius: 24, padding: 20, gap: 6 },
  label: { fontFamily: F.medium, fontSize: 12, color: C.mutedForeground },
  val: { fontFamily: F.dExtra, fontSize: 28, color: C.lime },
  sub: { fontFamily: F.regular, fontSize: 13, color: C.mutedForeground, lineHeight: 19 },
  box: { backgroundColor: C.white, borderRadius: 20, padding: 16, gap: 6 },
  h: { fontFamily: F.dBold, fontSize: 16, color: C.navy },
});
