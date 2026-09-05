/* مدبر المهام — Service Worker: عمل بلا إنترنت + تنبيهات مجدولة */
const CACHE='yawmiyati-v2';
const ASSETS=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];

self.addEventListener('install',e=>{
 e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
 e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  .then(()=>self.clients.claim()));
});

/* الشبكة أولاً للمصادر الخارجية، والذاكرة أولاً لملفات التطبيق */
self.addEventListener('fetch',e=>{
 const u=new URL(e.request.url);
 if(u.origin!==location.origin){return;}          // الطقس والـAPI يمرّان مباشرة
 e.respondWith(
  caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{
   const copy=res.clone();
   caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});
   return res;
  }).catch(()=>caches.match('./index.html')))
 );
});

/* جدولة المنبّهات: تُرسل الصفحة قائمة المواعيد، ونستخدم TimestampTrigger
   حيث يتوفّر ليصل الإشعار والجهاز مقفل. */
self.addEventListener('message',async e=>{
 const d=e.data||{};
 if(d.type!=='schedule')return;
 try{
  const olds=await self.registration.getNotifications({includeTriggered:true});
  olds.forEach(n=>{if(n.tag&&n.tag.startsWith('alarm-'))n.close();});
 }catch(_){}
 if(!('showTrigger' in Notification.prototype))return;   // غير مدعوم: نعتمد على الصفحة
 for(const a of (d.alarms||[])){
  try{
   await self.registration.showNotification('⏰ '+(a.label||'منبه'),{
    tag:'alarm-'+a.id+'-'+a.at,
    body:'افتح «مدبر المهام» وحلّ التحدي لإيقافه',
    icon:'./icon-192.png',badge:'./icon-192.png',
    requireInteraction:true,
    silent:false,
    data:{id:a.id},
    showTrigger:new TimestampTrigger(a.at)
   });
  }catch(_){}
 }
});

self.addEventListener('notificationclick',e=>{
 e.notification.close();
 e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{
  for(const c of cs){if('focus' in c)return c.focus();}
  if(self.clients.openWindow)return self.clients.openWindow('./');
 }));
});
