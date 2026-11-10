import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Text } from '@/components/LocalizedText';
import { Feather } from '@expo/vector-icons';
import { C, F } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import { BrandMark, IconBtn, go, useTopInset } from '@/components/ui';

export function openMenu() {
  Alert.alert('Menyu', undefined, [
    { text: 'Saqlanganlar', onPress: () => go('/saved') },
    { text: 'Mening eʼlonlarim', onPress: () => go('/my-listings') },
    { text: 'Sozlamalar va til', onPress: () => go('/settings') },
    { text: 'Yopish', style: 'cancel' },
  ]);
}

export function BrandHeader({
  title = 'ZOO BOZOR',
  icon,
  children,
  showCart,
}: {
  title?: string;
  icon?: keyof typeof Feather.glyphMap;
  children?: React.ReactNode;
  showCart?: boolean;
}) {
  const top = useTopInset();
  const { cart, conversations } = useApp();
  const cartCount = cart.reduce((a, c) => a + c.qty, 0);
  return (
    <View style={[st.wrap, { paddingTop: top + 8 }]}>
      <View style={st.row}>
        <View style={st.brand}>
          {icon ? <Feather name={icon} size={24} color={C.lime} /> : <BrandMark size={24} />}
          <Text style={st.title}>{title}</Text>
        </View>
        <View style={st.actions}>
          {showCart ? (
            <IconBtn label="Savat" name="shopping-cart" onPress={() => go('/cart')} badge={cartCount || undefined} testID="cart-btn" />
          ) : null}
          <IconBtn label="Xabarlar" name="mail" onPress={() => go('/messages')} badge={conversations.length || undefined} />
          <IconBtn label="Menyu" name="menu" onPress={openMenu} />
        </View>
      </View>
      {children ? <View style={{ marginTop: 14 }}>{children}</View> : null}
    </View>
  );
}

const st = StyleSheet.create({
  wrap: { backgroundColor: C.navy, paddingHorizontal: 16, paddingBottom: 16, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontFamily: F.dExtra, fontSize: 20, color: C.white, letterSpacing: 0.3 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
