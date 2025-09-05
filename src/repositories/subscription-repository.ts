import { db } from '@/server/db';
import { userPushSubscriptions, userRoles, users } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export class SubscriptionRepository {
  static async getUserSubscriptions(userId: number) {
    return await db
      .select()
      .from(userPushSubscriptions)
      .where(eq(userPushSubscriptions.userId, userId));
  }

  static async getAdminSubscriptions() {
    const adminSubscriptions = await db
      .select({
        subscription: userPushSubscriptions
      })
      .from(userPushSubscriptions)
      .leftJoin(users, eq(userPushSubscriptions.userId, users.userId))
      .leftJoin(userRoles, eq(users.roleId, userRoles.roleId))
      .where(eq(userRoles.isAdmin, true));

    return adminSubscriptions.map(s => s.subscription);
  }

  static async addSubscription(userId: number, subscription: PushSubscriptionData, userAgent?: string) {
    const existing = await db
      .select()
      .from(userPushSubscriptions)
      .where(
        and(
          eq(userPushSubscriptions.userId, userId),
          eq(userPushSubscriptions.endpoint, subscription.endpoint)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(userPushSubscriptions)
        .set({
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          userAgent,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(userPushSubscriptions.userId, userId),
            eq(userPushSubscriptions.endpoint, subscription.endpoint)
          )
        );
    } else {
      await db.insert(userPushSubscriptions).values({
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent
      });
    }

    return true;
  }

  static async removeSubscription(userId: number, endpoint: string) {
    await db
      .delete(userPushSubscriptions)
      .where(
        and(
          eq(userPushSubscriptions.userId, userId),
          eq(userPushSubscriptions.endpoint, endpoint)
        )
      );
    
    return true;
  }

  static async removeAllUserSubscriptions(userId: number) {
    await db
      .delete(userPushSubscriptions)
      .where(eq(userPushSubscriptions.userId, userId));
    
    return true;
  }

  static async cleanupInvalidSubscriptions() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    await db
      .delete(userPushSubscriptions)
      .where(eq(userPushSubscriptions.updatedAt, thirtyDaysAgo));
  }
}