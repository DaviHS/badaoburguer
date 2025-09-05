import { formatCurrency } from '@/lib/utils/price';
import webPush from 'web-push';
import { SubscriptionRepository } from '@/repositories/subscription-repository';
import { db } from '@/server/db';
import { users, userRoles } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export function initializeWebPush() {
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webPush.setVapidDetails(
      'mailto:contato@badaogrill.com',
      process.env.VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );
    console.log('🔔 Web Push inicializado');
  }
}

export interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

export class NotificationService {
  private static async sendToSubscription(subscription: any, payload: NotificationPayload) {
    try {
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth
        }
      };

      await webPush.sendNotification(
        pushSubscription,
        JSON.stringify(payload)
      );
      
      return { success: true };
    } catch (error: any) {
      if (error.statusCode === 410 || error.statusCode === 404) {
        await SubscriptionRepository.removeSubscription(
          subscription.userId,
          subscription.endpoint
        );
      }
      return { success: false, error: error.message };
    }
  }

  static async sendToUser(userId: number, payload: NotificationPayload) {
    const subscriptions = await SubscriptionRepository.getUserSubscriptions(userId);
    
    if (subscriptions.length === 0) {
      console.log(`⚠️  Nenhuma subscription encontrada para usuário ${userId}`);
      return { success: false, sent: 0, total: 0 };
    }

    let sentCount = 0;
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        const result = await this.sendToSubscription(subscription, payload);
        if (result.success) sentCount++;
        return result;
      })
    );

    console.log(`📤 Notificações para usuário ${userId}: ${sentCount}/${subscriptions.length} enviadas`);
    return { success: sentCount > 0, sent: sentCount, total: subscriptions.length };
  }

  static async notifyAdmins(payload: NotificationPayload) {
    try {
      const admins = await db
        .select({ userId: users.userId })
        .from(users)
        .leftJoin(userRoles, eq(users.roleId, userRoles.roleId))
        .where(eq(userRoles.isAdmin, true));

      let totalSent = 0;
      let totalSubscriptions = 0;

      for (const admin of admins) {
        const result = await this.sendToUser(admin.userId, payload);
        totalSent += result.sent;
        totalSubscriptions += result.total;
      }

      console.log(`📤 Notificações para admins: ${totalSent}/${totalSubscriptions} enviadas`);
      return { success: totalSent > 0, sent: totalSent, total: totalSubscriptions };
    } catch (error) {
      console.error('Erro ao notificar admins:', error);
      return { success: false, sent: 0, total: 0 };
    }
  }

  static async notifyAdminOrderUpdate(orderId: number, customerName: string, oldStatus: number, newStatus: number) {
    const statusNames: Record<number, string> = {
      0: 'Pendente',
      1: 'Pago', 
      2: 'Preparando',
      3: 'Pronto',
      4: 'Saiu para Entrega',
      5: 'Entregue',
      6: 'Cancelado'
    };

    return await this.notifyAdmins({
      title: '📊 Status do Pedido Atualizado',
      body: `Pedido #${orderId} - ${customerName}\n` +
            `Status: ${statusNames[oldStatus] || oldStatus} → ${statusNames[newStatus] || newStatus}`,
      url: `/admin`,
      icon: '/icon-192x192.png'
    });
  }
  
  static async notifyOrderUpdate(userId: number, orderId: number, statusId: number) {
    const statusMessages: Record<number, { title: string; body: string }> = {
      0: { 
        title: '📋 Pedido Recebido',
        body: `Seu pedido #${orderId} foi recebido e aguarda pagamento.`
      },
      1: { 
        title: '✅ Pagamento Confirmado',
        body: `Pagamento do pedido #${orderId} confirmado! Estamos preparando seu pedido.`
      },
      2: { 
        title: '👨‍🍳 Pedido em Preparação',
        body: `Seu pedido #${orderId} está sendo preparado com carinho!`
      },
      3: { 
        title: '📦 Pedido Pronto',
        body: `Seu pedido #${orderId} está pronto! Em breve sairá para entrega.`
      },
      4: {
        title: '🚚 Saiu para Entrega',
        body: `Seu pedido #${orderId} saiu para entrega! Fique atento ao telefone.`
      },
      5: {
        title: '🎉 Pedido Entregue',
        body: `Pedido #${orderId} entregue com sucesso! Obrigado pela preferência.`
      },
      6: {
        title: '❌ Pedido Cancelado',
        body: `Seu pedido #${orderId} foi cancelado. Entre em contato para mais informações.`
      }
    };

    const message = statusMessages[statusId] || {
      title: '📦 Status Atualizado',
      body: `Status do pedido #${orderId} foi atualizado.`
    };

    return await this.sendToUser(userId, {
      title: message.title,
      body: message.body,
      url: `/my-orders`,
      icon: '/icon-192x192.png'
    });
  }

  static async notifyNewOrder(orderId: number, customerName: string, total: string) {
    return await this.notifyAdmins({
      title: '🛎️ Novo Pedido Recebido!',
      body: `Pedido #${orderId} - ${customerName}\nTotal: ${formatCurrency(total)}\n\nStatus: Pendente de pagamento`,
      url: `/admin`,
      icon: '/icon-192x192.png'
    });
  }

  static async registerSubscription(userId: number, subscriptionData: any, userAgent?: string) {
    return await SubscriptionRepository.addSubscription(
      userId,
      subscriptionData,
      userAgent
    );
  }

  // Remover todas subscriptions do usuário
  static async unregisterUserSubscriptions(userId: number) {
    return await SubscriptionRepository.removeAllUserSubscriptions(userId);
  }
}