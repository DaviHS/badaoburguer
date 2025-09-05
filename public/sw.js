console.log('Service Worker carregado');

self.addEventListener('install', function(event) {
  console.log('Service Worker instalado');
  self.skipWaiting(); // Força ativação imediata
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker ativado');
  event.waitUntil(self.clients.claim()); // Assume controle imediato
});

self.addEventListener('push', function(event) {
  console.log('Push recebido:', event);
  
  if (!event.data) {
    console.error('Push sem dados');
    return;
  }

  let payload;
  try {
    payload = event.data.json();
    console.log('Payload:', payload);
  } catch (error) {
    console.error('Erro ao parsear payload:', error);
    return;
  }

  const options = {
    body: payload.body,
    icon: payload.icon || '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'badao-notification',
    data: {
      url: payload.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
      .then(() => console.log('Notificação exibida'))
      .catch(error => console.error('Erro ao mostrar notificação:', error))
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notificação clicada:', event.notification);
  event.notification.close();

  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
        .then(() => console.log('Janela aberta:', event.notification.data.url))
        .catch(error => console.error('Erro ao abrir janela:', error))
    );
  }
});