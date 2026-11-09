import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Listing, SAMPLE_LISTINGS } from '@/constants/data';

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

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Stored>(DEFAULTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<Stored>;
          setState({ ...DEFAULTS, ...parsed, prefs: { ...DEFAULTS.prefs, ...(parsed.prefs ?? {}) } });
        }
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

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
      saveListing: (l) =>
        update((s) => {
          const exists = s.myListings.some((x) => x.id === l.id);
          return { ...s, myListings: exists ? s.myListings.map((x) => (x.id === l.id ? l : x)) : [l, ...s.myListings] };
        }),
      deleteListing: (id) =>
        update((s) => ({
          ...s,
          myListings: s.myListings.filter((x) => x.id !== id),
          favorites: s.favorites.filter((x) => x !== id),
          conversations: s.conversations.filter((c) => c.listingId !== id),
        })),
      updateProfile: (p) => update((s) => ({ ...s, profile: p })),
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

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
