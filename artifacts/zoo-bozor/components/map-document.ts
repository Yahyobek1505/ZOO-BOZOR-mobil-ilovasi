import { C } from '@/constants/colors';
import { GeoPoint } from '@/constants/data';

export type MapPin = GeoPoint & { id: string; label: string; title: string };
export type ListingMapProps = {
  pins: MapPin[];
  me: GeoPoint | null;
  onSelect: (id: string) => void;
};

// One real, zoomable OpenStreetMap surface for native WebView and browser preview.
export function mapDocument(pins: MapPin[], me: GeoPoint | null) {
  const payload = JSON.stringify({ pins, me }).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="uz"><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<style>
html,body,#map{height:100%;margin:0;background:${C.secondary};font-family:Arial,sans-serif}
.price{border:2px solid ${C.white};border-radius:22px;background:${C.navy};color:${C.lime};font-weight:700;font-size:11px;padding:8px 12px;box-shadow:0 3px 12px ${C.overlay};white-space:nowrap;cursor:pointer;line-height:14px}
.price.selected{background:${C.lime};color:${C.navy};z-index:1000}
.me{width:14px;height:14px;background:#2377ed;border:3px solid white;border-radius:50%;box-shadow:0 0 0 7px #2377ed33}
.leaflet-control-attribution{font-size:9px}
#status{position:absolute;left:12px;right:12px;top:12px;z-index:1000;padding:12px;border-radius:14px;background:${C.white};color:${C.navy};font-size:12px;text-align:center;box-shadow:0 2px 12px #0001}
</style></head><body><div id="map"></div><div id="status">Xarita yuklanmoqda…</div>
<script>
window.onerror=function(){document.getElementById('status').style.display='block';document.getElementById('status').textContent='Xarita yuklanmadi. Internet aloqasini tekshiring va qayta urining.';};
</script>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" onerror="window.onerror()"></script>
<script>
if(window.L){
var data=${payload};
var map=L.map('map',{zoomControl:false,scrollWheelZoom:true}).setView([41.3111,69.2797],11);
L.control.zoom({position:'topright'}).addTo(map);
var tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'}).addTo(map);
var statusNode=document.getElementById('status');
tiles.on('load',function(){statusNode.style.display='none';});
tiles.on('tileerror',function(){statusNode.style.display='block';statusNode.textContent='Xarita qatlami yuklanmadi. Internet aloqasini tekshiring.';});
var markers=[];
data.pins.forEach(function(p){
var node=document.createElement('button');node.className='price';node.textContent=p.label;node.setAttribute('aria-label',p.title);
var marker=L.marker([p.lat,p.lng],{icon:L.divIcon({className:'',html:node,iconSize:null,iconAnchor:[42,17]})}).addTo(map);
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
map.setView([data.me.lat,data.me.lng],12);
}else if(data.pins.length){
map.setView([data.pins[0].lat,data.pins[0].lng],11);
}
setTimeout(function(){map.invalidateSize();},100);
}
</script></body></html>`;
}
