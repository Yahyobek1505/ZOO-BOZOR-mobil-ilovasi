import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/LocalizedText';
import { WebView } from 'react-native-webview';
import { F } from '@/constants/colors';
import { makeStyles, useTheme } from '@/context/ThemeContext';
import { ListingMapProps, mapDocument } from './map-document';

export default function ListingMap({ pins, me, onSelect, view }: ListingMapProps) {
  const { C } = useTheme();
  const st = useSt();
  const html = useMemo(() => mapDocument(pins, me, view), [pins, me, view]);
  const [attempt, setAttempt] = useState(0);
  return (
    <WebView
      key={attempt}
      source={{ html, baseUrl: `https://${process.env.EXPO_PUBLIC_DOMAIN || 'www.openstreetmap.org'}` }}
      originWhitelist={['*']}
      style={{ flex: 1, backgroundColor: C.secondary }}
      javaScriptEnabled
      scrollEnabled={false}
      onMessage={(event) => {
        try {
          const message = JSON.parse(event.nativeEvent.data);
          if (message.source === 'zoo-map' && pins.some((pin) => pin.id === message.id)) onSelect(message.id);
        } catch { /* Ignore messages not belonging to this map. */ }
      }}
      renderError={() => (
        <View style={st.error}>
          <Text style={st.text}>Xarita yuklanmadi. Internet aloqasini tekshiring.</Text>
          <Pressable onPress={() => setAttempt((n) => n + 1)} accessibilityRole="button">
            <Text style={st.retry}>Qayta urinish</Text>
          </Pressable>
        </View>
      )}
    />
  );
}

const useSt = makeStyles((C) => ({
  error: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12, backgroundColor: C.secondary },
  text: { fontFamily: F.regular, color: C.text, textAlign: 'center' },
  retry: { fontFamily: F.bold, color: C.text, padding: 12 },
}));
