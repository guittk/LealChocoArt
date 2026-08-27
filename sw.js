/* Service worker — duas coisas:
   1) `registration.showNotification()` local (chamado da própria
      página) pros lembretes de retirada, mais confiável que
      `new Notification()` direto quando a aba está minimizada/em
      segundo plano.
   2) Recebe push de verdade do Firebase Cloud Messaging quando o
      navegador está fechado ou a aba não está em foco — é o que
      `onBackgroundMessage` cobre abaixo.

   Não cacheia nada de propósito: o cache-busting por ?v= no
   index.html já cuida de atualização, e um SW com cache
   reintroduziria exatamente o problema que o ?v= existe pra evitar.

   O firebaseConfig abaixo é o mesmo do app principal — não é segredo,
   é a config pública do projeto (é assim que o Firebase Web funciona:
   quem protege os dados são as regras do Firestore, não esconder essa
   config). Duplicado aqui porque um service worker não compartilha
   escopo com a página — precisa da própria cópia. */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDOQZJQiltlQKIIIiYki_JQinAV4lX0m3E",
  authDomain: "fb-general-stores.firebaseapp.com",
  projectId: "fb-general-stores",
  storageBucket: "fb-general-stores.firebasestorage.app",
  messagingSenderId: "780236289961",
  appId: "1:780236289961:web:c4d6ce274d49645d84b6b8"
});

try {
  var messaging = firebase.messaging();
  messaging.onBackgroundMessage(function(payload){
    var n = payload.notification || {};
    self.registration.showNotification(n.title || 'Leal ChocoArt', {
      body: n.body || '',
      icon: 'assets/images/icon-192.png',
      badge: 'assets/images/icon-192.png'
    });
  });
} catch (e) {
  /* projeto sem Cloud Messaging configurado direito — o SW segue
     funcionando pras notificações locais mesmo assim */
}

self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });

self.addEventListener('notificationclick', function(e){
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type:'window' }).then(function(list){
    for (var i = 0; i < list.length; i++){
      if ('focus' in list[i]) return list[i].focus();
    }
    if (self.clients.openWindow) return self.clients.openWindow('/');
  }));
});
