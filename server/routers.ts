import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { storagePut } from "./storage";

// Helper to check if user is admin
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ CATEGORIES ============
  categories: router({
    list: publicProcedure.query(async () => {
      return await db.getCategories();
    }),
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return await db.getCategoryBySlug(input.slug);
      }),
  }),

  // ============ PRODUCTS ============
  products: router({
    list: publicProcedure.query(async () => {
      return await db.getProducts();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductById(input.id);
      }),
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return await db.getProductBySlug(input.slug);
      }),
    getByCategory: publicProcedure
      .input(z.object({ categoryId: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductsByCategory(input.categoryId);
      }),
  }),

  // ============ ADMIN PRODUCTS ============
  adminProducts: router({
    list: adminProcedure.query(async () => {
      return await db.getAllProductsForAdmin();
    }),
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        price: z.string().min(1),
        categoryId: z.number(),
        sku: z.string().optional(),
        stock: z.number().default(0),
        status: z.enum(["available", "out_of_stock", "limited_time_deal", "coming_soon"]).default("available"),
        imageBase64: z.string().optional(),
        imageName: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        let imageUrl = undefined;
        let imageKey = undefined;

        if (input.imageBase64 && input.imageName) {
          try {
            const buffer = Buffer.from(input.imageBase64, 'base64');
            const result = await storagePut(
              `products/${Date.now()}-${input.imageName}`,
              buffer,
              'image/jpeg'
            );
            imageUrl = result.url;
            imageKey = result.key;
          } catch (error) {
            console.error('Image upload failed:', error);
          }
        }

        const result = await db.createProduct({
          name: input.name,
          slug: input.slug,
          description: input.description,
          price: input.price,
          categoryId: input.categoryId,
          sku: input.sku,
          stock: input.stock,
          status: input.status,
          imageUrl,
          imageKey,
          isActive: true,
        });

        return result;
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        description: z.string().optional(),
        price: z.string().optional(),
        categoryId: z.number().optional(),
        sku: z.string().optional(),
        stock: z.number().optional(),
        status: z.enum(["available", "out_of_stock", "limited_time_deal", "coming_soon"]).optional(),
        imageBase64: z.string().optional(),
        imageName: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const updateData: any = {};
        if (input.name) updateData.name = input.name;
        if (input.slug) updateData.slug = input.slug;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.price) updateData.price = input.price;
        if (input.categoryId) updateData.categoryId = input.categoryId;
        if (input.sku) updateData.sku = input.sku;
        if (input.stock !== undefined) updateData.stock = input.stock;
        if (input.status) updateData.status = input.status;

        if (input.imageBase64 && input.imageName) {
          try {
            const buffer = Buffer.from(input.imageBase64, 'base64');
            const result = await storagePut(
              `products/${Date.now()}-${input.imageName}`,
              buffer,
              'image/jpeg'
            );
            updateData.imageUrl = result.url;
            updateData.imageKey = result.key;
          } catch (error) {
            console.error('Image upload failed:', error);
          }
        }

        return await db.updateProduct(input.id, updateData);
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteProduct(input.id);
      }),
  }),

  // ============ CART ============
  cart: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const items = await db.getCartItems(ctx.user.id);
      
      // Enrich with product details
      const enrichedItems = await Promise.all(
        items.map(async (item) => {
          const product = await db.getProductById(item.productId);
          return {
            ...item,
            product,
          };
        })
      );

      return enrichedItems;
    }),
    add: protectedProcedure
      .input(z.object({
        productId: z.number(),
        quantity: z.number().min(1).default(1),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.addToCart(ctx.user.id, input.productId, input.quantity);
        return { success: true };
      }),
    updateQuantity: protectedProcedure
      .input(z.object({
        cartItemId: z.number(),
        quantity: z.number().min(1),
      }))
      .mutation(async ({ input }) => {
        await db.updateCartItemQuantity(input.cartItemId, input.quantity);
        return { success: true };
      }),
    remove: protectedProcedure
      .input(z.object({ cartItemId: z.number() }))
      .mutation(async ({ input }) => {
        await db.removeFromCart(input.cartItemId);
        return { success: true };
      }),
    clear: protectedProcedure.mutation(async ({ ctx }) => {
      await db.clearCart(ctx.user.id);
      return { success: true };
    }),
  }),

  // ============ ORDERS ============
  orders: router({
    create: protectedProcedure
      .input(z.object({
        customerName: z.string().min(1),
        customerEmail: z.string().email(),
        customerPhone: z.string().optional(),
        shippingAddress: z.string().min(1),
        shippingCity: z.string().min(1),
        shippingState: z.string().optional(),
        shippingZip: z.string().min(1),
        shippingCountry: z.string().min(1),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get cart items
        const cartItems = await db.getCartItems(ctx.user.id);
        if (cartItems.length === 0) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cart is empty' });
        }

        // Calculate total and prepare order items
        let totalAmount = 0;
        const itemsToCreate = [];

        for (const cartItem of cartItems) {
          const product = await db.getProductById(cartItem.productId);
          if (!product) {
            throw new TRPCError({ code: 'NOT_FOUND', message: `Product ${cartItem.productId} not found` });
          }

          const subtotal = parseFloat(product.price) * cartItem.quantity;
          totalAmount += subtotal;

          itemsToCreate.push({
            productId: product.id,
            productName: product.name,
            quantity: cartItem.quantity,
            unitPrice: product.price,
            subtotal: subtotal.toString(),
          });
        }

        // Create order
        const orderNumber = `ORD-${Date.now()}`;
        const orderResult = await db.createOrder({
          userId: ctx.user.id,
          orderNumber,
          status: 'pending',
          totalAmount: totalAmount.toString(),
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
          shippingAddress: input.shippingAddress,
          shippingCity: input.shippingCity,
          shippingState: input.shippingState,
          shippingZip: input.shippingZip,
          shippingCountry: input.shippingCountry,
          notes: input.notes,
        });

        // Get the created order ID
        const orderId = (orderResult as any).insertId;

        // Create order items
        for (const item of itemsToCreate) {
          await db.createOrderItem({
            orderId,
            ...item,
          });
        }

        // Clear cart
        await db.clearCart(ctx.user.id);

        return {
          orderId,
          orderNumber,
          totalAmount: totalAmount.toString(),
        };
      }),
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserOrders(ctx.user.id);
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const order = await db.getOrderById(input.id);
        if (!order) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }
        if (order.userId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        const items = await db.getOrderItems(order.id);
        return { ...order, items };
      }),
  }),

  // ============ ADMIN ORDERS ============
  adminOrders: router({
    list: adminProcedure.query(async () => {
      return await db.getAllOrders();
    }),
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const order = await db.getOrderById(input.id);
        if (!order) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }
        const items = await db.getOrderItems(order.id);
        return { ...order, items };
      }),
    updateStatus: adminProcedure
      .input(z.object({
        orderId: z.number(),
        status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
      }))
      .mutation(async ({ input }) => {
        await db.updateOrderStatus(input.orderId, input.status);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
