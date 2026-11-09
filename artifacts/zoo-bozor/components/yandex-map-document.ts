import { C } from '@/constants/colors';
import type { GeoPoint } from '@/constants/data';
import type { MapPin } from './map-document';

export function yandexDocument(pins: MapPin[], me: GeoPoint | null, key: string) {
  const data = JSON.stringify({ pins, me }).replace(/</g, '\\u003c');
  const apiUrl = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(key)}&lang=ru_RU`;
  return `<!doctype html><html lang="uz"><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<style>
html,body,#map{height:100%;width:100%;padding:0;margin:0;background:${C.secondary};font-family:Arial,sans-serif}
.animal{display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:66px;height:66px;padding:3px;border:3px solid ${C.lime};border-radius:50%;background:${C.navy};box-shadow:0 3px 10px ${C.overlay};cursor:pointer}
.animal img{width:100%;height:100%;object-fit:cover;border-radius:50%;pointer-events:none}
.animal.selected{box-shadow:0 0 0 3px ${C.white},0 5px 18px ${C.overlay};transform:scale(1.1)}
.fallback{color:${C.lime};font-size:10px;font-weight:bold;text-align:center}
[class*="-copyrights-pane"]{bottom:155px!important}
#status{position:absolute;top:140px;left:20px;right:20px;padding:16px;border-radius:16px;background:${C.white};color:${C.navy};font-size:13px;line-height:19px;text-align:center;box-shadow:0 2px 16px #0002;z-index:1000}
#retry{border:0;border-radius:16px;background:${C.lime};color:${C.navy};padding:10px 18px;margin-top:12px;font-weight:bold;cursor:pointer}
</style></head><body><div id="map"></div>
<div id="status"><span id="message">Yandex xaritasi yuklanmoqda…</span><br><button id="retry" style="display:none" onclick="location.reload()">Qayta urinish</button></div>
<script>
var loaded=false;
function fail(){if(loaded)return;document.getElementById('message').textContent='Yandex xaritasi yuklanmadi. Internet, API kaliti va kalit uchun ruxsat etilgan domenlarni tekshiring.';document.getElementById('retry').style.display='inline-block';}
window.onerror=fail;
var loadTimer=setTimeout(fail,20000);
</script>
<script src="${apiUrl}" onerror="fail()"></script>
<script>
if(window.ymaps){ymaps.ready(function(){
try{
var data=${data};
var map=new ymaps.Map('map',{center:data.me?[data.me.lat,data.me.lng]:[41.3111,69.2797],zoom:12,controls:[]},{suppressMapOpenBlock:true});
map.behaviors.disable('dblClickZoom');
var selected=null;
function esc(value){return String(value||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
data.pins.forEach(function(p){
var content=p.imageUrl?'<img src="'+esc(p.imageUrl)+'" alt="'+esc(p.title)+'">':'<span class="fallback">'+esc(p.label)+'</span>';
var layout=ymaps.templateLayoutFactory.createClass('<button class="animal" aria-label="'+esc(p.title)+'">'+content+'</button>');
var pin=new ymaps.Placemark([p.lat,p.lng],{hintContent:esc(p.title)},{iconLayout:layout,iconOffset:[-33,-33],iconShape:{type:'Circle',coordinates:[0,0],radius:33},hasBalloon:false,openHintOnHover:false});
pin.events.add('click',function(){
if(selected){selected.options.set('zIndex',100);}
selected=pin;pin.options.set('zIndex',1000);
var msg={source:'zoo-map',id:p.id};
if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(JSON.stringify(msg));}
else{window.parent.postMessage(msg,'*');}
});
map.geoObjects.add(pin);
});
if(data.me){map.geoObjects.add(new ymaps.Placemark([data.me.lat,data.me.lng],{},{preset:'islands#blueCircleDotIcon'}));}
// Reserve space above the floating app controls without hiding provider attribution.
map.margin.addArea({left:0,bottom:0,width:'100%',height:150});
map.events.add('error',fail);
map.container.fitToViewport();
var layer=map.layers.get(0).get(0);
function checkTiles(){
var tileStatus=layer.getTileStatus();
if(tileStatus.readyTileNumber>0){loaded=true;clearTimeout(loadTimer);document.getElementById('status').style.display='none';}
}
layer.events.add('tileloadchange',checkTiles);
checkTiles();
}catch(e){fail();}
});}
</script></body></html>`;
}
