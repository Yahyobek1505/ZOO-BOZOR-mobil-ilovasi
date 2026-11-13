import React, { useEffect, useMemo, useRef } from 'react';
import { ListingMapProps, mapDocument } from './map-document';

export default function ListingMap({ pins, me, onSelect, view }: ListingMapProps) {
  const ref = useRef<HTMLIFrameElement>(null);
  const html = useMemo(() => mapDocument(pins, me, view), [pins, me, view]);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.source !== ref.current?.contentWindow || event.data?.source !== 'zoo-map') return;
      if (pins.some((pin) => pin.id === event.data.id)) onSelect(event.data.id);
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [pins, onSelect]);
  return React.createElement('iframe', {
    ref,
    title: 'ZOO-BOZOR — eʼlonlar xaritasi',
    srcDoc: html,
    sandbox: 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox',
    style: { width: '100%', height: '100%', border: 0, display: 'block' },
  });
}
