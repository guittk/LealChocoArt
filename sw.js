/* Service worker mínimo — existe só pra tornar as notificações de
   retirada mais confiáveis (registration.showNotification() sobrevive
   à aba minimizada/em segundo plano melhor que `new Notification()`
   direto da página). Não cacheia nada de propósito: o cache-busting
   por ?v= no index.html já cuida de atualização, e um SW com cache
   reintroduziria exatamente o problema que o ?v= existe pra evitar.

   Isso NÃO é push de verdade — o navegador precisa estar aberto
   (pode estar minimizado/em outra aba). Notificação com o navegador
   fechado exige um gatilho no servidor (Cloud Function agendada +
   Firebase Cloud Messaging), o que exige o plano pago (Blaze) do
   Firebase — decisão de custo que cabe à Julia, não a este código. */
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
