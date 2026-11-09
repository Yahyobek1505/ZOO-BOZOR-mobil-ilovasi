import { C } from '@/constants/colors';
import type { GeoPoint } from '@/constants/data';
import type { MapPin } from './map-document';

export function googleDocument(pins: MapPin[], me: GeoPoint | null, key: string) {
  const data = JSON.stringify({ pins, me }).replace(/</g, '\\u003c');
  const apiUrl = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&loading=async&callback=initMap&v=weekly&language=ru&region=UZ`;
  return `<!doctype html><html lang="uz"><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<style>
html,body,#map{height:100%;width:100%;padding:0;margin:0;background:${C.secondary};font-family:Arial,sans-serif}
.animal{display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:66px;height:66px;padding:3px;border:3px solid ${C.lime};border-radius:50%;background:${C.navy};box-shadow:0 3px 10px ${C.overlay};cursor:pointer;transition:transform .15s}
.animal img{width:100%;height:100%;object-fit:cover;border-radius:50%;pointer-events:none}
.animal.selected{box-shadow:0 0 0 3px ${C.white},0 5px 18px ${C.overlay};transform:scale(1.1)}
.fallback{color:${C.lime};font-size:10px;font-weight:bold;text-align:center}
.me{width:14px;height:14px;border:3px solid white;background:#2377ed;border-radius:50%;box-shadow:0 0 0 7px #2377ed33}
#status{position:absolute;top:140px;left:20px;right:20px;padding:16px;border-radius:16px;background:${C.white};color:${C.navy};font-size:13px;line-height:19px;text-align:center;box-shadow:0 2px 16px #0002;z-index:1000}
#retry{border:0;border-radius:16px;background:${C.lime};color:${C.navy};padding:10px 18px;margin-top:12px;font-weight:bold;cursor:pointer}
</style>
<script>
var ready=false,failed=false;
function fail(message){failed=true;if(!document.getElementById('status')){document.addEventListener('DOMContentLoaded',function(){fail(message);},{once:true});return;}document.getElementById('status').style.display='block';document.getElementById('message').textContent=message||'Google xaritasi yuklanmadi. Internet aloqasini tekshiring.';document.getElementById('retry').style.display='inline-block';}
window.gm_authFailure=function(){fail('Google Maps kaliti tasdiqlanmadi. API kaliti, ruxsat etilgan domenlar va Google Cloud sozlamalarini tekshiring.');};
var loadTimer=setTimeout(function(){if(!ready)fail();},20000);
window.initMap=async function(){
try{
if(document.readyState==='loading'){await new Promise(function(resolve){document.addEventListener('DOMContentLoaded',resolve,{once:true});});}
var data=${data};
var libs=await Promise.all([google.maps.importLibrary('maps'),google.maps.importLibrary('marker')]);
var Map=libs[0].Map,AdvancedMarkerElement=libs[1].AdvancedMarkerElement;
var map=new Map(document.getElementById('map'),{
center:data.me?{lat:data.me.lat,lng:data.me.lng}:{lat:41.3111,lng:69.2797},
zoom:12,mapId:'DEMO_MAP_ID',disableDefaultUI:true,gestureHandling:'greedy',clickableIcons:false
});
var nodes=[];
data.pins.forEach(function(p){
var node=document.createElement('div');node.className='animal';
var fallback=document.createElement('span');fallback.className='fallback';fallback.textContent=p.label;
if(p.imageUrl){
var img=document.createElement('img');img.src=p.imageUrl;img.alt=p.title;
img.onerror=function(){img.remove();node.appendChild(fallback);};
node.appendChild(img);
}else{node.appendChild(fallback);}
var marker=new AdvancedMarkerElement({map:map,position:{lat:p.lat,lng:p.lng},title:p.title,gmpClickable:true});
marker.append(node);
marker.addEventListener('gmp-click',function(){
nodes.forEach(function(n){n.node.classList.remove('selected');n.marker.zIndex=0;});
node.classList.add('selected');marker.zIndex=1000;
var message={source:'zoo-map',id:p.id};
if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(JSON.stringify(message));}
else{window.parent.postMessage(message,'*');}
});
nodes.push({node:node,marker:marker});
});
if(data.me){
var dot=document.createElement('div');dot.className='me';
var locationMarker=new AdvancedMarkerElement({map:map,position:{lat:data.me.lat,lng:data.me.lng},title:'Joylashuvim'});
locationMarker.append(dot);
}
map.addListener('tilesloaded',function(){if(!failed){ready=true;clearTimeout(loadTimer);document.getElementById('status').style.display='none';}});
}catch(e){fail();}
};
</script>
<script async src="${apiUrl}" onerror="fail()"></script>
</head><body><div id="map"></div>
<div id="status"><span id="message">Google xaritasi yuklanmoqda…</span><br><button id="retry" style="display:none" onclick="location.reload()">Qayta urinish</button></div>
</body></html>`;
}
