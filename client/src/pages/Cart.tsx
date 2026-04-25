import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { ShoppingBag, Trash2, Plus, Minus, ChevronLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function Cart() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: cartItems, refetch } = trpc.cart.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const removeFromCartMutation = trpc.cart.remove.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Item removed from cart");
    },
  });

  const updateQuantityMutation = trpc.cart.updateQuantity.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const clearCartMutation = trpc.cart.clear.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Cart cleared");
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
          <div className="container flex items-center justify-between h-20">
            <Link href="/">
              <a className="text-2xl font-bold text-primary hover:text-secondary transition-colors">
                Alvina Artworks
              </a>
            </Link>
          </div>
        </nav>
        <div className="container py-16 text-center">
          <h1 className="mb-4">Please Sign In</h1>
          <p className="text-muted-foreground mb-8">
            You need to be signed in to view your cart.
          </p>
          <a href={getLoginUrl()} className="btn-primary">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  const total = cartItems?.reduce((sum, item) => {
    if (item.product) {
      return sum + parseFloat(item.product.price) * item.quantity;
    }
    return sum;
  }, 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container flex items-center justify-between h-20">
          <Link href="/">
            <a className="text-2xl font-bold text-primary hover:text-secondary transition-colors">
              Alvina Artworks
            </a>
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/catalog">
              <a className="text-foreground hover:text-secondary transition-colors font-medium">
                Shop
              </a>
            </Link>
            <Link href="/account">
              <a className="text-foreground hover:text-secondary transition-colors font-medium">
                Account
              </a>
            </Link>
            <Link href="/cart">
              <a className="flex items-center gap-2 text-foreground hover:text-secondary transition-colors font-medium">
                <ShoppingBag size={20} />
                Cart
              </a>
            </Link>
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <section className="bg-gradient-to-r from-primary to-secondary text-primary-foreground py-12">
        <div className="container">
          <h1>Shopping Cart</h1>
        </div>
      </section>

      {/* Cart Content */}
      <div className="container py-12">
        {!cartItems || cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h2 className="mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">
              Discover our beautiful collections and add items to your cart.
            </p>
            <Link href="/catalog">
              <a className="btn-primary">Continue Shopping</a>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="card-elegant overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h2>Items in Cart</h2>
                </div>
                <div className="divide-y divide-border">
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-6 flex gap-6">
                      {item.product?.imageUrl && (
                        <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      <div className="flex-grow">
                        <Link href={`/product/${item.product?.slug}`}>
                          <a className="text-lg font-semibold hover:text-secondary transition-colors">
                            {item.product?.name}
                          </a>
                        </Link>
                        <p className="text-muted-foreground text-sm mb-4">
                          ${parseFloat(item.product?.price || "0").toFixed(2)} each
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 border border-border rounded-lg">
                            <button
                              onClick={() =>
                                updateQuantityMutation.mutate({
                                  cartItemId: item.id,
                                  quantity: Math.max(1, item.quantity - 1),
                                })
                              }
                              className="p-2 hover:bg-muted transition-colors"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-8 text-center font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantityMutation.mutate({
                                  cartItemId: item.id,
                                  quantity: item.quantity + 1,
                                })
                              }
                              className="p-2 hover:bg-muted transition-colors"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          <span className="font-semibold text-secondary">
                            ${(
                              parseFloat(item.product?.price || "0") *
                              item.quantity
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          removeFromCartMutation.mutate({ cartItemId: item.id })
                        }
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="card-elegant p-6 sticky top-24">
                <h3 className="mb-6 pb-4 border-b border-border">Order Summary</h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-semibold">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-semibold">Calculated at checkout</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 mb-6">
                  <div className="flex justify-between mb-6">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-2xl text-secondary">
                      ${total.toFixed(2)}
                    </span>
                  </div>

                  <Link href="/checkout">
                    <a className="w-full btn-secondary block text-center">
                      Proceed to Checkout
                    </a>
                  </Link>
                </div>

                <button
                  onClick={() => clearCartMutation.mutate()}
                  className="w-full btn-outline"
                >
                  Clear Cart
                </button>

                <div className="mt-6 pt-6 border-t border-border">
                  <Link href="/catalog">
                    <a className="flex items-center justify-center gap-2 text-secondary hover:text-accent transition-colors font-semibold">
                      <ChevronLeft size={18} />
                      Continue Shopping
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 mt-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">Alvina Artworks</h4>
              <p className="text-muted-foreground text-sm">
                Handcrafted elegance for your most cherished moments.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Collections</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/catalog?category=candles">
                    <a className="text-muted-foreground hover:text-secondary transition-colors">
                      Candles
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/catalog?category=wedding-decorations">
                    <a className="text-muted-foreground hover:text-secondary transition-colors">
                      Wedding Decorations
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/catalog?category=catholic-church-decorations">
                    <a className="text-muted-foreground hover:text-secondary transition-colors">
                      Church Decorations
                    </a>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Customer</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/catalog">
                    <a className="text-muted-foreground hover:text-secondary transition-colors">
                      Shop
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/account">
                    <a className="text-muted-foreground hover:text-secondary transition-colors">
                      My Account
                    </a>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <p className="text-muted-foreground text-sm">
                For inquiries, please reach out through your account.
              </p>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-muted-foreground text-sm">
            <p>&copy; 2024 Alvina Artworks. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
