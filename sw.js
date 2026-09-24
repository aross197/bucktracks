// DeerBook Service Worker - enables notification support
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window'}).then(list => {
    if (list.length) list[0].focus();
    else clients.openWindow('/');
  }));
});
