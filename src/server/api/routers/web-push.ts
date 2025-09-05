import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { NotificationService } from '@/services/notification-service';

export const webPushRouter = createTRPCRouter({
  register: protectedProcedure
    .input(z.object({
      subscription: z.object({
        endpoint: z.string(),
        keys: z.object({
          p256dh: z.string(),
          auth: z.string()
        })
      })
    }))
    .mutation(async ({ ctx, input }) => {
      const userAgent = ctx.headers.get('user-agent');

      await NotificationService.registerSubscription(
        ctx.session.user.userId,
        input.subscription,
        userAgent || undefined
      );
      
      return { success: true, message: 'Subscription registrada no banco' };
    }),

  unregister: protectedProcedure
    .mutation(async ({ ctx }) => {
      await NotificationService.unregisterUserSubscriptions(ctx.session.user.userId);
      return { success: true, message: 'Subscriptions removidas do banco' };
    }),

  test: protectedProcedure
    .mutation(async ({ ctx }) => {
      const result = await NotificationService.sendToUser(
        ctx.session.user.userId,
        {
          title: '🔔 Teste de Notificação',
          body: 'Esta é uma notificação de teste do Badão Grill!',
          url: '/',
          icon: '/logo-circle.png'
        }
      );

      return { 
        success: result.success, 
        sent: result.sent,
        message: result.success ? 'Notificação de teste enviada' : 'Falha ao enviar notificação'
      };
    }),
});