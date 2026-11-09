import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Listing, SAMPLE_LISTINGS } from '@/constants/data';
import { normalizePhone } from '@/constants/input';
import { C, F } from '@/constants/colors';

export type Profile = {
  name: string;
  phone: string;
  email: string;
  region: string;
  birth: string;
  gender: 'erkak' | 'ayol' | '';
  avatar: string;
};

export type DraftMessage = { id: string; text: string; at: number };
export type Conversation = { listingId: string; messages: DraftMessage[] };
export type CartItem = { productId: string; qty: number };
export type Prefs = { language: 'uz' | 'uzc' | 'ru'; notifications: boolean; welcomed: boolean };

type Stored = {
  favorites: string[];
  favoriteProducts: string[];
  myListings: Listing[];
  profile: Profile;
  cart: CartItem[];
  conversations: Conversation[];
  prefs: Prefs;
};

export const EMPTY_PROFILE: Profile = { name: '', phone: '', email: '', region: '', birth: '', gender: '', avatar: '' };

const DEFAULTS: Stored = {
  favorites: [],
  favoriteProducts: [],
  myListings: [],
  profile: EMPTY_PROFILE,
  cart: [],
  conversations: [],
  prefs: { language: 'uz', notifications: true, welcomed: false },
};

const KEY = 'zoo-bozor/state/v1';

export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

type Ctx = Stored & {
  ready: boolean;
  allListings: Listing[];
  getListing: (id: string) => Listing | undefined;
  toggleFavorite: (id: string) => void;
  toggleFavoriteProduct: (id: string) => void;
  saveListing: (l: Listing) => void;
  deleteListing: (id: string) => void;
  updateProfile: (p: Profile) => void;
  addToCart: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  addDraft: (listingId: string, text: string) => void;
  deleteDraft: (listingId: string, msgId: string) => void;
  setPrefs: (p: Partial<Prefs>) => void;
  resetAll: () => void;
};

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children, storageKey = KEY, initialProfile }: {
  children: React.ReactNode;
  storageKey?: string;
  initialProfile?: Partial<Profile>;
}) {
  const [state, setState] = useState<Stored>(DEFAULTS);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const seedProfile = useRef(initialProfile);
  const saveWarned = useRef(false);

  useEffect(() => {
    let active = true;
    setLoadError(false);
    AsyncStorage.getItem(storageKey)
      .then((raw) => {
        if (!active) return;
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<Stored>;
          setState({ ...DEFAULTS, ...parsed, profile: { ...EMPTY_PROFILE, ...seedProfile.current, ...(parsed.profile ?? {}) }, prefs: { ...DEFAULTS.prefs, ...(parsed.prefs ?? {}) } });
        } else {
          setState({ ...DEFAULTS, profile: { ...EMPTY_PROFILE, ...seedProfile.current } });
        }
        setReady(true);
      })
      .catch(() => { if (active) setLoadError(true); });
    return () => { active = false; };
  }, [storageKey, attempt]);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(storageKey, JSON.stringify(state)).catch(() => {
      if (!saveWarned.current) {
        saveWarned.current = true;
        Alert.alert('Saqlashda xatolik', 'Qurilmada maʼlumotni saqlab boʻlmadi. Ilovani yopishdan oldin xotira va brauzer ruxsatlarini tekshiring.');
      }
    });
  }, [state, ready, storageKey]);

  const update = useCallback((fn: (s: Stored) => Stored) => setState((s) => fn(s)), []);

  const allListings = useMemo(() => [...state.myListings, ...SAMPLE_LISTINGS], [state.myListings]);

  const value = useMemo<Ctx>(
    () => ({
      ...state,
      ready,
      allListings,
      getListing: (id) => allListings.find((l) => l.id === id),
      toggleFavorite: (id) =>
        update((s) => ({ ...s, favorites: s.favorites.includes(id) ? s.favorites.filter((x) => x !== id) : [id, ...s.favorites] })),
      toggleFavoriteProduct: (id) =>
        update((s) => ({
          ...s,
          favoriteProducts: s.favoriteProducts.includes(id) ? s.favoriteProducts.filter((x) => x !== id) : [id, ...s.favoriteProducts],
        })),
      saveListing: (l) => {
        const phone = normalizePhone(l.phone);
        if (!phone) throw new Error('Eʼlon uchun haqiqiy telefon raqamini kiriting.');
        update((s) => {
          const saved = { ...l, phone };
          const exists = s.myListings.some((x) => x.id === l.id);
          return { ...s, myListings: exists ? s.myListings.map((x) => (x.id === l.id ? saved : x)) : [saved, ...s.myListings] };
        });
      },
      deleteListing: (id) =>
        update((s) => ({
          ...s,
          myListings: s.myListings.filter((x) => x.id !== id),
          favorites: s.favorites.filter((x) => x !== id),
          conversations: s.conversations.filter((c) => c.listingId !== id),
        })),
      updateProfile: (p) => {
        const phone = p.phone ? normalizePhone(p.phone) : '';
        if (phone === null) throw new Error('Telefon raqamini toʻliq kiriting.');
        update((s) => ({ ...s, profile: { ...p, phone } }));
      },
      addToCart: (id) =>
        update((s) => {
          const ex = s.cart.find((c) => c.productId === id);
          return {
            ...s,
            cart: ex ? s.cart.map((c) => (c.productId === id ? { ...c, qty: c.qty + 1 } : c)) : [...s.cart, { productId: id, qty: 1 }],
          };
        }),
      setQty: (id, qty) =>
        update((s) => ({
          ...s,
          cart: qty <= 0 ? s.cart.filter((c) => c.productId !== id) : s.cart.map((c) => (c.productId === id ? { ...c, qty } : c)),
        })),
      removeFromCart: (id) => update((s) => ({ ...s, cart: s.cart.filter((c) => c.productId !== id) })),
      addDraft: (listingId, text) =>
        update((s) => {
          const msg = { id: newId(), text, at: Date.now() };
          const ex = s.conversations.find((c) => c.listingId === listingId);
          const conversations = ex
            ? s.conversations.map((c) => (c.listingId === listingId ? { ...c, messages: [...c.messages, msg] } : c))
            : [{ listingId, messages: [msg] }, ...s.conversations];
          return { ...s, conversations };
        }),
      deleteDraft: (listingId, msgId) =>
        update((s) => ({
          ...s,
          conversations: s.conversations
            .map((c) => (c.listingId === listingId ? { ...c, messages: c.messages.filter((m) => m.id !== msgId) } : c))
            .filter((c) => c.messages.length > 0),
        })),
      setPrefs: (p) => update((s) => ({ ...s, prefs: { ...s.prefs, ...p } })),
      resetAll: () => setState(DEFAULTS),
    }),
    [state, ready, allListings, update],
  );

  if (!ready) return (
    <View style={{ flex: 1, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }}>
      {loadError ? <>
        <Text style={{ fontFamily: F.medium, color: C.navy, textAlign: 'center' }}>Saqlangan maʼlumotlarni oʻqib boʻlmadi. Ular oʻchirilmagan.</Text>
        <Pressable onPress={() => setAttempt((n) => n + 1)} accessibilityRole="button"><Text style={{ fontFamily: F.bold, color: C.navy }}>Qayta urinish</Text></Pressable>
      </> : <ActivityIndicator color={C.navy} />}
    </View>
  );
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
