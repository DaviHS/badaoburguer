'use client';

import { useEffect, useState } from 'react';
import { api } from '@/trpc/react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';

export function WebPushRegister() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const registerMutation = api.webPush.register.useMutation();
  const unregisterMutation = api.webPush.unregister.useMutation();
  const testMutation = api.webPush.test.useMutation();

  useEffect(() => {
    setIsSupported('serviceWorker' in navigator && 'PushManager' in window);
    checkExistingSubscription();
  }, []);

  const checkExistingSubscription = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (error) {
        console.error('Erro ao verificar subscription:', error);
      }
    }
  };

  const subscribe = async () => {
    if (!isSupported) return;
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      
      console.log("process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!", process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
      // Converter a chave pública para Uint8Array
      const applicationServerKey = urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      );

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });

      // Converter as chaves corretamente
      const p256dh = arrayBufferToBase64(subscription.getKey('p256dh')!);
      const auth = arrayBufferToBase64(subscription.getKey('auth')!);

      await registerMutation.mutateAsync({
        subscription: {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: p256dh,
            auth: auth,
          },
        },
      });

      setIsSubscribed(true);
      toast.success('Notificações ativadas!');
    } catch (error) {
      console.error('Erro ao registrar notificações:', error);
      toast.error('Erro ao ativar notificações');
    } finally {
      setIsLoading(false);
    }
  };

  // Funções auxiliares para conversão
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  function arrayBufferToBase64(buffer: ArrayBuffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]!);
    }
    return btoa(binary);
  }

  const unsubscribe = async () => {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }

      await unregisterMutation.mutateAsync();
      setIsSubscribed(false);
      toast.success('Notificações desativadas');
    } catch (error) {
      console.error('Erro ao remover notificações:', error);
      toast.error('Erro ao desativar notificações');
    } finally {
      setIsLoading(false);
    }
  };

  const testNotification = async () => {
    try {
      await testMutation.mutateAsync();
      toast.success('Notificação de teste enviada!');
    } catch (error) {
      toast.error('Erro ao enviar notificação de teste');
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <>
      <div className="hidden md:flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="relative bg-transparent border-white text-white hover:bg-white hover:text-[#4d0f2e] transition-colors"
          onClick={isSubscribed ? unsubscribe : subscribe}
          disabled={isLoading}
        >
          {isSubscribed ? (
            <BellOff className="h-4 w-4 mr-1" />
          ) : (
            <Bell className="h-4 w-4 mr-1" />
          )}
          {isLoading ? 'Processando...' : isSubscribed ? 'Desativar' : 'Ativar Notificações'}
        </Button>
        {isSubscribed && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={testNotification}
            className="relative bg-transparent border-white text-white hover:bg-white hover:text-[#4d0f2e] transition-colors"
            disabled={testMutation.isPending}
          >
            {testMutation.isPending ? 'Enviando...' : 'Testar'}
          </Button>
        )}
      </div>

      <div className="flex md:hidden">
        <button
          onClick={isSubscribed ? unsubscribe : subscribe}
          disabled={isLoading}
          className="text-gray-300 hover:text-primary flex items-center gap-2 mb-2 cursor-pointer"
        >
          {isSubscribed ? (
            <BellOff className="h-4 w-4" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          {isLoading ? 'Processando...' : isSubscribed ? 'Desativar' : 'Ativar'}
        </button>
        {isSubscribed && (
          <button 
            onClick={testNotification}
            disabled={testMutation.isPending}
            className="text-gray-300 hover:text-primary flex items-center gap-2 mb-2 cursor-pointer ml-4"
          >
            {testMutation.isPending ? 'Enviando...' : 'Testar'}
          </button>
        )}
      </div>
    </>
  );
}