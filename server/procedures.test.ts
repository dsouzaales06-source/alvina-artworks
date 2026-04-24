import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock user contexts
const createMockContext = (userId: number, role: "user" | "admin" = "user"): TrpcContext => ({
  user: {
    id: userId,
    openId: `user-${userId}`,
    email: `user${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "test",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  },
  req: {
    protocol: "https",
    headers: {},
  } as TrpcContext["req"],
  res: {} as TrpcContext["res"],
});

describe("Alvina Artworks Procedures", () => {
  describe("Categories", () => {
    it("should list all categories", async () => {
      const ctx = createMockContext(1);
      const caller = appRouter.createCaller(ctx);

      const categories = await caller.categories.list();
      expect(Array.isArray(categories)).toBe(true);
    });
  });

  describe("Products", () => {
    it("should list all active products", async () => {
      const ctx = createMockContext(1);
      const caller = appRouter.createCaller(ctx);

      const products = await caller.products.list();
      expect(Array.isArray(products)).toBe(true);
    });

    it("should get product by slug", async () => {
      const ctx = createMockContext(1);
      const caller = appRouter.createCaller(ctx);

      // First get a product to know its slug
      const products = await caller.products.list();
      if (products.length > 0) {
        const product = await caller.products.getBySlug({
          slug: products[0].slug,
        });
        expect(product).toBeDefined();
        expect(product?.slug).toBe(products[0].slug);
      }
    });

    it("should get product by ID", async () => {
      const ctx = createMockContext(1);
      const caller = appRouter.createCaller(ctx);

      const products = await caller.products.list();
      if (products.length > 0) {
        const product = await caller.products.getById({ id: products[0].id });
        expect(product).toBeDefined();
        expect(product?.id).toBe(products[0].id);
      }
    });

    it("should get products by category", async () => {
      const ctx = createMockContext(1);
      const caller = appRouter.createCaller(ctx);

      const categories = await caller.categories.list();
      if (categories.length > 0) {
        const products = await caller.products.getByCategory({
          categoryId: categories[0].id,
        });
        expect(Array.isArray(products)).toBe(true);
      }
    });
  });

  describe("Cart", () => {
    it("should get empty cart for new user", async () => {
      const ctx = createMockContext(999);
      const caller = appRouter.createCaller(ctx);

      const cart = await caller.cart.get();
      expect(Array.isArray(cart)).toBe(true);
      expect(cart.length).toBe(0);
    });

    it("should add item to cart", async () => {
      const ctx = createMockContext(1);
      const caller = appRouter.createCaller(ctx);

      // Get a product first
      const products = await caller.products.list();
      if (products.length > 0) {
        const result = await caller.cart.add({
          productId: products[0].id,
          quantity: 2,
        });
        expect(result.success).toBe(true);

        // Verify it was added
        const cart = await caller.cart.get();
        const item = cart.find((item) => item.productId === products[0].id);
        expect(item).toBeDefined();
        expect(item?.quantity).toBeGreaterThanOrEqual(2);
      }
    });

    it("should update cart item quantity", async () => {
      const ctx = createMockContext(2);
      const caller = appRouter.createCaller(ctx);

      // Add item first
      const products = await caller.products.list();
      if (products.length > 0) {
        await caller.cart.add({
          productId: products[0].id,
          quantity: 1,
        });

        // Get cart and find the item
        const cart = await caller.cart.get();
        const item = cart.find((item) => item.productId === products[0].id);

        if (item) {
          const result = await caller.cart.updateQuantity({
            cartItemId: item.id,
            quantity: 5,
          });
          expect(result.success).toBe(true);

          // Verify update
          const updatedCart = await caller.cart.get();
          const updatedItem = updatedCart.find(
            (item) => item.productId === products[0].id
          );
          expect(updatedItem?.quantity).toBe(5);
        }
      }
    });

    it("should remove item from cart", async () => {
      const ctx = createMockContext(3);
      const caller = appRouter.createCaller(ctx);

      // Add item first
      const products = await caller.products.list();
      if (products.length > 0) {
        await caller.cart.add({
          productId: products[0].id,
          quantity: 1,
        });

        // Get cart and find the item
        const cart = await caller.cart.get();
        const item = cart.find((item) => item.productId === products[0].id);

        if (item) {
          const result = await caller.cart.remove({ cartItemId: item.id });
          expect(result.success).toBe(true);

          // Verify removal
          const updatedCart = await caller.cart.get();
          const removedItem = updatedCart.find(
            (item) => item.productId === products[0].id
          );
          expect(removedItem).toBeUndefined();
        }
      }
    });

    it("should clear cart", async () => {
      const ctx = createMockContext(4);
      const caller = appRouter.createCaller(ctx);

      // Add items first
      const products = await caller.products.list();
      if (products.length > 0) {
        await caller.cart.add({
          productId: products[0].id,
          quantity: 1,
        });

        // Clear cart
        const result = await caller.cart.clear();
        expect(result.success).toBe(true);

        // Verify cart is empty
        const cart = await caller.cart.get();
        expect(cart.length).toBe(0);
      }
    });
  });

  describe("Orders", () => {
    it("should create order from cart", async () => {
      const ctx = createMockContext(5);
      const caller = appRouter.createCaller(ctx);

      // Add item to cart first
      const products = await caller.products.list();
      if (products.length > 0) {
        await caller.cart.add({
          productId: products[0].id,
          quantity: 1,
        });

        // Create order
        const result = await caller.orders.create({
          customerName: "Test Customer",
          customerEmail: "test@example.com",
          customerPhone: "123-456-7890",
          shippingAddress: "123 Main St",
          shippingCity: "Test City",
          shippingState: "TS",
          shippingZip: "12345",
          shippingCountry: "Test Country",
          notes: "Test order",
        });

        expect(result.orderId).toBeDefined();
        expect(result.orderNumber).toBeDefined();
        expect(result.totalAmount).toBeDefined();

        // Verify cart is cleared
        const cart = await caller.cart.get();
        expect(cart.length).toBe(0);
      }
    });

    it("should list user orders", async () => {
      const ctx = createMockContext(6);
      const caller = appRouter.createCaller(ctx);

      const orders = await caller.orders.list();
      expect(Array.isArray(orders)).toBe(true);
    });

    it("should get order by ID", async () => {
      const ctx = createMockContext(7);
      const caller = appRouter.createCaller(ctx);

      // Create an order first
      const products = await caller.products.list();
      if (products.length > 0) {
        await caller.cart.add({
          productId: products[0].id,
          quantity: 1,
        });

        const createResult = await caller.orders.create({
          customerName: "Test Customer",
          customerEmail: "test@example.com",
          shippingAddress: "123 Main St",
          shippingCity: "Test City",
          shippingZip: "12345",
          shippingCountry: "Test Country",
        });

        // Get the order
        const order = await caller.orders.getById({ id: createResult.orderId });
        expect(order).toBeDefined();
        expect(order?.id).toBe(createResult.orderId);
        expect(order?.items).toBeDefined();
      }
    });
  });

  describe("Admin Procedures", () => {
    it("should list all products for admin", async () => {
      const ctx = createMockContext(1, "admin");
      const caller = appRouter.createCaller(ctx);

      const products = await caller.adminProducts.list();
      expect(Array.isArray(products)).toBe(true);
    });

    it("should list all orders for admin", async () => {
      const ctx = createMockContext(1, "admin");
      const caller = appRouter.createCaller(ctx);

      const orders = await caller.adminOrders.list();
      expect(Array.isArray(orders)).toBe(true);
    });

    it("should update order status for admin", async () => {
      const ctx = createMockContext(1, "admin");
      const caller = appRouter.createCaller(ctx);

      // Get an order first
      const orders = await caller.adminOrders.list();
      if (orders.length > 0) {
        const result = await caller.adminOrders.updateStatus({
          orderId: orders[0].id,
          status: "processing",
        });
        expect(result.success).toBe(true);
      }
    });

    it("should prevent non-admin from accessing admin procedures", async () => {
      const ctx = createMockContext(1, "user");
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.adminProducts.list();
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });

  describe("Auth", () => {
    it("should get current user", async () => {
      const ctx = createMockContext(1);
      const caller = appRouter.createCaller(ctx);

      const user = await caller.auth.me();
      expect(user).toBeDefined();
      expect(user?.id).toBe(1);
      expect(user?.email).toBe("user1@example.com");
    });
  });
});
