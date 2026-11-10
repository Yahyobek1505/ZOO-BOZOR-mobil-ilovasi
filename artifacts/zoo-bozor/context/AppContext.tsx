import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { Text } from '@/components/LocalizedText';
import { Alert } from '@/components/AppAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Listing, SAMPLE_LISTINGS } from '@/constants/data';
import { normalizePhone } from '@/constants/input';
import { C, F } from '@/constants/colors';
import { useSession } from '@/context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import {
  useListListings, createListing, updateListing, removeListing,
  getListListingsQueryKey, type ListingInput, type ListingRecord,
} from '@workspace/api-client-react';
import { persistListingImages } from '@/lib/listing-images';

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
export type Prefs = { language: 'uz' | 'ru' | 'en'; notifications: boolean; welcomed: boolean };

type Stored = {
  favorites: string[];
  favoriteProducts: string[];
  myListings: Listing[];
  profile: Profile;
  cart: CartItem[];
  conversations: Conversation[];
  prefs: Prefs;
  importedLocalIds: string[];
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
  importedLocalIds: [],
};

const KEY = 'zoo-bozor/state/v1';

export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

type Ctx = Stored & {
  ready: boolean;
  allListings: Listing[];
  getListing: (id: string) => Listing | undefined;
  toggleFavorite: (id: string) => void;
  toggleFavoriteProduct: (id: string) => void;
  listingsLoading: boolean;
  listingsError: boolean;
  refreshListings: () => void;
  saveListing: (l: Listing) => Promise<Listing>;
  deleteListing: (id: string) => Promise<void>;
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
  const { accountId: userId } = useSession();
  const queryClient = useQueryClient();
  const listingsQuery = useListListings({ query: { staleTime: 15_000, refetchInterval: 30_000, retry: 1 } });
  const [guestListings, setGuestListings] = useState<Listing[]>([]);
  const [guestError, setGuestError] = useState(false);
  const activeAccount = useRef(true);

  useEffect(() => {
    activeAccount.current = true;
    return () => { activeAccount.current = false; };
  }, []);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    AsyncStorage.getItem(KEY).then((raw) => {
      if (!active || !raw) return;
      const guest = JSON.parse(raw) as Partial<Stored>;
      setGuestListings((guest.myListings ?? []).map((l) => ({ ...l, id: `guest-${l.id}` })));
    }).catch(() => { if (active) setGuestError(true); });
    return () => { active = false; };
  }, [userId]);

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

  const remoteListings = useMemo(() => (listingsQuery.data ?? []).map((l) => ({
    ...l, own: l.ownerId === userId, localOnly: false,
  })), [listingsQuery.data, userId]);
  const importId = useCallback((id: string) => `import-${userId}-${id}`, [userId]);
  const localListings = useMemo(() => [...state.myListings, ...guestListings]
    .filter((l) => !state.importedLocalIds.includes(l.id))
    .filter((l) => !remoteListings.some((r) => r.id === importId(l.id)))
    .map((l) => ({ ...l, own: true, localOnly: true })), [state.myListings, state.importedLocalIds, guestListings, remoteListings, importId]);
  const myListings = useMemo(() => [...remoteListings.filter((l) => l.own), ...localListings], [remoteListings, localListings]);
  const allListings = useMemo(() => [...remoteListings, ...localListings, ...SAMPLE_LISTINGS], [remoteListings, localListings]);

  const cacheSaved = useCallback((saved: ListingRecord) => {
    queryClient.setQueryData<ListingRecord[]>(getListListingsQueryKey(), (rows = []) => [
      saved, ...rows.filter((r) => r.id !== saved.id),
    ]);
    void queryClient.invalidateQueries({ queryKey: getListListingsQueryKey() });
  }, [queryClient]);

  const saveListing = useCallback(async (l: Listing): Promise<Listing> => {
    if (!userId) throw new Error('Eʼlonni hammaga koʻrsatish uchun avval hisobingizga kiring. Qoralamangiz saqlanadi.');
    const phone = normalizePhone(l.phone);
    if (!phone) throw new Error('Eʼlon uchun haqiqiy telefon raqamini kiriting.');
    if (l.images.some((im) => typeof im !== 'string')) throw new Error('Rasmlarni galereyadan qayta tanlang.');
    const images = await persistListingImages(l.images as string[]);
    if (!activeAccount.current) throw new Error('Hisob oʻzgardi. Toʻgʻri hisobga kirib, qoralamadan davom eting.');
    const data: ListingInput = {
      id: l.localOnly ? importId(l.id) : l.id,
      title: l.title, category: l.category as ListingInput['category'],
      price: l.price, negotiable: l.negotiable, images, breed: l.breed,
      age: l.age, gender: l.gender, count: l.count, documents: l.documents,
      weight: l.weight, color: l.color, city: l.city, district: l.district,
      geo: l.geo, description: l.description, phone, sellerName: l.sellerName,
      delivery: l.delivery, vaccinated: l.vaccinated,
    };
    const saved = l.ownerId && !l.localOnly
      ? await updateListing(data.id, data)
      : await createListing(data);
    if (!activeAccount.current) return { ...saved, own: true, localOnly: false };
    cacheSaved(saved);
    if (l.localOnly) update((s) => ({ ...s, importedLocalIds: [...new Set([...s.importedLocalIds, l.id])] }));
    return { ...saved, own: true, localOnly: false };
  }, [userId, importId, cacheSaved, update]);

  const deleteListing = useCallback(async (id: string) => {
    const item = remoteListings.find((l) => l.id === id);
    if (!item?.own) throw new Error('Faqat hisobingizga tegishli, serverdagi eʼlonni oʻchira olasiz.');
    await removeListing(id);
    queryClient.setQueryData<ListingRecord[]>(getListListingsQueryKey(), (rows = []) => rows.filter((r) => r.id !== id));
    update((s) => ({
      ...s, favorites: s.favorites.filter((x) => x !== id),
      conversations: s.conversations.filter((c) => c.listingId !== id),
    }));
    void queryClient.invalidateQueries({ queryKey: getListListingsQueryKey() });
  }, [remoteListings, queryClient, update]);

  const value = useMemo<Ctx>(
    () => ({
      ...state,
      myListings,
      ready,
      allListings,
      listingsLoading: listingsQuery.isLoading,
      listingsError: listingsQuery.isError,
      refreshListings: () => { void listingsQuery.refetch(); },
      getListing: (id) => allListings.find((l) => l.id === id),
      toggleFavorite: (id) =>
        update((s) => ({ ...s, favorites: s.favorites.includes(id) ? s.favorites.filter((x) => x !== id) : [id, ...s.favorites] })),
      toggleFavoriteProduct: (id) =>
        update((s) => ({
          ...s,
          favoriteProducts: s.favoriteProducts.includes(id) ? s.favoriteProducts.filter((x) => x !== id) : [id, ...s.favoriteProducts],
        })),
      saveListing,
      deleteListing,
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
    [state, ready, allListings, myListings, update, saveListing, deleteListing, listingsQuery.isLoading, listingsQuery.isError, listingsQuery.refetch],
  );

  if (!ready) return (
    <View style={{ flex: 1, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }}>
      {loadError ? <>
        <Text style={{ fontFamily: F.medium, color: C.navy, textAlign: 'center' }}>Saqlangan maʼlumotlarni oʻqib boʻlmadi. Ular oʻchirilmagan.</Text>
        <Pressable onPress={() => setAttempt((n) => n + 1)} accessibilityRole="button"><Text style={{ fontFamily: F.bold, color: C.navy }}>Qayta urinish</Text></Pressable>
      </> : <ActivityIndicator color={C.navy} />}
    </View>
  );
  return <AppContext.Provider value={value}>
    {listingsQuery.isError ? <View style={{ backgroundColor: C.lime, padding: 12 }}>
      <Text style={{ fontFamily: F.medium, color: C.navy }}>Umumiy eʼlonlarni yuklab boʻlmadi. Quyidagi maʼlumotlar eskirgan boʻlishi mumkin.</Text>
      <Pressable onPress={() => { void listingsQuery.refetch(); }} accessibilityRole="button" testID="retry-listings"><Text style={{ fontFamily: F.bold, color: C.navy }}>Qayta urinish</Text></Pressable>
    </View> : null}
    {guestError ? <Text style={{ color: C.destructive, padding: 12 }}>Mehmon eʼlonlarini oʻqib boʻlmadi. Ular oʻchirilmagan.</Text> : null}
    {children}
  </AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

export function useOptionalApp() {
  return useContext(AppContext);
}
