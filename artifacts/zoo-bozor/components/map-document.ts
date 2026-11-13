import colors from '@/constants/colors';

// The map page itself stays in the day palette (OSM/Google/Yandex tiles are light).
const C = colors.light;
import { GeoPoint } from '@/constants/data';
import { googleDocument } from './google-map-document';

export type MapPin = GeoPoint & { id: string; label: string; title: string; imageUrl?: string };
export type MapView = { center: GeoPoint; zoom: number };
export type ListingMapProps = {
  pins: MapPin[];
  me: GeoPoint | null;
  onSelect: (id: string) => void;
  /** Initial camera; defaults to the user's position (or Tashkent) at zoom 12. */
  view?: MapView;
};

// Browser map keys are intentionally client-visible and must be domain-restricted.
// Keep the current provider explicitly labelled until the Google key is configured.
export function mapDocument(pins: MapPin[], me: GeoPoint | null, view?: MapView) {
  const key = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (key) return googleDocument(pins, me, key);
  const payload = JSON.stringify({ pins, me, view: view ?? null }).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="uz"><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<style>
html,body,#map{height:100%;margin:0;background:${C.secondary};font-family:Arial,sans-serif}
.animal{display:flex;flex-direction:column;align-items:center;width:110px;padding:0;border:0;background:none;cursor:pointer;transition:transform .15s;transform-origin:50% 100%}
.animal .ring{display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:60px;height:60px;padding:2px;border:3px solid ${C.lime};border-radius:50%;background:${C.white};box-shadow:0 3px 10px rgba(8,13,32,.25);overflow:hidden}
.animal img{display:block;width:100%;height:100%;object-fit:cover;border-radius:50%;pointer-events:none}
.animal .price{position:relative;z-index:1;margin-top:-9px;padding:3px 8px;border-radius:10px;background:${C.white};color:${C.navy};font-weight:800;font-size:10px;white-space:nowrap;box-shadow:0 1px 5px rgba(8,13,32,.25)}
.animal .tip{width:0;height:0;margin-top:1px;border-left:8px solid transparent;border-right:8px solid transparent;border-top:12px solid ${C.lime}}
.animal.selected{transform:scale(1.12)}
.animal.selected .ring{box-shadow:0 0 0 3px ${C.navy},0 5px 18px rgba(8,13,32,.35)}
.animal .fallback{font-weight:bold;color:${C.navy};font-size:9px;text-align:center}
.me{width:14px;height:14px;background:#2377ed;border:3px solid white;border-radius:50%;box-shadow:0 0 0 7px #2377ed33}
.leaflet-control-attribution{font-size:9px}
.leaflet-bottom{bottom:155px}
#provider{position:absolute;top:130px;left:16px;z-index:500;background:${C.white};color:${C.mutedForeground};font-size:9px;padding:5px 8px;border-radius:10px;pointer-events:none;max-width:240px}
#status{position:absolute;left:12px;right:12px;top:12px;z-index:1000;padding:12px;border-radius:14px;background:${C.white};color:${C.navy};font-size:12px;text-align:center;box-shadow:0 2px 12px #0001}
</style></head><body><div id="map"></div><div id="provider">OpenStreetMap · Google Maps kaliti ulanmagan</div><div id="status">Xarita yuklanmoqda…</div>
<script>
window.onerror=function(){document.getElementById('status').style.display='block';document.getElementById('status').textContent='Xarita yuklanmadi. Internet aloqasini tekshiring va qayta urining.';};
</script>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" onerror="window.onerror()"></script>
<script>
if(window.L){
var data=${payload};
var map=L.map('map',{zoomControl:false,scrollWheelZoom:true}).setView([41.3111,69.2797],12);
var tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'}).addTo(map);
var statusNode=document.getElementById('status');
tiles.on('load',function(){statusNode.style.display='none';});
tiles.on('tileerror',function(){statusNode.style.display='block';statusNode.textContent='Xarita qatlami yuklanmadi. Internet aloqasini tekshiring.';});
var markers=[];
data.pins.forEach(function(p){
var node=document.createElement('button');node.className='animal';node.setAttribute('aria-label',p.title);
var ring=document.createElement('span');ring.className='ring';node.appendChild(ring);
var fallback=document.createElement('span');fallback.className='fallback';fallback.textContent='ZOO';
if(p.imageUrl){
var image=document.createElement('img');image.src=p.imageUrl;image.alt=p.title;
image.onerror=function(){image.remove();ring.appendChild(fallback);};
ring.appendChild(image);
}else{ring.appendChild(fallback);}
var price=document.createElement('span');price.className='price';price.textContent=p.label;node.appendChild(price);
var tip=document.createElement('span');tip.className='tip';node.appendChild(tip);
var marker=L.marker([p.lat,p.lng],{icon:L.divIcon({className:'',html:node,iconSize:[110,86],iconAnchor:[55,86]})}).addTo(map);
marker.on('click',function(){
markers.forEach(function(m){m.node.classList.remove('selected');});
node.classList.add('selected');marker.setZIndexOffset(1000);
var msg={source:'zoo-map',id:p.id};
if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(JSON.stringify(msg));}
else{window.parent.postMessage(msg,'*');}
});
markers.push({node:node,marker:marker});
});
if(data.me){
L.marker([data.me.lat,data.me.lng],{icon:L.divIcon({className:'',html:'<div class="me"></div>',iconSize:[20,20]})}).addTo(map);
}
if(data.view){
map.setView([data.view.center.lat,data.view.center.lng],data.view.zoom);
}else if(data.me){
map.setView([data.me.lat,data.me.lng],12);
}else if(data.pins.length){
map.setView([41.3111,69.2797],12);
}
setTimeout(function(){map.invalidateSize();},100);
}
</script></body></html>`;
}
