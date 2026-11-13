import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Alert } from '@/components/AppAlert';
import { Text } from '@/components/LocalizedText';
import { Feather, Ionicons } from '@expo/vector-icons';
import { F } from '@/constants/colors';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { useApp } from '@/context/AppContext';
import { useLocale } from '@/context/LocaleContext';
import { BrandMark, go, useTopInset } from '@/components/ui';
import { BasketIcon, MailIcon, MarketTabIcon, PlusSquareIcon } from '@/components/FigmaIcons';
import { useScreen } from '@/hooks/useScreen';
import { PopupMenu } from '@/components/PopupMenu';

// Payments are not part of the app: buyers and sellers settle directly, which is what these terms say.
const showTerms = () => Alert.alert(
  'Savdo shartlari',
  'ZOO-BOZOR sotuvchi va xaridorni bogʻlaydi. Toʻlov va topshirish ular oʻrtasida bevosita kelishiladi. Hayvon va uning hujjatlarini xariddan oldin shaxsan tekshiring, oldindan pul oʻtkazmang.',
);

function HeaderButton({ label, onPress, badge, testID, children }: {
  label: string; onPress: () => void; badge?: number; testID?: string; children: React.ReactNode;
}) {
  const { C } = useTheme();
  const st = useSt();
  const { t } = useLocale();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={t(label)}
      testID={testID}
      style={({ pressed }) => [st.btn, pressed && { opacity: 0.6 }]}
    >
      {children}
      {badge ? <View style={st.badge}><Text style={st.badgeTxt}>{badge > 99 ? '99+' : badge}</Text></View> : null}
    </Pressable>
  );
}

/** Figma menu glyph: three 3px bars, the middle one shorter and right-aligned. */
function MenuGlyph({ color = '#FFFFFF' }: { color?: string }) {
  const { C } = useTheme();
  const st = useSt();
  return (
    <View style={st.menu}>
      <View style={[st.menuBar, { width: 20, backgroundColor: color }]} />
      <View style={[st.menuBar, { width: 16, backgroundColor: color }]} />
      <View style={[st.menuBar, { width: 20, backgroundColor: color }]} />
    </View>
  );
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
  const { C } = useTheme();
  const st = useSt();
  const top = useTopInset();
  const { cart, conversations } = useApp();
  const { compact } = useScreen(); // < 360pt: tighter margins so all four header actions fit
  const cartCount = cart.reduce((a, c) => a + c.qty, 0);
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <View style={[st.wrap, { paddingTop: top + 8 }, compact && { paddingHorizontal: 16 }]}>
      <View style={st.row}>
        <View style={st.brand}>
          {icon === 'shopping-bag'
            ? <MarketTabIcon size={35} color={C.lime} />
            : icon ? <Feather name={icon} size={24} color={C.lime} /> : <BrandMark size={24} />}
          <Text style={st.title}>{title}</Text>
        </View>
        <View style={[st.actions, compact && { gap: 8 }]}>
          {showCart ? (
            <HeaderButton label="Savat" onPress={() => go('/cart')} badge={cartCount || undefined} testID="cart-btn">
              <BasketIcon size={24} color={C.white} />
            </HeaderButton>
          ) : null}
          <HeaderButton label="Eʼlon berish" onPress={() => go('/listing/edit')} testID="add-listing">
            <PlusSquareIcon size={28} color={C.lime} />
          </HeaderButton>
          <HeaderButton label="Xabarlar" onPress={() => go('/messages')} badge={conversations.length || undefined}>
            <MailIcon size={26} color={C.white} />
          </HeaderButton>
          <HeaderButton label="Menyu" onPress={() => setMenuOpen(true)} testID="header-menu">
            <MenuGlyph color={menuOpen ? C.lime : C.white} />
          </HeaderButton>
        </View>
      </View>
      {/* Figma 7-Market: white dropdown with Savdo shartlari and Yordam; the rest keeps settings reachable. */}
      <PopupMenu
        visible={menuOpen}
        top={top + 52}
        onClose={() => setMenuOpen(false)}
        items={[
          { label: 'Savdo shartlari', icon: <Ionicons name="document-text-outline" size={24} color={C.navy} />, onPress: showTerms, testID: 'menu-terms' },
          { label: 'Yordam', icon: <Ionicons name="help-circle-outline" size={25} color={C.navy} />, onPress: () => go('/settings'), testID: 'menu-help' },
          { label: 'Mening eʼlonlarim', icon: <Feather name="list" size={22} color={C.navy} />, onPress: () => go('/my-listings'), testID: 'menu-my-listings' },
          { label: 'Saqlanganlar', icon: <Ionicons name="heart-outline" size={23} color={C.navy} />, onPress: () => go('/saved'), testID: 'menu-saved' },
          { label: 'Sozlamalar va til', icon: <Ionicons name="settings-outline" size={23} color={C.navy} />, onPress: () => go('/settings'), testID: 'menu-settings' },
        ]}
      />
      {children ? <View style={{ marginTop: 14 }}>{children}</View> : null}
    </View>
  );
}

const useSt = makeStyles((C) => ({
  wrap: { backgroundColor: C.navy, paddingHorizontal: 20, paddingBottom: 17, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontFamily: F.dExtra, fontSize: 20, color: C.white, letterSpacing: 0.3 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  btn: { minWidth: 34, height: 36, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: -2, right: -6, backgroundColor: C.lime, borderRadius: 9, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeTxt: { fontFamily: F.bold, fontSize: 10, color: C.navy },
  menu: { width: 20, height: 15, justifyContent: 'space-between', alignItems: 'flex-end' },
  menuBar: { height: 3, borderRadius: 2 },
}));
