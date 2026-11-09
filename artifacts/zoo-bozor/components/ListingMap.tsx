import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { C, F } from '@/constants/colors';
import { ListingMapProps, mapDocument } from './map-document';

export default function ListingMap({ pins, me, onSelect }: ListingMapProps) {
  const html = useMemo(() => mapDocument(pins, me), [pins, me]);
  const [attempt, setAttempt] = useState(0);
  return (
    <WebView
      key={attempt}
      source={{ html, baseUrl: 'https://www.openstreetmap.org' }}
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

const st = StyleSheet.create({
  error: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12, backgroundColor: C.secondary },
  text: { fontFamily: F.regular, color: C.navy, textAlign: 'center' },
  retry: { fontFamily: F.bold, color: C.navy, padding: 12 },
});
