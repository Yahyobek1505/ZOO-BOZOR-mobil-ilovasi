import React, { useEffect } from 'react';
import { Platform, Pressable, View, ViewStyle, StyleProp } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Text, TextInput } from '@/components/LocalizedText';
import { Image } from 'expo-image';
import { Feather, Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Path } from 'react-native-svg';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { F } from '@/constants/colors';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { ImgSrc, Listing, Product, formatPrice } from '@/constants/data';
import { useApp } from '@/context/AppContext';
import { BasketIcon, ChevronDownIcon } from '@/components/FigmaIcons';
import { apiUrl } from '@/lib/api-origin';
import { useScreen } from '@/hooks/useScreen';

export const go = (path: string) => router.push(path as never);

// Metro returns numbers on native and source objects on web.
// Wrap only user-picked URI strings; preserve bundled asset objects.
export const src = (s: ImgSrc) => (typeof s === 'string' ? { uri: s.startsWith('/api/') ? apiUrl(s) : s } : s);

export function useTopInset() {
  const insets = useSafeAreaInsets();
  // Web: real safe-area (notched phones) with a small floor; no fake 67px status bar.
  return Platform.OS === 'web' ? Math.max(insets.top, 20) : insets.top;
}
export function useBottomInset() {
  const insets = useSafeAreaInsets();
  return Platform.OS === 'web' ? Math.max(insets.bottom, 12) : insets.bottom;
}

const LOGO_PATH =
  'M3.78807 8.55997C3.86208 9.02924 3.73723 9.1471 3.53477 9.42244C0.391861 13.6983 -0.725248 18.7008 0.466095 23.7925C4.99988 44.3719 35.4378 40.5838 36 25.2249C36 20.8722 30.6905 18.2146 26.2595 19.6086C24.6993 20.0994 23.1842 21.8831 19.445 21.8831C18.3214 21.8831 17.233 19.9617 18.7604 18.972C19.4552 18.5217 19.86 18.7378 20.9971 18.7378C21.9331 18.7378 22.9742 18.1831 23.395 17.6737C23.9613 16.988 24.2629 16.239 24.1132 15.1945C23.8274 13.1997 21.7266 12.2504 20.0659 12.2504C17.3795 12.2504 15.3277 12.7675 13.4164 14.5833C10.9521 16.9245 10.4963 20.1953 11.6198 23.2227C12.0115 24.2783 12.5723 24.8541 13.2211 25.6332C13.6819 26.1867 14.8855 26.9786 15.5115 27.2907C18.8579 28.959 22.7841 28.3125 25.5238 25.6918C25.9925 25.2433 26.3799 24.8319 27.4121 24.8319C28.8339 24.8319 31.1356 26.9718 27.163 29.903C26.6074 30.3129 26.2543 30.5605 25.6213 30.8957C25.0203 31.2138 24.5213 31.5167 23.8523 31.7708C19.9792 33.242 14.878 32.7998 11.463 30.3504C9.0949 28.652 7.98398 27.1806 6.91039 24.6495C6.02172 22.5544 5.83996 19.8152 6.44812 17.498C7.36468 14.0054 9.87683 11.0447 13.2711 9.43249C17.7519 7.30418 23.9547 8.01793 26.6674 10.5991C29.5045 12.4336 29.373 14.6096 32.2751 14.6096C33.7236 14.6096 34.8224 13.5864 35.1632 12.5368C35.394 11.8262 35.4301 11.2268 35.1479 10.5045C35.0198 10.1765 34.9122 10.0056 34.719 9.73241C33.9988 8.71436 34.0326 9.34049 34.3196 8.0986C34.7153 6.38625 34.7786 3.40636 34.5233 1.66186C34.0715 -1.4237 28.616 0.91189 26.6184 1.86391L25.1716 2.56269C24.809 2.72905 24.8537 2.70491 24.4508 2.59154C17.6459 0.677145 13.3366 2.9607 12.5841 2.75245C11.8475 2.54859 9.71779 0.767218 5.00427 0.018427C2.21701 -0.422855 3.57279 7.19498 3.78818 8.56018L3.78807 8.55997Z';

