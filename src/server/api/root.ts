import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { userRouter } from './routers/user';
import { authRouter } from "./routers/auth";
import { orderRouter } from "./routers/order";
import { productRouter } from "./routers/product";
import { categoryRouter } from "./routers/category";
import { productImageRouter } from "./routers/product-image";
import { userRoleRouter } from "./routers/user-role";
import { paymentRouter } from "./routers/payment";
import { adminRouter } from "./routers/admin";
import { webPushRouter } from "./routers/web-push";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  userRoles: userRoleRouter,
  product: productRouter,
  productImage: productImageRouter,
  category: categoryRouter,
  order: orderRouter,
  payment: paymentRouter,
  admin: adminRouter,
  webPush: webPushRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
