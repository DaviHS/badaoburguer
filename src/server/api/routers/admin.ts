import z from 'zod';
import { createTRPCRouter, adminProcedure } from '../trpc';
import { NotificationService } from '@/services/notification-service';

export const adminRouter = createTRPCRouter({
  testNotification: adminProcedure
    .input(z.object({ type: z.enum(['admin', 'user']) }))
    .mutation(async ({ input, ctx }) => {
      if (input.type === 'admin') {
        await NotificationService.notifyAdmins({
          title: '🔔 Teste de Notificação',
          body: 'Esta é uma notificação de teste para administradores',
          url: '/admin'
        });
      } else {
        await NotificationService.notifyOrderUpdate(
          ctx.session.user.userId,
          999,
          '0'
        );
      }
      
      return { success: true };
    }),
});