export function BrandMark({ size = 26, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size * (38 / 36)} viewBox="0 0 36 38">
      <Path d={LOGO_PATH} fill={color} fillRule="evenodd" clipRule="evenodd" />
    </Svg>
  );
}

export function FigmaLoader({
  size = 36,
  color = '#D0FE17',
  trackColor = '#E2E2E2',
}: {
  size?: number;
  color?: string;
  trackColor?: string;
}) {
  const rotation = useSharedValue(0);
  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 900, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(rotation);
  }, [rotation]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  const strokeWidth = Math.max(3, Math.round(size / 9));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  return (
    <Animated.View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, animatedStyle]}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference * 0.4} ${circumference * 0.6}`}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    </Animated.View>
  );
}

export function IconBtn({
  name,
  onPress,
  bg = 'transparent',
  color = '#FFFFFF',
  size = 22,
  badge,
  testID,
  label,
}: {
  name: keyof typeof Feather.glyphMap;
  onPress: () => void;
  bg?: string;
  color?: string;
  size?: number;
  badge?: number;
  testID?: string;
  label: string;
}) {
  const { C } = useTheme();
  const s = useS();
  return (
    <Pressable
      testID={testID}
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [s.iconBtn, { backgroundColor: bg, opacity: pressed ? 0.6 : 1 }]}
    >
      <Feather name={name} size={size} color={color} />
      {badge ? (
        <View style={s.badge}>
          <Text style={s.badgeTxt}>{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

// Figma search field: 362×46, radius 15, #ddd border, #c8c8c8 hint, 86×36 #eee filter button.
const SEARCH_HINT = '#c8c8c8';

export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  placeholder,
  onFilter,
  filterIcon = 'sliders',
  filterNode,
}: {
  value: string;
  onChangeText: (t: string) => void;
  onSubmit?: () => void;
  placeholder: string;
  onFilter?: () => void;
  filterIcon?: keyof typeof Feather.glyphMap;
  /** Custom glyph for the filter button (e.g. the Figma paw icon). */
  filterNode?: React.ReactNode;
}) {
  const { C } = useTheme();
  const s = useS();
  const { compact } = useScreen();
  return (
    <View style={s.search}>
      <Feather name="search" size={18} color={SEARCH_HINT} />
      <TextInput
        testID="search-input"
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor={SEARCH_HINT}
        returnKeyType="search"
        style={s.searchInput}
      />
      {value ? (
        <Pressable onPress={() => onChangeText('')} hitSlop={8} accessibilityLabel="Tozalash">
          <Feather name="x" size={16} color={C.mutedForeground} />
        </Pressable>
      ) : null}
      {onFilter ? (
        <Pressable onPress={onFilter} style={[s.filterBtn, compact && { width: 66, gap: 6 }]} accessibilityLabel="Saralash">
          {filterNode ?? <Feather name={filterIcon} size={20} color={C.mutedDark} />}
          <ChevronDownIcon size={17} color={C.text} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function SectionTitle({ title, onMore, moreLabel = 'Barchasi', dark }: { title: string; onMore?: () => void; moreLabel?: string; dark?: boolean }) {
  const { C } = useTheme();
  const s = useS();
  return (
    <View style={s.section}>
      <View style={[s.sectionPill, dark && { backgroundColor: 'transparent', paddingHorizontal: 0 }]}>
        <Text style={[s.sectionTxt, dark && { color: C.text }]}>{title}</Text>
        {dark && onMore ? <Feather name="chevron-right" size={18} color={C.text} /> : null}
      </View>
      {onMore ? (
        <Pressable onPress={onMore} style={s.morePill} hitSlop={6}>
          <Text style={s.moreTxt}>{moreLabel}</Text>
          <Feather name="chevron-right" size={14} color={C.ink} />
        </Pressable>
      ) : null}
    </View>
  );
}

function Heart({ active, onPress, small }: { active: boolean; onPress: () => void; small?: boolean }) {
  const { C } = useTheme();
  const s = useS();
  return (
    <Pressable onPress={onPress} hitSlop={8} style={[s.heart, small && { width: 26, height: 26 }]} accessibilityLabel="Saqlash">
      <Ionicons name={active ? 'heart' : 'heart-outline'} size={small ? 15 : 18} color={active ? C.lime : C.white} />
    </Pressable>
  );
}

export function Rating({ value, views }: { value: number; views?: number | string }) {
  const { C } = useTheme();
  const s = useS();
  return (
    <View style={s.ratingRow}>
      <View style={s.row}>
        <Ionicons name="star" size={12} color={C.star} />
        <Text style={s.meta}> {value}</Text>
      </View>
      {views !== undefined ? (
        <View style={s.row}>
          <Text style={s.meta}>{views} </Text>
          <Feather name="eye" size={11} color={C.mutedForeground} />
        </View>
      ) : null}
    </View>
  );
}

// Figma "10-Bosh Sahifa" listing card: 178px wide, image inset 6px (165x214, r12),
// medium title, bold price, three-line description and a star/views footer.
export function ListingCard({ item, style }: { item: Listing; style?: StyleProp<ViewStyle> }) {
  const { C } = useTheme();
  const s = useS();
  const { favorites, toggleFavorite } = useApp();
  return (
    <View style={[s.lCard, style]}>
    <Pressable testID={`listing-${item.id}`} onPress={() => go(`/listing/${item.id}`)} style={({ pressed }) => pressed && { opacity: 0.85 }}>
      <View style={s.lImgWrap}>
        {item.images[0] !== undefined ? (
          <Image source={src(item.images[0])} style={s.cardImg} contentFit="cover" transition={200} />
        ) : (
          <View style={[s.cardImg, s.center]}>
            <Feather name="image" size={26} color={C.mutedForeground} />
          </View>
        )}
        {item.vaccinated ? (
          <View style={s.lBolt} pointerEvents="none">
            <Ionicons name="flash" size={22} color={C.lime} />
          </View>
        ) : null}
      </View>
      <View style={s.lBody}>
        <Text style={s.lTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={s.lPrice} numberOfLines={1}>
          {formatPrice(item.price)} uzs
        </Text>
        <Text style={s.lDesc} numberOfLines={3}>
          {item.description}
        </Text>
        <CardFooter value={item.rating} views={compactViews(item.views)} />
      </View>
    </Pressable>
      {/* Image inset (6) + Figma heart offset (8). */}
      <View style={[s.heartPos, { top: 14, right: 14 }]}>
        <Heart active={favorites.includes(item.id)} onPress={() => toggleFavorite(item.id)} />
      </View>
    </View>
  );
}

/** Figma shows view counts as 980, 1.12K, 1.5K. */
export const compactViews = (views: number) =>
  views >= 1000 ? `${(views / 1000).toFixed(2).replace(/\.?0+$/, '')}K` : views;

/** Figma card footer: yellow star + grey rating on the left, grey views + navy eye on the right. */
function CardFooter({ value, views }: { value: number; views?: number | string }) {
  const { C } = useTheme();
  const s = useS();
  return (
    <View style={s.lFooter}>
      <View style={[s.row, { gap: 5 }]}>
        <Ionicons name="star" size={14} color={C.star} />
        <Text style={s.lMeta}>{value}</Text>
      </View>
      {views !== undefined ? (
        <View style={[s.row, { gap: 4 }]}>
          <Text style={s.lMeta}>{views}</Text>
          <Ionicons name="eye" size={14} color={C.dark ? C.mutedDark : C.navySoft} />
        </View>
      ) : null}
    </View>
  );
}

export function SaleCard({ item, onPress, image, title, price, desc, rating, sub }: {
  item: { id: string };
  onPress: () => void;
  image: ImgSrc;
  title: string;
  price: number;
  desc: string;
  rating: number;
  sub?: string | number;
}) {
  const { C } = useTheme();
  const s = useS();
  return (
    <Pressable testID={`sale-${item.id}`} onPress={onPress} style={({ pressed }) => [s.sale, pressed && { opacity: 0.85 }]}>
      <Image source={src(image)} style={s.saleImg} contentFit="cover" />
      <View style={s.saleBolt} pointerEvents="none">
        <Ionicons name="flash" size={20} color={C.lime} />
      </View>
      {/* Figma "Xafta sotuvi" card shows no title, only price, description and footer. */}
      <View style={s.saleBody} accessible accessibilityLabel={title}>
        <Text style={s.salePrice} numberOfLines={1}>
          {formatPrice(price)} uzs
        </Text>
        <Text style={s.saleDesc} numberOfLines={3}>{desc}</Text>
        <CardFooter value={rating} views={sub} />
      </View>
    </Pressable>
  );
}

export function ProductCard({ item, style }: { item: Product; style?: StyleProp<ViewStyle> }) {
  const { C } = useTheme();
  const s = useS();
  const { favoriteProducts, toggleFavoriteProduct, addToCart, cart } = useApp();
  const inCart = cart.some((c) => c.productId === item.id);
  return (
    <View style={[s.card, style]}>
    <Pressable testID={`product-${item.id}`} onPress={() => go(`/product/${item.id}`)} style={({ pressed }) => pressed && { opacity: 0.85 }}>
      <View style={[s.cardImgWrap, { backgroundColor: C.surface }]}>
        <Image source={src(item.image)} style={s.cardImg} contentFit="cover" />
      </View>
      <View style={{ padding: 8, gap: 2 }}>
        <View style={[s.row, { justifyContent: 'space-between' }]}>
          <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
          {/* A long title is cut with "…"; the weight never wraps (keeps every card the same height). */}
          <Text style={[s.meta, { flexShrink: 0, marginLeft: 6 }]} numberOfLines={1}>{item.weight}</Text>
        </View>
        <View style={[s.row, { justifyContent: 'space-between' }]}>
          <Text style={s.cardPrice}>
            {formatPrice(item.price)} <Text style={s.cardCur}>uzs</Text>
          </Text>
          {item.oldPrice ? <Text style={s.oldPrice}>{formatPrice(item.oldPrice)}</Text> : null}
        </View>
        <Text style={s.cardDesc} numberOfLines={2}>{item.description}</Text>
        <View style={s.ratingRow}>
          <View style={s.row}>
            <Ionicons name="star" size={12} color={C.star} />
            <Text style={s.meta}> {item.rating}</Text>
          </View>
          <Text style={s.meta}>{item.sold} sotildi</Text>
        </View>
      </View>
    </Pressable>
      {/* Image inset (4) + Figma offsets (8; basket 40 from the right). */}
      <Pressable
        onPress={() => addToCart(item.id)}
        style={[s.cartMini, { top: 12, right: 44 }, inCart && { backgroundColor: C.lime }]}
        hitSlop={6}
        accessibilityLabel="Savatga qoʻshish"
        testID={`product-cart-${item.id}`}
      >
        {inCart ? <Feather name="check" size={14} color={C.ink} /> : <BasketIcon size={16} color={C.lime} />}
      </Pressable>
      <View style={[s.heartPos, { top: 12, right: 12 }]}>
        <Heart small active={favoriteProducts.includes(item.id)} onPress={() => toggleFavoriteProduct(item.id)} />
      </View>
    </View>
  );
}

export function Chip({ label, active, onPress, testID }: { label: string; active: boolean; onPress: () => void; testID?: string }) {
  const { C } = useTheme();
  const s = useS();
  return (
    <Pressable testID={testID} onPress={onPress} style={[s.chip, active && s.chipActive]}>
      <Text style={[s.chipTxt, active && { color: C.lime }]}>{label}</Text>
    </Pressable>
  );
}

export function Button({
  label,
  onPress,
  variant = 'lime',
  icon,
  disabled,
  style,
  testID,
}: {
  label: string;
  onPress: () => void;
  variant?: 'lime' | 'navy' | 'ghost' | 'danger';
  icon?: keyof typeof Feather.glyphMap;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const { C } = useTheme();
  const s = useS();
  const bg = { lime: C.lime, navy: C.navy, ghost: C.secondary, danger: C.destructive }[variant];
  const fg = { lime: C.ink, navy: C.white, ghost: C.text, danger: C.white }[variant];
  return (
    <Pressable
      testID={testID}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [s.btn, { backgroundColor: bg, opacity: disabled ? 0.45 : pressed ? 0.8 : 1 }, style]}
    >
      {icon ? <Feather name={icon} size={18} color={fg} /> : null}
      <Text style={[s.btnTxt, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function ScreenHeader({ title, right, onBack }: { title: string; right?: React.ReactNode; onBack?: () => void }) {
  const { C } = useTheme();
  const s = useS();
  const top = useTopInset();
  return (
    <View style={[s.screenHeader, { paddingTop: top + 8 }]}>
      <Pressable
        onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/' as never)))}
        style={s.backBtn}
        hitSlop={8}
        accessibilityLabel="Orqaga"
        testID="back"
      >
        <Feather name="chevron-left" size={24} color={C.text} />
      </Pressable>
      <Text style={s.screenTitle} numberOfLines={1}>{title}</Text>
      <View style={{ minWidth: 40, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: keyof typeof Feather.glyphMap; title: string; text: string; action?: React.ReactNode }) {
  const { C } = useTheme();
  const s = useS();
  return (
    <View style={s.empty}>
      <View style={s.emptyIcon}>
        <Feather name={icon} size={28} color={C.lime} />
      </View>
      <Text style={s.emptyTitle}>{title}</Text>
      <Text style={s.emptyText}>{text}</Text>
      {action}
    </View>
  );
}

export function Notice({ text, icon = 'info', tone = 'navy' }: { text: string; icon?: keyof typeof Feather.glyphMap; tone?: 'navy' | 'light' }) {
  const { C } = useTheme();
  const s = useS();
  const dark = tone === 'navy';
  return (
    <View style={[s.notice, { backgroundColor: dark ? C.navy : C.secondary }]}>
      <Feather name={icon} size={16} color={dark ? C.lime : C.text} />
      <Text style={[s.noticeTxt, { color: dark ? C.white : C.text }]}>{text}</Text>
    </View>
  );
}

const useS = makeStyles((C) => ({
  row: { flexDirection: 'row', alignItems: 'center' },
  center: { alignItems: 'center', justifyContent: 'center', backgroundColor: C.secondary },
  iconBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: -2, right: -2, backgroundColor: C.lime, borderRadius: 9, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeTxt: { fontFamily: F.bold, fontSize: 10, color: C.ink },
  search: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 15, borderWidth: 1, borderColor: C.dark ? C.border : '#dddddd', paddingLeft: 17, paddingRight: 4, height: 46, gap: 10 },
  // minWidth 0 lets the field shrink on narrow phones (web inputs have an intrinsic width).
  searchInput: { flex: 1, minWidth: 0, fontFamily: F.dMedium, fontSize: 16, color: C.text, height: '100%', outlineStyle: 'none', outlineWidth: 0 } as object,
  filterBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: C.dark ? C.secondary : '#eeeeee', borderRadius: 10, width: 86, height: 36 },
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 18, marginBottom: 10 },
  sectionPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.lime, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, gap: 4 },
  sectionTxt: { fontFamily: F.dBold, fontSize: 15, color: C.ink },
  morePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.lime, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  moreTxt: { fontFamily: F.dSemibold, fontSize: 12, color: C.ink },
  card: { backgroundColor: C.card, borderRadius: 16, overflow: 'hidden' },
  cardImgWrap: { aspectRatio: 0.92, borderRadius: 14, overflow: 'hidden', margin: 4 },
  cardImg: { width: '100%', height: '100%' },
  heartPos: { position: 'absolute', top: 8, right: 8 },
  heart: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(8,13,32,0.35)', alignItems: 'center', justifyContent: 'center' },
  bolt: { position: 'absolute', top: 8, left: 8, width: 24, height: 24, borderRadius: 8, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center' },
  // Figma 7-Market: lime basket on the same translucent circle as the heart.
  cartMini: { position: 'absolute', top: 8, right: 40, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(8,13,32,0.35)', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontFamily: F.dBold, fontSize: 15, color: C.text, flexShrink: 1 },
  cardPrice: { fontFamily: F.dExtra, fontSize: 16, color: C.text },
  cardCur: { fontFamily: F.dBold, fontSize: 12, color: C.text },
  oldPrice: { fontFamily: F.semibold, fontSize: 13, color: C.sale, textDecorationLine: 'line-through' },
  cardDesc: { fontFamily: F.regular, fontSize: 11, lineHeight: 14, color: C.mutedForeground },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  meta: { fontFamily: F.medium, fontSize: 11, color: C.mutedForeground },
  // Listing card (Figma 10-Bosh Sahifa).
  lCard: { backgroundColor: C.card, borderRadius: 12, overflow: 'hidden' },
  lImgWrap: { aspectRatio: 165 / 214, borderRadius: 12, overflow: 'hidden', margin: 6, marginBottom: 0, backgroundColor: C.surface },
  lBolt: { position: 'absolute', top: 10, left: 10 },
  lBody: { paddingHorizontal: 10, paddingTop: 11, paddingBottom: 12 },
  lTitle: { fontFamily: F.dMedium, fontSize: 16, color: C.text },
  lPrice: { fontFamily: F.dBold, fontSize: 16, color: C.text, marginTop: 2 },
  lDesc: { fontFamily: F.dMedium, fontSize: 10, lineHeight: 12, color: C.text, marginTop: 8, minHeight: 36 },
  lFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  lMeta: { fontFamily: F.dMedium, fontSize: 12, color: '#9b9b9b' },
  // "Xafta sotuvi" card: 140px wide, 6px inset image.
  sale: { width: 140, backgroundColor: C.card, borderRadius: 16, overflow: 'hidden' },
  saleImg: { width: 128, height: 186, margin: 6, marginBottom: 0, borderRadius: 12 },
  saleBolt: { position: 'absolute', top: 12, left: 12 },
  saleBody: { paddingHorizontal: 8, paddingTop: 8, paddingBottom: 9 },
  salePrice: { fontFamily: F.dBold, fontSize: 14, color: C.text },
  saleDesc: { fontFamily: F.dMedium, fontSize: 8, lineHeight: 10, color: C.text, marginTop: 6, minHeight: 30 },
  chip: { paddingHorizontal: 14, height: 34, borderRadius: 17, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  chipActive: { backgroundColor: C.navy, borderColor: C.navy },
  chipTxt: { fontFamily: F.semibold, fontSize: 13, color: C.text },
  btn: { height: 50, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 18 },
  btnTxt: { fontFamily: F.dBold, fontSize: 15 },
  screenHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 10, backgroundColor: C.surface, gap: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  screenTitle: { flex: 1, fontFamily: F.dExtra, fontSize: 20, color: C.text },
  empty: { alignItems: 'center', padding: 32, gap: 8 },
  emptyIcon: { width: 64, height: 64, borderRadius: 20, backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  emptyTitle: { fontFamily: F.dBold, fontSize: 17, color: C.text, textAlign: 'center' },
  emptyText: { fontFamily: F.regular, fontSize: 13, color: C.mutedForeground, textAlign: 'center', lineHeight: 19, marginBottom: 8 },
  notice: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: 14, alignItems: 'flex-start' },
  noticeTxt: { flex: 1, fontFamily: F.medium, fontSize: 12.5, lineHeight: 18 },
}));
