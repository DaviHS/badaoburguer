// lib/init-notifications.ts
import webPush from 'web-push';

export function initializeAppServices() {
  // Inicializar Web Push diretamente aqui para evitar import circular
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webPush.setVapidDetails(
      'mailto:contato@badaogrill.com',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    console.log('🔔 Web Push inicializado');
  } else {
    console.warn('⚠️  Chaves VAPID não configuradas - Web Push desabilitado');
  }
  
  // Outros serviços podem ser inicializados aqui
}